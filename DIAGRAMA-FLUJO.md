# 📊 Diagrama de Flujo del Sistema

## 🔄 Flujo Completo del Pedido (Cliente → Admin)

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENTE (index.html)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Página carga
                              ▼
                    ┌──────────────────┐
                    │  cargarMenu()    │ ← Lee colección 'menu' de Firestore
                    └──────────────────┘
                              │
                              │ 2. Cliente ve platos
                              ▼
                    ┌──────────────────┐
                    │ Cliente hace     │
                    │ clic en "Agregar"│
                    └──────────────────┘
                              │
                              │ 3. Ejecuta agregarAlCarrito()
                              ▼
                    ┌──────────────────┐
                    │ Modifica array   │
                    │ 'carrito'        │
                    └──────────────────┘
                              │
                              │ 4. Llama actualizarCarrito()
                              ▼
                    ┌──────────────────┐
                    │ Actualiza HTML   │
                    │ del carrito      │
                    └──────────────────┘
                              │
                              │ 5. Cliente confirma pedido
                              ▼
                    ┌──────────────────┐
                    │ Event 'submit'   │
                    │ del formulario   │
                    └──────────────────┘
                              │
                              │ 6. Prepara objeto 'pedido'
                              ▼
                    ┌──────────────────┐
                    │ pedidosRef.add() │ ← 🔥 GUARDA EN FIRESTORE
                    └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIRESTORE (Base de Datos)                     │
│                                                                  │
│  Colección: pedidos                                              │
│  ├─ [ID_AUTO] {                                                 │
│  │    cliente: { nombre, telefono, direccion, notas }           │
│  │    productos: [ {...}, {...} ]                               │
│  │    total: 32.98                                              │
│  │    estado: 'pendiente'                                       │
│  │    fechaCreacion: Timestamp                                  │
│  │  }                                                            │
│                                                                  │
│  ⚡ Firestore detecta nuevo documento                            │
│  ⚡ Envía notificación via WebSocket                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 7. Notificación en tiempo real
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ADMINISTRADOR (admin.html)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 8. Página admin ya estaba escuchando
                              ▼
                    ┌──────────────────┐
                    │ escucharPedidos()│
                    │ con onSnapshot() │ ← 👂 Listener en tiempo real
                    └──────────────────┘
                              │
                              │ 9. onSnapshot() se activa automáticamente
                              ▼
                    ┌──────────────────┐
                    │ Callback de      │
                    │ onSnapshot()     │
                    │ se ejecuta       │
                    └──────────────────┘
                              │
                              │ 10. Genera HTML del pedido
                              ▼
                    ┌──────────────────┐
                    │ crearTarjeta     │
                    │ Pedido()         │
                    └──────────────────┘
                              │
                              │ 11. Actualiza DOM
                              ▼
                    ┌──────────────────┐
                    │ ✨ PEDIDO        │
                    │ APARECE SIN      │
                    │ RECARGAR PÁGINA  │
                    └──────────────────┘
```

## 🎯 Puntos Clave del Tiempo Real

### ¿Por qué NO necesita recargar la página?

**Método Tradicional (SIN tiempo real):**
```javascript
// ❌ Esto requiere hacer polling (consultar cada X segundos)
setInterval(() => {
    fetch('/api/pedidos')
        .then(res => res.json())
        .then(pedidos => actualizarUI(pedidos))
}, 5000);  // Consulta cada 5 segundos
```

**Método con Firestore (CON tiempo real):**
```javascript
// ✅ Esto escucha cambios y se actualiza automáticamente
pedidosRef.onSnapshot((snapshot) => {
    // Esta función se ejecuta:
    // - Una vez al inicio
    // - Cada vez que HAY UN CAMBIO
    snapshot.forEach(doc => {
        // Procesar documento
    });
});
```

### Tecnología Detrás: WebSockets

```
┌─────────────┐                           ┌─────────────┐
│  Navegador  │◄─────── WebSocket ───────►│  Firestore  │
│   (Admin)   │        (Conexión          │   Server    │
│             │         persistente)      │             │
└─────────────┘                           └─────────────┘
       ▲                                         │
       │                                         │
       │         Cuando hay un cambio:           │
       │         1. Firestore lo detecta         │
       │         2. Envía mensaje via WS         │
       └─────────3. Navegador lo recibe──────────┘
                 4. onSnapshot() se ejecuta
                 5. UI se actualiza
```

## 🔀 Flujo de Actualización de Estado

```
Admin cambia estado del pedido de "Pendiente" → "En Preparación"
                    │
                    ▼
        ┌──────────────────────┐
        │ cambiarEstadoPedido()│
        │ función se ejecuta   │
        └──────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │ pedidosRef.doc(id)   │
        │  .update({           │
        │    estado: 'nuevo'   │
        │  })                  │
        └──────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │ Firestore actualiza  │
        │ el documento         │
        └──────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │ onSnapshot() detecta │
        │ el cambio            │
        └──────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │ UI se actualiza con  │
        │ el nuevo estado      │
        │ (cambio de color,    │
        │  icono, etc.)        │
        └──────────────────────┘
