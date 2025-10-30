/**
 * Constantes de configuración para JWT
 * 
 * IMPORTANTE: En producción, mueve el secret a variables de entorno (.env)
 * y usa una clave mucho más segura y compleja.
 */
export const jwtConstants = {
  // Clave secreta para firmar los tokens
  // En producción: usar process.env.JWT_SECRET
  secret: process.env.JWT_SECRET || 'udenarshop_secret_key_change_in_production_2024',
  
  // Tiempo de expiración del token
  // Formatos válidos: '24h', '7d', '30m', '1y'
  expiresIn: '24h',
};
