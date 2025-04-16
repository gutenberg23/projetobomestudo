/**
 * Formata um valor decimal de horas para exibição em formato de horas e minutos.
 * Exemplo: 2.5 -> "2h30m"
 * @param hoursValue Valor em horas (pode ser fracionado)
 * @returns String formatada
 */
export const formatTimeValue = (hoursValue: number): string => {
  const hours = Math.floor(hoursValue);
  const minutes = Math.round((hoursValue - hours) * 60);
  
  if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h${minutes}m`;
  }
};

/**
 * Converte um valor de tempo formatado como string para um valor decimal.
 * Exemplo: "2h30m" -> 2.5
 * @param formattedTime String no formato "Xh" ou "XhYm"
 * @returns Valor decimal em horas
 */
export const parseTimeValue = (formattedTime: string): number => {
  if (!formattedTime) return 0;
  
  const hoursMatch = formattedTime.match(/(\d+)h/);
  const minutesMatch = formattedTime.match(/(\d+)m/);
  
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  
  return hours + (minutes / 60);
}; 