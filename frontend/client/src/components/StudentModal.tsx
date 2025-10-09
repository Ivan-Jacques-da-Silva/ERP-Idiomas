import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { validateCPF, formatCPF, formatCEP, formatPhone, fetchAddressByCEP, formatDateToInput, formatDateToISO } from "@/lib/cpfUtils";

interface StudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: any;
}

export function StudentModal({ open, onOpenChange, student }: StudentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!student;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    cpf: "",
    birthDate: "",
    email: "",
    phone: "",
    whatsapp: "",
    gender: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    billingType: "",
    login: "",
    password: "",
  });

  const [guardianData, setGuardianData] = useState({
    firstName: "",
    lastName: "",
    cpf: "",
    birthDate: "",
    email: "",
    phone: "",
    whatsapp: "",
    gender: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    relationship: "",
  });

  const [financialData, setFinancialData] = useState({
    firstName: "",
    lastName: "",
    cpf: "",
    birthDate: "",
    email: "",
    phone: "",
    whatsapp: "",
    gender: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    relationship: "",
  });

  const [cpfError, setCpfError] = useState("");
  const [guardianCpfError, setGuardianCpfError] = useState("");
  const [financialCpfError, setFinancialCpfError] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [guardianCepLoading, setGuardianCepLoading] = useState(false);
  const [financialCepLoading, setFinancialCepLoading] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [hasGuardian, setHasGuardian] = useState(false);
  const [hasFinancialResponsible, setHasFinancialResponsible] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.user?.firstName || "",
        lastName: student.user?.lastName || "",
        cpf: student.cpf || "",
        birthDate: formatDateToInput(student.birthDate),
        email: student.user?.email || "",
        phone: student.phone || "",
        whatsapp: student.whatsapp || "",
        gender: student.gender || "",
        cep: student.cep || "",
        address: student.address || "",
        number: student.number || "",
        complement: student.complement || "",
        neighborhood: student.neighborhood || "",
        city: student.city || "",
        billingType: student.billingType || "",
        login: student.login || "",
        password: "",
      });

      if (student.guardian) {
        setHasGuardian(true);
        setGuardianData({
          firstName: student.guardian.firstName || "",
          lastName: student.guardian.lastName || "",
          cpf: student.guardian.cpf || "",
          birthDate: formatDateToInput(student.guardian.birthDate),
          email: student.guardian.email || "",
          phone: student.guardian.phone || "",
          whatsapp: student.guardian.whatsapp || "",
          gender: student.guardian.gender || "",
          cep: student.guardian.cep || "",
          address: student.guardian.address || "",
          number: student.guardian.number || "",
          complement: student.guardian.complement || "",
          neighborhood: student.guardian.neighborhood || "",
          city: student.guardian.city || "",
          relationship: student.guardian.relationship || "",
        });

        if (student.guardian.financialResponsible) {
          setHasFinancialResponsible(true);
          setFinancialData({
            firstName: student.guardian.financialResponsible.firstName || "",
            lastName: student.guardian.financialResponsible.lastName || "",
            cpf: student.guardian.financialResponsible.cpf || "",
            birthDate: formatDateToInput(student.guardian.financialResponsible.birthDate),
            email: student.guardian.financialResponsible.email || "",
            phone: student.guardian.financialResponsible.phone || "",
            whatsapp: student.guardian.financialResponsible.whatsapp || "",
            gender: student.guardian.financialResponsible.gender || "",
            cep: student.guardian.financialResponsible.cep || "",
            address: student.guardian.financialResponsible.address || "",
            number: student.guardian.financialResponsible.number || "",
            complement: student.guardian.financialResponsible.complement || "",
            neighborhood: student.guardian.financialResponsible.neighborhood || "",
            city: student.guardian.financialResponsible.city || "",
            relationship: student.guardian.financialResponsible.relationship || "",
          });
        }
      }
    } else {
      resetAllForms();
    }
  }, [student]);

  const resetAllForms = () => {
    setFormData({
      firstName: "",
      lastName: "",
      cpf: "",
      birthDate: "",
      email: "",
      phone: "",
      whatsapp: "",
      gender: "",
      cep: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      billingType: "",
      login: "",
      password: "",
    });
    setGuardianData({
      firstName: "",
      lastName: "",
      cpf: "",
      birthDate: "",
      email: "",
      phone: "",
      whatsapp: "",
      gender: "",
      cep: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      relationship: "",
    });
    setFinancialData({
      firstName: "",
      lastName: "",
      cpf: "",
      birthDate: "",
      email: "",
      phone: "",
      whatsapp: "",
      gender: "",
      cep: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      relationship: "",
    });
    setIsMinor(false);
    setHasGuardian(false);
    setHasFinancialResponsible(false);
  };

  const checkIfMinor = (birthDateStr: string) => {
    if (!birthDateStr) return false;
    
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      return (age - 1) < 18;
    }
    
    return age < 18;
  };

  useEffect(() => {
    const minor = checkIfMinor(formData.birthDate);
    setIsMinor(minor);
    if (minor && !isEditing) {
      setHasGuardian(true);
    }
  }, [formData.birthDate, isEditing]);

  const handleCPFBlur = (field: "student" | "guardian" | "financial") => {
    if (field === "student") {
      if (formData.cpf && !validateCPF(formData.cpf)) {
        setCpfError("CPF inválido");
      } else {
        setCpfError("");
      }
    } else if (field === "guardian") {
      if (guardianData.cpf && !validateCPF(guardianData.cpf)) {
        setGuardianCpfError("CPF inválido");
      } else {
        setGuardianCpfError("");
      }
    } else if (field === "financial") {
      if (financialData.cpf && !validateCPF(financialData.cpf)) {
        setFinancialCpfError("CPF inválido");
      } else {
        setFinancialCpfError("");
      }
    }
  };

  const handleCEPBlur = async (field: "student" | "guardian" | "financial") => {
    let cep = "";
    let setLoading: (loading: boolean) => void;
    let setData: (data: any) => void;
    let currentData: any;

    if (field === "student") {
      cep = formData.cep;
      setLoading = setCepLoading;
      setData = setFormData;
      currentData = formData;
    } else if (field === "guardian") {
      cep = guardianData.cep;
      setLoading = setGuardianCepLoading;
      setData = setGuardianData;
      currentData = guardianData;
    } else {
      cep = financialData.cep;
      setLoading = setFinancialCepLoading;
      setData = setFinancialData;
      currentData = financialData;
    }

    if (cep.replace(/\D/g, "").length === 8) {
      setLoading(true);
      try {
        const data = await fetchAddressByCEP(cep);
        setData({
          ...currentData,
          address: data.logradouro,
          neighborhood: data.bairro,
          city: `${data.localidade} - ${data.uf}`,
        });
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
        setLoading(false);
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/students", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Sucesso!",
        description: "Aluno cadastrado com sucesso",
      });
      onOpenChange(false);
      resetAllForms();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar aluno",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/students/${student.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Sucesso!",
        description: "Aluno atualizado com sucesso",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar aluno",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.cpf && !validateCPF(formData.cpf)) {
      setCpfError("CPF inválido");
      return;
    }

    if (hasGuardian && guardianData.cpf && !validateCPF(guardianData.cpf)) {
      setGuardianCpfError("CPF inválido");
      return;
    }

    if (hasFinancialResponsible && financialData.cpf && !validateCPF(financialData.cpf)) {
      setFinancialCpfError("CPF inválido");
      return;
    }

    const submitData: any = {
      userId: student?.userId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      cpf: formData.cpf.replace(/\D/g, ""),
      birthDate: formatDateToISO(formData.birthDate),
      gender: formData.gender || null,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      cep: formData.cep.replace(/\D/g, ""),
      address: formData.address,
      number: formData.number,
      complement: formData.complement,
      neighborhood: formData.neighborhood,
      city: formData.city,
      billingType: formData.billingType || null,
      login: formData.login,
      password: formData.password || null,
    };

    if (hasGuardian) {
      submitData.guardian = {
        firstName: guardianData.firstName,
        lastName: guardianData.lastName,
        cpf: guardianData.cpf.replace(/\D/g, ""),
        birthDate: formatDateToISO(guardianData.birthDate),
        email: guardianData.email,
        phone: guardianData.phone,
        whatsapp: guardianData.whatsapp,
        gender: guardianData.gender || null,
        cep: guardianData.cep.replace(/\D/g, ""),
        address: guardianData.address,
        number: guardianData.number,
        complement: guardianData.complement,
        neighborhood: guardianData.neighborhood,
        city: guardianData.city,
        relationship: guardianData.relationship,
      };

      if (hasFinancialResponsible) {
        submitData.guardian.financialResponsible = {
          firstName: financialData.firstName,
          lastName: financialData.lastName,
          cpf: financialData.cpf.replace(/\D/g, ""),
          birthDate: formatDateToISO(financialData.birthDate),
          email: financialData.email,
          phone: financialData.phone,
          whatsapp: financialData.whatsapp,
          gender: financialData.gender || null,
          cep: financialData.cep.replace(/\D/g, ""),
          address: financialData.address,
          number: financialData.number,
          complement: financialData.complement,
          neighborhood: financialData.neighborhood,
          city: financialData.city,
          relationship: financialData.relationship,
        };
      }
    }

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="modal-title">
            {isEditing ? "Editar Aluno" : "Novo Aluno"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize as informações do aluno" 
              : "Preencha os dados para cadastrar um novo aluno"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais do Aluno */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações do Aluno</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  data-testid="input-firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                  onBlur={() => handleCPFBlur("student")}
                  maxLength={14}
                />
                {cpfError && <p className="text-sm text-red-500">{cpfError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  data-testid="input-birthDate"
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
                {isMinor && !isEditing && (
                  <p className="text-sm text-amber-600">Aluno menor de idade - cadastro de responsável obrigatório</p>
                )}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contato *</Label>
                <Input
                  id="phone"
                  data-testid="input-phone"
                  required
                  placeholder="(00) 0000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  maxLength={15}
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
                />
              </div>
            </div>
          </div>

          {/* Endereço do Aluno */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Endereço</h3>
            
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
                    onBlur={() => handleCEPBlur("student")}
                    maxLength={9}
                  />
                  {cepLoading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  data-testid="input-address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  data-testid="input-complement"
                  value={formData.complement}
                  onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  data-testid="input-neighborhood"
                  required
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  data-testid="input-city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Informações de Cobrança e Acesso */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Cobrança e Acesso</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingType">Tipo de Cobrança *</Label>
                <Select
                  value={formData.billingType}
                  onValueChange={(value) => setFormData({ ...formData, billingType: value })}
                >
                  <SelectTrigger id="billingType" data-testid="select-billingType">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensalidade">Mensalidade</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="semestral">Semestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                    <SelectItem value="avulso">Avulso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login">Login *</Label>
                <Input
                  id="login"
                  data-testid="input-login"
                  required
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
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
                />
              </div>
            </div>
          </div>

          {/* Responsável/Tutor Legal (se menor de idade ou selecionado) */}
          {!isMinor && !isEditing && (
            <div className="flex items-center space-x-2 py-2">
              <Checkbox 
                id="hasGuardian"
                data-testid="checkbox-hasGuardian"
                checked={hasGuardian}
                onCheckedChange={(checked) => setHasGuardian(!!checked)}
              />
              <Label htmlFor="hasGuardian" className="cursor-pointer">
                Adicionar Responsável/Tutor Legal
              </Label>
            </div>
          )}

          {hasGuardian && (
            <div className="space-y-4 border-l-4 border-primary pl-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold border-b pb-2">Responsável/Tutor Legal {isMinor && "*"}</h3>
                {!isMinor && !isEditing && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setHasGuardian(false)}
                    data-testid="button-removeGuardian"
                  >
                    Remover
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardian-firstName">Nome *</Label>
                  <Input
                    id="guardian-firstName"
                    data-testid="input-guardian-firstName"
                    required={hasGuardian}
                    value={guardianData.firstName}
                    onChange={(e) => setGuardianData({ ...guardianData, firstName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-lastName">Sobrenome *</Label>
                  <Input
                    id="guardian-lastName"
                    data-testid="input-guardian-lastName"
                    required={hasGuardian}
                    value={guardianData.lastName}
                    onChange={(e) => setGuardianData({ ...guardianData, lastName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-cpf">CPF *</Label>
                  <Input
                    id="guardian-cpf"
                    data-testid="input-guardian-cpf"
                    required={hasGuardian}
                    placeholder="000.000.000-00"
                    value={guardianData.cpf}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      setGuardianData({ ...guardianData, cpf: formatted });
                      setGuardianCpfError("");
                    }}
                    onBlur={() => handleCPFBlur("guardian")}
                    maxLength={14}
                  />
                  {guardianCpfError && <p className="text-sm text-red-500">{guardianCpfError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-birthDate">Data de Nascimento *</Label>
                  <Input
                    id="guardian-birthDate"
                    data-testid="input-guardian-birthDate"
                    type="date"
                    required={hasGuardian}
                    value={guardianData.birthDate}
                    onChange={(e) => setGuardianData({ ...guardianData, birthDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-gender">Gênero *</Label>
                  <Select
                    value={guardianData.gender}
                    onValueChange={(value) => setGuardianData({ ...guardianData, gender: value })}
                  >
                    <SelectTrigger id="guardian-gender" data-testid="select-guardian-gender">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-relationship">Parentesco *</Label>
                  <Select
                    value={guardianData.relationship}
                    onValueChange={(value) => setGuardianData({ ...guardianData, relationship: value })}
                  >
                    <SelectTrigger id="guardian-relationship" data-testid="select-guardian-relationship">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pai">Pai</SelectItem>
                      <SelectItem value="mae">Mãe</SelectItem>
                      <SelectItem value="tutor">Tutor Legal</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-email">E-mail</Label>
                  <Input
                    id="guardian-email"
                    data-testid="input-guardian-email"
                    type="email"
                    value={guardianData.email}
                    onChange={(e) => setGuardianData({ ...guardianData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-phone">Telefone *</Label>
                  <Input
                    id="guardian-phone"
                    data-testid="input-guardian-phone"
                    required={hasGuardian}
                    placeholder="(00) 0000-0000"
                    value={guardianData.phone}
                    onChange={(e) => setGuardianData({ ...guardianData, phone: formatPhone(e.target.value) })}
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-whatsapp">WhatsApp *</Label>
                  <Input
                    id="guardian-whatsapp"
                    data-testid="input-guardian-whatsapp"
                    required={hasGuardian}
                    placeholder="(00) 00000-0000"
                    value={guardianData.whatsapp}
                    onChange={(e) => setGuardianData({ ...guardianData, whatsapp: formatPhone(e.target.value) })}
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-cep">CEP *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="guardian-cep"
                      data-testid="input-guardian-cep"
                      required={hasGuardian}
                      placeholder="00000-000"
                      value={guardianData.cep}
                      onChange={(e) => setGuardianData({ ...guardianData, cep: formatCEP(e.target.value) })}
                      onBlur={() => handleCEPBlur("guardian")}
                      maxLength={9}
                    />
                    {guardianCepLoading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-address">Endereço *</Label>
                  <Input
                    id="guardian-address"
                    data-testid="input-guardian-address"
                    required={hasGuardian}
                    value={guardianData.address}
                    onChange={(e) => setGuardianData({ ...guardianData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-number">Número *</Label>
                  <Input
                    id="guardian-number"
                    data-testid="input-guardian-number"
                    required={hasGuardian}
                    value={guardianData.number}
                    onChange={(e) => setGuardianData({ ...guardianData, number: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-complement">Complemento</Label>
                  <Input
                    id="guardian-complement"
                    data-testid="input-guardian-complement"
                    value={guardianData.complement}
                    onChange={(e) => setGuardianData({ ...guardianData, complement: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-neighborhood">Bairro *</Label>
                  <Input
                    id="guardian-neighborhood"
                    data-testid="input-guardian-neighborhood"
                    required={hasGuardian}
                    value={guardianData.neighborhood}
                    onChange={(e) => setGuardianData({ ...guardianData, neighborhood: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian-city">Cidade *</Label>
                  <Input
                    id="guardian-city"
                    data-testid="input-guardian-city"
                    required={hasGuardian}
                    value={guardianData.city}
                    onChange={(e) => setGuardianData({ ...guardianData, city: e.target.value })}
                  />
                </div>
              </div>

              {/* Opção para Responsável Financeiro/Avalista */}
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="hasFinancialResponsible"
                  data-testid="checkbox-hasFinancialResponsible"
                  checked={hasFinancialResponsible}
                  onCheckedChange={(checked) => setHasFinancialResponsible(!!checked)}
                />
                <Label htmlFor="hasFinancialResponsible" className="cursor-pointer">
                  Adicionar Responsável Legal e Financeiro/Avalista
                </Label>
              </div>
            </div>
          )}

          {/* Responsável Legal e Financeiro/Avalista */}
          {hasFinancialResponsible && hasGuardian && (
            <div className="space-y-4 border-l-4 border-secondary pl-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold border-b pb-2">Responsável Legal e Financeiro/Avalista</h3>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setHasFinancialResponsible(false)}
                  data-testid="button-removeFinancial"
                >
                  Remover
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="financial-firstName">Nome *</Label>
                  <Input
                    id="financial-firstName"
                    data-testid="input-financial-firstName"
                    required={hasFinancialResponsible}
                    value={financialData.firstName}
                    onChange={(e) => setFinancialData({ ...financialData, firstName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-lastName">Sobrenome *</Label>
                  <Input
                    id="financial-lastName"
                    data-testid="input-financial-lastName"
                    required={hasFinancialResponsible}
                    value={financialData.lastName}
                    onChange={(e) => setFinancialData({ ...financialData, lastName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-cpf">CPF *</Label>
                  <Input
                    id="financial-cpf"
                    data-testid="input-financial-cpf"
                    required={hasFinancialResponsible}
                    placeholder="000.000.000-00"
                    value={financialData.cpf}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      setFinancialData({ ...financialData, cpf: formatted });
                      setFinancialCpfError("");
                    }}
                    onBlur={() => handleCPFBlur("financial")}
                    maxLength={14}
                  />
                  {financialCpfError && <p className="text-sm text-red-500">{financialCpfError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-birthDate">Data de Nascimento *</Label>
                  <Input
                    id="financial-birthDate"
                    data-testid="input-financial-birthDate"
                    type="date"
                    required={hasFinancialResponsible}
                    value={financialData.birthDate}
                    onChange={(e) => setFinancialData({ ...financialData, birthDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-gender">Gênero *</Label>
                  <Select
                    value={financialData.gender}
                    onValueChange={(value) => setFinancialData({ ...financialData, gender: value })}
                  >
                    <SelectTrigger id="financial-gender" data-testid="select-financial-gender">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-relationship">Relação com Responsável *</Label>
                  <Select
                    value={financialData.relationship}
                    onValueChange={(value) => setFinancialData({ ...financialData, relationship: value })}
                  >
                    <SelectTrigger id="financial-relationship" data-testid="select-financial-relationship">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conjuge">Cônjuge</SelectItem>
                      <SelectItem value="familiar">Familiar</SelectItem>
                      <SelectItem value="avalista">Avalista</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-email">E-mail</Label>
                  <Input
                    id="financial-email"
                    data-testid="input-financial-email"
                    type="email"
                    value={financialData.email}
                    onChange={(e) => setFinancialData({ ...financialData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-phone">Telefone *</Label>
                  <Input
                    id="financial-phone"
                    data-testid="input-financial-phone"
                    required={hasFinancialResponsible}
                    placeholder="(00) 0000-0000"
                    value={financialData.phone}
                    onChange={(e) => setFinancialData({ ...financialData, phone: formatPhone(e.target.value) })}
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-whatsapp">WhatsApp *</Label>
                  <Input
                    id="financial-whatsapp"
                    data-testid="input-financial-whatsapp"
                    required={hasFinancialResponsible}
                    placeholder="(00) 00000-0000"
                    value={financialData.whatsapp}
                    onChange={(e) => setFinancialData({ ...financialData, whatsapp: formatPhone(e.target.value) })}
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-cep">CEP *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="financial-cep"
                      data-testid="input-financial-cep"
                      required={hasFinancialResponsible}
                      placeholder="00000-000"
                      value={financialData.cep}
                      onChange={(e) => setFinancialData({ ...financialData, cep: formatCEP(e.target.value) })}
                      onBlur={() => handleCEPBlur("financial")}
                      maxLength={9}
                    />
                    {financialCepLoading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-address">Endereço *</Label>
                  <Input
                    id="financial-address"
                    data-testid="input-financial-address"
                    required={hasFinancialResponsible}
                    value={financialData.address}
                    onChange={(e) => setFinancialData({ ...financialData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-number">Número *</Label>
                  <Input
                    id="financial-number"
                    data-testid="input-financial-number"
                    required={hasFinancialResponsible}
                    value={financialData.number}
                    onChange={(e) => setFinancialData({ ...financialData, number: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-complement">Complemento</Label>
                  <Input
                    id="financial-complement"
                    data-testid="input-financial-complement"
                    value={financialData.complement}
                    onChange={(e) => setFinancialData({ ...financialData, complement: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-neighborhood">Bairro *</Label>
                  <Input
                    id="financial-neighborhood"
                    data-testid="input-financial-neighborhood"
                    required={hasFinancialResponsible}
                    value={financialData.neighborhood}
                    onChange={(e) => setFinancialData({ ...financialData, neighborhood: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financial-city">Cidade *</Label>
                  <Input
                    id="financial-city"
                    data-testid="input-financial-city"
                    required={hasFinancialResponsible}
                    value={financialData.city}
                    onChange={(e) => setFinancialData({ ...financialData, city: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetAllForms();
              }}
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
