# 📋 Estructura Completa de la Base de Datos - ShopUdenar Marketplace

## 🎯 Contexto del Proyecto

Estoy desarrollando **ShopUdenar**, un marketplace/tienda en línea donde los usuarios pueden:
- Registrarse como vendedores y compradores
- Publicar artículos para vender
- Comunicarse mediante chat
- Agregar productos al carrito
- Realizar compras
- Marcar favoritos
- Gestionar órdenes de compra
- Calificar y reseñar productos y vendedores
- Recibir notificaciones en tiempo real
- Reportar productos o usuarios problemáticos

El backend está construido con:
- **NestJS** v11.0.1 (framework)
- **TypeORM** v0.3.27 (ORM)
- **PostgreSQL** v14.3 (base de datos)
- **TypeScript**
- **class-validator** (validaciones)
- **class-transformer** (transformaciones)

---

## 🗄️ ESTRUCTURA COMPLETA DE ENTIDADES

### 🧩 1. **User** (Usuario)

Representa a los usuarios registrados. Cada usuario puede ser vendedor y comprador simultáneamente.

**Atributos:**
```typescript
- id: UUID (PK, generado automáticamente)
- name: string (nombre completo, min 3 caracteres)
- email: string (único, para autenticación, validación email)
- password: string (cifrada con bcrypt)
- phone: string (número de contacto, nullable)
- avatarUrl: string (URL de imagen de perfil, nullable)
- role: enum { USER, ADMIN } (rol del usuario, default USER)
- address: string (dirección principal, nullable)
- isActive: boolean (cuenta activa, default true)
- rating: decimal(2, 1) (calificación promedio como vendedor, 0.0-5.0, default 0.0)
- totalReviews: integer (cantidad de reseñas recibidas como vendedor, default 0)
- createdAt: timestamp (automático)
- updatedAt: timestamp (automático)
```

**Relaciones:**
- `1:N` con **Product** (un usuario puede publicar muchos productos) → `user.products`
- `1:1` con **Cart** (un usuario tiene un carrito) → `user.cart`
- `1:N` con **Favorite** (un usuario puede tener muchos favoritos) → `user.favorites`
- `1:N` con **Order** (un usuario puede realizar muchas órdenes) → `user.orders`
- `1:N` con **Chat** (como comprador o vendedor) → `user.chatsAsBuyer`, `user.chatsAsSeller`
- `1:N` con **Message** (un usuario puede enviar muchos mensajes) → `user.messages`
- `1:N` con **Review** (como autor de reseñas) → `user.reviewsGiven`
- `1:N` con **Review** (como vendedor reseñado) → `user.reviewsReceived`
- `1:N` con **Notification** (un usuario recibe notificaciones) → `user.notifications`
- `1:N` con **Report** (como reportador) → `user.reportsCreated`
- `1:N` con **Report** (como reportado) → `user.reportsReceived`

**Índices:**
- Index en `email` (único)
- Index en `rating` (para búsquedas de mejores vendedores)

---

### 🏷️ 2. **Category** (Categoría)

Clasificación de productos (Electrónica, Hogar, Ropa, Deportes, etc.)

**Atributos:**
```typescript
- id: UUID (PK)
- name: string (nombre de la categoría, único, min 3 caracteres)
- slug: string (único, generado automáticamente desde name)
- description: string (descripción opcional, nullable)
- iconUrl: string (URL del ícono de la categoría, nullable)
- isActive: boolean (categoría activa, default true)
- createdAt: timestamp (automático)
```

**Relaciones:**
- `1:N` con **Product** (una categoría puede tener muchos productos) → `category.products`

**Hooks:**
- `@BeforeInsert()`: Genera slug desde name
- `@BeforeUpdate()`: Actualiza slug si name cambió

**Índices:**
- Index en `slug` (único)

---

### 🛒 3. **Product** (Producto) ✅ **IMPLEMENTADA**

Artículos que los usuarios publican para vender.

**Atributos:**
```typescript
- id: UUID (PK)
- title: string (único, min 3 caracteres)
- slug: string (único, generado automáticamente desde title)
- description: string (nullable)
- price: decimal(12, 0) (pesos colombianos COP, sin decimales, positivo)
- condition: enum { NEW, USED } (estado del producto)
- images: string[] (array de URLs)
- stock: integer (cantidad disponible, min 1, default 1)
- isSold: boolean (default false)
- rating: decimal(2, 1) (calificación promedio del producto, 0.0-5.0, default 0.0) [PENDIENTE]
- totalReviews: integer (cantidad de reseñas del producto, default 0) [PENDIENTE]
- viewsCount: integer (contador de vistas, default 0) [PENDIENTE]
- createdAt: timestamp (automático)
- updatedAt: timestamp (automático)
- sellerId: UUID (FK → User) [PENDIENTE]
- categoryId: UUID (FK → Category) [PENDIENTE]
```

