# 🍽️ Sistema de Gestión de Pedidos para Restaurante

Sistema completo de gestión de pedidos con panel de administración en tiempo real usando Firebase Firestore.

## 📋 Características

✅ **Base de Datos en Tiempo Real** - Los pedidos se sincronizan automáticamente
✅ **Panel de Administración** - Gestión completa de pedidos y menú
✅ **Carrito de Compras** - Sin necesidad de registro de usuario
✅ **CRUD de Menú** - Editar precios y disponibilidad de platos
✅ **Estadísticas** - Visualiza ventas diarias y platos más vendidos
✅ **Estados de Pedido** - Pendiente, En Preparación, Completado, Cancelado

## 🚀 Configuración Inicial

### Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Dale un nombre a tu proyecto (ej: "restaurante-pedidos")
4. Sigue el asistente de configuración

### Paso 2: Activar Firestore

1. En el menú lateral, selecciona "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Iniciar en modo de prueba" (para desarrollo)
4. Elige una ubicación cercana a tus usuarios

### Paso 3: Obtener Configuración de Firebase

1. En la página principal del proyecto, haz clic en el ícono `</>` (Web)
2. Registra tu app (ej: "App Web Restaurante")
3. Copia los datos de configuración que aparecen

### Paso 4: Configurar el Proyecto

1. Abre el archivo `js/firebase-config.js`
2. Reemplaza las siguientes líneas con tus datos:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY",                          // ← Pega aquí tu API Key
    authDomain: "TU_PROJECT_ID.firebaseapp.com",   // ← Pega aquí tu Auth Domain
    projectId: "TU_PROJECT_ID",                     // ← Pega aquí tu Project ID
    storageBucket: "TU_PROJECT_ID.appspot.com",    // ← Pega aquí tu Storage Bucket
    messagingSenderId: "TU_SENDER_ID",             // ← Pega aquí tu Sender ID
    appId: "TU_APP_ID"                             // ← Pega aquí tu App ID
};
```

### Paso 5: Agregar Datos de Prueba

Abre la consola de Firebase:
1. Ve a Firestore Database
2. Crea una colección llamada "menu"
3. Agrega algunos documentos de ejemplo:

**Documento 1:**
```
nombre: "Pizza Margarita"
descripcion: "Pizza clásica con tomate, mozzarella y albahaca"
precio: 12.99
categoria: "platos_fuertes"
imagen: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002"
disponible: true
```

**Documento 2:**
```
nombre: "Ensalada César"
descripcion: "Lechuga romana, pollo, crutones y aderezo césar"
precio: 8.50
categoria: "entradas"
imagen: "https://images.unsplash.com/photo-1546793665-c74683f339c1"
disponible: true
```

**Documento 3:**
```
nombre: "Tiramisu"
descripcion: "Postre italiano con café y mascarpone"
precio: 6.00
categoria: "postres"
imagen: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9"
disponible: true
```

## 📂 Estructura del Proyecto

```
Restaurante/
│
├── index.html              # Página del cliente (menú y pedidos)
├── admin.html              # Panel de administración
│
├── css/
│   ├── styles.css          # Estilos del cliente
│   └── admin-styles.css    # Estilos del admin
│
└── js/
    ├── firebase-config.js  # Configuración de Firebase
    ├── cliente.js          # Lógica del carrito y pedidos
    └── admin.js            # Lógica del panel de administración
