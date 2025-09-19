import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

// Form schema
const ticketFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").min(10, "Título deve ter pelo menos 10 caracteres"),
  description: z.string().min(1, "Descrição é obrigatória").min(20, "Descrição deve ter pelo menos 20 caracteres"),
  category: z.string().min(1, "Categoria é obrigatória"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Form setup
  const ticketForm = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
    },
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

  // Query para buscar tickets
  const { data: userTickets, isLoading: ticketsLoading, error: ticketsError } = useQuery({
    queryKey: ['/api/support/tickets'],
    enabled: !!user,
  });

  // Mutation para criar ticket
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: TicketFormValues) => {
      const response = await apiRequest('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify(ticketData)
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Ticket criado com sucesso",
        description: `Seu ticket #${data.id} foi criado. Entraremos em contato em breve.`,
      });
      ticketForm.reset();
      // Invalidate tickets cache
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar ticket",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const onSubmitTicket = (data: TicketFormValues) => {
    createTicketMutation.mutate(data);
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
                    <AccordionItem key={faq.id} value={faq.id} data-testid={`faq-item-${faq.id}`}>
                      <AccordionTrigger className="text-left" data-testid={`faq-question-${faq.id}`}>
                        <div className="flex items-start space-x-3">
                          <Badge variant="outline" className="text-xs" data-testid={`faq-category-${faq.id}`}>
                            {faq.category}
                          </Badge>
                          <span>{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent data-testid={`faq-answer-${faq.id}`}>
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
                      }} data-testid="button-create-ticket-from-faq">
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
                <Form {...ticketForm}>
                  <form onSubmit={ticketForm.handleSubmit(onSubmitTicket)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={ticketForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-ticket-category">
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                            </FormControl>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={ticketForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-ticket-priority">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Baixa</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={ticketForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Descreva brevemente o problema ou solicitação"
                            data-testid="input-ticket-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ticketForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Detalhada *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Forneça o máximo de detalhes possível sobre o problema, incluindo passos para reproduzi-lo, mensagens de erro, etc."
                            rows={6}
                            data-testid="textarea-ticket-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                      onClick={() => ticketForm.reset()}
                      data-testid="button-clear-ticket"
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
                </Form>
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
                {ticketsLoading ? (
                  <div className="text-center py-8" data-testid="tickets-loading">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando tickets...</p>
                  </div>
                ) : ticketsError ? (
                  <div className="text-center py-8" data-testid="tickets-error">
                    <p className="text-destructive mb-2">Erro ao carregar tickets</p>
                    <p className="text-sm text-muted-foreground">Tente recarregar a página</p>
                  </div>
                ) : userTickets && userTickets.length > 0 ? (
                  userTickets.map((ticket) => (
                    <Card key={ticket.id} className="border-l-4 border-l-primary" data-testid={`ticket-card-${ticket.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="space-y-1">
                            <h3 className="font-medium" data-testid={`ticket-title-${ticket.id}`}>{ticket.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`ticket-description-${ticket.id}`}>
                              {ticket.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={getStatusColor(ticket.status)} data-testid={`ticket-status-${ticket.id}`}>
                              {getStatusIcon(ticket.status)}
                              <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(ticket.priority)} data-testid={`ticket-priority-${ticket.id}`}>
                              {ticket.priority === 'urgent' && 'Urgente'}
                              {ticket.priority === 'high' && 'Alta'}
                              {ticket.priority === 'medium' && 'Média'}
                              {ticket.priority === 'low' && 'Baixa'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span data-testid={`ticket-id-${ticket.id}`}>Ticket #{ticket.id}</span>
                          <span data-testid={`ticket-date-${ticket.id}`}>{ticket.createdAt.toLocaleDateString('pt-BR')}</span>
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
                    }} data-testid="button-create-first-ticket">
                      Criar Primeiro Ticket
                    </Button>
                  </div>
                )
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
                  <Button variant="outline" className="w-full justify-start h-auto p-4" data-testid="button-manual">
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

                  <Button variant="outline" className="w-full justify-start h-auto p-4" data-testid="button-tutorial">
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

                  <Button variant="outline" className="w-full justify-start h-auto p-4" data-testid="button-community">
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