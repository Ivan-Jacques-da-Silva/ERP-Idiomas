import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface UserPermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userDisplayName?: string;
}

export default function UserPermissionsModal({ open, onOpenChange, userId, userDisplayName }: UserPermissionsModalProps) {
  const { toast } = useToast();

  const { data: allPermissions } = useQuery<any[]>({
    queryKey: ["/api/permissions"],
    enabled: open,
  });

  const { data: overrides } = useQuery<any[]>({
    queryKey: ["/api/users", userId, "permissions"],
    enabled: open && !!userId,
    queryFn: async () => await apiRequest("GET", `/api/users/${userId}/permissions`),
  });

  const [search, setSearch] = useState("");
  const [granted, setGranted] = useState<Set<string>>(new Set());
  const [denied, setDenied] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"grant" | "deny">("grant");

  useEffect(() => {
    if (!overrides) return;
    const g = new Set<string>();
    const d = new Set<string>();
    for (const ov of overrides) {
      if (ov.isGranted) g.add(ov.permissionId);
      else d.add(ov.permissionId);
    }
    setGranted(g);
    setDenied(d);
  }, [overrides]);

  const filteredPermissions = useMemo(() => {
    if (!allPermissions) return [] as any[];
    if (!search.trim()) return allPermissions;
    const s = search.toLowerCase();
    return allPermissions.filter((p: any) =>
      (p.displayName || p.name).toLowerCase().includes(s)
      || (p.description || "").toLowerCase().includes(s)
      || (p.name || "").toLowerCase().includes(s)
    );
  }, [allPermissions, search]);

  const toggleGrant = (permissionId: string) => {
    const g = new Set(granted);
    const d = new Set(denied);
    if (g.has(permissionId)) g.delete(permissionId); else g.add(permissionId);
    // se marcar grant, remove deny
    d.delete(permissionId);
    setGranted(g);
    setDenied(d);
  };

  const toggleDeny = (permissionId: string) => {
    const g = new Set(granted);
    const d = new Set(denied);
    if (d.has(permissionId)) d.delete(permissionId); else d.add(permissionId);
    // se marcar deny, remove grant
    g.delete(permissionId);
    setDenied(d);
    setGranted(g);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const overrides = [
        ...Array.from(granted).map((id) => ({ permissionId: id, isGranted: true })),
        ...Array.from(denied).map((id) => ({ permissionId: id, isGranted: false })),
      ];
      await apiRequest("PUT", `/api/users/${userId}/permissions`, { overrides });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "permissions"] });
      toast({ title: "Sucesso!", description: "Permissões do usuário atualizadas." });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.message || "Falha ao salvar permissões", variant: "destructive" });
    }
  });

  const permissionsList = (items: any[], isGrantList: boolean) => (
    <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
      {items.map((permission) => (
        <div key={permission.id} className="flex items-center space-x-2">
          <Checkbox
            id={permission.id}
            checked={isGrantList ? granted.has(permission.id) : denied.has(permission.id)}
            onCheckedChange={() => (isGrantList ? toggleGrant(permission.id) : toggleDeny(permission.id))}
            data-testid={`checkbox-userperm-${isGrantList ? 'grant' : 'deny'}-${permission.name}`}
          />
          <Label htmlFor={permission.id} className="text-sm cursor-pointer select-none">
            {permission.displayName ?? permission.name}
            {permission.description && (
              <span className="text-xs text-muted-foreground ml-2">— {permission.description}</span>
            )}
          </Label>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Permissões de {userDisplayName || 'Usuário'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Pesquisar permissões..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="grant">Conceder</TabsTrigger>
              <TabsTrigger value="deny">Revogar</TabsTrigger>
            </TabsList>
            <TabsContent value="grant">
              {permissionsList(filteredPermissions, true)}
            </TabsContent>
            <TabsContent value="deny">
              {permissionsList(filteredPermissions, false)}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

