/**
 * Utilitários para manipulação e formatação de tempo
 */

/**
 * Formata horas em um texto legível (dias, horas, minutos)
 * @param totalHours - Total de horas
 * @returns String formatada (ex: "2d 5h 30m")
 */
export function formatResolutionTime(totalHours: number): string {
  if (totalHours === 0) return '0h';
  
  const days = Math.floor(totalHours / 24);
  const hours = Math.floor(totalHours % 24);
  const minutes = Math.floor((totalHours % 1) * 60);
  
  const parts: string[] = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.length > 0 ? parts.join(' ') : '0h';
}

/**
 * Formata horas em um texto completo e detalhado
 * @param totalHours - Total de horas
 * @returns String formatada (ex: "2 dias, 5 horas e 30 minutos")
 */
export function formatResolutionTimeDetailed(totalHours: number): string {
  if (totalHours === 0) return 'Menos de 1 hora';
  
  const days = Math.floor(totalHours / 24);
  const hours = Math.floor(totalHours % 24);
  const minutes = Math.floor((totalHours % 1) * 60);
  
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
  }
  
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
  }
  
  if (parts.length === 0) return 'Menos de 1 minuto';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  
  return `${parts[0]}, ${parts[1]} e ${parts[2]}`;
}

/**
 * Calcula o tempo de resolução em horas entre duas datas
 * @param startDate - Data de início (data da reclamação)
 * @param endDate - Data de fim (data da resolução)
 * @returns Total de horas
 */
export function calculateResolutionTime(startDate: Date, endDate: Date): number {
  const diffInMs = endDate.getTime() - startDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  return Math.max(0, Math.round(diffInHours * 100) / 100); // Arredonda para 2 casas decimais
}

/**
 * Formata a duração em um badge colorido baseado no tempo
 * @param hours - Total de horas
 * @returns Objeto com cor e label
 */
export function getResolutionTimeColor(hours: number): {
  color: string;
  label: string;
} {
  if (hours <= 24) {
    return { color: 'bg-green-100 text-green-800', label: 'Rápido' };
  } else if (hours <= 72) {
    return { color: 'bg-blue-100 text-blue-800', label: 'Moderado' };
  } else if (hours <= 168) {
    return { color: 'bg-orange-100 text-orange-800', label: 'Lento' };
  } else {
    return { color: 'bg-red-100 text-red-800', label: 'Muito Lento' };
  }
}

