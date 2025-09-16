import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUnitSchema } from "@shared/schema";
import type { z } from "zod";

type UnitFormData = z.infer<typeof insertUnitSchema>;

export default function Units() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: units, isLoading } = useQuery<any[]>({
    queryKey: ["/api/units"],
    retry: false,
  });

  const form = useForm<UnitFormData>({
    resolver: zodResolver(insertUnitSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: UnitFormData) => {
      await apiRequest("POST", "/api/units", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: "Sucesso!",
        description: "Unidade criada com sucesso.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao criar unidade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const onSubmit = (data: UnitFormData) => {
    createUnitMutation.mutate(data);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check permissions
  const canManageUnits = user?.role === 'admin' || user?.role === 'developer';

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Unidades</h2>
            <p className="text-sm text-muted-foreground">Gerencie as unidades da escola</p>
          </div>
          
          {canManageUnits && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-unit">
                  <i className="fas fa-plus mr-2"></i>
                  Nova Unidade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Unidade</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Unidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Unidade Centro" {...field} data-testid="input-unit-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Endereço completo da unidade" {...field} value={field.value ?? ""} data-testid="input-unit-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} value={field.value ?? ""} data-testid="input-unit-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@unidade.com" {...field} value={field.value ?? ""} data-testid="input-unit-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createUnitMutation.isPending}
                        data-testid="button-save-unit"
                      >
                        {createUnitMutation.isPending ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !units || units.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <i className="fas fa-building text-muted-foreground text-6xl mb-4"></i>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma unidade encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {canManageUnits 
                  ? "Comece criando sua primeira unidade." 
                  : "Não há unidades cadastradas no sistema."}
              </p>
              {canManageUnits && (
                <Button onClick={() => setIsDialogOpen(true)} data-testid="button-create-first-unit">
                  <i className="fas fa-plus mr-2"></i>
                  Criar primeira unidade
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="units-grid">
            {units.map((unit: any) => (
              <Card key={unit.id} className="card-hover transition-smooth" data-testid={`card-unit-${unit.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-building text-primary"></i>
                    <span>{unit.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {unit.address && (
                      <span className="flex items-center text-sm text-muted-foreground">
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {unit.address}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {unit.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <i className="fas fa-phone mr-2"></i>
                        <span>{unit.phone}</span>
                      </div>
                    )}
                    {unit.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <i className="fas fa-envelope mr-2"></i>
                        <span>{unit.email}</span>
                      </div>
                    )}
                  </div>
                  {canManageUnits && (
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm">
                        <i className="fas fa-edit mr-2"></i>
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <i className="fas fa-trash mr-2"></i>
                        Excluir
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