**Relaciones:**
- `N:1` con **User** (muchos productos pertenecen a un vendedor) → `product.seller`
- `N:1` con **Category** (muchos productos pertenecen a una categoría) → `product.category`
- `1:N` con **Favorite** (un producto puede estar en muchos favoritos)
- `1:N` con **CartItem** (un producto puede estar en muchos carritos)
- `1:N` con **OrderItem** (un producto puede estar en muchas órdenes)
- `1:N` con **Chat** (un producto puede tener varios chats)
- `1:N` con **Review** (un producto puede tener muchas reseñas) → `product.reviews`
- `1:N` con **Report** (un producto puede ser reportado) → `product.reports`

**Hooks:**
- `@BeforeInsert()`: Genera slug desde title si no existe ✅
- `@BeforeUpdate()`: Normaliza el slug si fue modificado ✅

**Índices:**
- Index en `slug` (único) ✅
- Index en `sellerId`
- Index en `categoryId`
- Index en `rating` (para búsquedas de mejor calificados)
- Index en `createdAt` (para ordenar por fecha)

**Estado actual:**
- ✅ Entidad completamente implementada
- ✅ DTOs creados (CreateProductDto, UpdateProductDto)
- ✅ Service implementado (CRUD completo)
- ✅ Controller con endpoints REST
- ✅ Paginación implementada (limit, offset)
- ✅ Validaciones con class-validator
- ✅ Seed module con 15 productos iniciales
- ✅ Precios en pesos colombianos (COP)
- ✅ Búsqueda por UUID o slug

---

### 🧺 4. **Cart** (Carrito)

Carrito de compras activo de cada usuario.

**Atributos:**
```typescript
- id: UUID (PK)
- userId: UUID (FK → User, único)
- createdAt: timestamp (automático)
- updatedAt: timestamp (automático)
```

**Relaciones:**
- `1:1` con **User** (un carrito pertenece a un usuario) → `cart.user`
- `1:N` con **CartItem** (un carrito contiene muchos ítems) → `cart.items`

**Índices:**
- Index en `userId` (único)

---

### 📦 5. **CartItem** (Item de Carrito)

Productos específicos dentro de un carrito.

**Atributos:**
```typescript
- id: UUID (PK)
- cartId: UUID (FK → Cart)
- productId: UUID (FK → Product)
- quantity: integer (cantidad, min 1, default 1)
- createdAt: timestamp (automático)
```

**Relaciones:**
- `N:1` con **Cart** (muchos items pertenecen a un carrito) → `cartItem.cart`
- `N:1` con **Product** (muchos items se asocian a un producto) → `cartItem.product`

**Constraints:**
- Unique constraint en `(cartId, productId)` → Un producto solo puede estar una vez en el mismo carrito

**Índices:**
- Composite index en `(cartId, productId)` (único)

---

### 💰 6. **Order** (Orden de Compra)

Compra confirmada por un usuario.

**Atributos:**
```typescript
- id: UUID (PK)
- orderNumber: string (número de orden único generado, ej: "ORD-20251018-00001")
- buyerId: UUID (FK → User)
- totalAmount: decimal(12, 0) (monto total en COP)
- status: enum { PENDING, PAID, CANCELLED, SHIPPED, DELIVERED }
- paymentMethod: enum { CASH, CARD, TRANSFER }
- shippingAddress: string (dirección de envío)
- notes: text (notas adicionales del comprador, nullable)
- createdAt: timestamp (automático)
- updatedAt: timestamp (automático)
```

**Relaciones:**
- `N:1` con **User** (muchas órdenes pertenecen a un comprador) → `order.buyer`
- `1:N` con **OrderItem** (una orden contiene muchos items) → `order.items`

**Hooks:**
- `@BeforeInsert()`: Genera orderNumber único

**Índices:**
- Index en `orderNumber` (único)
- Index en `buyerId`
- Index en `status`
- Index en `createdAt`

---

### 🧾 7. **OrderItem** (Item de Orden)

Productos dentro de una orden (snapshot histórico del precio).

**Atributos:**
```typescript
- id: UUID (PK)
- orderId: UUID (FK → Order)
- productId: UUID (FK → Product)
- sellerId: UUID (FK → User) (vendedor en el momento de la compra)
- quantity: integer (cantidad comprada, min 1)
- price: decimal(12, 0) (precio unitario en el momento de la compra)
- productTitle: string (título del producto en el momento de compra)
- createdAt: timestamp (automático)
```