```

## 🎯 Cómo Usar el Sistema

### Para el Cliente:

1. Abre `index.html` en tu navegador
2. Explora el menú de platos disponibles
3. Haz clic en "Agregar al carrito" en los platos que desees
4. Ajusta las cantidades usando los botones + y -
5. Haz clic en "Proceder al Pedido"
6. Llena tus datos de contacto
7. Haz clic en "Confirmar Pedido"
8. ¡Listo! Recibirás un número de pedido

### Para el Administrador:

1. Abre `admin.html` en tu navegador
2. **Pestaña "Pedidos":**
   - Ver todos los pedidos en tiempo real
   - Filtrar por estado (Pendiente, En Preparación, etc.)
   - Cambiar el estado de cada pedido
3. **Pestaña "Gestión de Menú":**
   - Ver todos los platos del menú
   - Agregar nuevos platos
   - Editar precios y disponibilidad
   - Eliminar platos
4. **Pestaña "Estadísticas":**
   - Ver ventas totales del día
   - Ver número de pedidos completados
   - Ver ticket promedio
   - Ver platos más vendidos

## 🔥 Flujo de Datos en Tiempo Real

### Cuando un cliente confirma un pedido:

1. El cliente llena el formulario y hace clic en "Confirmar Pedido"
2. `cliente.js` ejecuta la función del evento `submit`
3. Se crea un objeto `pedido` con toda la información
4. Se usa `pedidosRef.add(pedido)` para guardarlo en Firestore
5. Firestore guarda el documento y genera un ID único

### Cómo aparece en el panel del admin SIN recargar:

1. Cuando el admin abre `admin.html`, se ejecuta `escucharPedidos()`
2. Esta función crea un listener con `onSnapshot()`
3. El listener está "escuchando" cambios en la colección de pedidos
4. Cuando Firestore detecta un nuevo documento (el pedido del cliente)
5. `onSnapshot()` se ejecuta AUTOMÁTICAMENTE
6. La función actualiza el HTML del panel
7. El admin ve el pedido aparecer instantáneamente

**¡No hay polling, no hay intervalos, no hay recargas!**
Firebase usa WebSockets para mantener una conexión en tiempo real.

## 📊 Estructura de Datos en Firestore

### Colección: `pedidos`
```javascript
{
  cliente: {
    nombre: "Juan Pérez",
    telefono: "+1234567890",
    direccion: "Calle Principal 123",
    notas: "Sin cebolla"
  },
  productos: [
    {
      id: "abc123",
      nombre: "Pizza Margarita",
      precio: 12.99,
      cantidad: 2,
      subtotal: 25.98
    }
  ],
  total: 25.98,
  estado: "pendiente",
  fechaCreacion: Timestamp,
  fecha: "2026-01-21",
  hora: "14:30"
}
```

### Colección: `menu`
```javascript
{
  nombre: "Pizza Margarita",
  descripcion: "Pizza clásica...",
  precio: 12.99,
  categoria: "platos_fuertes",
  imagen: "https://...",
  disponible: true,
  ultimaActualizacion: Timestamp
}
```

### Colección: `estadisticas`
```javascript
// Documento con ID = fecha (ej: "2026-01-21")
{
  fecha: "2026-01-21",
  totalVentas: 245.50,
  totalPedidos: 15,
  ultimaActualizacion: Timestamp
  
  // Subcolección: platosVendidos
  platosVendidos: {
    "abc123": {
      nombre: "Pizza Margarita",
      cantidad: 8,
      total: 103.92
    }
  }
}
```

## 🔐 Seguridad de Firestore

**IMPORTANTE:** En producción, debes configurar reglas de seguridad.

Ve a Firestore > Reglas y configura:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Permitir lectura del menú a todos
    match /menu/{document=**} {
      allow read: if true;
      allow write: if false; // Solo el admin puede escribir
    }
    
    // Los clientes solo pueden crear pedidos
    match /pedidos/{pedido} {
      allow create: if true;
      allow read, update: if false; // Solo el admin puede leer/actualizar
    }
    
    // Solo el admin puede acceder a estadísticas
    match /estadisticas/{document=**} {
      allow read, write: if false;
    }
  }
}
```

Para el panel de admin, deberías implementar Firebase Authentication.

## 🌐 Despliegue

### Opción 1: Firebase Hosting (Recomendado)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar proyecto
firebase init hosting

# Desplegar
firebase deploy
```

### Opción 2: Servidor Local Simple

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js
npx http-server
```

Luego abre: `http://localhost:8000`

## 🐛 Solución de Problemas

### Los pedidos no aparecen en tiempo real

- Verifica que la configuración de Firebase sea correcta
- Abre la consola del navegador (F12) y busca errores
- Verifica que Firestore esté habilitado en tu proyecto

### Error: "Firebase is not defined"

- Asegúrate de que los scripts de Firebase se carguen antes que tus archivos JS
- Verifica la conexión a internet

### Los platos no se cargan

- Verifica que la colección "menu" exista en Firestore
- Verifica que los documentos tengan el campo `disponible: true`

## 📚 Conceptos Clave Explicados

### ¿Qué es Firestore?
Es una base de datos NoSQL en la nube. En lugar de tablas y filas (como SQL), usa colecciones y documentos.

### ¿Qué es onSnapshot()?
Es un método que "escucha" cambios en tiempo real. Cada vez que un documento cambia, se ejecuta automáticamente.

### ¿Qué es serverTimestamp()?
Usa la hora del servidor de Firebase en lugar de la hora del cliente, para evitar problemas con relojes desincronizados.

### ¿Qué es increment()?
Suma un valor a un campo existente sin necesidad de leerlo primero. Útil para contadores.

## 🎓 Próximos Pasos

1. **Autenticación:** Implementa Firebase Authentication para proteger el panel de admin
2. **Notificaciones:** Usa Firebase Cloud Messaging para notificar al dueño de nuevos pedidos
3. **Imágenes:** Usa Firebase Storage para subir imágenes de los platos
4. **Reportes:** Crea reportes mensuales y anuales
5. **Impresión:** Agrega función para imprimir tickets de cocina
6. **WhatsApp:** Integra API de WhatsApp para confirmar pedidos

## 📞 Soporte

Si tienes dudas, revisa:
- [Documentación de Firebase](https://firebase.google.com/docs)
- [Guía de Firestore](https://firebase.google.com/docs/firestore)

---

**¡Tu sistema de pedidos está listo! 🎉**

Recuerda: Este es un proyecto educativo. Para producción, implementa autenticación y reglas de seguridad apropiadas.
