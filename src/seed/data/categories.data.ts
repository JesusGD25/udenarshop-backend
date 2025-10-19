/**
 * Interfaz para los datos de seed de categorías
 */
interface SeedCategory {
  name: string;
  description: string;
  iconUrl?: string;
  isActive: boolean;
}

/**
 * Datos iniciales de categorías para el seed
 * Categorías principales del marketplace universitario
 */
export const initialCategories: SeedCategory[] = [
  {
    name: 'Electrónica',
    description: 'Dispositivos electrónicos, computadoras, tablets, accesorios tecnológicos',
    iconUrl: '📱',
    isActive: true,
  },
  {
    name: 'Libros y Material Educativo',
    description: 'Libros de texto, cuadernos, material de estudio, guías universitarias',
    iconUrl: '📚',
    isActive: true,
  },
  {
    name: 'Ropa y Accesorios',
    description: 'Ropa, zapatos, accesorios de moda, joyería',
    iconUrl: '👕',
    isActive: true,
  },
  {
    name: 'Deportes y Fitness',
    description: 'Equipamiento deportivo, bicicletas, ropa deportiva, accesorios de gimnasio',
    iconUrl: '⚽',
    isActive: true,
  },
  {
    name: 'Hogar y Muebles',
    description: 'Muebles, decoración, electrodomésticos, artículos para el hogar',
    iconUrl: '🛋️',
    isActive: true,
  },
  {
    name: 'Instrumentos Musicales',
    description: 'Guitarras, teclados, baterías, accesorios musicales, equipos de audio',
    iconUrl: '🎸',
    isActive: true,
  },
  {
    name: 'Videojuegos y Consolas',
    description: 'Consolas, videojuegos, accesorios gaming, controladores',
    iconUrl: '🎮',
    isActive: true,
  },
  {
    name: 'Fotografía y Cámaras',
    description: 'Cámaras, lentes, trípodes, accesorios de fotografía',
    iconUrl: '📷',
    isActive: true,
  },
];
