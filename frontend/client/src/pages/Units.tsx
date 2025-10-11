import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader, FadeIn, StaggeredFadeIn } from "@/components/PageLoader";
import { UnitModal } from "@/components/UnitModal";

export default function Units() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  const { data: units, isLoading } = useQuery<any[]>({
    queryKey: ["/api/units"],
    retry: false,
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
        window.location.href = "/landing";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const handleNewUnit = () => {
    setSelectedUnit(null);
    setIsModalOpen(true);
  };

  const handleEditUnit = (unit: any) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check permissions
  const canManageUnits = user?.role === 'admin';

  return (
    <Layout>
      <PageLoader>
        <div className="p-6 space-y-6">
          <FadeIn delay={200}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Unidades</h2>
                <p className="text-sm text-muted-foreground">Gerencie as unidades da escola</p>
              </div>

              {canManageUnits && (
                <Button onClick={handleNewUnit} data-testid="button-new-unit">
                  <i className="fas fa-plus mr-2"></i>
                  Nova Unidade
                </Button>
              )}
            </div>
          </FadeIn>

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
                  <Button onClick={handleNewUnit} data-testid="button-create-first-unit">
                    <i className="fas fa-plus mr-2"></i>
                    Criar primeira unidade
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="units-grid">
              <StaggeredFadeIn stagger={150} className="contents">
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditUnit(unit)}
                            data-testid={`button-edit-${unit.id}`}
                          >
                            <i className="fas fa-edit mr-2"></i>
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-testid={`button-delete-${unit.id}`}
                          >
                            <i className="fas fa-trash mr-2"></i>
                            Excluir
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )) || []}
              </StaggeredFadeIn>
            </div>
          )}
        </div>
      </PageLoader>
      
      <UnitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        unit={selectedUnit}
      />
    </Layout>
  );
}
