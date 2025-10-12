
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { API_BASE } from "@/lib/api";
import { Paperclip, Trash2 } from "lucide-react";
import { formatCPF, validateCPF } from "@/lib/cpfUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface UnitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: any;
}

export function UnitModal({ open, onOpenChange, unit }: UnitModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!unit;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    franchiseeType: "",
    
    // Pessoa Física
    franchiseeName: "",
    franchiseeCpf: "",
    franchiseeCpfDoc: "",
    franchiseeRg: "",
    franchiseeRgDoc: "",
    franchiseeResidenceAddress: "",
    franchiseeResidenceDoc: "",
    franchiseeMaritalStatus: "",
    franchiseeMaritalStatusDoc: "",
    franchiseeCurriculumDoc: "",
    franchiseeAssetsDoc: "",
    franchiseeIncomeDoc: "",
    
    // Pessoa Jurídica
    franchiseeSocialContractDoc: "",
    franchiseeCnpj: "",
    franchiseeCnpjDoc: "",
    franchiseeStateRegistration: "",
    franchiseeStateRegistrationDoc: "",
    franchiseePartnersDocsDoc: "",
    franchiseeCertificatesDoc: "",
    
    // Dados Financeiros
    financialCapitalDoc: "",
    financialCashFlowDoc: "",
    financialTaxReturnsDoc: "",
    financialBankReferences: "",
    financialBankReferencesDoc: "",
    
    // Dados Imobiliários
    realEstateLocation: "",
    realEstatePropertyDoc: "",
    realEstateLeaseDoc: "",
    realEstateFloorPlanDoc: "",
  });

  const [cpfError, setCpfError] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name || "",
        address: unit.address || "",
        phone: unit.phone || "",
        email: unit.email || "",
        franchiseeType: unit.franchiseeType || "",
        
        franchiseeName: unit.franchiseeName || "",
        franchiseeCpf: unit.franchiseeCpf || "",
        franchiseeCpfDoc: unit.franchiseeCpfDoc || "",
        franchiseeRg: unit.franchiseeRg || "",
        franchiseeRgDoc: unit.franchiseeRgDoc || "",
        franchiseeResidenceAddress: unit.franchiseeResidenceAddress || "",
        franchiseeResidenceDoc: unit.franchiseeResidenceDoc || "",
        franchiseeMaritalStatus: unit.franchiseeMaritalStatus || "",
        franchiseeMaritalStatusDoc: unit.franchiseeMaritalStatusDoc || "",
        franchiseeCurriculumDoc: unit.franchiseeCurriculumDoc || "",
        franchiseeAssetsDoc: unit.franchiseeAssetsDoc || "",
        franchiseeIncomeDoc: unit.franchiseeIncomeDoc || "",
        
        franchiseeSocialContractDoc: unit.franchiseeSocialContractDoc || "",
        franchiseeCnpj: unit.franchiseeCnpj || "",
        franchiseeCnpjDoc: unit.franchiseeCnpjDoc || "",
        franchiseeStateRegistration: unit.franchiseeStateRegistration || "",
        franchiseeStateRegistrationDoc: unit.franchiseeStateRegistrationDoc || "",
        franchiseePartnersDocsDoc: unit.franchiseePartnersDocsDoc || "",
        franchiseeCertificatesDoc: unit.franchiseeCertificatesDoc || "",
        
        financialCapitalDoc: unit.financialCapitalDoc || "",
        financialCashFlowDoc: unit.financialCashFlowDoc || "",
        financialTaxReturnsDoc: unit.financialTaxReturnsDoc || "",
        financialBankReferences: unit.financialBankReferences || "",
        financialBankReferencesDoc: unit.financialBankReferencesDoc || "",
        
        realEstateLocation: unit.realEstateLocation || "",
        realEstatePropertyDoc: unit.realEstatePropertyDoc || "",
        realEstateLeaseDoc: unit.realEstateLeaseDoc || "",
        realEstateFloorPlanDoc: unit.realEstateFloorPlanDoc || "",
      });
    } else {
      resetForm();
    }
  }, [unit]);

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      franchiseeType: "",
      franchiseeName: "",
      franchiseeCpf: "",
      franchiseeCpfDoc: "",
      franchiseeRg: "",
      franchiseeRgDoc: "",
      franchiseeResidenceAddress: "",
      franchiseeResidenceDoc: "",
      franchiseeMaritalStatus: "",
      franchiseeMaritalStatusDoc: "",
      franchiseeCurriculumDoc: "",
      franchiseeAssetsDoc: "",
      franchiseeIncomeDoc: "",
      franchiseeSocialContractDoc: "",
      franchiseeCnpj: "",
      franchiseeCnpjDoc: "",
      franchiseeStateRegistration: "",
      franchiseeStateRegistrationDoc: "",
      franchiseePartnersDocsDoc: "",
      franchiseeCertificatesDoc: "",
      financialCapitalDoc: "",
      financialCashFlowDoc: "",
      financialTaxReturnsDoc: "",
      financialBankReferences: "",
      financialBankReferencesDoc: "",
      realEstateLocation: "",
      realEstatePropertyDoc: "",
      realEstateLeaseDoc: "",
      realEstateFloorPlanDoc: "",
    });
    setCpfError("");
  };

  const handleCPFBlur = () => {
    if (formData.franchiseeCpf && !validateCPF(formData.franchiseeCpf)) {
      setCpfError("CPF inválido");
    } else {
      setCpfError("");
    }
  };

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 14) {
      return cleaned
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return value;
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/units", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: "Sucesso!",
        description: "Unidade cadastrada com sucesso",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Erro ao cadastrar:", error);
      const errorDetails = error?.response?.data?.details || error?.response?.data?.error || error.message;
      toast({
        title: "Erro",
        description: `Erro ao cadastrar unidade: ${JSON.stringify(errorDetails)}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/units/${unit.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: "Sucesso!",
        description: "Unidade atualizada com sucesso",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar:", error);
      const errorDetails = error?.response?.data?.details || error?.response?.data?.error || error.message;
      toast({
        title: "Erro",
        description: `Erro ao atualizar unidade: ${JSON.stringify(errorDetails)}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da unidade é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (formData.franchiseeType === "pessoa_fisica" && formData.franchiseeCpf && !validateCPF(formData.franchiseeCpf)) {
      setCpfError("CPF inválido");
      return;
    }

    // Helper function to convert empty strings to null
    const toNullIfEmpty = (value: string) => value === "" ? null : value;

    const submitData: any = {
      name: formData.name.trim(),
      address: toNullIfEmpty(formData.address),
      phone: toNullIfEmpty(formData.phone),
      email: toNullIfEmpty(formData.email),
      franchiseeType: formData.franchiseeType === "" ? null : formData.franchiseeType,
      
      franchiseeName: toNullIfEmpty(formData.franchiseeName),
      franchiseeCpf: formData.franchiseeCpf ? formData.franchiseeCpf.replace(/\D/g, "") : null,
      franchiseeCpfDoc: toNullIfEmpty(formData.franchiseeCpfDoc),
      franchiseeRg: toNullIfEmpty(formData.franchiseeRg),
      franchiseeRgDoc: toNullIfEmpty(formData.franchiseeRgDoc),
      franchiseeResidenceAddress: toNullIfEmpty(formData.franchiseeResidenceAddress),
      franchiseeResidenceDoc: toNullIfEmpty(formData.franchiseeResidenceDoc),
      franchiseeMaritalStatus: toNullIfEmpty(formData.franchiseeMaritalStatus),
      franchiseeMaritalStatusDoc: toNullIfEmpty(formData.franchiseeMaritalStatusDoc),
      franchiseeCurriculumDoc: toNullIfEmpty(formData.franchiseeCurriculumDoc),
      franchiseeAssetsDoc: toNullIfEmpty(formData.franchiseeAssetsDoc),
      franchiseeIncomeDoc: toNullIfEmpty(formData.franchiseeIncomeDoc),
      
      franchiseeSocialContractDoc: toNullIfEmpty(formData.franchiseeSocialContractDoc),
      franchiseeCnpj: formData.franchiseeCnpj ? formData.franchiseeCnpj.replace(/\D/g, "") : null,
      franchiseeCnpjDoc: toNullIfEmpty(formData.franchiseeCnpjDoc),
      franchiseeStateRegistration: toNullIfEmpty(formData.franchiseeStateRegistration),
      franchiseeStateRegistrationDoc: toNullIfEmpty(formData.franchiseeStateRegistrationDoc),
      franchiseePartnersDocsDoc: toNullIfEmpty(formData.franchiseePartnersDocsDoc),
      franchiseeCertificatesDoc: toNullIfEmpty(formData.franchiseeCertificatesDoc),
      
      financialCapitalDoc: toNullIfEmpty(formData.financialCapitalDoc),
      financialCashFlowDoc: toNullIfEmpty(formData.financialCashFlowDoc),
      financialTaxReturnsDoc: toNullIfEmpty(formData.financialTaxReturnsDoc),
      financialBankReferences: toNullIfEmpty(formData.financialBankReferences),
      financialBankReferencesDoc: toNullIfEmpty(formData.financialBankReferencesDoc),
      
      realEstateLocation: toNullIfEmpty(formData.realEstateLocation),
      realEstatePropertyDoc: toNullIfEmpty(formData.realEstatePropertyDoc),
      realEstateLeaseDoc: toNullIfEmpty(formData.realEstateLeaseDoc),
      realEstateFloorPlanDoc: toNullIfEmpty(formData.realEstateFloorPlanDoc),
    };

    console.log('Dados sendo enviados:', submitData);

    if (isEditing) {
      setPendingData(submitData);
      setIsConfirmDialogOpen(true);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const confirmUpdate = () => {
    if (pendingData) {
      updateMutation.mutate(pendingData);
      setIsConfirmDialogOpen(false);
      setPendingData(null);
    }
  };

  const handleUploadPdf = async (fieldName: keyof typeof formData) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,.pdf';
    input.onchange = async (e: any) => {
      const file: File | undefined = e.target.files?.[0];
      if (!file) return;
      setUploadingField(fieldName as string);
      try {
        const token = localStorage.getItem('authToken');
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API_BASE}/api/upload/unit-document`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
          credentials: 'include',
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Falha ao enviar PDF');
        }
        const payload = await res.json();
        setFormData(prev => ({ ...prev, [fieldName]: payload.url }));
        toast({ title: 'Arquivo anexado', description: 'PDF anexado com sucesso.' });
      } catch (err: any) {
        toast({ title: 'Erro ao anexar', description: err.message || 'Falha ao enviar PDF', variant: 'destructive' });
      } finally {
        setUploadingField(null);
      }
    };
    input.click();
  };

  const removeUploaded = (fieldName: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [fieldName]: "" }));
  };

  const AttachInput = ({ id, label, field }: { id: string; label: string; field: keyof typeof formData }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2 items-center">
        <Button 
          type="button" 
          variant={formData[field] ? "default" : "secondary"} 
          onClick={() => handleUploadPdf(field)} 
          disabled={uploadingField === field}
          className="flex-1"
        >
          <Paperclip className="h-4 w-4 mr-2" /> 
          {uploadingField === field ? 'Enviando...' : formData[field] ? 'PDF Anexado' : 'Anexar PDF'}
        </Button>
        {formData[field] && (
          <Button type="button" variant="destructive" size="icon" onClick={() => removeUploaded(field)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  const InputWithAttach = ({ 
    inputId, 
    label, 
    inputField, 
    attachField,
    type = "text",
    placeholder = "",
    maxLength,
    onInputChange,
    onInputBlur
  }: { 
    inputId: string; 
    label: string; 
    inputField: keyof typeof formData;
    attachField: keyof typeof formData;
    type?: string;
    placeholder?: string;
    maxLength?: number;
    onInputChange?: (value: string) => void;
    onInputBlur?: () => void;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex gap-2 items-center">
        <Input
          id={inputId}
          data-testid={`input-${inputField}`}
          type={type}
          placeholder={placeholder}
          value={formData[inputField] as string}
          onChange={(e) => {
            if (onInputChange) {
              onInputChange(e.target.value);
            } else {
              setFormData({ ...formData, [inputField]: e.target.value });
            }
          }}
          onBlur={onInputBlur}
          onKeyDown={(e) => e.stopPropagation()}
          maxLength={maxLength}
          className="flex-1"
        />
        <Button 
          type="button" 
          variant={formData[attachField] ? "default" : "outline"} 
          size="icon"
          onClick={() => handleUploadPdf(attachField)} 
          disabled={uploadingField === attachField}
          data-testid={`button-attach-${attachField}`}
          title={uploadingField === attachField ? 'Enviando...' : formData[attachField] ? 'PDF Anexado - Clique para trocar' : 'Anexar PDF'}
        >
          {uploadingField === attachField ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>
        {formData[attachField] && (
          <Button 
            type="button" 
            variant="destructive" 
            size="icon" 
            onClick={() => removeUploaded(attachField)}
            data-testid={`button-remove-${attachField}`}
            title="Remover anexo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  const TextareaWithAttach = ({ 
    textareaId, 
    label, 
    textareaField, 
    attachField,
    placeholder = ""
  }: { 
    textareaId: string; 
    label: string; 
    textareaField: keyof typeof formData;
    attachField: keyof typeof formData;
    placeholder?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={textareaId}>{label}</Label>
      <div className="flex gap-2 items-start">
        <Textarea
          id={textareaId}
          data-testid={`input-${textareaField}`}
          placeholder={placeholder}
          value={formData[textareaField] as string}
          onChange={(e) => setFormData({ ...formData, [textareaField]: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
          className="flex-1"
        />
        <Button 
          type="button" 
          variant={formData[attachField] ? "default" : "outline"} 
          size="icon"
          onClick={() => handleUploadPdf(attachField)} 
          disabled={uploadingField === attachField}
          data-testid={`button-attach-${attachField}`}
          title={uploadingField === attachField ? 'Enviando...' : formData[attachField] ? 'PDF Anexado - Clique para trocar' : 'Anexar PDF'}
        >
          {uploadingField === attachField ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>
        {formData[attachField] && (
          <Button 
            type="button" 
            variant="destructive" 
            size="icon" 
            onClick={() => removeUploaded(attachField)}
            data-testid={`button-remove-${attachField}`}
            title="Remover anexo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle data-testid="modal-title">
                {isEditing ? "Editar Unidade / Franquia" : "Nova Unidade / Franquia"}
              </DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Atualize as informações da unidade e dados de franquia" 
                  : "Preencha os dados para cadastrar uma nova unidade franqueada"}
              </DialogDescription>
            </div>
            {!isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({
                    name: "Unidade Centro - Teste",
                    address: "Rua das Flores, 123 - Centro",
                    phone: "(11) 98765-4321",
                    email: "centro@teste.com.br",
                    franchiseeType: "pessoa_fisica",
                    franchiseeName: "João da Silva Santos",
                    franchiseeCpf: "123.456.789-09",
                    franchiseeCpfDoc: "",
                    franchiseeRg: "12.345.678-9",
                    franchiseeRgDoc: "",
                    franchiseeResidenceAddress: "Av. Principal, 456 - Jardins",
                    franchiseeResidenceDoc: "",
                    franchiseeMaritalStatus: "Casado - Comunhão Parcial",
                    franchiseeMaritalStatusDoc: "",
                    franchiseeCurriculumDoc: "",
                    franchiseeAssetsDoc: "",
                    franchiseeIncomeDoc: "",
                    franchiseeSocialContractDoc: "",
                    franchiseeCnpj: "",
                    franchiseeCnpjDoc: "",
                    franchiseeStateRegistration: "",
                    franchiseeStateRegistrationDoc: "",
                    franchiseePartnersDocsDoc: "",
                    franchiseeCertificatesDoc: "",
                    financialCapitalDoc: "",
                    financialCashFlowDoc: "",
                    financialTaxReturnsDoc: "",
                    financialBankReferences: "Banco do Brasil - Ag 1234-5",
                    financialBankReferencesDoc: "",
                    realEstateLocation: "https://maps.google.com/?q=-23.550520,-46.633308",
                    realEstatePropertyDoc: "",
                    realEstateLeaseDoc: "",
                    realEstateFloorPlanDoc: "",
                  });
                  toast({
                    title: "Dados de teste carregados",
                    description: "Formulário preenchido com dados exemplares",
                  });
                }}
                className="ml-2"
              >
                📝 Dados de Teste
              </Button>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas da Unidade */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações Básicas da Unidade</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Unidade *</Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  data-testid="input-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  data-testid="input-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>

          {/* Tabs para organizar os dados */}
          <Tabs defaultValue="franchisee" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="franchisee" data-testid="tab-franchisee">Dados do Franqueado</TabsTrigger>
              <TabsTrigger value="financial" data-testid="tab-financial">Dados Financeiros</TabsTrigger>
              <TabsTrigger value="realestate" data-testid="tab-realestate">Dados Imobiliários</TabsTrigger>
            </TabsList>

            {/* Dados do Franqueado */}
            <TabsContent value="franchisee" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Dados do Franqueado</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="franchiseeType">Tipo de Franqueado</Label>
                  <Select
                    value={formData.franchiseeType}
                    onValueChange={(value) => setFormData({ ...formData, franchiseeType: value })}
                  >
                    <SelectTrigger id="franchiseeType" data-testid="select-franchiseeType">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                      <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.franchiseeType === "pessoa_fisica" && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold">Pessoa Física</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="franchiseeName">Nome Completo</Label>
                        <Input
                          id="franchiseeName"
                          data-testid="input-franchiseeName"
                          value={formData.franchiseeName}
                          onChange={(e) => setFormData({ ...formData, franchiseeName: e.target.value })}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="space-y-2">
                        <InputWithAttach
                          inputId="franchiseeCpf"
                          label="CPF"
                          inputField="franchiseeCpf"
                          attachField="franchiseeCpfDoc"
                          placeholder="000.000.000-00"
                          maxLength={14}
                          onInputChange={(value) => {
                            const formatted = formatCPF(value);
                            setFormData(prev => ({ ...prev, franchiseeCpf: formatted }));
                            setCpfError("");
                          }}
                          onInputBlur={handleCPFBlur}
                        />
                        {cpfError && <p className="text-sm text-red-500">{cpfError}</p>}
                      </div>

                      <InputWithAttach
                        inputId="franchiseeRg"
                        label="RG"
                        inputField="franchiseeRg"
                        attachField="franchiseeRgDoc"
                      />

                      <InputWithAttach
                        inputId="franchiseeResidenceAddress"
                        label="Endereço de Residência"
                        inputField="franchiseeResidenceAddress"
                        attachField="franchiseeResidenceDoc"
                      />

                      <InputWithAttach
                        inputId="franchiseeMaritalStatus"
                        label="Estado Civil e Regime de Bens"
                        inputField="franchiseeMaritalStatus"
                        attachField="franchiseeMaritalStatusDoc"
                      />

                      <AttachInput
                        id="franchiseeCurriculumDoc"
                        label="Currículo/Histórico Profissional"
                        field="franchiseeCurriculumDoc"
                      />

                      <AttachInput
                        id="franchiseeAssetsDoc"
                        label="Declaração de Bens"
                        field="franchiseeAssetsDoc"
                      />

                      <AttachInput
                        id="franchiseeIncomeDoc"
                        label="Comprovante de Renda"
                        field="franchiseeIncomeDoc"
                      />
                    </div>
                  </div>
                )}

                {formData.franchiseeType === "pessoa_juridica" && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold">Pessoa Jurídica</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AttachInput
                        id="franchiseeSocialContractDoc"
                        label="Contrato Social/Estatuto"
                        field="franchiseeSocialContractDoc"
                      />

                      <InputWithAttach
                        inputId="franchiseeCnpj"
                        label="CNPJ"
                        inputField="franchiseeCnpj"
                        attachField="franchiseeCnpjDoc"
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        onInputChange={(value) => {
                          const formatted = formatCNPJ(value);
                          setFormData(prev => ({ ...prev, franchiseeCnpj: formatted }));
                        }}
                      />

                      <InputWithAttach
                        inputId="franchiseeStateRegistration"
                        label="Inscrição Estadual/Municipal"
                        inputField="franchiseeStateRegistration"
                        attachField="franchiseeStateRegistrationDoc"
                      />

                      <AttachInput
                        id="franchiseePartnersDocsDoc"
                        label="Documentos dos Sócios"
                        field="franchiseePartnersDocsDoc"
                      />

                      <AttachInput
                        id="franchiseeCertificatesDoc"
                        label="Certidões Negativas"
                        field="franchiseeCertificatesDoc"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Dados Financeiros */}
            <TabsContent value="financial" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Dados Financeiros</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttachInput
                    id="financialCapitalDoc"
                    label="Capital Disponível para Investimento"
                    field="financialCapitalDoc"
                  />

                  <AttachInput
                    id="financialCashFlowDoc"
                    label="Prova de Capacidade de Giro"
                    field="financialCashFlowDoc"
                  />

                  <AttachInput
                    id="financialTaxReturnsDoc"
                    label="Declaração de Imposto de Renda"
                    field="financialTaxReturnsDoc"
                  />

                  <TextareaWithAttach
                    textareaId="financialBankReferences"
                    label="Referências Bancárias e Comerciais"
                    textareaField="financialBankReferences"
                    attachField="financialBankReferencesDoc"
                    placeholder="Contatos de referências"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Dados Imobiliários */}
            <TabsContent value="realestate" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Dados Imobiliários</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="realEstateLocation">Localização Pretendida (Link)</Label>
                    <Input
                      id="realEstateLocation"
                      data-testid="input-realEstateLocation"
                      placeholder="URL do Google Maps ou similar"
                      value={formData.realEstateLocation}
                      onChange={(e) => setFormData({ ...formData, realEstateLocation: e.target.value })}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>

                  <AttachInput
                    id="realEstatePropertyDoc"
                    label="Documentos do Imóvel"
                    field="realEstatePropertyDoc"
                  />

                  <AttachInput
                    id="realEstateLeaseDoc"
                    label="Contrato de Locação"
                    field="realEstateLeaseDoc"
                  />

                  <AttachInput
                    id="realEstateFloorPlanDoc"
                    label="Planta Baixa/Croqui"
                    field="realEstateFloorPlanDoc"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              )}
              {isEditing ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
      <AlertDialogContent data-testid="dialog-confirm-update">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar alterações</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja salvar as alterações realizadas na unidade <strong>"{formData.name}"</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-update">Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmUpdate}
            data-testid="button-confirm-update"
          >
            {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
