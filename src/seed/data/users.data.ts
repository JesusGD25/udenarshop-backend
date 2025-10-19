import { Role } from '../../users/enums/role.enum';

export const initialUsers = [
  {
    name: 'Administrador Sistema',
    email: 'admin@shopudenar.com',
    password: 'Admin123!', // Se hasheará en el servicio
    phone: '3001234567',
    role: Role.ADMIN,
    address: 'Pasto, Nariño',
    isActive: true,
  },
  {
    name: 'Juan Carlos Pérez',
    email: 'juan.perez@udenar.edu.co',
    password: 'User123!',
    phone: '3102345678',
    role: Role.USER,
    address: 'Carrera 27 # 18-45, Pasto',
    isActive: true,
  },
  {
    name: 'María Fernanda López',
    email: 'maria.lopez@udenar.edu.co',
    password: 'User123!',
    phone: '3203456789',
    role: Role.USER,
    address: 'Calle 18 # 25-30, Pasto',
    isActive: true,
  },
  {
    name: 'Carlos Andrés Gómez',
    email: 'carlos.gomez@udenar.edu.co',
    password: 'User123!',
    phone: '3154567890',
    role: Role.USER,
    address: 'Carrera 30 # 20-15, Pasto',
    isActive: true,
  },
  {
    name: 'Ana Lucía Martínez',
    email: 'ana.martinez@udenar.edu.co',
    password: 'User123!',
    phone: '3015678901',
    role: Role.USER,
    address: 'Calle 22 # 28-40, Pasto',
    isActive: true,
  },
];
