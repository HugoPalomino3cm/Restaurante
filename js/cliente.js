// ========================================
// LÓGICA DEL CLIENTE - GESTIÓN DE PEDIDOS
// ========================================
// Este archivo maneja toda la interacción del cliente con el menú y el carrito

// ========================================
// VARIABLES GLOBALES
// ========================================
// El carrito es un array que almacena los productos que el cliente va agregando
// Cada elemento del carrito es un objeto con: id, nombre, precio, cantidad
let carrito = [];

// Variable para almacenar todos los platos del menú (se carga desde Firestore)
let menuCompleto = [];

// ========================================
// FUNCIÓN AUXILIAR: Formatear Precio
// ========================================
// Formatea números eliminando .00 innecesarios
// Ejemplo: 1500.00 → "1500" | 1500.50 → "1500.50"
function formatearPrecio(numero) {
    if (numero % 1 === 0) {
        // Si es número entero, no mostrar decimales
        return numero.toFixed(0);
    } else {
        // Si tiene decimales, mostrarlos
        return numero.toFixed(2);
    }
}

// ========================================
// 1. CARGAR EL MENÚ DESDE FIRESTORE
// ========================================
// Esta función se ejecuta cuando la página carga
// Consulta Firestore para obtener todos los platos disponibles
function cargarMenu() {
    console.log('📋 Cargando menú desde Firestore...');
    
    // Obtener todos los documentos de la colección 'menu'
    // where() filtra solo los platos que están disponibles
    menuRef.where('disponible', '==', true)
        .get()  // get() ejecuta la consulta una sola vez
        .then((querySnapshot) => {
            // querySnapshot contiene todos los documentos que cumplieron la condición
            
            const menuContainer = document.getElementById('menu-container');
            menuContainer.innerHTML = '';  // Limpiar el contenedor
            
            menuCompleto = [];  // Reiniciar el array del menú
            
            // Iterar sobre cada documento obtenido
            querySnapshot.forEach((doc) => {
                // doc.data() obtiene los datos del documento
                // doc.id obtiene el ID único del documento
                const plato = {
                    id: doc.id,
                    ...doc.data()  // Operador spread: copia todas las propiedades
                };
                
                menuCompleto.push(plato);
                
                // Crear el HTML para mostrar el plato
                menuContainer.innerHTML += `
                    <div class="plato-card">
                        <img src="${plato.imagen || 'img/placeholder.jpg'}" alt="${plato.nombre}">
                        <h3>${plato.nombre}</h3>
                        <p class="descripcion">${plato.descripcion}</p>
                        <p class="precio">$${formatearPrecio(plato.precio)}</p>
                        <button onclick="agregarAlCarrito('${plato.id}')" class="btn-agregar">
                            Agregar al carrito
                        </button>
                    </div>
                `;
            });
            
            console.log(`✅ Menú cargado: ${menuCompleto.length} platos disponibles`);
        })
        .catch((error) => {
            console.error('❌ Error al cargar el menú:', error);
            alert('Hubo un error al cargar el menú. Por favor recarga la página.');
        });
}

// ========================================
// 2. AGREGAR PRODUCTO AL CARRITO
// ========================================
// Esta función se ejecuta cuando el cliente hace clic en "Agregar al carrito"
function agregarAlCarrito(platoId) {
    // Buscar el plato en el menú completo usando su ID
    const plato = menuCompleto.find(p => p.id === platoId);
    
    if (!plato) {
        console.error('❌ Plato no encontrado:', platoId);
        return;
    }
    
    // Verificar si el plato ya está en el carrito
    const itemExistente = carrito.find(item => item.id === platoId);
    
    if (itemExistente) {
        // Si ya existe, solo incrementamos la cantidad
        itemExistente.cantidad++;
        console.log(`➕ Cantidad aumentada: ${plato.nombre} (${itemExistente.cantidad})`);
    } else {
        // Si no existe, lo agregamos como nuevo item
        carrito.push({
            id: plato.id,
            nombre: plato.nombre,
            precio: plato.precio,
            cantidad: 1
        });
        console.log(`🆕 Nuevo item agregado: ${plato.nombre}`);
    }
    
    // Actualizar la visualización del carrito
    actualizarCarrito();
}