**Relaciones:**
- `N:1` con **Order** (muchos items pertenecen a una orden) → `orderItem.order`
- `N:1` con **Product** (muchos items se asocian a un producto) → `orderItem.product`
- `N:1` con **User** (muchos items son vendidos por un usuario) → `orderItem.seller`

**Importante:** 
- Se guarda el precio, título y vendedor en el momento de la compra para mantener historial preciso
- Permite generar reportes de ventas por vendedor

**Índices:**
- Index en `orderId`
- Index en `productId`
- Index en `sellerId`

---

### ❤️ 8. **Favorite** (Favorito)

Productos marcados como favoritos por los usuarios.

**Atributos:**
```typescript
- id: UUID (PK)
- userId: UUID (FK → User)
- productId: UUID (FK → Product)
- createdAt: timestamp (automático)
```

**Relaciones:**
- `N:1` con **User** (muchos favoritos pertenecen a un usuario) → `favorite.user`
- `N:1` con **Product** (muchos favoritos se asocian a un producto) → `favorite.product`

**Constraints:**
- Unique constraint en `(userId, productId)` → Un usuario no puede marcar el mismo producto como favorito dos veces

**Índices:**
- Composite index en `(userId, productId)` (único)

---

### 💬 9. **Chat** (Chat)

Conversación entre comprador y vendedor sobre un producto.

**Atributos:**
```typescript
- id: UUID (PK)
- buyerId: UUID (FK → User)
- sellerId: UUID (FK → User)
- productId: UUID (FK → Product)
- lastMessageAt: timestamp (fecha del último mensaje, nullable)
- isActive: boolean (chat activo, default true)
- createdAt: timestamp (automático)
```

**Relaciones:**
- `N:1` con **User** (como comprador) → `chat.buyer`
- `N:1` con **User** (como vendedor) → `chat.seller`
- `N:1` con **Product** (chat asociado a un producto) → `chat.product`
- `1:N` con **Message** (un chat tiene muchos mensajes) → `chat.messages`

**Constraints:**
- Unique constraint en `(buyerId, sellerId, productId)` → Solo un chat por producto entre los mismos usuarios
- Check constraint: `buyerId != sellerId` → No se puede chatear consigo mismo

**Índices:**
- Composite index en `(buyerId, sellerId, productId)` (único)
- Index en `lastMessageAt`

---

### ✉️ 10. **Message** (Mensaje)

Mensajes intercambiados dentro de un chat.

**Atributos:**
```typescript
- id: UUID (PK)
- chatId: UUID (FK → Chat)
- senderId: UUID (FK → User)
- content: text (contenido del mensaje, max 2000 caracteres)
- isRead: boolean (mensaje leído, default false)
- createdAt: timestamp (automático)
```

**Relaciones:**
- `N:1` con **Chat** (muchos mensajes pertenecen a un chat) → `message.chat`
- `N:1` con **User** (muchos mensajes pertenecen a un emisor) → `message.sender`

**Hooks:**
- `@AfterInsert()`: Actualiza `lastMessageAt` en Chat

**Índices:**
- Index en `chatId`
- Index en `senderId`
- Index en `createdAt`

---

### ⭐ 11. **Review** (Reseña/Calificación)

Calificaciones y comentarios sobre productos o vendedores.

**Atributos:**
```typescript
- id: UUID (PK)
- userId: UUID (FK → User, autor de la reseña)
- productId: UUID (FK → Product, nullable)
- sellerId: UUID (FK → User, nullable)
- orderItemId: UUID (FK → OrderItem, nullable, único)
- rating: integer (calificación 1-5)
- comment: text (comentario opcional, max 1000 caracteres, nullable)
- type: enum { PRODUCT, SELLER } (tipo de reseña)
- createdAt: timestamp (automático)
- updatedAt: timestamp (automático)
```

**Relaciones:**
- `N:1` con **User** (autor) → `review.user`
- `N:1` con **Product** (producto reseñado) → `review.product`
- `N:1` con **User** (vendedor reseñado) → `review.seller`
- `N:1` con **OrderItem** (item de orden asociado) → `review.orderItem`

**Validaciones:**
- Si `type = PRODUCT`: `productId` es requerido, `sellerId` es null
- Si `type = SELLER`: `sellerId` es requerido, `productId` es null
- `rating` debe estar entre 1 y 5
- Solo se puede reseñar un `orderItem` una vez (constraint único)

**Constraints:**
- Unique constraint en `orderItemId` (solo una reseña por compra)
- Check constraint: `rating BETWEEN 1 AND 5`

**Hooks:**
- `@AfterInsert()`: Actualiza el rating promedio y totalReviews del producto/vendedor
- `@AfterUpdate()`: Recalcula el rating promedio
- `@AfterRemove()`: Recalcula el rating promedio

