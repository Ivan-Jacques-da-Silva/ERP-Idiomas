
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
import { formatCPF, validateCPF } from "@/lib/cpfUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      return await apiRequest("/api/units", "POST", data);
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
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar unidade",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/units/${unit.id}`, "PUT", data);
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
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar unidade",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.franchiseeType === "pessoa_fisica" && formData.franchiseeCpf && !validateCPF(formData.franchiseeCpf)) {
      setCpfError("CPF inválido");
      return;
    }

    const submitData: any = {
      name: formData.name,
      address: formData.address || null,
      phone: formData.phone || null,
      email: formData.email || null,
      franchiseeType: formData.franchiseeType || null,
      
      franchiseeName: formData.franchiseeName || null,
      franchiseeCpf: formData.franchiseeCpf ? formData.franchiseeCpf.replace(/\D/g, "") : null,
      franchiseeCpfDoc: formData.franchiseeCpfDoc || null,
      franchiseeRg: formData.franchiseeRg || null,
      franchiseeRgDoc: formData.franchiseeRgDoc || null,
      franchiseeResidenceAddress: formData.franchiseeResidenceAddress || null,
      franchiseeResidenceDoc: formData.franchiseeResidenceDoc || null,
      franchiseeMaritalStatus: formData.franchiseeMaritalStatus || null,
      franchiseeMaritalStatusDoc: formData.franchiseeMaritalStatusDoc || null,
      franchiseeCurriculumDoc: formData.franchiseeCurriculumDoc || null,
      franchiseeAssetsDoc: formData.franchiseeAssetsDoc || null,
      franchiseeIncomeDoc: formData.franchiseeIncomeDoc || null,
      
      franchiseeSocialContractDoc: formData.franchiseeSocialContractDoc || null,
      franchiseeCnpj: formData.franchiseeCnpj ? formData.franchiseeCnpj.replace(/\D/g, "") : null,
      franchiseeCnpjDoc: formData.franchiseeCnpjDoc || null,
      franchiseeStateRegistration: formData.franchiseeStateRegistration || null,
      franchiseeStateRegistrationDoc: formData.franchiseeStateRegistrationDoc || null,
      franchiseePartnersDocsDoc: formData.franchiseePartnersDocsDoc || null,
      franchiseeCertificatesDoc: formData.franchiseeCertificatesDoc || null,
      
      financialCapitalDoc: formData.financialCapitalDoc || null,
      financialCashFlowDoc: formData.financialCashFlowDoc || null,
      financialTaxReturnsDoc: formData.financialTaxReturnsDoc || null,
      financialBankReferences: formData.financialBankReferences || null,
      financialBankReferencesDoc: formData.financialBankReferencesDoc || null,
      
      realEstateLocation: formData.realEstateLocation || null,
      realEstatePropertyDoc: formData.realEstatePropertyDoc || null,
      realEstateLeaseDoc: formData.realEstateLeaseDoc || null,
      realEstateFloorPlanDoc: formData.realEstateFloorPlanDoc || null,
    };

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="modal-title">
            {isEditing ? "Editar Unidade / Franquia" : "Nova Unidade / Franquia"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize as informações da unidade e dados de franquia" 
              : "Preencha os dados para cadastrar uma nova unidade franqueada"}
          </DialogDescription>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  data-testid="input-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  data-testid="input-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeCpf">CPF</Label>
                        <Input
                          id="franchiseeCpf"
                          data-testid="input-franchiseeCpf"
                          placeholder="000.000.000-00"
                          value={formData.franchiseeCpf}
                          onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            setFormData({ ...formData, franchiseeCpf: formatted });
                            setCpfError("");
                          }}
                          onBlur={handleCPFBlur}
                          maxLength={14}
                        />
                        {cpfError && <p className="text-sm text-red-500">{cpfError}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeCpfDoc">Anexo CPF (URL do PDF)</Label>
                        <Input
                          id="franchiseeCpfDoc"
                          data-testid="input-franchiseeCpfDoc"
                          placeholder="URL do documento"
                          value={formData.franchiseeCpfDoc}
                          onChange={(e) => setFormData({ ...formData, franchiseeCpfDoc: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeRg">RG</Label>
                        <Input
                          id="franchiseeRg"
                          data-testid="input-franchiseeRg"
                          value={formData.franchiseeRg}
                          onChange={(e) => setFormData({ ...formData, franchiseeRg: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeRgDoc">Anexo RG (URL do PDF)</Label>
                        <Input
                          id="franchiseeRgDoc"
                          data-testid="input-franchiseeRgDoc"
                          placeholder="URL do documento"
                          value={formData.franchiseeRgDoc}
                          onChange={(e) => setFormData({ ...formData, franchiseeRgDoc: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeResidenceAddress">Endereço de Residência</Label>
                        <Input
                          id="franchiseeResidenceAddress"
                          data-testid="input-franchiseeResidenceAddress"
                          value={formData.franchiseeResidenceAddress}
                          onChange={(e) => setFormData({ ...formData, franchiseeResidenceAddress: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeResidenceDoc">Comprovante de Residência (URL do PDF)</Label>
                        <Input
                          id="franchiseeResidenceDoc"
                          data-testid="input-franchiseeResidenceDoc"
                          placeholder="URL do documento"
                          value={formData.franchiseeResidenceDoc}
                          onChange={(e) => setFormData({ ...formData, franchiseeResidenceDoc: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeMaritalStatus">Estado Civil e Regime de Bens</Label>
                        <Input
                          id="franchiseeMaritalStatus"
                          data-testid="input-franchiseeMaritalStatus"
                          value={formData.franchiseeMaritalStatus}
                          onChange={(e) => setFormData({ ...formData, franchiseeMaritalStatus: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeMaritalStatusDoc">Anexo Estado Civil (URL do PDF)</Label>
                        <Input
                          id="franchiseeMaritalStatusDoc"
                          data-testid="input-franchiseeMaritalStatusDoc"
                          placeholder="URL do documento"
                          value={formData.franchiseeMaritalStatusDoc}
                          onChange={(e) => setFormData({ ...formData, franchiseeMaritalStatusDoc: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeCurriculumDoc">Currículo/Histórico Profissional (URL do PDF)</Label>
                        <Input
                          id="franchiseeCurriculumDoc"
                          data-testid="input-franchiseeCurriculumDoc"
                          placeholder="URL do documento"
                          value={formData.franchiseeCurriculumDoc}
                          onChange={(e) => setFormData({ ...formData, franchiseeCurriculumDoc: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeAssetsDoc">Declaração de Bens (URL do PDF)</Label>
                        <Input
                          id="franchiseeAssetsDoc"
                          data-testid="input-franchiseeAssetsDoc"
                          placeholder="URL do documento"
                          value={formData.franchiseeAssetsDoc}
                          onChange={(e) => setFormData({ ...formData, franchiseeAssetsDoc: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeIncomeDoc">Comprovante de Renda (URL do PDF)</Label>
                        <Input
                          id="franchiseeIncomeDoc"
                          data-testid="input-franchiseeIncomeDoc"
                          placeholder="URL do documento"
                          value={formData.franchiseeIncomeDoc}
                          onChange={(e) => setFormData({ ...formData, franchiseeIncomeDoc: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.franchiseeType === "pessoa_juridica" && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold">Pessoa Jurídica</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="franchiseeSocialContractDoc">Contrato Social/Estatuto (URL do PDF)</Label>
                        <Input
                          id="franchiseeSocialContractDoc"
                          data-testid="input-franchiseeSocialContractDoc"
                          placeholder="URL do documento"
                          value={formData.franchiseeSocialContractDoc}
                          onChange={(e) => setFormData({ ...formData, franchiseeSocialContractDoc: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeCnpj">CNPJ</Label>
                        <Input
                          id="franchiseeCnpj"
                          data-testid="input-franchiseeCnpj"
                          placeholder="00.000.000/0000-00"
                          value={formData.franchiseeCnpj}
                          onChange={(e) => {
                            const formatted = formatCNPJ(e.target.value);
                            setFormData({ ...formData, franchiseeCnpj: formatted });
                          }}
                          maxLength={18}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeCnpjDoc">Anexo CNPJ (URL do PDF)</Label>
                        <Input
                          id="franchiseeCnpjDoc"
                          data-testid="input-franchiseeCnpjDoc"
                          placeholder="URL do documento"
                          value={formData.franchiseeCnpjDoc}
                          onChange={(e) => setFormData({ ...formData, franchiseeCnpjDoc: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeStateRegistration">Inscrição Estadual/Municipal</Label>
                        <Input
                          id="franchiseeStateRegistration"
                          data-testid="input-franchiseeStateRegistration"
                          value={formData.franchiseeStateRegistration}
                          onChange={(e) => setFormData({ ...formData, franchiseeStateRegistration: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeStateRegistrationDoc">Anexo Inscrição (URL do PDF)</Label>
                        <Input
                          id="franchiseeStateRegistrationDoc"
                          data-testid="input-franchiseeStateRegistrationDoc"
                          placeholder="URL do documento"
                          value={formData.franchiseeStateRegistrationDoc}
                          onChange={(e) => setFormData({ ...formData, franchiseeStateRegistrationDoc: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseePartnersDocsDoc">Documentos dos Sócios (URL do PDF)</Label>
                        <Input
                          id="franchiseePartnersDocsDoc"
                          data-testid="input-franchiseePartnersDocsDoc"
                          placeholder="URL do documento"
                          value={formData.franchiseePartnersDocsDoc}
                          onChange={(e) => setFormData({ ...formData, franchiseePartnersDocsDoc: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="franchiseeCertificatesDoc">Certidões Negativas (URL do PDF)</Label>
                        <Input
                          id="franchiseeCertificatesDoc"
                          data-testid="input-franchiseeCertificatesDoc"
                          placeholder="URL do documento"
                          value={formData.franchiseeCertificatesDoc}
                          onChange={(e) => setFormData({ ...formData, franchiseeCertificatesDoc: e.target.value })}
                        />
                      </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="financialCapitalDoc">Capital Disponível para Investimento (URL do PDF)</Label>
                    <Input
                      id="financialCapitalDoc"
                      data-testid="input-financialCapitalDoc"
                      placeholder="URL do documento"
                      value={formData.financialCapitalDoc}
                      onChange={(e) => setFormData({ ...formData, financialCapitalDoc: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="financialCashFlowDoc">Prova de Capacidade de Giro (URL do PDF)</Label>
                    <Input
                      id="financialCashFlowDoc"
                      data-testid="input-financialCashFlowDoc"
                      placeholder="URL do documento"
                      value={formData.financialCashFlowDoc}
                      onChange={(e) => setFormData({ ...formData, financialCashFlowDoc: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="financialTaxReturnsDoc">Declaração de Imposto de Renda (URL do PDF)</Label>
                    <Input
                      id="financialTaxReturnsDoc"
                      data-testid="input-financialTaxReturnsDoc"
                      placeholder="URL do documento"
                      value={formData.financialTaxReturnsDoc}
                      onChange={(e) => setFormData({ ...formData, financialTaxReturnsDoc: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="financialBankReferences">Referências Bancárias e Comerciais</Label>
                    <Textarea
                      id="financialBankReferences"
                      data-testid="input-financialBankReferences"
                      placeholder="Contatos de referências"
                      value={formData.financialBankReferences}
                      onChange={(e) => setFormData({ ...formData, financialBankReferences: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="financialBankReferencesDoc">Anexo Referências (URL do PDF)</Label>
                    <Input
                      id="financialBankReferencesDoc"
                      data-testid="input-financialBankReferencesDoc"
                      placeholder="URL do documento"
                      value={formData.financialBankReferencesDoc}
                      onChange={(e) => setFormData({ ...formData, financialBankReferencesDoc: e.target.value })}
                    />
                  </div>
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="realEstatePropertyDoc">Documentos do Imóvel (URL do PDF)</Label>
                    <Input
                      id="realEstatePropertyDoc"
                      data-testid="input-realEstatePropertyDoc"
                      placeholder="URL do documento"
                      value={formData.realEstatePropertyDoc}
                      onChange={(e) => setFormData({ ...formData, realEstatePropertyDoc: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="realEstateLeaseDoc">Contrato de Locação (URL do PDF)</Label>
                    <Input
                      id="realEstateLeaseDoc"
                      data-testid="input-realEstateLeaseDoc"
                      placeholder="URL do documento"
                      value={formData.realEstateLeaseDoc}
                      onChange={(e) => setFormData({ ...formData, realEstateLeaseDoc: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="realEstateFloorPlanDoc">Planta Baixa/Croqui (URL do PDF)</Label>
                    <Input
                      id="realEstateFloorPlanDoc"
                      data-testid="input-realEstateFloorPlanDoc"
                      placeholder="URL do documento"
                      value={formData.realEstateFloorPlanDoc}
                      onChange={(e) => setFormData({ ...formData, realEstateFloorPlanDoc: e.target.value })}
                    />
                  </div>
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
  );
}
