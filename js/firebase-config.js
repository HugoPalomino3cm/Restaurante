// ========================================
// CONFIGURACIÓN DE FIREBASE
// ========================================
// Este archivo contiene la configuración para conectar tu aplicación con Firebase.
// Necesitas reemplazar estos valores con los de tu proyecto en Firebase Console.

// Configuración de Firebase (obtén estos datos de Firebase Console)
// Ve a: https://console.firebase.google.com/
// 1. Crea un proyecto nuevo o selecciona uno existente
// 2. Ve a "Configuración del proyecto" (ícono de engranaje)
// 3. En la sección "Tus aplicaciones", agrega una app web
// 4. Copia los valores de configuración y pégalos aquí
const firebaseConfig = {
    apiKey: "AIzaSyBXvOjO9RklkciDM8rNPRancXYdDATHXgsEI8",
    authDomain: "restaurante-80847.firebaseapp.com",
    projectId: "restaurante-80847",
    storageBucket: "restaurante-80847.firebasestorage.app",
    messagingSenderId: "237612349662",
    appId: "1:237612349662:web:0a40e93afa9e5edc1baa4f",
    measurementId: "G-WMVNDFXCEN"
};

// Inicializar Firebase
// Esta línea conecta tu aplicación con los servicios de Firebase
firebase.initializeApp(firebaseConfig);

// Obtener referencia a Firestore (la base de datos)
// Firestore es una base de datos NoSQL en tiempo real
const db = firebase.firestore();

// Obtener referencia a Storage (almacenamiento de archivos)
// Firebase Storage permite subir y almacenar imágenes, videos y otros archivos
const storage = firebase.storage();
const storageRef = storage.ref();

// ========================================
// REFERENCIAS A LAS COLECCIONES
// ========================================
// Una colección es como una "tabla" en SQL, pero en NoSQL
// Cada colección contiene documentos (registros)

// Colección de pedidos - aquí se guardan todos los pedidos de los clientes
const pedidosRef = db.collection('pedidos');

// Colección del menú - aquí se guardan todos los platos disponibles
const menuRef = db.collection('menu');

// Colección de estadísticas - aquí se guardan resúmenes diarios de ventas
const estadisticasRef = db.collection('estadisticas');

// ========================================
// FUNCIÓN AUXILIAR: Obtener fecha actual en formato YYYY-MM-DD
// ========================================
// Esta función nos ayuda a trabajar con fechas de manera consistente
function obtenerFechaActual() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');  // +1 porque los meses empiezan en 0
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

// ========================================
// FUNCIÓN AUXILIAR: Obtener timestamp actual
// ========================================
// Timestamp = marca de tiempo, útil para ordenar cronológicamente
function obtenerTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
}

// Exportar las referencias para usarlas en otros archivos
// (En navegador, estas variables estarán disponibles globalmente)
console.log('🔥 Firebase configurado correctamente');
