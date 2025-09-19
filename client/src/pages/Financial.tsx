
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageLoader, FadeIn, StaggeredFadeIn } from "@/components/PageLoader";
import { Mail, MessageSquare, Phone, Edit } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  plan: string;
  responsible: string;
  valueInArrears: number;
  daysInArrears: number;
  lastContact: string;
  contact: string;
  status: 'first-notice' | 'negotiation' | 'second-notice';
}

export default function Financial() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data baseado na imagem
  const [financialData] = useState({
    totalInArrears: 3030.00,
    accountsInArrears: 3,
    averageDelay: 16,
    defaultRate: 12.5
  });

  const [customers] = useState<Customer[]>([
    {
      id: "1",
      name: "Larissa Oliveira",
      plan: "Mensalidade Semestral - 1ª parcela",
      responsible: "Roberto Oliveira",
      valueInArrears: 2400.00,
      daysInArrears: 15,
      lastContact: "2024-01-10",
      contact: "63",
      status: 'first-notice'
    },
    {
      id: "2", 
      name: "Carlos Eduardo Lima",
      plan: "Mensalidade Janeiro",
      responsible: "Sandra Lima",
      valueInArrears: 630.00,
      daysInArrears: 8,
      lastContact: "2024-01-15",
      contact: "11",
      status: 'negotiation'
    }
  ]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Você foi desconectado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check permissions
  const canViewFinancial = user?.role === 'admin';

  if (!canViewFinancial) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <i className="fas fa-lock text-muted-foreground text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Acesso Negado</h3>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.responsible.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'first-notice':
        return <Badge className="bg-yellow-100 text-yellow-700">Primeiro Aviso</Badge>;
      case 'negotiation':
        return <Badge className="bg-purple-100 text-purple-700">Negociação</Badge>;
      case 'second-notice':
        return <Badge className="bg-red-100 text-red-700">Segundo Aviso</Badge>;
      default:
        return <Badge variant="secondary">Status</Badge>;
    }
  };

  const getStatusCount = (status: string) => {
    return customers.filter(c => c.status === status).length;
  };

  return (
    <Layout>
      <PageLoader>
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          <FadeIn delay={50}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center icon-glow">
                  <i className="fas fa-dollar-sign text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gradient">Controle de Inadimplência</h2>
                  <p className="text-sm text-muted-foreground">Dashboard de inadimplência e recuperação de crédito</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Enviar E-mails
                </Button>
                <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                  <MessageSquare className="w-4 h-4" />
                  Notificar WhatsApp
                </Button>
              </div>
            </div>
          </FadeIn>

          {/* Stats Cards */}
          <StaggeredFadeIn 
            stagger={80}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
          >
            <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Inadimplência</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      R$ {financialData.totalInArrears.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Contas em Atraso</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{financialData.accountsInArrears}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                    <i className="fas fa-calendar-times text-purple-600 dark:text-purple-400"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Média de Atraso</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{financialData.averageDelay} dias</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clock text-yellow-600 dark:text-yellow-400"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Taxa de Inadimplência</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{financialData.defaultRate}%</p>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-orange-600 dark:text-orange-400"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggeredFadeIn>

          {/* Status Cards Row */}
          <StaggeredFadeIn 
            stagger={100}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6"
          >
            <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{getStatusCount('first-notice')}</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Primeiro Aviso</p>
                    <p className="text-xs text-yellow-500 dark:text-yellow-500">Contatos iniciais</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">●</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{getStatusCount('negotiation')}</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Em Negociação</p>
                    <p className="text-xs text-purple-500 dark:text-purple-500">Acordos em andamento</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">●</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300">{getStatusCount('second-notice')}</p>
                    <p className="text-sm text-red-600 dark:text-red-400">Segundo Aviso</p>
                    <p className="text-xs text-red-500 dark:text-red-500">Situação crítica</p>
                  </div>
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">●</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggeredFadeIn>

          {/* Contas em Atraso */}
          <FadeIn delay={300}>
            <Card className="glassmorphism-card rounded-2xl border border-white/20 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-exclamation-triangle text-white text-sm"></i>
                    </div>
                    <CardTitle className="text-lg font-semibold">Contas em Atraso</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Buscar cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{customer.name}</h4>
                          <p className="text-sm text-muted-foreground">{customer.plan}</p>
                          <p className="text-xs text-muted-foreground">Responsável: {customer.responsible}</p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm text-muted-foreground">Valor em Atraso</p>
                          <p className="text-lg font-bold text-red-600">
                            R$ {customer.valueInArrears.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm text-muted-foreground">Dias em Atraso</p>
                          <p className="text-lg font-bold text-foreground">{customer.daysInArrears} dias</p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm text-muted-foreground">Último Contato</p>
                          <p className="text-sm text-foreground">{customer.lastContact}</p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm text-muted-foreground">Contato</p>
                          <p className="text-sm text-foreground">{customer.contact}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(customer.status)}
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="gap-1">
                              <Phone className="w-3 h-3" />
                              Ligar
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Mail className="w-3 h-3" />
                              E-mail
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <MessageSquare className="w-3 h-3" />
                              WhatsApp
                            </Button>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="secondary">Segundo Aviso</Badge>
                          <Button size="sm" className="gap-1 bg-purple-600 hover:bg-purple-700">
                            Negociar
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Edit className="w-3 h-3" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </PageLoader>
    </Layout>
  );
}
