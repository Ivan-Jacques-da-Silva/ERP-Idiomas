import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader, FadeIn, StaggeredFadeIn } from "@/components/PageLoader";
import { UnitModal } from "@/components/UnitModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";

export default function Units() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading, user, permissions } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<any>(null);
  
  // Estados para filtros
  const [searchName, setSearchName] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const { data: units, isLoading } = useQuery<any[]>({
    queryKey: ["/api/units"],
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
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

  const handleDeleteClick = (unit: any) => {
    setUnitToDelete(unit);
    setIsDeleteDialogOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/units/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: "Sucesso!",
        description: "Unidade excluÃ­da com sucesso",
      });
      setIsDeleteDialogOpen(false);
      setUnitToDelete(null);
    },
    onError: (error: any) => {
      console.error("Erro ao excluir:", error);
      const errorDetails = error?.response?.data?.message || error.message;
      toast({
        title: "Erro",
        description: `Erro ao excluir unidade: ${errorDetails}`,
        variant: "destructive",
      });
    },
  });

  const confirmDelete = () => {
    if (unitToDelete) {
      deleteMutation.mutate(unitToDelete.id);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check permissions
  const canManageUnits = permissions?.includes('units:write') || user?.role === 'admin';

  // Extrair cidades Ãºnicas das unidades para o filtro
  const cityOptions = units ? [...new Set(units
    .map((unit: any) => unit.realEstateLocation)
    .filter(Boolean)
    .sort()
  )] : [];

  // Filtrar unidades baseado nos filtros aplicados
  const filteredUnits = units?.filter((unit: any) => {
    const matchesName = !searchName || unit.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesCity = !selectedCity || selectedCity === "all" || unit.realEstateLocation === selectedCity;
    return matchesName && matchesCity;
  });

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

          {/* Filtros e Controles */}
          <FadeIn delay={300}>
            <div className="flex justify-between items-center">
              <div></div> {/* EspaÃ§o vazio Ã  esquerda */}
              
              <div className="flex items-center gap-3">
                {/* Filtro por Nome */}
                <Input
                  placeholder="Buscar por nome..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-64"
                  data-testid="input-search-units"
                />
                
                {/* Filtro por Cidade */}
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-48" data-testid="select-city-filter">
                    <SelectValue placeholder="Filtrar por cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {cityOptions.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Modo de VisualizaÃ§Ã£o - Apenas Ãcones */}
                 <div className="flex gap-1 border rounded-md p-1">
                   <Button
                     variant={viewMode === "card" ? "default" : "ghost"}
                     size="sm"
                     onClick={() => setViewMode("card")}
                     className="px-3"
                   >
                     <i className="fas fa-th"></i>
                   </Button>
                   <Button
                     variant={viewMode === "list" ? "default" : "ghost"}
                     size="sm"
                     onClick={() => setViewMode("list")}
                     className="px-3"
                   >
                     <i className="fas fa-list"></i>
                   </Button>
                 </div>
              </div>
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
          ) : !filteredUnits || filteredUnits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <i className="fas fa-building text-muted-foreground text-6xl mb-4"></i>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {(searchName || (selectedCity && selectedCity !== "all")) ? "Nenhuma unidade encontrada" : "Nenhuma unidade cadastrada"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {(searchName || (selectedCity && selectedCity !== "all"))
                    ? "Tente ajustar os filtros de busca." 
                    : canManageUnits
                    ? "Comece criando sua primeira unidade."
                    : " hÃ¡ unidades cadastradas no sistema."}
                </p>
                {canManageUnits && !searchName && !(selectedCity && selectedCity !== "all") && (
                  <Button onClick={handleNewUnit} data-testid="button-create-first-unit">
                    <i className="fas fa-plus mr-2"></i>
                    Criar primeira unidade
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredUnits.length} {filteredUnits.length === 1 ? 'unidade encontrada' : 'unidades encontradas'}
                </p>
              </div>
              
              {viewMode === "card" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="units-grid">
                  <StaggeredFadeIn stagger={150} className="contents">
                    {filteredUnits.map((unit: any) => (
                    <Card key={unit.id} className="card-hover transition-smooth h-fit" data-testid={`card-unit-${unit.id}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-base">
                          <i className="fas fa-building text-primary text-sm"></i>
                          <span className="truncate">{unit.name}</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {unit.address && (
                            <span className="flex items-start text-xs text-muted-foreground">
                              <i className="fas fa-map-marker-alt mr-2 mt-0.5 flex-shrink-0"></i>
                              <span className="line-clamp-2">{unit.address}</span>
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {unit.phone && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <i className="fas fa-phone mr-2 w-3 flex-shrink-0"></i>
                              <span className="truncate">{unit.phone}</span>
                            </div>
                          )}
                          {unit.email && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <i className="fas fa-envelope mr-2 w-3 flex-shrink-0"></i>
                              <span className="truncate">{unit.email}</span>
                            </div>
                          )}
                        </div>
                        {canManageUnits && (
                          <div className="mt-3 flex flex-col sm:flex-row gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditUnit(unit)}
                              data-testid={`button-edit-${unit.id}`}
                              className="flex-1 text-xs h-8"
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteClick(unit)}
                              data-testid={`button-delete-${unit.id}`}
                              className="flex-1 text-xs h-8"
                            >
                              <i className="fas fa-trash mr-1"></i>
                              Excluir
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )) || []}
                  </StaggeredFadeIn>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell className="font-semibold">Nome</TableCell>
                        <TableCell className="font-semibold">EndereÃ§o</TableCell>
                        <TableCell className="font-semibold">Telefone</TableCell>
                        <TableCell className="font-semibold">Email</TableCell>
                        {canManageUnits && <TableCell className="font-semibold">AÃ§Ãµes</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUnits.map((unit: any) => (
                        <TableRow key={unit.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-building text-primary text-sm"></i>
                              <span>{unit.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {unit.address ? (
                              <div className="flex items-center text-sm">
                                <i className="fas fa-map-marker-alt mr-2 text-muted-foreground"></i>
                                <span>{unit.address}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {unit.phone ? (
                              <div className="flex items-center text-sm">
                                <i className="fas fa-phone mr-2 text-muted-foreground"></i>
                                <span>{unit.phone}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {unit.email ? (
                              <div className="flex items-center text-sm">
                                <i className="fas fa-envelope mr-2 text-muted-foreground"></i>
                                <span>{unit.email}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          {canManageUnits && (
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditUnit(unit)}
                                  data-testid={`button-edit-${unit.id}`}
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteClick(unit)}
                                  data-testid={`button-delete-${unit.id}`}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>
      </PageLoader>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-unit">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusÃ£o</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a unidade <strong>"{unitToDelete?.name}"</strong>?
              Esta aÃ§Ã£o nÃ£o pode ser desfeita e todos os dados relacionados serÃ£o permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir Unidade"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UnitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        unit={selectedUnit}
      />
    </Layout>
  );
}