// ========================================
// 3. ELIMINAR PRODUCTO DEL CARRITO
// ========================================
function eliminarDelCarrito(platoId) {
    // Encontrar el índice del item en el carrito
    const index = carrito.findIndex(item => item.id === platoId);
    
    if (index !== -1) {
        const nombrePlato = carrito[index].nombre;
        // splice() elimina elementos de un array
        // Parámetros: (índice inicial, cantidad de elementos a eliminar)
        carrito.splice(index, 1);
        console.log(`🗑️ Eliminado del carrito: ${nombrePlato}`);
        actualizarCarrito();
    }
}

// ========================================
// 4. ACTUALIZAR CANTIDAD EN EL CARRITO
// ========================================
function actualizarCantidad(platoId, nuevaCantidad) {
    const item = carrito.find(item => item.id === platoId);
    
    if (item) {
        if (nuevaCantidad <= 0) {
            // Si la cantidad es 0 o menor, eliminar el item
            eliminarDelCarrito(platoId);
        } else {
            item.cantidad = nuevaCantidad;
            console.log(`🔄 Cantidad actualizada: ${item.nombre} = ${nuevaCantidad}`);
            actualizarCarrito();
        }
    }
}

// ========================================
// 5. ACTUALIZAR VISUALIZACIÓN DEL CARRITO
// ========================================
// Esta función actualiza el HTML del carrito cada vez que hay cambios
function actualizarCarrito() {
    const carritoContainer = document.getElementById('carrito-items');
    const totalElement = document.getElementById('total-carrito');
    const btnProceder = document.getElementById('btn-proceder');
    
    // Si el carrito está vacío
    if (carrito.length === 0) {
        carritoContainer.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
        totalElement.textContent = '0';
        btnProceder.style.display = 'none';  // Ocultar botón de proceder
        return;
    }
    
    // Generar HTML para cada item del carrito
    let html = '';
    let total = 0;
    
    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        html += `
            <div class="carrito-item">
                <div class="item-info">
                    <h4>${item.nombre}</h4>
                    <p class="item-precio">$${formatearPrecio(item.precio)} c/u</p>
                </div>
                <div class="item-controles">
                    <button onclick="actualizarCantidad('${item.id}', ${item.cantidad - 1})" class="btn-cantidad">-</button>
                    <span class="cantidad">${item.cantidad}</span>
                    <button onclick="actualizarCantidad('${item.id}', ${item.cantidad + 1})" class="btn-cantidad">+</button>
                    <button onclick="eliminarDelCarrito('${item.id}')" class="btn-eliminar">X</button>
                </div>
                <div class="item-subtotal">
                    <strong>$${formatearPrecio(subtotal)}</strong>
                </div>
            </div>
        `;
    });
    
    carritoContainer.innerHTML = html;
    totalElement.textContent = formatearPrecio(total);
    btnProceder.style.display = 'block';  // Mostrar botón de proceder
}

// ========================================
// 6. MOSTRAR/OCULTAR FORMULARIO DE DATOS
// ========================================
function mostrarFormulario() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío. Agrega algunos platos primero.');
        return;
    }
    document.getElementById('formulario-cliente').style.display = 'block';
    // Hacer scroll hacia el formulario
    document.getElementById('formulario-cliente').scrollIntoView({ behavior: 'smooth' });
}

function ocultarFormulario() {
    document.getElementById('formulario-cliente').style.display = 'none';
    // Limpiar el formulario
    document.getElementById('form-pedido').reset();
}