**Índices:**
- Index en `userId`
- Index en `productId`
- Index en `sellerId`
- Index en `orderItemId` (único)
- Index en `rating`

---

### 🔔 12. **Notification** (Notificación)

Notificaciones en tiempo real para los usuarios.

**Atributos:**
```typescript
- id: UUID (PK)
- userId: UUID (FK → User, receptor)
- type: enum { 
    NEW_MESSAGE,        // Nuevo mensaje en chat
    NEW_ORDER,          // Nueva orden de compra
    ORDER_STATUS,       // Cambio de estado de orden
    NEW_REVIEW,         // Nueva reseña recibida
    PRODUCT_SOLD,       // Tu producto fue vendido
    PRICE_DROP,         // Bajó el precio de favorito
    STOCK_AVAILABLE,    // Producto favorito tiene stock
    REPORT_RESOLVED,    // Tu reporte fue resuelto
    ACCOUNT_WARNING     // Advertencia de cuenta
  }
- title: string (título de la notificación, max 100 caracteres)
- message: text (contenido de la notificación, max 500 caracteres)
- isRead: boolean (notificación leída, default false)
- link: string (URL relacionada, nullable)
- metadata: jsonb (datos adicionales en JSON, nullable)
- createdAt: timestamp (automático)
```

**Relaciones:**
- `N:1` con **User** (muchas notificaciones pertenecen a un usuario) → `notification.user`

**Índices:**
- Index en `userId`
- Index en `isRead`
- Index en `createdAt`
- Composite index en `(userId, isRead, createdAt)`

**Metadata ejemplos:**
```json
// NEW_MESSAGE
{ "chatId": "uuid", "senderName": "Juan Pérez" }

// NEW_ORDER
{ "orderId": "uuid", "orderNumber": "ORD-20251018-00001" }

// PRODUCT_SOLD
{ "productId": "uuid", "productTitle": "iPhone 15", "amount": 4500000 }
```

---

### 🚩 13. **Report** (Reporte)

Reportes de productos o usuarios problemáticos.

**Atributos:**
```typescript
- id: UUID (PK)
- reporterId: UUID (FK → User, quien reporta)
- reportedUserId: UUID (FK → User, usuario reportado, nullable)
- reportedProductId: UUID (FK → Product, producto reportado, nullable)
- type: enum {
    PRODUCT_FAKE,          // Producto falso/falsificado
    PRODUCT_INAPPROPRIATE, // Contenido inapropiado
    PRODUCT_MISLEADING,    // Información engañosa
    USER_SCAM,             // Usuario estafador
    USER_HARASSMENT,       // Acoso
    USER_SPAM,             // Spam
    OTHER                  // Otro
  }
- reason: text (descripción detallada del reporte, min 10 caracteres)
- status: enum { PENDING, UNDER_REVIEW, RESOLVED, DISMISSED }
- adminNote: text (nota del administrador, nullable)
- resolvedAt: timestamp (fecha de resolución, nullable)
- resolvedBy: UUID (FK → User, admin que resolvió, nullable)
- createdAt: timestamp (automático)
- updatedAt: timestamp (automático)
```

**Relaciones:**
- `N:1` con **User** (reportador) → `report.reporter`
- `N:1` con **User** (usuario reportado) → `report.reportedUser`
- `N:1` con **Product** (producto reportado) → `report.reportedProduct`
- `N:1` con **User** (admin resolvedor) → `report.resolver`

**Validaciones:**
- Debe tener `reportedUserId` O `reportedProductId` (no ambos, no ninguno)
- `reason` debe tener mínimo 10 caracteres

**Constraints:**
- Check constraint: `(reportedUserId IS NOT NULL AND reportedProductId IS NULL) OR (reportedUserId IS NULL AND reportedProductId IS NOT NULL)`

**Índices:**
- Index en `reporterId`
- Index en `reportedUserId`
- Index en `reportedProductId`
- Index en `status`
- Index en `createdAt`

**Hooks:**
- `@AfterInsert()`: Crea notificación para administradores
- `@AfterUpdate()`: Si status = RESOLVED, crea notificación para el reportador

---

## ⚙️ ENUMS GLOBALES

### **Role** (Rol de Usuario)
```typescript
enum Role {
  USER = 'user',
  ADMIN = 'admin'
}
```

### **ProductCondition** (Condición de Producto) ✅ **IMPLEMENTADO**
```typescript
enum ProductCondition {
  NEW = 'new',
  USED = 'used'
}
```

