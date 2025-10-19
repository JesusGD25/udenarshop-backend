import { ProductCondition } from '../../products/enums/product-condition.enum';

/**
 * Interfaz para los datos de seed de productos
 */
interface SeedProduct {
  title: string;
  slug?: string;
  description: string;
  price: number;
  condition: ProductCondition;
  images: string[];
  stock: number;
}

/**
 * Datos iniciales de productos para el seed
 * 15 productos variados con precios en Pesos Colombianos
 */
export const initialProducts: SeedProduct[] = [
  {
    title: 'iPhone 13 Pro Max 256GB',
    description:
      'iPhone 13 Pro Max de 256GB, color azul pacífico. Pantalla Super Retina XDR de 6.7", chip A15 Bionic, sistema de cámaras Pro. Excelente estado, con caja y accesorios originales. Batería en óptimas condiciones.',
    price: 4500000,
    condition: ProductCondition.NEW,
    images: [
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400',
      'https://images.unsplash.com/photo-1632633728024-e1fd4bef561a?w=400',
    ],
    stock: 3,
  },
  {
    title: 'MacBook Pro M1 2020 8GB RAM',
    description:
      'MacBook Pro 2020 con chip M1, 8GB RAM, 256GB SSD. Pantalla Retina de 13", Touch Bar. En excelente estado, sin rayones. Incluye cargador original MagSafe. Ideal para desarrollo y diseño.',
    price: 5200000,
    condition: ProductCondition.USED,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400',
    ],
    stock: 1,
  },
  {
    title: 'AirPods Pro 2da Generación',
    description:
      'AirPods Pro sellados, nunca abiertos. Con cancelación de ruido activa mejorada, modo ambiente, audio espacial personalizado y resistencia al agua IPX4. Estuche de carga MagSafe incluido.',
    price: 1100000,
    condition: ProductCondition.NEW,
    images: [
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
    ],
    stock: 5,
  },
  {
    title: 'Samsung Galaxy Tab S8 128GB',
    description:
      'Tablet Samsung Galaxy Tab S8, pantalla 11 pulgadas LCD 120Hz, 128GB almacenamiento, 8GB RAM. Incluye S Pen. Perfecta para productividad y entretenimiento. Como nueva.',
    price: 1850000,
    condition: ProductCondition.USED,
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    ],
    stock: 2,
  },
  {
    title: 'PlayStation 5 Digital Edition',
    description:
      'PlayStation 5 edición digital, sin lector de discos. Incluye control DualSense, todos los cables y caja original. En perfecto estado, poco uso. Garantía de tienda hasta 2026.',
    price: 2400000,
    condition: ProductCondition.NEW,
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400',
    ],
    stock: 2,
  },
  {
    title: 'Bicicleta de Montaña Trek Marlin 7',
    description:
      'Bicicleta de montaña Trek Marlin 7, rin 29, cuadro de aluminio Alpha Gold. Sistema de cambios Shimano Deore 2x10, suspensión RockShox. Mantenimiento reciente. Talla M.',
    price: 3500000,
    condition: ProductCondition.USED,
    images: [
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
    ],
    stock: 1,
  },
  {
    title: 'Sony WH-1000XM5 Noise Cancelling',
    description:
      'Audífonos inalámbricos Sony WH-1000XM5 con cancelación de ruido líder en la industria. Batería de 30 horas, multipoint connection, Hi-Res Audio. Nuevos en caja sellada.',
    price: 1350000,
    condition: ProductCondition.NEW,
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
    ],
    stock: 4,
  },
  {
    title: 'Escritorio Gamer RGB con LED',
    description:
      'Escritorio gamer de 140cm con iluminación LED RGB, superficie de fibra de carbono, soporte para cables, gancho para audífonos. Negro con detalles rojos. Estructura de acero reforzada.',
    price: 650000,
    condition: ProductCondition.NEW,
    images: [
      'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400',
    ],
    stock: 3,
  },
  {
    title: 'Canon EOS Rebel T7 con Lente 18-55mm',
    description:
      'Cámara DSLR Canon EOS Rebel T7 de 24.1MP con lente 18-55mm. Incluye estuche, tarjeta SD 64GB, batería extra, correa y manual. Perfecta para iniciar en fotografía. 500 disparos aprox.',
    price: 1850000,
    condition: ProductCondition.USED,
    images: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
    ],
    stock: 1,
  },
  {
    title: 'Apple Watch Series 8 GPS 45mm',
    description:
      'Apple Watch Series 8, caja de aluminio color medianoche, GPS. Monitoreo avanzado de salud, detección de accidentes, resistencia al agua. Incluye correa deportiva y cargador magnético.',
    price: 1800000,
    condition: ProductCondition.NEW,
    images: [
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
    ],
    stock: 2,
  },
  {
    title: 'Nintendo Switch OLED Edición Especial',
    description:
      'Nintendo Switch modelo OLED con pantalla mejorada de 7", 64GB de almacenamiento. Incluye dock, controles Joy-Con y todos los cables. Edición limitada. Sellada de fábrica.',
    price: 1650000,
    condition: ProductCondition.NEW,
    images: [
      'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',
    ],
    stock: 3,
  },
  {
    title: 'Guitarra Acústica Yamaha FG800',
    description:
      'Guitarra acústica Yamaha FG800, tapa de abeto sólido, aros y fondo de nato/okume. Incluye funda acolchada, afinador digital Yamaha, juego de cuerdas extra y púas. Perfecta para principiantes.',
    price: 850000,
    condition: ProductCondition.USED,
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
    ],
    stock: 1,
  },
  {
    title: 'Tenis Nike Air Max 270 Talla 42',
    description:
      'Tenis Nike Air Max 270, color negro con detalles blancos. Talla 42 (US 9). Sistema de amortiguación Air visible en el talón. Nuevos en caja original con etiquetas.',
    price: 450000,
    condition: ProductCondition.NEW,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    ],
    stock: 4,
  },
  {
    title: 'Monitor LG UltraWide 29" Full HD',
    description:
      'Monitor LG UltraWide de 29 pulgadas, resolución 2560x1080, IPS, 75Hz. Ideal para productividad y gaming casual. Incluye cable HDMI y DisplayPort. Sin píxeles muertos, en excelente estado.',
    price: 950000,
    condition: ProductCondition.USED,
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
    ],
    stock: 1,
  },
  {
    title: 'Kindle Paperwhite 11va Gen 16GB',
    description:
      'Kindle Paperwhite 11va generación, pantalla de 6.8" sin reflejos, 16GB de almacenamiento, resistente al agua IPX8. Batería de semanas. Incluye funda de cuero y cargador USB-C. Sellado.',
    price: 650000,
    condition: ProductCondition.NEW,
    images: [
      'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400',
    ],
    stock: 6,
  },
];
