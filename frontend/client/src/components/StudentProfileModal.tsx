import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { displayDateBR, formatCPF, formatPhone } from "@/lib/cpfUtils";

interface StudentProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
}

export function StudentProfileModal({ open, onOpenChange, student }: StudentProfileModalProps) {
  if (!student) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'graduated': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'graduated': return 'Formado';
      default: return status;
    }
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'masculino': return 'Masculino';
      case 'feminino': return 'Feminino';
      default: return gender;
    }
  };

  const getRelationshipText = (relationship: string) => {
    switch (relationship) {
      case 'pai': return 'Pai';
      case 'mae': return 'Mãe';
      case 'tutor': return 'Tutor Legal';
      default: return relationship;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={student.user?.profileImageUrl} />
              <AvatarFallback>
                <i className="fas fa-user-graduate text-lg"></i>
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-semibold">
                {student.user?.firstName} {student.user?.lastName}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(student.status)}>
                  {getStatusText(student.status)}
                </Badge>
                {student.studentId && (
                  <span className="text-sm text-muted-foreground">
                    ID: {student.studentId}
                  </span>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-user text-primary"></i>
                <span>Informações Pessoais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                  <p className="text-sm">{student.user?.firstName} {student.user?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{student.user?.email || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CPF</label>
                  <p className="text-sm">{student.cpf ? formatCPF(student.cpf) : "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                  <p className="text-sm">{student.birthDate ? displayDateBR(student.birthDate) : "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                  <p className="text-sm">{student.gender ? getGenderText(student.gender) : "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-sm">{student.phone ? formatPhone(student.phone) : "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                  <p className="text-sm">{student.whatsapp ? formatPhone(student.whatsapp) : "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Matrícula</label>
                  <p className="text-sm">{student.enrollmentDate ? displayDateBR(student.enrollmentDate) : "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-map-marker-alt text-primary"></i>
                <span>Endereço</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CEP</label>
                  <p className="text-sm">{student.cep || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                  <p className="text-sm">{student.address || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Número</label>
                  <p className="text-sm">{student.number || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Complemento</label>
                  <p className="text-sm">{student.complement || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                  <p className="text-sm">{student.neighborhood || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                  <p className="text-sm">{student.city || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <p className="text-sm">{student.state || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsável/Guardian */}
          {student.guardian && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-user-friends text-primary"></i>
                  <span>Responsável</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                    <p className="text-sm">{student.guardian.firstName} {student.guardian.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Parentesco</label>
                    <p className="text-sm">{getRelationshipText(student.guardian.relationship)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CPF</label>
                    <p className="text-sm">{student.guardian.cpf ? formatCPF(student.guardian.cpf) : "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                    <p className="text-sm">{student.guardian.birthDate ? displayDateBR(student.guardian.birthDate) : "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                    <p className="text-sm">{student.guardian.gender ? getGenderText(student.guardian.gender) : "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <p className="text-sm">{student.guardian.phone ? formatPhone(student.guardian.phone) : "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{student.guardian.email || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                    <p className="text-sm">{student.guardian.whatsapp ? formatPhone(student.guardian.whatsapp) : "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Responsável Financeiro */}
          {student.guardian?.financialResponsible && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-credit-card text-primary"></i>
                  <span>Responsável Financeiro</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                    <p className="text-sm">{student.guardian.financialResponsible.firstName} {student.guardian.financialResponsible.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CPF</label>
                    <p className="text-sm">{student.guardian.financialResponsible.cpf ? formatCPF(student.guardian.financialResponsible.cpf) : "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                    <p className="text-sm">{student.guardian.financialResponsible.birthDate ? displayDateBR(student.guardian.financialResponsible.birthDate) : "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                    <p className="text-sm">{student.guardian.financialResponsible.gender ? getGenderText(student.guardian.financialResponsible.gender) : "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <p className="text-sm">{student.guardian.financialResponsible.phone ? formatPhone(student.guardian.financialResponsible.phone) : "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{student.guardian.financialResponsible.email || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                    <p className="text-sm">{student.guardian.financialResponsible.whatsapp ? formatPhone(student.guardian.financialResponsible.whatsapp) : "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Parentesco</label>
                    <p className="text-sm">{getRelationshipText(student.guardian.financialResponsible.relationship)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cursos e Matrículas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-book text-primary"></i>
                <span>Cursos e Matrículas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.enrollments && student.enrollments.length > 0 ? (
                <div className="space-y-3">
                  {student.enrollments.map((enrollment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{enrollment.course?.name || "Curso não especificado"}</p>
                        <p className="text-sm text-muted-foreground">
                          Nível: {enrollment.course?.level || "-"}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {enrollment.status === 'active' ? 'Ativo' : enrollment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum curso matriculado
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}