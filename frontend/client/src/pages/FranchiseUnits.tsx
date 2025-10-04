import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFranchiseUnitSchema } from "@shared/schema";
import { Paperclip, Upload, FileText, Trash2, Edit, Building2 } from "lucide-react";
import type { z } from "zod";
import { PageLoader, FadeIn, StaggeredFadeIn } from "@/components/PageLoader";

type FranchiseUnitFormData = z.infer<typeof insertFranchiseUnitSchema>;

export default function FranchiseUnits() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FranchiseUnitFormData | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});

  const { data: franchiseUnits, isLoading } = useQuery<any[]>({
    queryKey: ["/api/franchise-units"],
    retry: false,
  });

  const form = useForm<FranchiseUnitFormData>({
    resolver: zodResolver(insertFranchiseUnitSchema),
    defaultValues: {
      entityType: "pessoa_fisica",
      fullName: "",
      cpfNumber: "",
      cpfDocument: "",
      rgNumber: "",
      rgDocument: "",
      addressProof: "",
      addressProofDocument: "",
      maritalStatus: "",
      maritalStatusDocument: "",
      resumeDocument: "",
      assetDeclarationDocument: "",
      incomeProofDocument: "",
      socialContractDocument: "",
      cnpjNumber: "",
      cnpjDocument: "",
      stateRegistrationNumber: "",
      stateRegistrationDocument: "",
      partnersDocuments: "",
      partnersDocumentsNumber: "",
      negativeCertificatesDocument: "",
      initialCapitalDocument: "",
      cashFlowProofDocument: "",
      taxReturnDocument: "",
      bankReferencesContacts: "",
      bankReferencesDocument: "",
      desiredLocation: "",
      propertyDocuments: "",
      leaseContractDocument: "",
      floorPlanDocument: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { formData: FranchiseUnitFormData; files: Record<string, File> }) => {
      const formData = new FormData();
      
      // Add all text fields (including empty ones to satisfy Zod validation)
      Object.entries(data.formData).forEach(([key, value]) => {
        formData.append(key, value || "");
      });
      
      // Add all uploaded files
      Object.entries(data.files).forEach(([fieldName, file]) => {
        formData.append(fieldName, file);
      });
      
      const response = await fetch("/api/franchise-units", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to create franchise unit");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-units"] });
      toast({
        title: "Sucesso!",
        description: "Unidade franqueada cadastrada com sucesso.",
      });
      setIsDialogOpen(false);
      setUploadedFiles({});
      setPendingFiles({});
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar unidade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/franchise-units/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-units"] });
      toast({
        title: "Sucesso!",
        description: "Unidade excluída com sucesso.",
      });
      setDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao excluir unidade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (fieldName: any) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
        form.setValue(fieldName, file.name);
      }
    };
    input.click();
  };

  const onSubmit = (data: FranchiseUnitFormData) => {
    setPendingFormData(data);
    setPendingFiles(uploadedFiles);
    setSaveConfirmOpen(true);
  };

  const confirmSave = () => {
    if (pendingFormData) {
      createMutation.mutate({ formData: pendingFormData, files: pendingFiles });
    }
    setSaveConfirmOpen(false);
    setPendingFormData(null);
    setPendingFiles({});
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const canManageUnits = user?.role === 'admin';

  return (
    <Layout>
      <PageLoader>
        <div className="p-6 space-y-6">
          <FadeIn delay={200}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Cadastro de Unidades Franqueadas</h2>
                <p className="text-sm text-muted-foreground">Gerencie o cadastro de franqueados</p>
              </div>

              {canManageUnits && (
                <Button onClick={() => setIsDialogOpen(true)} data-testid="button-new-franchise">
                  <Building2 className="mr-2 h-4 w-4" />
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
          ) : !franchiseUnits || franchiseUnits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma unidade encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {canManageUnits
                    ? "Comece criando o primeiro cadastro de unidade franqueada."
                    : "Não há unidades cadastradas no sistema."}
                </p>
                {canManageUnits && (
                  <Button onClick={() => setIsDialogOpen(true)} data-testid="button-create-first-franchise">
                    <Building2 className="mr-2 h-4 w-4" />
                    Criar primeiro cadastro
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="franchise-units-grid">
              <StaggeredFadeIn stagger={150} className="contents">
                {franchiseUnits.map((unit: any) => (
                  <Card key={unit.id} className="card-hover transition-smooth" data-testid={`card-franchise-${unit.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building2 className="text-primary h-5 w-5" />
                        <span>{unit.entityType === "pessoa_fisica" ? unit.fullName : unit.cnpjNumber}</span>
                      </CardTitle>
                      <CardDescription>
                        {unit.entityType === "pessoa_fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {unit.entityType === "pessoa_fisica" && unit.cpfNumber && (
                          <div className="flex items-center text-muted-foreground">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>CPF: {unit.cpfNumber}</span>
                          </div>
                        )}
                        {unit.entityType === "pessoa_juridica" && unit.cnpjNumber && (
                          <div className="flex items-center text-muted-foreground">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>CNPJ: {unit.cnpjNumber}</span>
                          </div>
                        )}
                        {unit.desiredLocation && (
                          <div className="flex items-center text-muted-foreground">
                            <Building2 className="mr-2 h-4 w-4" />
                            <span className="truncate">{unit.desiredLocation}</span>
                          </div>
                        )}
                      </div>
                      {canManageUnits && (
                        <div className="mt-4 flex space-x-2">
                          <Button variant="outline" size="sm" data-testid={`button-edit-${unit.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteId(unit.id)} data-testid={`button-delete-${unit.id}`}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </StaggeredFadeIn>
            </div>
          )}
        </div>

        {/* Dialog para cadastro */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastro de Unidade Franqueada</DialogTitle>
              <DialogDescription>
                Preencha os dados do franqueado conforme o tipo de cadastro
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cadastro</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                          data-testid="radio-entity-type"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pessoa_fisica" id="pessoa_fisica" />
                            <label htmlFor="pessoa_fisica" className="cursor-pointer">Pessoa Física</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pessoa_juridica" id="pessoa_juridica" />
                            <label htmlFor="pessoa_juridica" className="cursor-pointer">Pessoa Jurídica</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Tabs defaultValue="dados_pessoa" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dados_pessoa">Dados do Franqueado</TabsTrigger>
                    <TabsTrigger value="dados_financeiros">Dados Financeiros</TabsTrigger>
                    <TabsTrigger value="dados_imobiliarios">Dados Imobiliários</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dados_pessoa" className="space-y-4 mt-4">
                    {form.watch("entityType") === "pessoa_fisica" ? (
                      <>
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Completo</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} data-testid="input-full-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cpfNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CPF</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} placeholder="000.000.000-00" data-testid="input-cpf-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cpfDocument"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Anexar PDF do CPF</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-cpf-document" />
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("cpfDocument")} data-testid="button-upload-cpf">
                                      <Paperclip className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="rgNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>RG</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} data-testid="input-rg-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="rgDocument"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Anexar PDF do RG</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-rg-document" />
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("rgDocument")} data-testid="button-upload-rg">
                                      <Paperclip className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="addressProof"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Comprovante de Residência (Endereço)</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} data-testid="input-address-proof" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="addressProofDocument"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Anexar PDF</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-address-proof-document" />
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("addressProofDocument")} data-testid="button-upload-address-proof">
                                      <Paperclip className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="maritalStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado Civil e Regime de Bens</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} data-testid="input-marital-status" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="maritalStatusDocument"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Anexar PDF</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-marital-status-document" />
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("maritalStatusDocument")} data-testid="button-upload-marital-status">
                                      <Paperclip className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="resumeDocument"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currículo ou Histórico Profissional/Empresarial</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-resume-document" />
                                  <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("resumeDocument")} data-testid="button-upload-resume">
                                    <Paperclip className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="assetDeclarationDocument"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Declaração de Bens e Situação Patrimonial</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-asset-declaration-document" />
                                  <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("assetDeclarationDocument")} data-testid="button-upload-asset-declaration">
                                    <Paperclip className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="incomeProofDocument"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comprovante de Renda/Capacidade Financeira</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-income-proof-document" />
                                  <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("incomeProofDocument")} data-testid="button-upload-income-proof">
                                    <Paperclip className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    ) : (
                      <>
                        <FormField
                          control={form.control}
                          name="socialContractDocument"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contrato Social/Estatuto</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-social-contract-document" />
                                  <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("socialContractDocument")} data-testid="button-upload-social-contract">
                                    <Paperclip className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cnpjNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CNPJ</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} placeholder="00.000.000/0000-00" data-testid="input-cnpj-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cnpjDocument"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Anexar PDF do CNPJ</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-cnpj-document" />
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("cnpjDocument")} data-testid="button-upload-cnpj">
                                      <Paperclip className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="stateRegistrationNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inscrição Estadual/Municipal</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} data-testid="input-state-registration-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="stateRegistrationDocument"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Anexar PDF</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-state-registration-document" />
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("stateRegistrationDocument")} data-testid="button-upload-state-registration">
                                      <Paperclip className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="partnersDocumentsNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Documentos dos Sócios (CPF, RG, etc)</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} data-testid="input-partners-documents-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="partnersDocuments"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Anexar PDF</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-partners-documents" />
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("partnersDocuments")} data-testid="button-upload-partners-documents">
                                      <Paperclip className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="negativeCertificatesDocument"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certidões Negativas (Tributárias, Trabalhistas e Cíveis)</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-negative-certificates-document" />
                                  <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("negativeCertificatesDocument")} data-testid="button-upload-negative-certificates">
                                    <Paperclip className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="dados_financeiros" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="initialCapitalDocument"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capital Disponível para Investimento Inicial</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-initial-capital-document" />
                              <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("initialCapitalDocument")} data-testid="button-upload-initial-capital">
                                <Paperclip className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cashFlowProofDocument"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prova de Capacidade de Giro (recursos para os primeiros meses)</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-cash-flow-proof-document" />
                              <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("cashFlowProofDocument")} data-testid="button-upload-cash-flow-proof">
                                <Paperclip className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxReturnDocument"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Declaração de Imposto de Renda (Pessoa Física ou Jurídica)</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-tax-return-document" />
                              <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("taxReturnDocument")} data-testid="button-upload-tax-return">
                                <Paperclip className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bankReferencesContacts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Referências Bancárias e Comerciais (Contatos)</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} data-testid="input-bank-references-contacts" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bankReferencesDocument"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Anexar PDF</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-bank-references-document" />
                                <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("bankReferencesDocument")} data-testid="button-upload-bank-references">
                                  <Paperclip className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="dados_imobiliarios" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="desiredLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localização Pretendida (Link)</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="https://maps.google.com/..." data-testid="input-desired-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="propertyDocuments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Documentos do Imóvel (se próprio ou locado)</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-property-documents" />
                              <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("propertyDocuments")} data-testid="button-upload-property-documents">
                                <Paperclip className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="leaseContractDocument"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contrato de Locação (se já existente)</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-lease-contract-document" />
                              <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("leaseContractDocument")} data-testid="button-upload-lease-contract">
                                <Paperclip className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="floorPlanDocument"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Planta Baixa ou Croqui da Unidade</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input {...field} value={field.value || ""} readOnly placeholder="Nenhum arquivo selecionado" data-testid="input-floor-plan-document" />
                              <Button type="button" size="sm" variant="outline" onClick={() => handleFileUpload("floorPlanDocument")} data-testid="button-upload-floor-plan">
                                <Paperclip className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <DialogFooter className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-save"
                  >
                    {createMutation.isPending ? "Salvando..." : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmação para salvar */}
        <AlertDialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
          <AlertDialogContent data-testid="modal-save-confirm">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Cadastro</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja cadastrar esta unidade franqueada? Verifique se todos os dados estão corretos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-save">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSave} data-testid="button-confirm-save">Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de confirmação para excluir */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent data-testid="modal-delete-confirm">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta unidade franqueada? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground" data-testid="button-confirm-delete">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageLoader>
    </Layout>
  );
}
