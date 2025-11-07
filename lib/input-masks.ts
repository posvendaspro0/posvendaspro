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

