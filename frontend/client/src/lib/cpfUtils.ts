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
    
    // Retorna no formato YYYY-MM-DD para input type="date"
    return dateObj.toISOString().slice(0, 10);
  } catch (error) {
    console.error('Error formatting date to input:', error);
    return "";
  }
}

export function formatDateToISO(dateString: string): string | null {
  if (!dateString) return null;
  
  try {
    // Se já está no formato YYYY-MM-DD (do input date), converte diretamente
    const dateObj = new Date(dateString + 'T00:00:00.000Z');
    
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error formatting date to ISO:', error);
    return null;
  }
}

// Nova função para formatar data brasileira (DD/MM/YYYY)
export function formatDateBR(dateString: string): string {
  if (!dateString) return "";
  
  // Remove caracteres não numéricos
  const numbers = dateString.replace(/\D/g, "");
  
  // Aplica máscara DD/MM/YYYY
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return numbers.replace(/(\d{2})(\d{0,2})/, "$1/$2");
  } else {
    return numbers.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3").slice(0, 10);
  }
}

// Função para converter data brasileira (DD/MM/YYYY) para formato ISO
export function convertBRDateToISO(brDate: string): string | null {
  if (!brDate) return null;
  
  // Remove caracteres não numéricos
  const numbers = brDate.replace(/\D/g, "");
  
  // Verifica se tem 8 dígitos (DDMMYYYY)
  if (numbers.length !== 8) return null;
  
  const day = numbers.slice(0, 2);
  const month = numbers.slice(2, 4);
  const year = numbers.slice(4, 8);
  
  // Valida dia, mês e ano
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  
  if (dayNum < 1 || dayNum > 31) return null;
  if (monthNum < 1 || monthNum > 12) return null;
  if (yearNum < 1900 || yearNum > 2100) return null;
  
  try {
    // Cria data no formato ISO (YYYY-MM-DD)
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const dateObj = new Date(isoDate + 'T00:00:00.000Z');
    
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error converting BR date to ISO:', error);
    return null;
  }
}

// Função para exibir datas no formato brasileiro DD/MM/AAAA
export function displayDateBR(date: string | Date | null | undefined): string {
  if (!date) return "-";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return "-";
    }
    
    return dateObj.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Error displaying date in BR format:', error);
    return "-";
  }
}
