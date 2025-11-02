import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import ClassModal from "@/components/ClassModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

function ClassDetailModal({ isOpen, onClose, classItem }: { isOpen: boolean; onClose: () => void; classItem: any }) {
  const [tab, setTab] = useState<'dados' | 'presenca'>('dados');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selected, setSelected] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery<any[]>({
    queryKey: ["/api/classes", classItem?.id, "enrollments"],
    enabled: !!classItem && tab === 'presenca',
    queryFn: async () => {
      const res = await fetch(`/api/classes/${classItem.id}/enrollments`);
      if (!res.ok) throw new Error('Erro ao buscar alunos da turma');
      return res.json();
    }
  });

  useQuery<any[]>({
    queryKey: ["/api/classes", classItem?.id, "attendance", date],
    enabled: !!classItem && tab === 'presenca' && !!date,
    queryFn: async () => {
      const res = await fetch(`/api/classes/${classItem.id}/attendance?date=${date}`);
      if (!res.ok) throw new Error('Erro ao buscar presenças');
      return res.json();
    },
    onSuccess: (rows) => {
      const map: Record<string, string> = {};
      rows.forEach((r: any) => { map[r.student.id] = r.status; });
      setSelected(map);
    }
  });

  const saveAttendance = useMutation({
    mutationFn: async () => {
      const records = Object.entries(selected).map(([studentId, status]) => ({ studentId, status }));
      const res = await fetch(`/api/classes/${classItem.id}/attendance`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, records })
      });
      if (!res.ok) throw new Error('Erro ao salvar presenças');
      return res.json();
    },
    onSuccess: () => toast({ title: 'Sucesso', description: 'Presenças salvas' }),
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' })
  });

  if (!classItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{classItem?.title || classItem?.name}</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
          <TabsList>
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="presenca">Presença</TabsTrigger>
          </TabsList>
          <TabsContent value="dados" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Professor</Label>
                <p className="text-sm">{classItem?.teacher}</p>
              </div>
              <div>
                <Label>Horário</Label>
                <p className="text-sm">{classItem?.startTime} - {classItem?.endTime}</p>
              </div>
              <div>
                <Label>Livro</Label>
                <p className="text-sm">{classItem?.book}</p>
              </div>
              <div>
                <Label>Sala</Label>
                <p className="text-sm">{classItem?.room || '-'}</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="presenca" className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label>Data</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  const map: Record<string, string> = {};
                  (enrollments || []).forEach((e: any) => map[e.student.id] = 'present');
                  setSelected(map);
                }}>Todos Presentes</Button>
                <Button variant="outline" onClick={() => {
                  const map: Record<string, string> = {};
                  (enrollments || []).forEach((e: any) => map[e.student.id] = 'absent');
                  setSelected(map);
                }}>Todos Faltaram</Button>
              </div>
            </div>
            {enrollmentsLoading ? (
              <div className="text-center text-muted-foreground">Carregando alunos...</div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-auto">
                {(enrollments || []).map((e: any) => {
                  const studentId = e.student.id;
                  const name = `${e.student.user.firstName} ${e.student.user.lastName}`;
                  const status = selected[studentId] || '';
                  return (
                    <div key={studentId} className="flex items-center justify-between border rounded-md p-2">
                      <div className="text-sm">{name}</div>
                      <div className="flex gap-2 text-xs">
                        <Button variant={status==='present'?'default':'outline'} size="sm" onClick={() => setSelected(s => ({...s, [studentId]:'present'}))}>Presente</Button>
                        <Button variant={status==='absent'?'default':'outline'} size="sm" onClick={() => setSelected(s => ({...s, [studentId]:'absent'}))}>Faltou</Button>
                        <Button variant={status==='justified'?'default':'outline'} size="sm" onClick={() => setSelected(s => ({...s, [studentId]:'justified'}))}>Justificada</Button>
                      </div>
                    </div>
                  );
                })}
                {(enrollments || []).length === 0 && (
                  <div className="text-center text-muted-foreground text-sm">Nenhum aluno matriculado</div>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Fechar</Button>
              <Button onClick={() => saveAttendance.mutate()} disabled={saveAttendance.isPending}>{saveAttendance.isPending?'Salvando...':'Salvar Presenças'}</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function Schedule() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);

  const { data: classes = [], refetch: refetchClasses } = useQuery<any[]>({
    queryKey: ["/api/classes"],
    retry: false,
    enabled: isAuthenticated,
  });

  // Compute classes by day unconditionally to keep hooks order stable
  const classesByDay = useMemo(() => {
    const map: Record<number, any[]> = {1:[],2:[],3:[],4:[],5:[],6:[],7:[]};
    (classes||[]).forEach((c: any) => {
      const d = c.dayOfWeek || 1;
      (map as any)[d].push({
        id: c.id,
        title: c.book?.course?.name ? `${c.book.course.name}` : (c.name || 'Turma'),
        teacher: c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : '-',
        book: c.book?.name || '-',
        startTime: c.startTime,
        endTime: c.endTime,
        room: c.room,
      });
    });
    return map;
  }, [classes]);


  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Não autorizado", description: "You are logged out. Logging in again...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/"; }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const canManageSchedule = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'secretary';
  const daysPt = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Agenda</h2>
          {canManageSchedule && (
            <Button onClick={() => setShowClassModal(true)}>
              <i className="fas fa-plus mr-2" /> Nova Turma
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6,7].map((d) => (
            <Card key={d} className="h-full">
              <CardHeader>
                <CardTitle>{daysPt[d%7]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(classesByDay as any)[d].length === 0 && (
                  <div className="text-sm text-muted-foreground">Sem aulas</div>
                )}
                {(classesByDay as any)[d].map((c:any) => (
                  <div key={c.id} className="p-3 rounded-md border cursor-pointer hover:bg-muted/50" onClick={() => setSelectedClass({ ...c, id: c.id })}>
                    <div className="text-sm font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.startTime} - {c.endTime} • {c.teacher}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ClassModal isOpen={showClassModal} onClose={() => { setShowClassModal(false); refetchClasses(); }} />
      <ClassDetailModal isOpen={!!selectedClass} onClose={() => setSelectedClass(null)} classItem={selectedClass} />
    </Layout>
  );
}

