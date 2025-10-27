import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, extractErrorMessage } from "@/lib/queryClient";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { validateCPF, formatCPF, formatCEP, formatPhone, fetchAddressByCEP, formatDateBR, convertBRDateToISO } from "@/lib/cpfUtils";

interface StaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember?: any;
}

export function StaffModal({ open, onOpenChange, staffMember }: StaffModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!staffMember;

  const [formData, setFormData] = useState({
    // User info
    firstName: "",
    lastName: "",
    email: "",
    // Staff info
    cpf: "",
    birthDate: "",
    gender: "",
    phone: "",
    whatsapp: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    position: "",
    department: "",
    salary: "",
    hireDate: "",
    unitId: "",
    unitIds: [] as string[], // Multiple units selection
    login: "",
    password: "",
    // Guardian info (for minors)
    guardianName: "",
    guardianCpf: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelationship: "",
  });

  const [cpfError, setCpfError] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  // Menor de idade (corrigido, bordas)
  const isMinor = useMemo(() => {
    if (!formData.birthDate) return false;
    try {
      const [d, m, y] = formData.birthDate.split("/").map(Number);
      if (!d || !m || !y) return false;
      const nasc = new Date(y, m - 1, d);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nasc.getFullYear();
      const mdiff = hoje.getMonth() - nasc.getMonth();
      if (mdiff < 0 || (mdiff === 0 && hoje.getDate() < nasc.getDate())) idade--;
      return idade < 18;
    } catch {
      return false;
    }
  }, [formData.birthDate]);

  const { data: units } = useQuery<any[]>({
    queryKey: ["/api/units"],
    queryFn: () => apiRequest("GET", "/api/units"),
  });

  useEffect(() => {
    if (staffMember) {
      // birthDate → DD/MM/YYYY
      let formattedBirthDate = "";
      if (staffMember.birthDate) {
        try {
          const date = new Date(staffMember.birthDate);
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          formattedBirthDate = `${day}/${month}/${year}`;
        } catch (error) {
          console.error("Error formatting birth date:", error);
        }
      }

      // hireDate → DD/MM/YYYY
      let formattedHireDate = "";
      if (staffMember.hireDate) {
        try {
          const date = new Date(staffMember.hireDate);
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          formattedHireDate = `${day}/${month}/${year}`;
        } catch (error) {
          console.error("Error formatting hire date:", error);
        }
      }

      setFormData({
        firstName: staffMember.user?.firstName || "",
        lastName: staffMember.user?.lastName || "",
        email: staffMember.user?.email || "",
        cpf: staffMember.cpf || "",
        birthDate: formattedBirthDate,
        gender: staffMember.gender || "",
        phone: staffMember.phone || "",
        whatsapp: staffMember.whatsapp || "",
        cep: staffMember.cep || "",
        address: staffMember.address || "",
        number: staffMember.number || "",
        complement: staffMember.complement || "",
        neighborhood: staffMember.neighborhood || "",
        city: staffMember.city || "",
        position: staffMember.position || "",
        department: staffMember.department || "",
        salary: staffMember.salary != null ? String(staffMember.salary) : "",
        hireDate: formattedHireDate,
        unitId: staffMember.unitId || "",
        unitIds: staffMember.unitIds || [],
        login: staffMember.login || "",
        password: "",
        guardianName: staffMember.guardianName || "",
        guardianCpf: staffMember.guardianCpf || "",
        guardianPhone: staffMember.guardianPhone || "",
        guardianEmail: staffMember.guardianEmail || "",
        guardianRelationship: staffMember.guardianRelationship || "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        cpf: "",
        birthDate: "",
        gender: "",
        phone: "",
        whatsapp: "",
        cep: "",
        address: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        position: "",
        department: "",
        salary: "",
        hireDate: "",
        unitId: "",
        unitIds: [],
        login: "",
        password: "",
        guardianName: "",
        guardianCpf: "",
        guardianPhone: "",
        guardianEmail: "",
        guardianRelationship: "",
      });
    }
  }, [staffMember]);

  const handleCPFBlur = () => {
    if (formData.cpf && !validateCPF(formData.cpf)) {
      setCpfError("CPF inválido");
    } else {
      setCpfError("");
    }
  };

  const handleCEPBlur = async () => {
    if (formData.cep.replace(/\D/g, "").length === 8) {
      setCepLoading(true);
      try {
        const data = await fetchAddressByCEP(formData.cep);
        setFormData((prev) => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: `${data.localidade} - ${data.uf}`,
        }));
        toast({
          title: "CEP encontrado!",
          description: "Endereço preenchido automaticamente",
        });
      } catch (error) {
        toast({
          title: "CEP não encontrado",
          description: "Por favor, preencha o endereço manualmente",
          variant: "destructive",
        });
      } finally {
        setCepLoading(false);
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/staff", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast({
        title: "Sucesso!",
        description: "Colaborador cadastrado com sucesso",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: extractErrorMessage(error) || "Erro ao cadastrar colaborador",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/staff/${staffMember.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast({
        title: "Sucesso!",
        description: "Colaborador atualizado com sucesso",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: extractErrorMessage(error) || "Erro ao atualizar colaborador",
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    if (formData.cpf && !validateCPF(formData.cpf)) {
      setCpfError("CPF inválido");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const salarioNumero =
      formData.salary && formData.salary.trim() !== ""
        ? parseFloat(formData.salary.replace(/\./g, "").replace(",", "."))
        : null;

    // Payload
    const submitData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      cpf: formData.cpf,
      birthDate: convertBRDateToISO(formData.birthDate),
      gender: formData.gender,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      cep: formData.cep,
      address: formData.address,
      number: formData.number,
      complement: formData.complement,
      neighborhood: formData.neighborhood,
      city: formData.city,
      position: formData.position,
      department: formData.department,
      salary: salarioNumero,
      hireDate: convertBRDateToISO(formData.hireDate),
      unitId: formData.unitId,
      unitIds: formData.unitIds,
      login: formData.login,
    };

    if (isMinor) {
      submitData.guardianName = formData.guardianName;
      submitData.guardianCpf = formData.guardianCpf;
      submitData.guardianPhone = formData.guardianPhone;
      submitData.guardianEmail = formData.guardianEmail;
      submitData.guardianRelationship = formData.guardianRelationship;
    }

    if (staffMember) {
      if (formData.email && formData.email.trim() !== "" && formData.email !== staffMember.user?.email) {
        submitData.email = formData.email;
      }
      if (formData.password && formData.password.trim() !== "") {
        submitData.password = formData.password;
      }
    } else {
      if (!formData.email || formData.email.trim() === "") {
        toast({
          title: "Erro",
          description: "Email é obrigatório para criar um novo funcionário",
          variant: "destructive",
        });
        return;
      }
      submitData.email = formData.email;

      if (!formData.password || formData.password.trim() === "") {
        toast({
          title: "Erro",
          description: "Senha é obrigatória para criar um novo funcionário",
          variant: "destructive",
        });
        return;
      }
      submitData.password = formData.password;
    }

    setPendingFormData(submitData);
    setSaveConfirmOpen(true);
  };

  const confirmSave = () => {
    if (!pendingFormData) return;
    if (staffMember) {
      // PUT envia só o payload
      updateMutation.mutate(pendingFormData);
    } else {
      createMutation.mutate(pendingFormData);
    }
    setSaveConfirmOpen(false);
    setPendingFormData(null);
  };

  const positionLabels: Record<string, string> = {
    ceo: "CEO",
    diretor: "Diretor",
    financeiro: "Financeiro",
    administrativo: "Administrativo",
    coordenador: "Coordenador",
    instrutor: "Instrutor",
    professor: "Professor(a)",
    recepcionista: "Recepcionista",
    comercial: "Comercial",
    marketing: "Marketing",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle data-testid="modal-title">
                  {isEditing ? "Editar Colaborador" : "Novo Colaborador"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing ? "Atualize as informações do colaborador" : "Preencha os dados para cadastrar um novo colaborador"}
                </DialogDescription>
              </div>
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      firstName: "Maria",
                      lastName: "Oliveira Santos",
                      email: "maria.oliveira@teste.com.br",
                      cpf: "987.654.321-00",
                      birthDate: "15/05/1990",
                      gender: "feminino",
                      phone: "(11) 3456-7890",
                      whatsapp: "(11) 98765-4321",
                      cep: "01310-100",
                      address: "Av. Paulista",
                      number: "1000",
                      complement: "Sala 501",
                      neighborhood: "Bela Vista",
                      city: "São Paulo - SP",
                      position: "instrutor",
                      department: "Ensino",
                      salary: "3500,00",
                      hireDate: "01/03/2024",
                      unitId: units?.[0]?.id || "",
                      unitIds: [],
                      login: "maria.oliveira",
                      password: "teste123",
                      guardianName: "",
                      guardianCpf: "",
                      guardianPhone: "",
                      guardianEmail: "",
                      guardianRelationship: "",
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
            {/* Informações Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Pessoais</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome *</Label>
                  <Input
                    id="firstName"
                    data-testid="input-firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome *</Label>
                  <Input
                    id="lastName"
                    data-testid="input-lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    data-testid="input-cpf"
                    required
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      setFormData({ ...formData, cpf: formatted });
                      setCpfError("");
                    }}
                    onBlur={handleCPFBlur}
                    maxLength={14}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  {cpfError && <p className="text-sm text-red-500">{cpfError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    data-testid="input-birthDate"
                    type="text"
                    required
                    placeholder="DD/MM/AAAA"
                    value={formData.birthDate}
                    onChange={(e) => {
                      const formatted = formatDateBR(e.target.value);
                      setFormData({ ...formData, birthDate: formatted });
                    }}
                    maxLength={10}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger id="gender" data-testid="select-gender">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>

            {/* Contatos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contatos</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    data-testid="input-phone"
                    required
                    placeholder="(00) 0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                    maxLength={15}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    data-testid="input-whatsapp"
                    required
                    placeholder="(00) 00000-0000"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                    maxLength={15}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Endereço</h3>

              {/* Linha 1: CEP e Cidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      data-testid="input-cep"
                      required
                      placeholder="00000-000"
                      value={formData.cep}
                      onChange={(e) => setFormData({ ...formData, cep: formatCEP(e.target.value) })}
                      onBlur={handleCEPBlur}
                      maxLength={9}
                      onKeyDown={(e) => e.stopPropagation()}
                      disabled={cepLoading}
                    />
                    {cepLoading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    data-testid="input-city"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                    disabled={cepLoading}
                  />
                </div>
              </div>

              {/* Linha 2: Bairro, Endereço, Número */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    data-testid="input-neighborhood"
                    required
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                    disabled={cepLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço *</Label>
                  <Input
                    id="address"
                    data-testid="input-address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                    disabled={cepLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    data-testid="input-number"
                    required
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                    disabled={cepLoading}
                  />
                </div>
              </div>

              {/* Linha 3: Complemento */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    data-testid="input-complement"
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                    disabled={cepLoading}
                  />
                </div>
              </div>
            </div>

            {/* Informações Profissionais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Profissionais</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger id="position" data-testid="select-position">
                      <SelectValue placeholder="Selecione o cargo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(positionLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    data-testid="input-department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder="Ex: Ensino, Administrativo, Marketing..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salário (R$)</Label>
                  <Input
                    id="salary"
                    data-testid="input-salary"
                    type="text"
                    inputMode="decimal"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hireDate">Data de Contratação</Label>
                  <Input
                    id="hireDate"
                    data-testid="input-hire-date"
                    value={formData.hireDate}
                    onChange={(e) => {
                      const formatado = formatDateBR(e.target.value);
                      setFormData({ ...formData, hireDate: formatado });
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitId">Unidade Principal</Label>
                  <Select
                    value={formData.unitId}
                    onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                  >
                    <SelectTrigger id="unitId" data-testid="select-unit">
                      <SelectValue placeholder="Selecione a unidade principal..." />
                    </SelectTrigger>
                    <SelectContent>
                      {units?.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Unidades Adicionais</Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {units?.map((unit) => (
                        <div key={unit.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`unit-${unit.id}`}
                            checked={formData.unitIds.includes(unit.id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const newUnitIds = isChecked
                                ? [...formData.unitIds, unit.id]
                                : formData.unitIds.filter((id) => id !== unit.id);
                              setFormData({ ...formData, unitIds: newUnitIds });
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Label htmlFor={`unit-${unit.id}`} className="cursor-pointer text-sm">
                            {unit.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Selecione as unidades adicionais onde o colaborador pode atuar</p>
                </div>
              </div>
            </div>

            {/* Responsável Tutor (para menores de idade) */}
            {isMinor && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-600">
                  Responsável Tutor
                  <span className="text-sm font-normal text-amber-600 ml-2">(Obrigatório para menores de 18 anos)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Nome Completo *</Label>
                    <Input
                      id="guardianName"
                      data-testid="input-guardian-name"
                      required={isMinor}
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardianCpf">CPF *</Label>
                    <Input
                      id="guardianCpf"
                      data-testid="input-guardian-cpf"
                      required={isMinor}
                      value={formData.guardianCpf}
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value);
                        setFormData({ ...formData, guardianCpf: formatted });
                      }}
                      maxLength={14}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone">Telefone *</Label>
                    <Input
                      id="guardianPhone"
                      data-testid="input-guardian-phone"
                      required={isMinor}
                      value={formData.guardianPhone}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setFormData({ ...formData, guardianPhone: formatted });
                      }}
                      maxLength={15}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardianEmail">E-mail *</Label>
                    <Input
                      id="guardianEmail"
                      data-testid="input-guardian-email"
                      type="email"
                      required={isMinor}
                      value={formData.guardianEmail}
                      onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="guardianRelationship">Parentesco/Relação *</Label>
                    <Select
                      value={formData.guardianRelationship}
                      onValueChange={(value) => setFormData({ ...formData, guardianRelationship: value })}
                    >
                      <SelectTrigger id="guardianRelationship" data-testid="select-guardian-relationship">
                        <SelectValue placeholder="Selecione o parentesco..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pai">Pai</SelectItem>
                        <SelectItem value="mae">Mãe</SelectItem>
                        <SelectItem value="responsavel_legal">Responsável Legal</SelectItem>
                        <SelectItem value="tutor">Tutor</SelectItem>
                        <SelectItem value="avo">Avô/Avó</SelectItem>
                        <SelectItem value="tio">Tio/Tia</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Credenciais de Acesso */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Credenciais de Acesso</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Login *</Label>
                  <Input
                    id="login"
                    data-testid="input-login"
                    required
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha {!isEditing && "*"}</Label>
                  <Input
                    id="password"
                    data-testid="input-password"
                    type="password"
                    required={!isEditing}
                    placeholder={isEditing ? "Deixe em branco para manter a senha atual" : ""}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>

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

      <ConfirmationModal
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        title={isEditing ? "Confirmar Atualização" : "Confirmar Cadastro"}
        description={
          isEditing
            ? `Tem certeza de que deseja atualizar as informações do colaborador "${formData.firstName} ${formData.lastName}"?`
            : `Tem certeza de que deseja cadastrar o novo colaborador "${formData.firstName} ${formData.lastName}"?`
        }
        confirmText={isEditing ? "Atualizar" : "Cadastrar"}
        cancelText="Cancelar"
        onConfirm={confirmSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </>
  );
}