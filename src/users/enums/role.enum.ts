/**
 * Role Enum - Roles de usuario en el sistema
 * 
 * Define los diferentes niveles de acceso que puede tener un usuario
 */
export enum Role {
  /**
   * Usuario regular - Puede comprar y vender productos
   */
  USER = 'user',

  /**
   * Administrador - Acceso total al sistema
   * Puede gestionar reportes, usuarios y todas las operaciones
   */
  ADMIN = 'admin',
}