// ========================================
// 7. CONFIRMAR PEDIDO (LA PARTE MÁS IMPORTANTE)
// ========================================
// Esta función guarda el pedido en Firestore cuando el cliente confirma
document.getElementById('form-pedido').addEventListener('submit', function(e) {
    // Prevenir que el formulario recargue la página
    e.preventDefault();
    
    console.log('📝 Procesando pedido...');
    
    // Obtener los datos del formulario
    const datosCliente = {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        notas: document.getElementById('notas').value.trim()
    };
    
    // Calcular el total del pedido
    const totalPedido = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Preparar los productos en el formato adecuado para Firestore
    const productos = carrito.map(item => ({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        subtotal: item.precio * item.cantidad
    }));
    
    // ========================================
    // CREAR EL DOCUMENTO DEL PEDIDO
    // ========================================
    // Este objeto contiene toda la información del pedido
    const pedido = {
        // Información del cliente
        cliente: datosCliente,
        
        // Productos ordenados
        productos: productos,
        
        // Total del pedido
        total: totalPedido,
        
        // Estado inicial del pedido
        estado: 'pendiente',  // Puede ser: pendiente, en_preparacion, completado, cancelado
        
        // Fecha y hora del pedido
        // serverTimestamp() usa la hora del servidor de Firebase (más confiable)
        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
        
        // Fecha en formato simple para estadísticas
        fecha: obtenerFechaActual(),
        
        // Hora legible
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    
    // ========================================
    // GUARDAR EN FIRESTORE
    // ========================================
    // add() crea un nuevo documento con un ID automático
    pedidosRef.add(pedido)
        .then((docRef) => {
            // ✅ PEDIDO GUARDADO EXITOSAMENTE
            console.log('✅ Pedido guardado con ID:', docRef.id);
            
            // Mostrar mensaje de confirmación al cliente
            alert(`¡Pedido confirmado!\n\nNúmero de pedido: ${docRef.id.substring(0, 8)}\nTotal: $${formatearPrecio(totalPedido)}\n\nPronto nos pondremos en contacto contigo.`);
            
            // Limpiar el carrito y el formulario
            carrito = [];
            actualizarCarrito();
            ocultarFormulario();
            
            // Hacer scroll al inicio
            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch((error) => {
            // ❌ ERROR AL GUARDAR
            console.error('❌ Error al guardar el pedido:', error);
            alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
        });
});

// ========================================
// 8. ACTUALIZAR ESTADÍSTICAS DIARIAS
// ========================================
// Esta función actualiza o crea el documento de estadísticas del día
// NOTA: Las estadísticas se actualizan solo cuando un pedido se marca como "completado"
function actualizarEstadisticas(pedido) {
    const fecha = pedido.fecha;
    const statsDocRef = estadisticasRef.doc(fecha);
    
    // Contar cuántas unidades de cada plato se vendieron
    const platosVendidos = {};
    pedido.productos.forEach(producto => {
        if (platosVendidos[producto.id]) {
            platosVendidos[producto.id].cantidad += producto.cantidad;
            platosVendidos[producto.id].total += producto.subtotal;
        } else {
            platosVendidos[producto.id] = {
                nombre: producto.nombre,
                cantidad: producto.cantidad,
                total: producto.subtotal
            };
        }
    });
    
    // Usar set() con merge: true para actualizar o crear el documento
    // increment() suma valores sin sobrescribir
    statsDocRef.set({
        fecha: fecha,
        totalVentas: firebase.firestore.FieldValue.increment(pedido.total),
        totalPedidos: firebase.firestore.FieldValue.increment(1),
        ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
    .then(() => {
        console.log('📊 Estadísticas actualizadas');
        
        // Actualizar platos vendidos en un subcolección
        Object.keys(platosVendidos).forEach(platoId => {
            statsDocRef.collection('platosVendidos').doc(platoId).set({
                nombre: platosVendidos[platoId].nombre,
                cantidad: firebase.firestore.FieldValue.increment(platosVendidos[platoId].cantidad),
                total: firebase.firestore.FieldValue.increment(platosVendidos[platoId].total)
            }, { merge: true });
        });
    })
    .catch((error) => {
        console.error('❌ Error al actualizar estadísticas:', error);
    });
}

// ========================================
// 9. INICIALIZAR LA APLICACIÓN
// ========================================
// Cuando el DOM esté completamente cargado, cargar el menú
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Aplicación iniciada');
    cargarMenu();
});

// ========================================
// RESUMEN DEL FLUJO:
// ========================================
// 1. La página carga → se ejecuta cargarMenu()
// 2. El cliente ve los platos y hace clic en "Agregar al carrito"
// 3. agregarAlCarrito() añade el producto al array 'carrito'
// 4. actualizarCarrito() muestra los cambios en la interfaz
// 5. El cliente hace clic en "Proceder al Pedido"
// 6. Se muestra el formulario de datos
// 7. El cliente llena sus datos y hace clic en "Confirmar Pedido"
// 8. El evento 'submit' ejecuta la función que:
//    - Prepara el objeto 'pedido' con todos los datos
//    - Usa pedidosRef.add() para guardarlo en Firestore
//    - Actualiza las estadísticas del día
// 9. En el panel del admin, el listener en tiempo real detecta
//    el nuevo pedido y lo muestra automáticamente
// ========================================
