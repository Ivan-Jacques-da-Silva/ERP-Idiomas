export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
}

export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}

export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

export async function fetchAddressByCEP(cep: string): Promise<{
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}> {
  const cleanCEP = cep.replace(/\D/g, '');
  
  if (cleanCEP.length !== 8) {
    throw new Error('CEP inválido');
  }
  
  const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
  const data = await response.json();
  
  if (data.erro) {
    throw new Error('CEP não encontrado');
  }
  
  return data;
}

export function formatDateToInput(date: any): string {
  if (!date) return "";
  
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    
    return dateObj.toISOString().slice(0, 10);
  } catch (error) {
    console.error('Error formatting date to input:', error);
    return "";
  }
}

export function formatDateToISO(dateString: string): string | null {
  if (!dateString) return null;
  
  try {
    const dateObj = new Date(dateString);
    
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error formatting date to ISO:', error);
    return null;
  }
}
