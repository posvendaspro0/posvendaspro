/**
 * Utilitários para máscaras de input
 * Compatível com React 19
 */

/**
 * Aplica máscara de WhatsApp
 * Formato: (11) 99999-9999
 */
export function maskWhatsApp(value: string): string {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
  
  // Limita a 11 dígitos
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

/**
 * Aplica máscara de CEP
 * Formato: 00000-000
 */
export function maskCEP(value: string): string {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara
  if (numbers.length <= 5) {
    return numbers;
  }
  
  // Limita a 8 dígitos
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
}

/**
 * Remove máscara e retorna apenas números
 */
export function unmask(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Valida WhatsApp
 */
export function isValidWhatsApp(value: string): boolean {
  const numbers = unmask(value);
  return numbers.length === 11;
}

/**
 * Valida CEP
 */
export function isValidCEP(value: string): boolean {
  const numbers = unmask(value);
  return numbers.length === 8;
}

/**
 * Aplica máscara de CNPJ
 * Formato: 00.000.000/0000-00
 */
export function maskCNPJ(value: string): string {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  } else if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  }
  
  // Limita a 14 dígitos
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
}

/**
 * Valida CNPJ
 */
export function isValidCNPJ(value: string): boolean {
  const numbers = unmask(value);
  
  if (numbers.length !== 14) return false;
  
  // Elimina CNPJs invalidos conhecidos
  if (
    numbers === '00000000000000' ||
    numbers === '11111111111111' ||
    numbers === '22222222222222' ||
    numbers === '33333333333333' ||
    numbers === '44444444444444' ||
    numbers === '55555555555555' ||
    numbers === '66666666666666' ||
    numbers === '77777777777777' ||
    numbers === '88888888888888' ||
    numbers === '99999999999999'
  ) {
    return false;
  }
  
  // Valida DVs
  let tamanho = numbers.length - 2;
  let numeros = numbers.substring(0, tamanho);
  const digitos = numbers.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = numbers.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
}

