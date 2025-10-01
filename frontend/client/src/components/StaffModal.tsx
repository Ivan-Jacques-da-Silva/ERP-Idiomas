import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { validateCPF, formatCPF, formatCEP, formatPhone, fetchAddressByCEP } from "@/lib/cpfUtils";

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
    unitId: "",
  });

  const [cpfError, setCpfError] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  const { data: units } = useQuery<any[]>({
    queryKey: ["/api/units"],
  });

  useEffect(() => {
    if (staffMember) {
      setFormData({
        firstName: staffMember.user?.firstName || "",
        lastName: staffMember.user?.lastName || "",
        email: staffMember.user?.email || "",
        cpf: staffMember.cpf || "",
        birthDate: staffMember.birthDate ? new Date(staffMember.birthDate).toISOString().split('T')[0] : "",
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
        unitId: staffMember.unitId || "",
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
        unitId: "",
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
        setFormData({
          ...formData,
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
        setCepLoading(false);
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/staff", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Sucesso!",
        description: "Colaborador cadastrado com sucesso",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar colaborador",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/staff/${staffMember.id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Sucesso!",
        description: "Colaborador atualizado com sucesso",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar colaborador",
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

    const submitData = {
      userId: staffMember?.userId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      cpf: formData.cpf.replace(/\D/g, ""),
      birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
      gender: formData.gender || null,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      cep: formData.cep.replace(/\D/g, ""),
      address: formData.address,
      number: formData.number,
      complement: formData.complement,
      neighborhood: formData.neighborhood,
      city: formData.city,
      position: formData.position || null,
      unitId: formData.unitId || null,
    };

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const positionLabels: Record<string, string> = {
    ceo: "CEO",
    diretor: "Diretor",
    financeiro: "Financeiro",
    administrativo: "Administrativo",
    coordenador: "Coordenador",
    instrutor: "Instrutor",
    recepcionista: "Recepcionista",
    comercial: "Comercial",
    marketing: "Marketing",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="modal-title">
            {isEditing ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize as informações do colaborador" 
              : "Preencha os dados para cadastrar um novo colaborador"}
          </DialogDescription>
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
                  onBlur={handleCPFBlur}
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

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Endereço</h3>
            
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
                <Label htmlFor="unitId">Unidade</Label>
                <Select
                  value={formData.unitId}
                  onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                >
                  <SelectTrigger id="unitId" data-testid="select-unit">
                    <SelectValue placeholder="Selecione a unidade..." />
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
  );
}