### **OrderStatus** (Estado de Orden)
```typescript
enum OrderStatus {
  PENDING = 'pending',      // Orden creada, pendiente de pago
  PAID = 'paid',            // Pagada
  CANCELLED = 'cancelled',  // Cancelada
  SHIPPED = 'shipped',      // Enviada
  DELIVERED = 'delivered'   // Entregada
}
```

### **PaymentMethod** (Método de Pago)
```typescript
enum PaymentMethod {
  CASH = 'cash',       // Efectivo
  CARD = 'card',       // Tarjeta
  TRANSFER = 'transfer' // Transferencia
}
```

### **ReviewType** (Tipo de Reseña)
```typescript
enum ReviewType {
  PRODUCT = 'product',  // Reseña de producto
  SELLER = 'seller'     // Reseña de vendedor
}
```

### **NotificationType** (Tipo de Notificación)
```typescript
enum NotificationType {
  NEW_MESSAGE = 'new_message',
  NEW_ORDER = 'new_order',
  ORDER_STATUS = 'order_status',
  NEW_REVIEW = 'new_review',
  PRODUCT_SOLD = 'product_sold',
  PRICE_DROP = 'price_drop',
  STOCK_AVAILABLE = 'stock_available',
  REPORT_RESOLVED = 'report_resolved',
  ACCOUNT_WARNING = 'account_warning'
}
```

### **ReportType** (Tipo de Reporte)
```typescript
enum ReportType {
  PRODUCT_FAKE = 'product_fake',
  PRODUCT_INAPPROPRIATE = 'product_inappropriate',
  PRODUCT_MISLEADING = 'product_misleading',
  USER_SCAM = 'user_scam',
  USER_HARASSMENT = 'user_harassment',
  USER_SPAM = 'user_spam',
  OTHER = 'other'
}
```

### **ReportStatus** (Estado de Reporte)
```typescript
enum ReportStatus {
  PENDING = 'pending',           // Pendiente
  UNDER_REVIEW = 'under_review', // En revisión
  RESOLVED = 'resolved',         // Resuelto
  DISMISSED = 'dismissed'        // Desestimado
}
```

---

## 🔗 DIAGRAMA DE RELACIONES COMPLETO

```
User ────1:N───→ Product (como vendedor)
User ────1:1───→ Cart
User ────1:N───→ Favorite
User ────1:N───→ Order (como comprador)
User ────1:N───→ Chat (como buyer/seller)
User ────1:N───→ Message (como sender)
User ────1:N───→ Review (como autor) - reviewsGiven
User ────1:N───→ Review (como vendedor) - reviewsReceived
User ────1:N───→ Notification (como receptor)
User ────1:N───→ Report (como reportador)
User ────1:N───→ Report (como reportado)

Category ─1:N──→ Product

Product ──1:N──→ Favorite
Product ──1:N──→ CartItem
Product ──1:N──→ OrderItem
Product ──1:N──→ Chat
Product ──1:N──→ Review
Product ──1:N──→ Report

Cart ─────1:N──→ CartItem

Order ────1:N──→ OrderItem

OrderItem ─1:1─→ Review (opcional)

Chat ─────1:N──→ Message
```

---

## 📂 ESTRUCTURA DE CARPETAS PROPUESTA

```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── dto/
│   │   └── pagination.dto.ts ✅
│   ├── helpers/
│   │   └── currency.helper.ts ✅
│   ├── decorators/
│   │   ├── get-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── interceptors/
│       └── transform.interceptor.ts
├── config/
│   ├── database.config.ts
│   └── jwt.config.ts
├── users/
│   ├── dto/
│   ├── entities/
│   │   └── user.entity.ts
│   ├── enums/
│   │   └── role.enum.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── auth/
│   ├── dto/
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── categories/
│   ├── dto/
│   ├── entities/
│   │   └── category.entity.ts
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── categories.module.ts
├── products/ ✅ COMPLETADO
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   └── update-product.dto.ts
│   ├── entities/
│   │   └── product.entity.ts
│   ├── enums/
│   │   └── product-condition.enum.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
├── cart/
│   ├── dto/
│   ├── entities/
│   │   ├── cart.entity.ts
│   │   └── cart-item.entity.ts
│   ├── cart.controller.ts
│   ├── cart.service.ts
│   └── cart.module.ts
├── orders/
│   ├── dto/
│   ├── entities/
│   │   ├── order.entity.ts
│   │   └── order-item.entity.ts
│   ├── enums/
│   │   ├── order-status.enum.ts
│   │   └── payment-method.enum.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.module.ts
├── favorites/
│   ├── dto/
│   ├── entities/
│   │   └── favorite.entity.ts
│   ├── favorites.controller.ts
│   ├── favorites.service.ts
│   └── favorites.module.ts
├── chat/
│   ├── dto/
│   ├── entities/
│   │   ├── chat.entity.ts
│   │   └── message.entity.ts
│   ├── gateways/
│   │   └── chat.gateway.ts
│   ├── chat.controller.ts
│   ├── chat.service.ts
│   └── chat.module.ts
├── reviews/
│   ├── dto/
│   ├── entities/
│   │   └── review.entity.ts
│   ├── enums/
│   │   └── review-type.enum.ts
│   ├── reviews.controller.ts
│   ├── reviews.service.ts
│   └── reviews.module.ts
├── notifications/
│   ├── dto/
│   ├── entities/
│   │   └── notification.entity.ts
│   ├── enums/
│   │   └── notification-type.enum.ts
│   ├── gateways/
│   │   └── notifications.gateway.ts
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   └── notifications.module.ts
├── reports/
│   ├── dto/
│   ├── entities/
│   │   └── report.entity.ts
│   ├── enums/
│   │   ├── report-type.enum.ts
│   │   └── report-status.enum.ts
│   ├── reports.controller.ts
│   ├── reports.service.ts
│   └── reports.module.ts
└── seed/ ✅ COMPLETADO
    ├── data/
    │   └── products.data.ts
    ├── seed.controller.ts
    ├── seed.service.ts
    └── seed.module.ts
```