```

## 📝 Estructura de Datos Detallada

### Documento de Pedido
```javascript
{
  // Datos del cliente (anónimo, sin autenticación)
  cliente: {
    nombre: String,        // Ej: "Juan Pérez"
    telefono: String,      // Ej: "+1234567890"
    direccion: String,     // Ej: "Calle 123, Ciudad"
    notas: String          // Ej: "Sin cebolla" (opcional)
  },
  
  // Array de productos ordenados
  productos: [
    {
      id: String,         // ID del plato en colección 'menu'
      nombre: String,     // Nombre del plato
      precio: Number,     // Precio unitario
      cantidad: Number,   // Cantidad ordenada
      subtotal: Number    // precio * cantidad
    }
  ],
  
  // Total del pedido
  total: Number,          // Suma de todos los subtotales
  
  // Estado del pedido (flujo de cocina)
  estado: String,         // 'pendiente' | 'en_preparacion' | 
                          // 'completado' | 'cancelado'
  
  // Marcas de tiempo
  fechaCreacion: Timestamp,     // Timestamp de Firebase
  fecha: String,                // "2026-01-21" (para estadísticas)
  hora: String,                 // "14:30" (legible)
  ultimaActualizacion: Timestamp  // Se actualiza al cambiar estado
}
```

### Documento de Menú
```javascript
{
  nombre: String,           // Ej: "Pizza Margarita"
  descripcion: String,      // Descripción del plato
  precio: Number,           // Ej: 12.99
  categoria: String,        // 'entradas' | 'platos_fuertes' | 
                            // 'postres' | 'bebidas'
  imagen: String,           // URL de la imagen
  disponible: Boolean,      // true = se muestra al cliente
  ultimaActualizacion: Timestamp
}
```

### Documento de Estadísticas (ID = fecha)
```javascript
// Documento con ID = "2026-01-21"
{
  fecha: String,              // "2026-01-21"
  totalVentas: Number,        // Suma acumulada del día
  totalPedidos: Number,       // Contador de pedidos
  ultimaActualizacion: Timestamp
}

// Subcolección: platosVendidos
// platosVendidos/[ID_PLATO]
{
  nombre: String,             // Nombre del plato
  cantidad: Number,           // Unidades vendidas
  total: Number               // Total generado por este plato
}
```

## 🛠️ Operaciones de Firestore Utilizadas

### 1. Lectura única (get)
```javascript
menuRef.get()  // Consulta una sola vez
```

### 2. Escucha en tiempo real (onSnapshot)
```javascript
pedidosRef.onSnapshot(...)  // Se ejecuta cada vez que hay cambios
```

### 3. Crear documento (add)
```javascript
pedidosRef.add(pedido)  // Crea con ID automático
```

### 4. Actualizar documento (update)
```javascript
pedidosRef.doc(id).update({ estado: 'nuevo' })
```

### 5. Eliminar documento (delete)
```javascript
menuRef.doc(id).delete()
```

### 6. Contador atómico (increment)
```javascript
// No necesita leer primero, suma directamente
estadisticasRef.doc(fecha).set({
  totalVentas: firebase.firestore.FieldValue.increment(32.98)
}, { merge: true })
```

### 7. Consultas con filtros
```javascript
menuRef.where('disponible', '==', true)  // Solo disponibles
pedidosRef.where('estado', '==', 'pendiente')  // Solo pendientes
```

### 8. Ordenamiento
```javascript
pedidosRef.orderBy('fechaCreacion', 'desc')  // Más reciente primero
```

## 🎨 Flujo de UI/UX

```
CLIENTE                         ADMIN
  │                               │
  │ 1. Navega el menú             │ 1. Ve panel vacío o con pedidos
  │                               │    antiguos
  │ 2. Agrega items               │
  │    (feedback visual inmediato)│
  │                               │
  │ 3. Ve total actualizarse      │
  │    en tiempo real             │
  │                               │
  │ 4. Procede al pedido          │
  │                               │
  │ 5. Llena formulario           │
  │                               │
  │ 6. Clic en "Confirmar"        │
  │                               │
  │ 7. 🔥 Guardando en Firestore  │
  │    ⏱️ ~100-500ms              │
  │                               │
  │ 8. ✅ Confirmación + número   │ 8. ✨ NUEVO PEDIDO APARECE
  │    de pedido                  │    (sin recargar)
  │                               │
  │ 9. Carrito se limpia          │ 9. Notificación visual
  │                               │    (animación)
  │                               │
  │                               │ 10. Admin cambia estado
  │                               │
  │                               │ 11. 🔥 Actualiza Firestore
  │                               │
  │ (Podría ver estado si         │ 12. ✅ UI se actualiza
  │  implementamos tracking)      │     automáticamente
```

## 💡 Ventajas del Enfoque en Tiempo Real

✅ **Sin polling**: No necesitas consultar cada X segundos
✅ **Eficiente**: Solo se transmiten los cambios, no todo el dataset
✅ **Escalable**: Firestore maneja millones de conexiones simultáneas
✅ **Sincronización**: Todos ven los mismos datos al mismo tiempo
✅ **Offline-first**: Firestore guarda cambios localmente si no hay internet
✅ **Fácil de implementar**: Una sola función (onSnapshot)

## 🚀 Optimizaciones Posibles

1. **Paginación**: Limitar pedidos mostrados con `.limit(20)`
2. **Índices**: Crear índices compuestos para consultas complejas
3. **Caché**: Firestore cachea automáticamente en el navegador
4. **Batch Writes**: Usar batches para operaciones múltiples
5. **Seguridad**: Implementar reglas de seguridad robustas
