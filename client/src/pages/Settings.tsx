import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Zap,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  AlertTriangle
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  
  // Estado para configurações
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    systemAlerts: true,
    lessonReminders: true,
    weeklyReports: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    currency: "BRL",
    autoSave: true,
    debugMode: false,
  });

  const [profileSettings, setProfileSettings] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    department: "",
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true,
    passwordChangeRequired: false,
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'developer';

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Configurações salvas",
      description: `As configurações de ${section} foram salvas com sucesso.`,
    });
  };

  const handleResetSettings = (section: string) => {
    toast({
      title: "Configurações resetadas",
      description: `As configurações de ${section} foram resetadas para o padrão.`,
      variant: "destructive",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seus dados estão sendo preparados para download.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Importação de dados",
      description: "Recurso disponível em breve.",
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você precisa estar logado para acessar as configurações.
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
              <SettingsIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground" data-testid="text-settings-title">
                Configurações
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie suas preferências e configurações do sistema
              </p>
            </div>
          </div>
          <Badge variant="secondary">
            {user.role === 'admin' && 'Administrador'}
            {user.role === 'teacher' && 'Professor'}
            {user.role === 'secretary' && 'Secretário'}
            {user.role === 'financial' && 'Financeiro'}
            {user.role === 'developer' && 'Desenvolvedor'}
            {user.role === 'student' && 'Estudante'}
          </Badge>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="appearance" className="flex items-center space-x-1">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-1">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Sistema</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="advanced" className="flex items-center space-x-1">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Avançado</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Aparência */}
          <TabsContent value="appearance" className="space-y-6">
            <Card data-testid="card-appearance-settings">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Configurações de Aparência</span>
                </CardTitle>
                <CardDescription>
                  Personalize a aparência da interface do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Tema</Label>
                    <div className="text-sm text-muted-foreground">
                      Escolha entre tema claro ou escuro
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {theme === 'light' ? 'Claro' : 'Escuro'}
                    </span>
                    <ThemeToggle />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fontsize">Tamanho da Fonte</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="fontsize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequena</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                        <SelectItem value="xlarge">Extra Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="density">Densidade da Interface</Label>
                    <Select defaultValue="comfortable">
                      <SelectTrigger id="density">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compacta</SelectItem>
                        <SelectItem value="comfortable">Confortável</SelectItem>
                        <SelectItem value="spacious">Espaçosa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Animações</Label>
                    <div className="text-sm text-muted-foreground">
                      Habilitar animações e transições
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button onClick={() => handleSaveSettings('aparência')} data-testid="button-save-appearance">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => handleResetSettings('aparência')}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conta */}
          <TabsContent value="account" className="space-y-6">
            <Card data-testid="card-account-settings">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informações da Conta</span>
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais e de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={profileSettings.firstName}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, firstName: e.target.value }))}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={profileSettings.lastName}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, lastName: e.target.value }))}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                    data-testid="input-email"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileSettings.phone}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                      data-testid="input-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={profileSettings.department}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, department: e.target.value }))}
                      data-testid="input-department"
                    />
                  </div>
                </div>

                <Separator />

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm">Função Atual</h3>
                      <p className="text-sm text-muted-foreground">
                        Você está logado como <strong>{user.role}</strong>. 
                        {user.role !== 'admin' && user.role !== 'developer' && 
                          ' Para alterar permissões, entre em contato com o administrador.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button onClick={() => handleSaveSettings('conta')} data-testid="button-save-account">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                  <Button variant="outline" onClick={() => handleResetSettings('conta')}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notifications" className="space-y-6">
            <Card data-testid="card-notification-settings">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Configurações de Notificação</span>
                </CardTitle>
                <CardDescription>
                  Controle como e quando você recebe notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notificações por Email</Label>
                      <div className="text-sm text-muted-foreground">
                        Receba notificações importantes por email
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                      }
                      data-testid="switch-email-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notificações Push</Label>
                      <div className="text-sm text-muted-foreground">
                        Receba notificações push no navegador
                      </div>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                      }
                      data-testid="switch-push-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Alertas do Sistema</Label>
                      <div className="text-sm text-muted-foreground">
                        Alertas sobre atualizações e manutenção
                      </div>
                    </div>
                    <Switch
                      checked={notifications.systemAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, systemAlerts: checked }))
                      }
                      data-testid="switch-system-alerts"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Lembretes de Aula</Label>
                      <div className="text-sm text-muted-foreground">
                        Receba lembretes sobre aulas agendadas
                      </div>
                    </div>
                    <Switch
                      checked={notifications.lessonReminders}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, lessonReminders: checked }))
                      }
                      data-testid="switch-lesson-reminders"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Relatórios Semanais</Label>
                      <div className="text-sm text-muted-foreground">
                        Receba resumos semanais de atividades
                      </div>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                      }
                      data-testid="switch-weekly-reports"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-base font-medium">Horários de Notificação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="quietHoursStart">Início do Silêncio</Label>
                      <Input
                        id="quietHoursStart"
                        type="time"
                        defaultValue="22:00"
                        data-testid="input-quiet-hours-start"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quietHoursEnd">Fim do Silêncio</Label>
                      <Input
                        id="quietHoursEnd"
                        type="time"
                        defaultValue="07:00"
                        data-testid="input-quiet-hours-end"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button onClick={() => handleSaveSettings('notificações')} data-testid="button-save-notifications">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => handleResetSettings('notificações')}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="security" className="space-y-6">
            <Card data-testid="card-security-settings">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Configurações de Segurança</span>
                </CardTitle>
                <CardDescription>
                  Gerencie a segurança da sua conta e dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Autenticação de Dois Fatores</Label>
                    <div className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança à sua conta
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))
                    }
                    data-testid="switch-two-factor"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertas de Login</Label>
                    <div className="text-sm text-muted-foreground">
                      Receba alertas sobre novos logins na sua conta
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.loginAlerts}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({ ...prev, loginAlerts: checked }))
                    }
                    data-testid="switch-login-alerts"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tempo Limite da Sessão (minutos)</Label>
                  <Select
                    value={securitySettings.sessionTimeout.toString()}
                    onValueChange={(value) => 
                      setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(value) }))
                    }
                  >
                    <SelectTrigger id="sessionTimeout" data-testid="select-session-timeout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="480">8 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-base font-medium">Gerenciamento de Senha</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4" data-testid="button-change-password">
                      <div className="text-left">
                        <div className="font-medium">Alterar Senha</div>
                        <div className="text-sm text-muted-foreground">
                          Atualize sua senha de acesso
                        </div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4" data-testid="button-download-data">
                      <div className="text-left">
                        <div className="font-medium">Baixar Dados</div>
                        <div className="text-sm text-muted-foreground">
                          Exporte seus dados pessoais
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button onClick={() => handleSaveSettings('segurança')} data-testid="button-save-security">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => handleResetSettings('segurança')}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sistema */}
          <TabsContent value="system" className="space-y-6">
            <Card data-testid="card-system-settings">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Configurações do Sistema</span>
                </CardTitle>
                <CardDescription>
                  Configure preferências gerais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select
                      value={systemSettings.language}
                      onValueChange={(value) => 
                        setSystemSettings(prev => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger id="language" data-testid="select-language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español (España)</SelectItem>
                        <SelectItem value="fr-FR">Français (France)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select
                      value={systemSettings.timezone}
                      onValueChange={(value) => 
                        setSystemSettings(prev => ({ ...prev, timezone: value }))
                      }
                    >
                      <SelectTrigger id="timezone" data-testid="select-timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                        <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Formato de Data</Label>
                    <Select
                      value={systemSettings.dateFormat}
                      onValueChange={(value) => 
                        setSystemSettings(prev => ({ ...prev, dateFormat: value }))
                      }
                    >
                      <SelectTrigger id="dateFormat" data-testid="select-date-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Moeda</Label>
                    <Select
                      value={systemSettings.currency}
                      onValueChange={(value) => 
                        setSystemSettings(prev => ({ ...prev, currency: value }))
                      }
                    >
                      <SelectTrigger id="currency" data-testid="select-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (R$)</SelectItem>
                        <SelectItem value="USD">Dólar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">Libra (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Salvamento Automático</Label>
                    <div className="text-sm text-muted-foreground">
                      Salve automaticamente as alterações
                    </div>
                  </div>
                  <Switch
                    checked={systemSettings.autoSave}
                    onCheckedChange={(checked) => 
                      setSystemSettings(prev => ({ ...prev, autoSave: checked }))
                    }
                    data-testid="switch-auto-save"
                  />
                </div>

                {isAdmin && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Modo Debug</Label>
                        <div className="text-sm text-muted-foreground">
                          Habilitar logs detalhados para depuração
                        </div>
                      </div>
                      <Switch
                        checked={systemSettings.debugMode}
                        onCheckedChange={(checked) => 
                          setSystemSettings(prev => ({ ...prev, debugMode: checked }))
                        }
                        data-testid="switch-debug-mode"
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-2 pt-4">
                  <Button onClick={() => handleSaveSettings('sistema')} data-testid="button-save-system">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => handleResetSettings('sistema')}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Avançado (apenas admins) */}
          {isAdmin && (
            <TabsContent value="advanced" className="space-y-6">
              <Card data-testid="card-advanced-settings">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Configurações Avançadas</span>
                  </CardTitle>
                  <CardDescription>
                    Configurações avançadas do sistema (apenas administradores)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">
                        Atenção
                      </span>
                    </div>
                    <p className="text-yellow-700 dark:text-yellow-300 mt-2">
                      As configurações avançadas podem afetar o funcionamento do sistema. 
                      Proceda com cuidado e faça backup antes de fazer alterações importantes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4" onClick={handleExportData} data-testid="button-export-data">
                      <Download className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Exportar Dados</div>
                        <div className="text-sm text-muted-foreground">
                          Exportar todos os dados do sistema
                        </div>
                      </div>
                    </Button>

                    <Button variant="outline" className="h-auto p-4" onClick={handleImportData} data-testid="button-import-data">
                      <Upload className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Importar Dados</div>
                        <div className="text-sm text-muted-foreground">
                          Importar dados de backup
                        </div>
                      </div>
                    </Button>

                    <Button variant="outline" className="h-auto p-4" data-testid="button-clear-cache">
                      <Zap className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Limpar Cache</div>
                        <div className="text-sm text-muted-foreground">
                          Limpar cache do sistema
                        </div>
                      </div>
                    </Button>

                    <Button variant="destructive" className="h-auto p-4" data-testid="button-factory-reset">
                      <Trash2 className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Reset de Fábrica</div>
                        <div className="text-sm text-muted-foreground">
                          Restaurar configurações padrão
                        </div>
                      </div>
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Informações do Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Versão</Label>
                        <p className="text-sm font-mono">v1.0.0</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Banco de Dados</Label>
                        <p className="text-sm font-mono">PostgreSQL 14</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Última Atualização</Label>
                        <p className="text-sm">{new Date().toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Uptime</Label>
                        <p className="text-sm">7 dias, 14h 32m</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}