---

## 🎯 ESTADO ACTUAL DE IMPLEMENTACIÓN

### ✅ **Completado (100%):**
1. **Product Entity** - Entidad completa con todos los campos base
2. **ProductCondition Enum** - NEW/USED
3. **Product DTOs** - CreateProductDto, UpdateProductDto con validaciones
4. **Product Service** - CRUD completo (create, findAll, findOne, update, remove)
5. **Product Controller** - Endpoints REST mapeados
6. **Paginación** - PaginationDto con limit/offset
7. **Currency Helper** - formatCOP, isValidCOPPrice, parseCOP
8. **Seed Module** - 15 productos iniciales, borra y recrea datos

### 🔄 **Pendiente:**
1. User Entity + Auth Module (JWT)
2. Category Entity
3. Cart + CartItem Entities
4. Order + OrderItem Entities
5. Favorite Entity
6. Chat + Message Entities (WebSockets)
7. Review Entity (sistema de calificaciones)
8. Notification Entity (notificaciones en tiempo real)
9. Report Entity (sistema de reportes)
10. Relaciones entre todas las entidades
11. Roles y permisos (Guards)
12. Subida de imágenes (Cloudinary/AWS S3)

---

## 🚀 ORDEN DE IMPLEMENTACIÓN SUGERIDO

### **Fase 1: Autenticación y Usuarios** (Prioridad Alta)
1. ✅ Crear Role enum
2. ✅ Crear User entity
3. ✅ Implementar Auth module (registro, login, JWT)
4. ✅ Crear JWT Guards y decoradores
5. ✅ Proteger rutas existentes

### **Fase 2: Categorías y Relaciones de Productos** (Prioridad Alta)
1. ✅ Crear Category entity
2. ✅ Implementar CRUD de categorías
3. ✅ Relacionar Product con User (sellerId)
4. ✅ Relacionar Product con Category (categoryId)
5. ✅ Actualizar seed con categorías y relaciones
6. ✅ Implementar filtros por categoría

### **Fase 3: Carrito de Compras** (Prioridad Media)
1. ✅ Crear Cart entity
2. ✅ Crear CartItem entity
3. ✅ Implementar lógica de carrito (add, remove, update, clear)
4. ✅ Auto-crear carrito al registrar usuario
5. ✅ Validar stock al agregar productos

### **Fase 4: Órdenes de Compra** (Prioridad Alta)
1. ✅ Crear OrderStatus enum
2. ✅ Crear PaymentMethod enum
3. ✅ Crear Order entity
4. ✅ Crear OrderItem entity
5. ✅ Implementar proceso de checkout
6. ✅ Actualizar stock al crear orden
7. ✅ Marcar productos como vendidos (isSold)

### **Fase 5: Favoritos** (Prioridad Baja)
1. ✅ Crear Favorite entity
2. ✅ Implementar add/remove favoritos
3. ✅ Endpoint para listar favoritos del usuario

### **Fase 6: Sistema de Mensajería** (Prioridad Media)
1. ✅ Crear Chat entity
2. ✅ Crear Message entity
3. ✅ Implementar WebSocket Gateway
4. ✅ Eventos en tiempo real (send, typing, read)
5. ✅ Listar chats del usuario
6. ✅ Historial de mensajes

