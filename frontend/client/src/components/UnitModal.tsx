import React, { useState, useEffect } from "react";
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
import { validateCPF } from "@/lib/cpfUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ===== Subcomponentes hoistados (estáveis) ===== */

type UploadFn = (campo: keyof FormDataShape) => void;
type RemoverFn = (campo: keyof FormDataShape) => void;

interface FormDataShape {
  name: string; address: string; phone: string; email: string; franchiseeType: string;
  franchiseeName: string; franchiseeCpf: string; franchiseeCpfDoc: string; franchiseeRg: string; franchiseeRgDoc: string;
  franchiseeResidenceAddress: string; franchiseeResidenceDoc: string; franchiseeMaritalStatus: string; franchiseeMaritalStatusDoc: string;
  franchiseeCurriculumDoc: string; franchiseeAssetsDoc: string; franchiseeIncomeDoc: string;
  franchiseeSocialContractDoc: string; franchiseeCnpj: string; franchiseeCnpjDoc: string; franchiseeStateRegistration: string; franchiseeStateRegistrationDoc: string;
  franchiseePartnersDocsDoc: string; franchiseeCertificatesDoc: string;
  financialCapitalDoc: string; financialCashFlowDoc: string; financialTaxReturnsDoc: string; financialBankReferences: string; financialBankReferencesDoc: string;
  realEstateLocation: string; realEstatePropertyDoc: string; realEstateLeaseDoc: string; realEstateFloorPlanDoc: string;
}

