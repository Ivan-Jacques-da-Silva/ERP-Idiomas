import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glassmorphism shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <i className="fas fa-graduation-cap text-primary-foreground text-2xl"></i>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-foreground">EduManage</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sistema de Gestão Escolar para Escola de Idiomas
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Bem-vindo de volta</h2>
            <p className="text-sm text-muted-foreground">
              Acesse sua conta para gerenciar alunos, professores e muito mais
            </p>
          </div>
          
          <Button 
            onClick={handleLogin}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3"
            size="lg"
            data-testid="button-login"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Entrar no Sistema
          </Button>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-users text-blue-600"></i>
              </div>
              <p className="text-xs text-muted-foreground">Gestão de<br />Alunos</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-calendar-alt text-green-600"></i>
              </div>
              <p className="text-xs text-muted-foreground">Agenda<br />Flexível</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