### **Fase 7: Reviews y Ratings** (Prioridad Media)
1. ✅ Crear ReviewType enum
2. ✅ Crear Review entity
3. ✅ Implementar crear reseña (solo si compró)
4. ✅ Calcular rating promedio automáticamente
5. ✅ Actualizar rating de Product y User
6. ✅ Validar que solo se reseñe una vez por compra
7. ✅ Listar reviews de producto/vendedor

### **Fase 8: Sistema de Notificaciones** (Prioridad Media)
1. ✅ Crear NotificationType enum
2. ✅ Crear Notification entity
3. ✅ Implementar WebSocket Gateway para notificaciones
4. ✅ Crear notificaciones automáticas en eventos:
   - Nuevo mensaje
   - Nueva orden (para vendedor)
   - Cambio de estado de orden
   - Nueva reseña recibida
   - Producto vendido
5. ✅ Marcar notificaciones como leídas
6. ✅ Eliminar notificaciones antiguas (cleanup job)

### **Fase 9: Sistema de Reportes** (Prioridad Baja)
1. ✅ Crear ReportType enum
2. ✅ Crear ReportStatus enum
3. ✅ Crear Report entity
4. ✅ Implementar crear reporte (producto/usuario)
5. ✅ Panel de administración para gestionar reportes
6. ✅ Resolver/desestimar reportes
7. ✅ Notificar al reportador cuando se resuelva

### **Fase 10: Mejoras y Optimizaciones** (Prioridad Baja)
1. ✅ Implementar búsqueda avanzada (ElasticSearch opcional)
2. ✅ Subida de imágenes a cloud (Cloudinary/S3)
3. ✅ Caché con Redis (productos populares, categorías)
4. ✅ Rate limiting
5. ✅ Logs y monitoreo
6. ✅ Tests unitarios e integración
7. ✅ Documentación con Swagger

---

## 📊 REGLAS DE NEGOCIO IMPORTANTES

### **Productos:**
- ✅ Solo el vendedor puede editar/eliminar su producto
- ✅ No se puede eliminar un producto con órdenes asociadas
- ✅ El stock se descuenta automáticamente al crear una orden
- ❌ Un producto con stock = 0 se marca como no disponible
- ✅ Los precios son en COP (pesos colombianos) sin decimales

### **Órdenes:**
- ✅ Solo se puede crear orden si hay stock suficiente
- ✅ El precio se congela en OrderItem (snapshot histórico)
- ✅ El comprador puede cancelar solo si status = PENDING
- ✅ El vendedor puede marcar como SHIPPED/DELIVERED
- ✅ Una orden CANCELLED devuelve el stock al producto

### **Reviews:**
- ✅ Solo se puede reseñar si se compró el producto
- ✅ Solo una reseña por compra (orderItemId único)
- ✅ Rating debe estar entre 1 y 5
- ✅ El rating promedio se calcula automáticamente
- ✅ Se puede editar la reseña propia (recalcula rating)

### **Chat:**
- ✅ Solo comprador y vendedor pueden ver el chat
- ✅ No se puede chatear con uno mismo
- ✅ Un chat se asocia a un producto específico
- ✅ Los mensajes tienen marca de leído

### **Notificaciones:**
- ✅ Se crean automáticamente en eventos del sistema
- ✅ Se envían en tiempo real vía WebSocket
- ✅ Se pueden marcar como leídas
- ✅ Se eliminan automáticamente después de 30 días

### **Reportes:**
- ✅ Cualquier usuario puede reportar
- ✅ Solo admins pueden resolver reportes
- ✅ Un reporte puede ser de producto O usuario (no ambos)
- ✅ El reportador recibe notificación al resolverse

### **Usuarios:**
- ✅ El rating del vendedor es el promedio de sus reviews recibidas
- ✅ Un usuario puede ser vendedor y comprador simultáneamente
- ✅ Los admins tienen acceso a panel de reportes y estadísticas

---

## 🔒 SEGURIDAD Y PERMISOS

### **Autenticación:**
- JWT con expiración de 7 días
- Refresh tokens opcionales
- Hash de contraseñas con bcrypt (salt rounds: 10)

### **Autorización (Guards):**
- `@Public()`: Rutas públicas (login, registro, ver productos)
- `@Roles('admin')`: Solo administradores
- `@Roles('user', 'admin')`: Usuarios autenticados
- `@IsOwner()`: Solo el dueño del recurso (custom guard)

### **Validaciones:**
- Whitelist en DTOs (rechazar campos extra)
- Transformación automática de tipos
- Validación de UUIDs en params
- Sanitización de inputs

---

## 🛠️ COMANDOS ÚTILES

