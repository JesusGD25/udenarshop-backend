/**
 * Utilidades para formatear y validar precios en Pesos Colombianos (COP)
 */

/**
 * Formatea un número a formato de moneda colombiana
 * @param price - Precio en pesos colombianos (número entero)
 * @returns String formateado con símbolo $ y puntos separadores
 * 
 * @example
 * formatCOP(1500000) // "$1.500.000"
 * formatCOP(50000)   // "$50.000"
 */
export const formatCOP = (price: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Valida que un precio sea válido para COP
 * @param price - Precio a validar
 * @returns true si es válido, false si no
 */
export const isValidCOPPrice = (price: number): boolean => {
  // Debe ser número entero positivo
  return Number.isInteger(price) && price > 0;
};

/**
 * Convierte un string con formato COP a número
 * @param priceString - String con formato "$1.500.000" o "1500000"
 * @returns Número entero
 * 
 * @example
 * parseCOP("$1.500.000") // 1500000
 * parseCOP("1.500.000")  // 1500000
 * parseCOP("1500000")    // 1500000
 */
export const parseCOP = (priceString: string): number => {
  // Eliminar símbolo $ y puntos
  const cleaned = priceString.replace(/[$\.]/g, '');
  return parseInt(cleaned, 10);
};
