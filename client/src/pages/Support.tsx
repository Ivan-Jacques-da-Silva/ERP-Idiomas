import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  HelpCircle,
  Send,
  MessageCircle,
  Phone,
  Mail,
  Book,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Bug,
  Lightbulb,
  Users,
  Search,
  ExternalLink
} from "lucide-react";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  assignedTo?: string;
  responses?: SupportResponse[];
}

interface SupportResponse {
  id: string;
  message: string;
  isFromSupport: boolean;
  createdAt: Date;
  userId: string;
}

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados do formulário
  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const,
  });

  const [searchQuery, setSearchQuery] = useState("");

  // FAQ mock data
  const faqData = [
    {
      id: "1",
      category: "Geral",
      question: "Como faço para redefinir minha senha?",
      answer: "Para redefinir sua senha, acesse as Configurações > Segurança > Alterar Senha. Você também pode solicitar uma redefinição na tela de login clicando em 'Esqueci minha senha'."
    },
    {
      id: "2", 
      category: "Agenda",
      question: "Como adicionar uma nova aula na agenda?",
      answer: "Na página Agenda, clique em 'Nova Aula' e preencha as informações necessárias. Certifique-se de selecionar o professor, horário e sala corretos."
    },
    {
      id: "3",
      category: "Alunos",
      question: "Como matricular um novo aluno?",
      answer: "Vá para a seção Alunos e clique em 'Novo Aluno'. Preencha todos os dados obrigatórios e selecione o curso desejado. O aluno será adicionado automaticamente ao sistema."
    },
    {
      id: "4",
      category: "Sistema",
      question: "Por que não consigo acessar certas páginas?",
      answer: "O acesso às páginas é controlado por permissões baseadas no seu perfil (admin, professor, secretário, etc.). Entre em contato com o administrador se precisar de permissões adicionais."
    },
    {
      id: "5",
      category: "Relatórios",
      question: "Como gerar relatórios de frequência?",
      answer: "Os relatórios de frequência podem ser gerados na seção Relatórios. Selecione o período, turma ou aluno específico e clique em 'Gerar Relatório'."
    },
    {
      id: "6",
      category: "Backup",
      question: "Como fazer backup dos dados?",
      answer: "Apenas administradores podem fazer backup dos dados. Acesse Configurações > Avançado > Exportar Dados. Recomendamos fazer backups semanais."
    }
  ];

  // Filtrar FAQ baseado na busca
  const filteredFaq = faqData.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tickets mock (normalmente viria da API)
  const mockTickets: SupportTicket[] = [
    {
      id: "1",
      title: "Problema com login no sistema",
      description: "Não consigo fazer login mesmo com a senha correta",
      category: "Técnico",
      priority: "high",
      status: "in_progress",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      userId: user?.id || "",
    },
    {
      id: "2",
      title: "Sugestão de melhoria na agenda",
      description: "Seria útil ter filtros por professor na visualização da agenda",
      category: "Sugestão",
      priority: "low",
      status: "open",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      userId: user?.id || "",
    }
  ];

  // Mutation para criar ticket
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: typeof ticketForm) => {
      // Aqui seria feita a chamada para a API
      // const response = await apiRequest('/api/support/tickets', {
      //   method: 'POST',
      //   body: JSON.stringify(ticketData)
      // });
      
      // COMENTADO: Integração com email para notificar suporte
      // if (process.env.SUPPORT_EMAIL) {
      //   await fetch('/api/support/notify-email', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       to: process.env.SUPPORT_EMAIL,
      //       subject: `Novo ticket: ${ticketData.title}`,
      //       message: ticketData.description,
      //       priority: ticketData.priority,
      //       userId: user?.id,
      //       userEmail: user?.email
      //     })
      //   });
      // }
      
      return { success: true, ticketId: 'TICKET_' + Date.now() };
    },
    onSuccess: (data) => {
      toast({
        title: "Ticket criado com sucesso",
        description: `Seu ticket #${data.ticketId} foi criado. Entraremos em contato em breve.`,
      });
      setTicketForm({
        title: "",
        description: "",
        category: "",
        priority: "medium",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar ticket",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketForm.title || !ticketForm.description || !ticketForm.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate(ticketForm);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você precisa estar logado para acessar o suporte.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground" data-testid="text-support-title">
                Central de Ajuda
              </h1>
              <p className="text-sm text-muted-foreground">
                Encontre respostas ou entre em contato conosco
              </p>
            </div>
          </div>
          <Badge variant="secondary">
            OpenLife Suporte
          </Badge>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="faq" className="flex items-center space-x-1">
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="new-ticket" className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Ticket</span>
            </TabsTrigger>
            <TabsTrigger value="my-tickets" className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Meus Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Contato</span>
            </TabsTrigger>
          </TabsList>

          {/* FAQ */}
          <TabsContent value="faq" className="space-y-6">
            <Card data-testid="card-faq">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>Perguntas Frequentes</span>
                </CardTitle>
                <CardDescription>
                  Encontre respostas para as dúvidas mais comuns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Barra de pesquisa */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar na FAQ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-faq-search"
                  />
                </div>

                {/* FAQ Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaq.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start space-x-3">
                          <Badge variant="outline" className="text-xs">
                            {faq.category}
                          </Badge>
                          <span>{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2 pl-16">
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFaq.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhum resultado encontrado para "{searchQuery}"
                    </p>
                  </div>
                )}

                <Separator />

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm">Não encontrou sua resposta?</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Crie um ticket de suporte e nossa equipe entrará em contato com você.
                      </p>
                      <Button size="sm" className="mt-2" onClick={() => {
                        // Switch to new ticket tab
                        const ticketTab = document.querySelector('[value="new-ticket"]') as HTMLElement;
                        ticketTab?.click();
                      }}>
                        Criar Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Novo Ticket */}
          <TabsContent value="new-ticket" className="space-y-6">
            <Card data-testid="card-new-ticket">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Criar Novo Ticket</span>
                </CardTitle>
                <CardDescription>
                  Descreva seu problema ou sugestão detalhadamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={ticketForm.category}
                        onValueChange={(value) => 
                          setTicketForm(prev => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger id="category" data-testid="select-ticket-category">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tecnico">
                            <div className="flex items-center space-x-2">
                              <Bug className="h-4 w-4" />
                              <span>Problema Técnico</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="sugestao">
                            <div className="flex items-center space-x-2">
                              <Lightbulb className="h-4 w-4" />
                              <span>Sugestão de Melhoria</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="duvida">
                            <div className="flex items-center space-x-2">
                              <HelpCircle className="h-4 w-4" />
                              <span>Dúvida Geral</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="permissao">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>Solicitação de Acesso</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select
                        value={ticketForm.priority}
                        onValueChange={(value: any) => 
                          setTicketForm(prev => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger id="priority" data-testid="select-ticket-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={ticketForm.title}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Descreva brevemente o problema ou solicitação"
                      data-testid="input-ticket-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição Detalhada *</Label>
                    <Textarea
                      id="description"
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Forneça o máximo de detalhes possível sobre o problema, incluindo passos para reproduzi-lo, mensagens de erro, etc."
                      rows={6}
                      data-testid="textarea-ticket-description"
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="text-sm">
                        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Dicas para um ticket eficaz:
                        </h3>
                        <ul className="text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                          <li>Seja específico sobre o problema encontrado</li>
                          <li>Inclua passos detalhados para reproduzir o erro</li>
                          <li>Mencione qual navegador e sistema operacional está usando</li>
                          <li>Anexe prints de tela se relevante</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTicketForm({
                        title: "",
                        description: "",
                        category: "",
                        priority: "medium",
                      })}
                    >
                      Limpar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createTicketMutation.isPending}
                      data-testid="button-submit-ticket"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {createTicketMutation.isPending ? 'Enviando...' : 'Enviar Ticket'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meus Tickets */}
          <TabsContent value="my-tickets" className="space-y-6">
            <Card data-testid="card-my-tickets">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Meus Tickets</span>
                </CardTitle>
                <CardDescription>
                  Acompanhe o status dos seus tickets de suporte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTickets.length > 0 ? (
                  mockTickets.map((ticket) => (
                    <Card key={ticket.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="space-y-1">
                            <h3 className="font-medium">{ticket.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {ticket.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={getStatusColor(ticket.status)}>
                              {getStatusIcon(ticket.status)}
                              <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                              {ticket.priority === 'urgent' && 'Urgente'}
                              {ticket.priority === 'high' && 'Alta'}
                              {ticket.priority === 'medium' && 'Média'}
                              {ticket.priority === 'low' && 'Baixa'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Ticket #{ticket.id}</span>
                          <span>{ticket.createdAt.toLocaleDateString('pt-BR')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Você ainda não possui tickets de suporte
                    </p>
                    <Button variant="outline" onClick={() => {
                      const ticketTab = document.querySelector('[value="new-ticket"]') as HTMLElement;
                      ticketTab?.click();
                    }}>
                      Criar Primeiro Ticket
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contato */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card data-testid="card-contact-info">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span>Informações de Contato</span>
                  </CardTitle>
                  <CardDescription>
                    Entre em contato através dos canais abaixo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-sm text-muted-foreground">
                        suporte@openlife.com
                        {/* COMENTADO: Email configurável via .env */}
                        {/* {process.env.SUPPORT_EMAIL || 'suporte@openlife.com'} */}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Telefone</h3>
                      <p className="text-sm text-muted-foreground">
                        (11) 9999-9999
                        {/* COMENTADO: Telefone configurável via .env */}
                        {/* {process.env.SUPPORT_PHONE || '(11) 9999-9999'} */}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">
                        (11) 99999-9999
                        {/* COMENTADO: WhatsApp configurável via .env */}
                        {/* {process.env.SUPPORT_WHATSAPP || '(11) 99999-9999'} */}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-medium">Horário de Atendimento</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Segunda a Sexta: 8h às 18h</p>
                      <p>Sábados: 8h às 12h</p>
                      <p>Domingos: Fechado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-help-resources">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Book className="h-5 w-5" />
                    <span>Recursos de Ajuda</span>
                  </CardTitle>
                  <CardDescription>
                    Links úteis e documentação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start h-auto p-4" data-testid="link-manual">
                    <div className="flex items-center space-x-3">
                      <Book className="h-5 w-5 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium">Manual do Usuário</div>
                        <div className="text-sm text-muted-foreground">
                          Guia completo de uso do sistema
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start h-auto p-4" data-testid="link-tutorial">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-green-600" />
                      <div className="text-left">
                        <div className="font-medium">Tutoriais em Vídeo</div>
                        <div className="text-sm text-muted-foreground">
                          Aprenda através de vídeos práticos
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start h-auto p-4" data-testid="link-community">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                      <div className="text-left">
                        <div className="font-medium">Comunidade</div>
                        <div className="text-sm text-muted-foreground">
                          Fórum da comunidade de usuários
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </div>
                  </Button>

                  <Separator />

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div className="text-sm">
                        <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          Suporte de Emergência
                        </h3>
                        <p className="text-yellow-700 dark:text-yellow-300">
                          Para problemas críticos fora do horário comercial, 
                          envie um email marcando como "URGENTE" no assunto.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}