```bash
# Ejecutar seed de productos
GET http://localhost:3000/seed

# Crear nuevo módulo completo (CRUD)
nest g resource <nombre> --no-spec

# Crear solo servicio
nest g service <nombre> --no-spec

# Crear solo controlador
nest g controller <nombre> --no-spec

# Crear módulo
nest g module <nombre>

# Iniciar aplicación en desarrollo
npm run start:dev

# Compilar para producción
npm run build

# Ver logs de PostgreSQL
docker logs shopudenardb

# Entrar a PostgreSQL CLI
docker exec -it shopudenardb psql -U postgres -d TesloDB

# Reiniciar contenedores
docker-compose down
docker-compose up -d
```

---

## 📝 NOTAS TÉCNICAS

### **Base de Datos:**
- PostgreSQL 14.3 en Docker
- Puerto: 5433
- Nombre: TesloDB
- Usuario: postgres
- Sincronización automática: `synchronize: true` (solo desarrollo)

### **Moneda:**
- Todos los precios en **Pesos Colombianos (COP)**
- Sin decimales (DECIMAL(12, 0))
- Validación: solo números enteros positivos
- Helper de formato: `formatCOP()` → "$1.500.000"

### **Identificadores:**
- Todos los IDs son UUID v4
- Generados automáticamente con `@PrimaryGeneratedColumn('uuid')`

### **Timestamps:**
- Todas las entidades tienen `createdAt`
- Entidades editables tienen `updatedAt`
- Automáticos con `@CreateDateColumn()` y `@UpdateDateColumn()`

### **Soft Delete:**
- No implementado actualmente
- Se puede agregar con `@DeleteDateColumn()` en el futuro

### **Índices:**
- Campos de búsqueda frecuente tienen índices
- Unique constraints en combinaciones únicas
- Composite indexes para queries complejos

---

## 🎨 ENDPOINTS PRINCIPALES ESPERADOS

### **Auth:**
```
POST   /auth/register
POST   /auth/login
GET    /auth/profile
POST   /auth/refresh
```

### **Users:**
```
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
GET    /users/:id/products (productos del vendedor)
GET    /users/:id/reviews (reseñas del vendedor)
```

### **Products:** ✅
```
GET    /products (paginado, filtros)
GET    /products/:term (UUID o slug)
POST   /products
PATCH  /products/:term
DELETE /products/:id
GET    /products/:id/reviews
```

### **Categories:**
```
GET    /categories
GET    /categories/:id
POST   /categories (admin)
PATCH  /categories/:id (admin)
DELETE /categories/:id (admin)
GET    /categories/:id/products
```

### **Cart:**
```
GET    /cart (mi carrito)
POST   /cart/items (agregar producto)
PATCH  /cart/items/:id (actualizar cantidad)
DELETE /cart/items/:id (eliminar del carrito)
DELETE /cart (vaciar carrito)
```

### **Orders:**
```
GET    /orders (mis órdenes)
GET    /orders/:id
POST   /orders (checkout)
PATCH  /orders/:id/status (cambiar estado)
DELETE /orders/:id (cancelar)
```

### **Favorites:**
```
GET    /favorites (mis favoritos)
POST   /favorites (agregar)
DELETE /favorites/:id (eliminar)
```

### **Chat:**
```
GET    /chats (mis chats)
GET    /chats/:id/messages
POST   /chats (crear chat)
WebSocket: /chat (enviar/recibir mensajes)
```

### **Reviews:**
```
GET    /reviews/product/:productId
GET    /reviews/seller/:sellerId
POST   /reviews (crear reseña)
PATCH  /reviews/:id (editar mi reseña)
DELETE /reviews/:id (eliminar mi reseña)
```

### **Notifications:**
```
GET    /notifications (mis notificaciones)
PATCH  /notifications/:id/read (marcar como leída)
PATCH  /notifications/read-all (marcar todas)
DELETE /notifications/:id
WebSocket: /notifications (tiempo real)
```

### **Reports:**
```
GET    /reports (admin: todos, user: mis reportes)
GET    /reports/:id (detalle)
POST   /reports (crear reporte)
PATCH  /reports/:id/resolve (admin)
PATCH  /reports/:id/dismiss (admin)
```

### **Seed:** ✅
```
GET    /seed (ejecutar seed)
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

**Opción 1: Implementar Auth + Users** (Recomendado para funcionalidad completa)
- Permitirá proteger rutas y asociar productos a vendedores
- Base para todas las demás funcionalidades

**Opción 2: Implementar Categories**
- Complementa el módulo de productos
- Permite organizar el marketplace

**Opción 3: Agregar relaciones a Product**
- Conectar productos con vendedores y categorías
- Actualizar seed con datos relacionales

---

**¿Con qué módulo quieres continuar?** 🚀
