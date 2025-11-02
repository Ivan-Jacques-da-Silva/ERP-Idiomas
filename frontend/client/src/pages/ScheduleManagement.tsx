import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import TeacherScheduleManager from "@/components/TeacherScheduleManager";
import { Card, CardContent } from "@/components/ui/card";

export default function ScheduleManagement() {
  const { user } = useAuth();

  // Verificar se o usuário tem permissão (admin ou secretary)
  const canManageSchedules = user?.role === 'admin' || user?.role === 'secretary';

  if (!canManageSchedules) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <i className="fas fa-user-slash text-muted-foreground text-6xl mb-4"></i>
              <h3 className="text-lg font-semibold text-foreground mb-2">Acesso Negado</h3>
              <p className="text-muted-foreground">
                Esta área é exclusiva para administradores e secretários.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gerenciamento de Horários</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os horários dos professores e cadastre novas aulas
          </p>
        </div>
        
        <TeacherScheduleManager />
      </div>
    </Layout>
  );
}