export function AttachInput({
  id, rotulo, campo, valorCampo, enviarPdf, removerAnexo, uploadingField
}: {
  id: string; rotulo: string; campo: keyof FormDataShape; valorCampo: string;
  enviarPdf: UploadFn; removerAnexo: RemoverFn; uploadingField: string | null;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{rotulo}</Label>
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          variant={valorCampo ? "default" : "secondary"}
          onClick={() => enviarPdf(campo)}
          disabled={uploadingField === campo}
          className="flex-1"
        >
          <Paperclip className="h-4 w-4 mr-2" />
          {uploadingField === campo ? "Enviando..." : valorCampo ? "PDF Anexado" : "Anexar PDF"}
        </Button>
        {valorCampo && (
          <Button type="button" variant="destructive" size="icon" onClick={() => removerAnexo(campo)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function InputComAnexo({
  inputId, rotulo, campoInput, campoAnexo, valorInput, valorAnexo,
  setValor, enviarPdf, removerAnexo, uploadingField,
  type = "text", placeholder = "", maxLength, aoSair
}: {
  inputId: string; rotulo: string;
  campoInput: keyof FormDataShape; campoAnexo: keyof FormDataShape;
  valorInput: string; valorAnexo: string;
  setValor: (v: string) => void;
  enviarPdf: UploadFn; removerAnexo: RemoverFn; uploadingField: string | null;
  type?: string; placeholder?: string; maxLength?: number; aoSair?: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{rotulo}</Label>
      <div className="flex gap-2 items-center">
        <Input
          id={inputId}
          data-testid={`input-${String(campoInput)}`}
          type={type}
          placeholder={placeholder}
          value={valorInput}
          onChange={(e) => setValor(e.target.value)}
          onBlur={aoSair}
          maxLength={maxLength}
          className="flex-1"
          autoComplete="off"
        />
        <Button
          type="button"
          variant={valorAnexo ? "default" : "outline"}
          size="icon"
          onClick={() => enviarPdf(campoAnexo)}
          disabled={uploadingField === campoAnexo}
          data-testid={`button-attach-${String(campoAnexo)}`}
          title={uploadingField === campoAnexo ? "Enviando..." : valorAnexo ? "PDF Anexado - Clique para trocar" : "Anexar PDF"}
        >
          {uploadingField === campoAnexo ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>
        {valorAnexo && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => removerAnexo(campoAnexo)}
            data-testid={`button-remove-${String(campoAnexo)}`}
            title="Remover anexo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function TextareaComAnexo({
  textareaId, rotulo, campoTexto, campoAnexo, valorTexto, valorAnexo,
  setValor, enviarPdf, removerAnexo, uploadingField, placeholder = ""
}: {
  textareaId: string; rotulo: string;
  campoTexto: keyof FormDataShape; campoAnexo: keyof FormDataShape;
  valorTexto: string; valorAnexo: string;
  setValor: (v: string) => void;
  enviarPdf: UploadFn; removerAnexo: RemoverFn; uploadingField: string | null;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={textareaId}>{rotulo}</Label>
      <div className="flex gap-2 items-start">
        <Textarea
          id={textareaId}
          data-testid={`input-${String(campoTexto)}`}
          placeholder={placeholder}
          value={valorTexto}
          onChange={(e) => setValor(e.target.value)}
          className="flex-1"
          autoComplete="off"
        />
        <Button
          type="button"
          variant={valorAnexo ? "default" : "outline"}
          size="icon"
          onClick={() => enviarPdf(campoAnexo)}
          disabled={uploadingField === campoAnexo}
          data-testid={`button-attach-${String(campoAnexo)}`}
          title={uploadingField === campoAnexo ? "Enviando..." : valorAnexo ? "PDF Anexado - Clique para trocar" : "Anexar PDF"}
        >
          {uploadingField === campoAnexo ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>
        {valorAnexo && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => removerAnexo(campoAnexo)}
            data-testid={`button-remove-${String(campoAnexo)}`}
            title="Remover anexo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ===== Componente principal ===== */

interface UnitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: any;
}

export function UnitModal({ open, onOpenChange, unit }: UnitModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!unit;

  const [formData, setFormData] = useState<FormDataShape>({
    name: "", address: "", phone: "", email: "", franchiseeType: "",
    franchiseeName: "", franchiseeCpf: "", franchiseeCpfDoc: "", franchiseeRg: "", franchiseeRgDoc: "",
    franchiseeResidenceAddress: "", franchiseeResidenceDoc: "", franchiseeMaritalStatus: "", franchiseeMaritalStatusDoc: "",
    franchiseeCurriculumDoc: "", franchiseeAssetsDoc: "", franchiseeIncomeDoc: "",
    franchiseeSocialContractDoc: "", franchiseeCnpj: "", franchiseeCnpjDoc: "", franchiseeStateRegistration: "", franchiseeStateRegistrationDoc: "",
    franchiseePartnersDocsDoc: "", franchiseeCertificatesDoc: "",
    financialCapitalDoc: "", financialCashFlowDoc: "", financialTaxReturnsDoc: "", financialBankReferences: "", financialBankReferencesDoc: "",
    realEstateLocation: "", realEstatePropertyDoc: "", realEstateLeaseDoc: "", realEstateFloorPlanDoc: "",
  });

  const [cpfError, setCpfError] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name || "", address: unit.address || "", phone: unit.phone || "", email: unit.email || "", franchiseeType: unit.franchiseeType || "",
        franchiseeName: unit.franchiseeName || "", franchiseeCpf: unit.franchiseeCpf || "", franchiseeCpfDoc: unit.franchiseeCpfDoc || "",
        franchiseeRg: unit.franchiseeRg || "", franchiseeRgDoc: unit.franchiseeRgDoc || "",
        franchiseeResidenceAddress: unit.franchiseeResidenceAddress || "", franchiseeResidenceDoc: unit.franchiseeResidenceDoc || "",
        franchiseeMaritalStatus: unit.franchiseeMaritalStatus || "", franchiseeMaritalStatusDoc: unit.franchiseeMaritalStatusDoc || "",
        franchiseeCurriculumDoc: unit.franchiseeCurriculumDoc || "", franchiseeAssetsDoc: unit.franchiseeAssetsDoc || "", franchiseeIncomeDoc: unit.franchiseeIncomeDoc || "",
        franchiseeSocialContractDoc: unit.franchiseeSocialContractDoc || "", franchiseeCnpj: unit.franchiseeCnpj || "", franchiseeCnpjDoc: unit.franchiseeCnpjDoc || "",
        franchiseeStateRegistration: unit.franchiseeStateRegistration || "", franchiseeStateRegistrationDoc: unit.franchiseeStateRegistrationDoc || "",
        franchiseePartnersDocsDoc: unit.franchiseePartnersDocsDoc || "", franchiseeCertificatesDoc: unit.franchiseeCertificatesDoc || "",
        financialCapitalDoc: unit.financialCapitalDoc || "", financialCashFlowDoc: unit.financialCashFlowDoc || "", financialTaxReturnsDoc: unit.financialTaxReturnsDoc || "",
        financialBankReferences: unit.financialBankReferences || "", financialBankReferencesDoc: unit.financialBankReferencesDoc || "",
        realEstateLocation: unit.realEstateLocation || "", realEstatePropertyDoc: unit.realEstatePropertyDoc || "", realEstateLeaseDoc: unit.realEstateLeaseDoc || "", realEstateFloorPlanDoc: unit.realEstateFloorPlanDoc || "",
      });
    } else {
      resetForm();
    }
  }, [unit]);

  const resetForm = () => {
    setFormData({
      name: "", address: "", phone: "", email: "", franchiseeType: "",
      franchiseeName: "", franchiseeCpf: "", franchiseeCpfDoc: "", franchiseeRg: "", franchiseeRgDoc: "",
      franchiseeResidenceAddress: "", franchiseeResidenceDoc: "", franchiseeMaritalStatus: "", franchiseeMaritalStatusDoc: "",
      franchiseeCurriculumDoc: "", franchiseeAssetsDoc: "", franchiseeIncomeDoc: "",
      franchiseeSocialContractDoc: "", franchiseeCnpj: "", franchiseeCnpjDoc: "", franchiseeStateRegistration: "", franchiseeStateRegistrationDoc: "",
      franchiseePartnersDocsDoc: "", franchiseeCertificatesDoc: "",
      financialCapitalDoc: "", financialCashFlowDoc: "", financialTaxReturnsDoc: "", financialBankReferences: "", financialBankReferencesDoc: "",
      realEstateLocation: "", realEstatePropertyDoc: "", realEstateLeaseDoc: "", realEstateFloorPlanDoc: "",
    });
    setCpfError("");
  };

  const aoSairCPF = () => {
    const soDigitos = formData.franchiseeCpf.replace(/\D/g, "");
    if (soDigitos && !validateCPF(soDigitos)) setCpfError("CPF inválido");
    else setCpfError("");
  };


  const criarMutacao = useMutation({
    mutationFn: async (dados: any) => apiRequest("POST", "/api/units", dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({ title: "Sucesso!", description: "Unidade cadastrada com sucesso" });
      onOpenChange(false);
      resetForm();
    },
    onError: (erro: any) => {
      const detalhes = erro?.response?.data?.details || erro?.response?.data?.error || erro.message;
      toast({ title: "Erro", description: `Erro ao cadastrar unidade: ${JSON.stringify(detalhes)}`, variant: "destructive" });
    },
  });

  const atualizarMutacao = useMutation({
    mutationFn: async (dados: any) => apiRequest("PUT", `/api/units/${unit?.id}`, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({ title: "Sucesso!", description: "Unidade atualizada com sucesso" });
      onOpenChange(false);
    },
    onError: (erro: any) => {
      const detalhes = erro?.response?.data?.details || erro?.response?.data?.error || erro.message;
      toast({ title: "Erro", description: `Erro ao atualizar unidade: ${JSON.stringify(detalhes)}`, variant: "destructive" });
    },
  });

  const aoEnviar = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({ title: "Erro", description: "Nome da unidade é obrigatório", variant: "destructive" });
      return;
    }
    if (formData.franchiseeType === "pessoa_fisica") {
      const cpfLimpo = formData.franchiseeCpf.replace(/\D/g, "");
      if (cpfLimpo && !validateCPF(cpfLimpo)) {
        setCpfError("CPF inválido");
        return;
      }
    }


    const nuloSeVazio = (v: string) => (v === "" ? null : v);

    const dados: any = {
      name: formData.name.trim(),
      address: nuloSeVazio(formData.address),
      phone: nuloSeVazio(formData.phone),
      email: nuloSeVazio(formData.email),
      franchiseeType: formData.franchiseeType === "" ? null : formData.franchiseeType,

      franchiseeName: nuloSeVazio(formData.franchiseeName),
      franchiseeCpf: formData.franchiseeCpf ? formData.franchiseeCpf.replace(/\D/g, "") : null,
      franchiseeCnpj: formData.franchiseeCnpj ? formData.franchiseeCnpj.replace(/\D/g, "") : null,
      franchiseeCpfDoc: nuloSeVazio(formData.franchiseeCpfDoc),
      franchiseeRg: nuloSeVazio(formData.franchiseeRg),
      franchiseeRgDoc: nuloSeVazio(formData.franchiseeRgDoc),
      franchiseeResidenceAddress: nuloSeVazio(formData.franchiseeResidenceAddress),
      franchiseeResidenceDoc: nuloSeVazio(formData.franchiseeResidenceDoc),
      franchiseeMaritalStatus: nuloSeVazio(formData.franchiseeMaritalStatus),
      franchiseeMaritalStatusDoc: nuloSeVazio(formData.franchiseeMaritalStatusDoc),
      franchiseeCurriculumDoc: nuloSeVazio(formData.franchiseeCurriculumDoc),
      franchiseeAssetsDoc: nuloSeVazio(formData.franchiseeAssetsDoc),
      franchiseeIncomeDoc: nuloSeVazio(formData.franchiseeIncomeDoc),

      franchiseeSocialContractDoc: nuloSeVazio(formData.franchiseeSocialContractDoc),
      franchiseeCnpjDoc: nuloSeVazio(formData.franchiseeCnpjDoc),
      franchiseeStateRegistration: nuloSeVazio(formData.franchiseeStateRegistration),
      franchiseeStateRegistrationDoc: nuloSeVazio(formData.franchiseeStateRegistrationDoc),
      franchiseePartnersDocsDoc: nuloSeVazio(formData.franchiseePartnersDocsDoc),
      franchiseeCertificatesDoc: nuloSeVazio(formData.franchiseeCertificatesDoc),

      financialCapitalDoc: nuloSeVazio(formData.financialCapitalDoc),
      financialCashFlowDoc: nuloSeVazio(formData.financialCashFlowDoc),
      financialTaxReturnsDoc: nuloSeVazio(formData.financialTaxReturnsDoc),
      financialBankReferences: nuloSeVazio(formData.financialBankReferences),
      financialBankReferencesDoc: nuloSeVazio(formData.financialBankReferencesDoc),

      realEstateLocation: nuloSeVazio(formData.realEstateLocation),
      realEstatePropertyDoc: nuloSeVazio(formData.realEstatePropertyDoc),
      realEstateLeaseDoc: nuloSeVazio(formData.realEstateLeaseDoc),
      realEstateFloorPlanDoc: nuloSeVazio(formData.realEstateFloorPlanDoc),
    };

    if (isEditing) atualizarMutacao.mutate(dados);
    else criarMutacao.mutate(dados);
  };
  // máscaras
  const formatarCPF = (valor: string) =>
    valor.replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);

  const formatarCNPJ = (valor: string) =>
    valor.replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
      .slice(0, 18);


  const enviarPdf = async (campo: keyof FormDataShape) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,.pdf";
    input.onchange = async (e: any) => {
      const file: File | undefined = e.target.files?.[0];
      if (!file) return;
      setUploadingField(String(campo));
      try {
        const token = localStorage.getItem("authToken");
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`${API_BASE}/api/upload/unit-document`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
          credentials: "include",
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Falha ao enviar PDF");
        }
        const payload = await res.json();
        setFormData((a) => ({ ...a, [campo]: payload.url as any }));
        toast({ title: "Arquivo anexado", description: "PDF anexado com sucesso." });
      } catch (err: any) {
        toast({ title: "Erro ao anexar", description: err.message || "Falha ao enviar PDF", variant: "destructive" });
      } finally {
        setUploadingField(null);
      }
    };
    input.click();
  };

  const removerAnexo = (campo: keyof FormDataShape) => {
    setFormData((a) => ({ ...a, [campo]: "" as any }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle data-testid="modal-title">
                {isEditing ? "Editar Unidade / Franquia" : "Nova Unidade / Franquia"}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? "Atualize as informações da unidade e dados de franquia" : "Preencha os dados para cadastrar uma nova unidade franqueada"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={aoEnviar}
          className="space-y-6"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault();
          }}
        >
          {/* Informações Básicas */}
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
                  onChange={(e) => setFormData((a) => ({ ...a, name: e.target.value }))}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  data-testid="input-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((a) => ({ ...a, phone: e.target.value }))}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((a) => ({ ...a, email: e.target.value }))}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  data-testid="input-address"
                  value={formData.address}
                  onChange={(e) => setFormData((a) => ({ ...a, address: e.target.value }))}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="franchisee" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="franchisee" data-testid="tab-franchisee">Dados do Franqueado</TabsTrigger>
              <TabsTrigger value="financial" data-testid="tab-financial">Dados Financeiros</TabsTrigger>
              <TabsTrigger value="realestate" data-testid="tab-realestate">Dados Imobiliários</TabsTrigger>
            </TabsList>

            {/* Franqueado */}
            <TabsContent value="franchisee" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Dados do Franqueado</h3>

                <div className="space-y-2">
                  <Label htmlFor="franchiseeType">Tipo de Franqueado</Label>
                  <Select
                    value={formData.franchiseeType}
                    onValueChange={(v) => setFormData((a) => ({ ...a, franchiseeType: v }))}
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
                          onChange={(e) => setFormData((a) => ({ ...a, franchiseeName: e.target.value }))}
                          autoComplete="off"
                        />
                      </div>

                      <div className="space-y-2">
                        <InputComAnexo
                          inputId="franchiseeCpf"
                          rotulo="CPF"
                          campoInput="franchiseeCpf"
                          campoAnexo="franchiseeCpfDoc"
                          valorInput={formData.franchiseeCpf}
                          valorAnexo={formData.franchiseeCpfDoc}
                          setValor={(v) => { setFormData(a => ({ ...a, franchiseeCpf: formatarCPF(v) })); setCpfError(""); }}
                          enviarPdf={enviarPdf}
                          removerAnexo={removerAnexo}
                          uploadingField={uploadingField}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          aoSair={aoSairCPF}
                        />

                        {cpfError && <p className="text-sm text-red-500">{cpfError}</p>}
                      </div>

                      <InputComAnexo
                        inputId="franchiseeRg"
                        rotulo="RG"
                        campoInput="franchiseeRg"
                        campoAnexo="franchiseeRgDoc"
                        valorInput={formData.franchiseeRg}
                        valorAnexo={formData.franchiseeRgDoc}
                        setValor={(v) => setFormData((a) => ({ ...a, franchiseeRg: v }))}
                        enviarPdf={enviarPdf}
                        removerAnexo={removerAnexo}
                        uploadingField={uploadingField}
                      />

                      <InputComAnexo
                        inputId="franchiseeResidenceAddress"
                        rotulo="Endereço de Residência"
                        campoInput="franchiseeResidenceAddress"
                        campoAnexo="franchiseeResidenceDoc"
                        valorInput={formData.franchiseeResidenceAddress}
                        valorAnexo={formData.franchiseeResidenceDoc}
                        setValor={(v) => setFormData((a) => ({ ...a, franchiseeResidenceAddress: v }))}
                        enviarPdf={enviarPdf}
                        removerAnexo={removerAnexo}
                        uploadingField={uploadingField}
                      />

                      <InputComAnexo
                        inputId="franchiseeMaritalStatus"
                        rotulo="Estado Civil e Regime de Bens"
                        campoInput="franchiseeMaritalStatus"
                        campoAnexo="franchiseeMaritalStatusDoc"
                        valorInput={formData.franchiseeMaritalStatus}
                        valorAnexo={formData.franchiseeMaritalStatusDoc}
                        setValor={(v) => setFormData((a) => ({ ...a, franchiseeMaritalStatus: v }))}
                        enviarPdf={enviarPdf}
                        removerAnexo={removerAnexo}
                        uploadingField={uploadingField}
                      />

                      <AttachInput id="franchiseeCurriculumDoc" rotulo="Currículo/Histórico Profissional" campo="franchiseeCurriculumDoc"
                        valorCampo={formData.franchiseeCurriculumDoc} enviarPdf={enviarPdf} removerAnexo={removerAnexo} uploadingField={uploadingField} />
                      <AttachInput id="franchiseeAssetsDoc" rotulo="Declaração de Bens" campo="franchiseeAssetsDoc"
                        valorCampo={formData.franchiseeAssetsDoc} enviarPdf={enviarPdf} removerAnexo={removerAnexo} uploadingField={uploadingField} />
                      <AttachInput id="franchiseeIncomeDoc" rotulo="Comprovante de Renda" campo="franchiseeIncomeDoc"
                        valorCampo={formData.franchiseeIncomeDoc} enviarPdf={enviarPdf} removerAnexo={removerAnexo} uploadingField={uploadingField} />
                    </div>
                  </div>
                )}

                {formData.franchiseeType === "pessoa_juridica" && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold">Pessoa Jurídica</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AttachInput id="franchiseeSocialContractDoc" rotulo="Contrato Social/Estatuto" campo="franchiseeSocialContractDoc"
                        valorCampo={formData.franchiseeSocialContractDoc} enviarPdf={enviarPdf} removerAnexo={removerAnexo} uploadingField={uploadingField} />

                      <InputComAnexo
                        inputId="franchiseeCnpj"
                        rotulo="CNPJ"
                        campoInput="franchiseeCnpj"
                        campoAnexo="franchiseeCnpjDoc"
                        valorInput={formData.franchiseeCnpj}
                        valorAnexo={formData.franchiseeCnpjDoc}
                        setValor={(v) => setFormData(a => ({ ...a, franchiseeCnpj: formatarCNPJ(v) }))}
                        enviarPdf={enviarPdf}
                        removerAnexo={removerAnexo}
                        uploadingField={uploadingField}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                      />


                      <InputComAnexo
                        inputId="franchiseeStateRegistration"
                        rotulo="Inscrição Estadual/Municipal"
                        campoInput="franchiseeStateRegistration"
                        campoAnexo="franchiseeStateRegistrationDoc"
                        valorInput={formData.franchiseeStateRegistration}
                        valorAnexo={formData.franchiseeStateRegistrationDoc}
                        setValor={(v) => setFormData((a) => ({ ...a, franchiseeStateRegistration: v }))}
                        enviarPdf={enviarPdf}
                        removerAnexo={removerAnexo}
                        uploadingField={uploadingField}
                      />

                      <AttachInput id="franchiseePartnersDocsDoc" rotulo="Documentos dos Sócios" campo="franchiseePartnersDocsDoc"
                        valorCampo={formData.franchiseePartnersDocsDoc} enviarPdf={enviarPdf} removerAnexo={removerAnexo} uploadingField={uploadingField} />
                      <AttachInput id="franchiseeCertificatesDoc" rotulo="Certidões Negativas" campo="franchiseeCertificatesDoc"
                        valorCampo={formData.franchiseeCertificatesDoc} enviarPdf={enviarPdf} removerAnexo={removerAnexo} uploadingField={uploadingField} />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Financeiros */}
            <TabsContent value="financial" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Dados Financeiros</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttachInput id="financialCapitalDoc" rotulo="Capital Disponível para Investimento" campo="financialCapitalDoc"
                    valorCampo={formData.financialCapitalDoc} enviarPdf={enviarPdf} removerAnexo={removerAnexo} uploadingField={uploadingField} />
                  <AttachInput id="financialCashFlowDoc" rotulo="Prova de Capacidade de Giro" campo="financialCashFlowDoc"
                    valorCampo={formData.financialCashFlowDoc} enviarPdf={enviarPdf} removerAnexo={removerAnexo} uploadingField={uploadingField} />
                  <AttachInput id="financialTaxReturnsDoc" rotulo="Declaração de Imposto de Renda" campo="financialTaxReturnsDoc"
                    valorCampo={formData.financialTaxReturnsDoc} enviarPdf={enviarPdf} removerAnexo={removerAnexo} uploadingField={uploadingField} />

                  <TextareaComAnexo
                    textareaId="financialBankReferences"
                    rotulo="Referências Bancárias e Comerciais"
                    campoTexto="financialBankReferences"
                    campoAnexo="financialBankReferencesDoc"
                    valorTexto={formData.financialBankReferences}
                    valorAnexo={formData.financialBankReferencesDoc}
                    setValor={(v) => setFormData((a) => ({ ...a, financialBankReferences: v }))}
                    enviarPdf={enviarPdf}
                    removerAnexo={removerAnexo}
                    uploadingField={uploadingField}
                    placeholder="Contatos de referências"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Imobiliários */}
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
                      onChange={(e) => setFormData((a) => ({ ...a, realEstateLocation: e.target.value }))}
                      autoComplete="off"
                    />
                  </div>

                  <AttachInput id="realEstatePropertyDoc" rotulo="Documentos do Imóvel" campo="realEstatePropertyDoc"
                    valorCampo={formData.realEstatePropertyDoc} enviarPdf={enviarPdf} removerAnexo={removerAnexo} uploadingField={uploadingField} />
                  <AttachInput id="realEstateLeaseDoc" rotulo="Contrato de Locação" campo="realEstateLeaseDoc"
                    valorCampo={formData.realEstateLeaseDoc} enviarPdf={enviarPdf} removerAnexo={removerAnexo} uploadingField={uploadingField} />
                  <AttachInput id="realEstateFloorPlanDoc" rotulo="Planta Baixa/Croqui" campo="realEstateFloorPlanDoc"
                    valorCampo={formData.realEstateFloorPlanDoc} enviarPdf={enviarPdf} removerAnexo={removerAnexo} uploadingField={uploadingField} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
              Cancelar
            </Button>
            <Button type="submit" disabled={criarMutacao.isPending || atualizarMutacao.isPending} data-testid="button-submit">
              {(criarMutacao.isPending || atualizarMutacao.isPending) && <i className="fas fa-spinner fa-spin mr-2"></i>}
              {isEditing ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
