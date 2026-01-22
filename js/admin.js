// ========================================
// PANEL DE ADMINISTRACIÓN - TIEMPO REAL
// ========================================
// Este archivo maneja el panel del administrador donde se ven los pedidos en tiempo real

// ========================================
// VARIABLES GLOBALES
// ========================================
let pedidosListener = null;  // Almacenará la referencia al listener de pedidos
let filtroActual = 'todos';   // Filtro actual de pedidos

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
// FUNCIÓN: Cambiar entre URL e input de archivo
// ========================================
function toggleImageInput() {
    const tipoSeleccionado = document.querySelector('input[name="tipo-imagen"]:checked').value;
    const inputUrl = document.getElementById('plato-imagen');
    const inputFile = document.getElementById('plato-imagen-file');
    const uploadProgress = document.getElementById('upload-progress');
    
    if (tipoSeleccionado === 'url') {
        inputUrl.style.display = 'block';
        inputFile.style.display = 'none';
        uploadProgress.style.display = 'none';
    } else {
        inputUrl.style.display = 'none';
        inputFile.style.display = 'block';
        uploadProgress.style.display = 'none';
    }
}

// ========================================
// FUNCIÓN: Subir imagen a Firebase Storage
// ========================================
async function subirImagen(archivo) {
    return new Promise((resolve, reject) => {
        // Crear nombre único para el archivo
        const timestamp = Date.now();
        const nombreArchivo = `menu/${timestamp}_${archivo.name}`;
        
        // Crear referencia al archivo en Storage
        const archivoRef = storageRef.child(nombreArchivo);
        
        // Subir el archivo
        const uploadTask = archivoRef.put(archivo);
        
        // Mostrar barra de progreso
        const progressDiv = document.getElementById('upload-progress');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        progressDiv.style.display = 'block';
        
        // Monitorear el progreso de la subida
        uploadTask.on('state_changed',
            (snapshot) => {
                // Calcular porcentaje de progreso
                const progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progreso + '%';
                progressText.textContent = `Subiendo: ${Math.round(progreso)}%`;
            },
            (error) => {
                // Error al subir
                console.error('❌ Error al subir imagen:', error);
                progressText.textContent = 'Error al subir la imagen';
                progressText.style.color = '#e74c3c';
                reject(error);
            },
            () => {
                // Subida completada exitosamente
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    progressText.textContent = 'Imagen subida correctamente';
                    progressText.style.color = '#27ae60';
                    console.log('✅ Imagen subida:', downloadURL);
                    resolve(downloadURL);
                });
            }
        );
    });
}

// ========================================
// 1. ESCUCHAR PEDIDOS EN TIEMPO REAL
// ========================================
// ⭐ ESTA ES LA PARTE MÁS IMPORTANTE PARA TU OBJETIVO INMEDIATO ⭐
// onSnapshot() crea un "listener" que se ejecuta cada vez que hay cambios en Firestore
// No necesitas recargar la página, los cambios aparecen automáticamente
function escucharPedidos(filtroEstado = 'todos') {
    console.log(`👂 Escuchando pedidos en tiempo real (filtro: ${filtroEstado})...`);
    
    // Si ya hay un listener activo, desconectarlo primero
    if (pedidosListener) {
        pedidosListener();  // Esto desconecta el listener anterior
    }
    
    // Construir la consulta según el filtro
    let consulta = pedidosRef.orderBy('fechaCreacion', 'desc');  // Ordenar por más reciente primero
    
    // Si el filtro no es 'todos', aplicar filtro por estado
    if (filtroEstado !== 'todos') {
        consulta = consulta.where('estado', '==', filtroEstado);
    }
    
    // ========================================
    // CREAR EL LISTENER DE TIEMPO REAL
    // ========================================
    // onSnapshot() es diferente de get()
    // - get() solo consulta UNA VEZ
    // - onSnapshot() se ejecuta CADA VEZ que hay cambios
    pedidosListener = consulta.onSnapshot(
        (querySnapshot) => {
            // ✅ Esta función se ejecuta:
            // 1. Inmediatamente con los datos actuales
            // 2. Cada vez que se agrega un nuevo pedido
            // 3. Cada vez que se modifica un pedido existente
            // 4. Cada vez que se elimina un pedido
            
            console.log(`📦 Pedidos actualizados: ${querySnapshot.size} pedidos`);
            
            const pedidosContainer = document.getElementById('pedidos-container');
            
            // Si no hay pedidos
            if (querySnapshot.empty) {
                pedidosContainer.innerHTML = '<p class="sin-pedidos">No hay pedidos en este momento</p>';
                return;
            }
            
            // Limpiar el contenedor
            pedidosContainer.innerHTML = '';
            
            // Iterar sobre cada pedido
            querySnapshot.forEach((doc) => {
                const pedido = doc.data();
                const pedidoId = doc.id;
                
                // Crear tarjeta HTML para el pedido
                const pedidoCard = crearTarjetaPedido(pedidoId, pedido);
                pedidosContainer.innerHTML += pedidoCard;
            });
            
            // Agregar animación de entrada a las nuevas tarjetas
            document.querySelectorAll('.pedido-card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('mostrar');
                }, index * 100);  // Efecto escalonado
            });
        },
        (error) => {
            // ❌ Manejo de errores
            console.error('❌ Error al escuchar pedidos:', error);
            alert('Error al conectar con la base de datos. Verifica tu conexión.');
        }
    );
}

// ========================================
// 2. CREAR TARJETA HTML PARA UN PEDIDO
// ========================================
function crearTarjetaPedido(pedidoId, pedido) {
    // Determinar la clase CSS según el estado
    const estadoClase = `estado-${pedido.estado}`;
    
    // Generar HTML para la lista de productos
    let productosHtml = '';
    pedido.productos.forEach(producto => {
        productosHtml += `
            <div class="producto-item">
                <span class="producto-nombre">${producto.cantidad}x ${producto.nombre}</span>
                <span class="producto-precio">$${formatearPrecio(producto.subtotal)}</span>
            </div>
        `;
    });
    
    // Formatear la fecha/hora
    let fechaHora = 'Ahora';
    if (pedido.fechaCreacion) {
        const fecha = pedido.fechaCreacion.toDate();
        fechaHora = fecha.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    return `
        <div class="pedido-card ${estadoClase}">
            <div class="pedido-header">
                <h3>Pedido #${pedidoId.substring(0, 8)}</h3>
                <span class="pedido-fecha">${fechaHora}</span>
            </div>
            
            <div class="pedido-cliente">
                <p><strong>Cliente:</strong> ${pedido.cliente.nombre}</p>
                <p><strong>Teléfono:</strong> ${pedido.cliente.telefono}</p>
                <p><strong>Dirección:</strong> ${pedido.cliente.direccion}</p>
                ${pedido.cliente.notas ? `<p><strong>Notas:</strong> ${pedido.cliente.notas}</p>` : ''}
            </div>
            
            <div class="pedido-productos">
                <h4>Productos:</h4>
                ${productosHtml}
            </div>
            
            <div class="pedido-total">
                <strong>Total: $${formatearPrecio(pedido.total)}</strong>
            </div>
            
            <div class="pedido-estado">
                <label>Estado:</label>
                <select onchange="cambiarEstadoPedido('${pedidoId}', this.value)" class="select-estado">
                    <option value="pendiente" ${pedido.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="en_preparacion" ${pedido.estado === 'en_preparacion' ? 'selected' : ''}>En Preparación</option>
                    <option value="completado" ${pedido.estado === 'completado' ? 'selected' : ''}>Completado</option>
                    <option value="cancelado" ${pedido.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            </div>
        </div>
    `;
}

// ========================================
// 3. CAMBIAR ESTADO DE UN PEDIDO
// ========================================
// Esta función actualiza el estado de un pedido en Firestore
function cambiarEstadoPedido(pedidoId, nuevoEstado) {
    console.log(`🔄 Cambiando estado del pedido ${pedidoId} a: ${nuevoEstado}`);
    
    // Primero obtener el pedido actual para verificar el estado anterior
    pedidosRef.doc(pedidoId).get()
        .then((doc) => {
            if (!doc.exists) {
                throw new Error('Pedido no encontrado');
            }
            
            const pedidoActual = doc.data();
            const estadoAnterior = pedidoActual.estado;
            
            // Actualizar el estado del pedido
            return pedidosRef.doc(pedidoId).update({
                estado: nuevoEstado,
                ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                // Manejar estadísticas según el cambio de estado
                ajustarEstadisticas(pedidoActual, estadoAnterior, nuevoEstado);
            });
        })
        .then(() => {
            console.log('✅ Estado actualizado correctamente');
            // El listener onSnapshot() detectará el cambio automáticamente
        })
        .catch((error) => {
            console.error('❌ Error al actualizar estado:', error);
            alert('Error al actualizar el estado del pedido');
        });
}

// ========================================
// FUNCIÓN AUXILIAR: Ajustar estadísticas según estado del pedido
// ========================================
// Las estadísticas solo cuentan pedidos COMPLETADOS (realmente vendidos)
function ajustarEstadisticas(pedido, estadoAnterior, nuevoEstado) {
    const fecha = pedido.fecha;
    const statsDocRef = estadisticasRef.doc(fecha);
    
    // Si se marca como completado (venta real)
    if (nuevoEstado === 'completado' && estadoAnterior !== 'completado') {
        console.log('📊 Sumando venta completada a estadísticas...');
        
        // Sumar al total de ventas y pedidos
        statsDocRef.set({
            fecha: fecha,
            totalVentas: firebase.firestore.FieldValue.increment(pedido.total),
            totalPedidos: firebase.firestore.FieldValue.increment(1),
            ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(error => console.error('Error al actualizar estadísticas:', error));
        
        // Sumar platos vendidos
        pedido.productos.forEach(producto => {
            statsDocRef.collection('platosVendidos').doc(producto.id).set({
                nombre: producto.nombre,
                cantidad: firebase.firestore.FieldValue.increment(producto.cantidad),
                total: firebase.firestore.FieldValue.increment(producto.subtotal)
            }, { merge: true }).catch(error => console.error('Error al actualizar platos vendidos:', error));
        });
    }
    // Si se quita del estado completado (ya no es venta)
    else if (estadoAnterior === 'completado' && nuevoEstado !== 'completado') {
        console.log('📊 Restando venta no completada de estadísticas...');
        
        // Restar del total de ventas y pedidos
        statsDocRef.update({
            totalVentas: firebase.firestore.FieldValue.increment(-pedido.total),
            totalPedidos: firebase.firestore.FieldValue.increment(-1),
            ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => console.error('Error al actualizar estadísticas:', error));
        
        // Restar platos vendidos
        pedido.productos.forEach(producto => {
            statsDocRef.collection('platosVendidos').doc(producto.id).update({
                cantidad: firebase.firestore.FieldValue.increment(-producto.cantidad),
                total: firebase.firestore.FieldValue.increment(-producto.subtotal)
            }).catch(error => console.error('Error al actualizar platos vendidos:', error));
        });
    }
}

// ========================================
// 4. FILTRAR PEDIDOS POR ESTADO
// ========================================
function filtrarPedidos(estado) {
    filtroActual = estado;
    
    // Actualizar botones de filtro (UI)
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Reiniciar el listener con el nuevo filtro
    escucharPedidos(estado);
}

// ========================================
// 5. GESTIÓN DEL MENÚ (CRUD)
// ========================================

// ========================================
// 5.1. CARGAR MENÚ EN PANEL DE ADMINISTRACIÓN
// ========================================
function cargarMenuAdmin() {
    console.log('📋 Cargando menú en panel de administración...');
    
    // orderBy() ordena los resultados
    menuRef.orderBy('categoria').get()
        .then((querySnapshot) => {
            const menuContainer = document.getElementById('menu-admin-container');
            menuContainer.innerHTML = '';
            
            querySnapshot.forEach((doc) => {
                const plato = doc.data();
                const platoId = doc.id;
                
                menuContainer.innerHTML += `
                    <div class="menu-item-admin">
                        <img src="${plato.imagen || 'img/placeholder.jpg'}" alt="${plato.nombre}">
                        <div class="item-info">
                            <h4>${plato.nombre}</h4>
                            <p class="categoria">${plato.categoria}</p>
                            <p class="descripcion">${plato.descripcion}</p>
                            <p class="precio">$${plato.precio.toFixed(2)}</p>
                            <p class="disponibilidad ${plato.disponible ? 'disponible' : 'no-disponible'}">
                                ${plato.disponible ? 'Disponible' : 'No disponible'}
                            </p>
                        </div>
                        <div class="item-acciones">
                            <button onclick="editarPlato('${platoId}')" class="btn-editar">Editar</button>
                            <button onclick="eliminarPlato('${platoId}', '${plato.nombre}')" class="btn-eliminar-plato">Eliminar</button>
                        </div>
                    </div>
                `;
            });
        })
        .catch((error) => {
            console.error('❌ Error al cargar menú:', error);
        });
}

// ========================================
// 5.2. MOSTRAR FORMULARIO PARA AGREGAR PLATO
// ========================================
function mostrarFormularioPlato(platoId = null) {
    document.getElementById('form-plato-container').style.display = 'block';
    document.getElementById('form-plato').scrollIntoView({ behavior: 'smooth' });
    
    if (platoId) {
        // Modo edición: cargar datos del plato
        document.getElementById('form-titulo').textContent = 'Editar Plato';
        document.getElementById('plato-id').value = platoId;
        
        menuRef.doc(platoId).get()
            .then((doc) => {
                if (doc.exists) {
                    const plato = doc.data();
                    document.getElementById('plato-nombre').value = plato.nombre;
                    document.getElementById('plato-descripcion').value = plato.descripcion;
                    document.getElementById('plato-precio').value = plato.precio;
                    document.getElementById('plato-categoria').value = plato.categoria;
                    document.getElementById('plato-imagen').value = plato.imagen || '';
                    document.getElementById('plato-disponible').checked = plato.disponible;
                }
            });
    } else {
        // Modo creación: limpiar formulario
        document.getElementById('form-titulo').textContent = 'Nuevo Plato';
        document.getElementById('plato-id').value = '';
        document.getElementById('form-plato').reset();
    }
}

function ocultarFormularioPlato() {
    document.getElementById('form-plato-container').style.display = 'none';
    document.getElementById('form-plato').reset();
    
    // Resetear inputs de imagen
    document.getElementById('plato-imagen-file').value = '';
    document.querySelector('input[name="tipo-imagen"][value="url"]').checked = true;
    toggleImageInput();
}

// ========================================
// 5.3. GUARDAR PLATO (CREAR O ACTUALIZAR)
// ========================================
document.getElementById('form-plato').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const platoId = document.getElementById('plato-id').value;
    const tipoImagen = document.querySelector('input[name="tipo-imagen"]:checked').value;
    let imagenUrl = '';
    
    try {
        // Determinar la URL de la imagen
        if (tipoImagen === 'url') {
            imagenUrl = document.getElementById('plato-imagen').value.trim();
        } else {
            // Subir archivo a Firebase Storage
            const archivoImagen = document.getElementById('plato-imagen-file').files[0];
            if (archivoImagen) {
                console.log('📤 Subiendo imagen...');
                imagenUrl = await subirImagen(archivoImagen);
            } else if (!platoId) {
                // Si es un plato nuevo y no hay imagen, mostrar error
                alert('Por favor selecciona una imagen');
                return;
            }
        }
        
        const platoData = {
            nombre: document.getElementById('plato-nombre').value.trim(),
            descripcion: document.getElementById('plato-descripcion').value.trim(),
            precio: parseFloat(document.getElementById('plato-precio').value),
            categoria: document.getElementById('plato-categoria').value,
            disponible: document.getElementById('plato-disponible').checked,
            ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Solo actualizar la imagen si se proporcionó una nueva
        if (imagenUrl) {
            platoData.imagen = imagenUrl;
        }
        
        if (platoId) {
            // ACTUALIZAR plato existente
            await menuRef.doc(platoId).update(platoData);
            console.log('✅ Plato actualizado');
            alert('Plato actualizado correctamente');
        } else {
            // CREAR nuevo plato
            await menuRef.add(platoData);
            console.log('✅ Plato creado');
            alert('Plato agregado correctamente');
        }
        
        ocultarFormularioPlato();
        cargarMenuAdmin();
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al guardar el plato: ' + error.message);
    }
});

// ========================================
// 5.4. EDITAR PLATO
// ========================================
function editarPlato(platoId) {
    mostrarFormularioPlato(platoId);
}

// ========================================
// 5.5. ELIMINAR PLATO
// ========================================
function eliminarPlato(platoId, nombrePlato) {
    if (confirm(`¿Estás seguro de que quieres eliminar "${nombrePlato}"?`)) {
        menuRef.doc(platoId).delete()
            .then(() => {
                console.log('✅ Plato eliminado');
                alert('Plato eliminado correctamente');
                cargarMenuAdmin();
            })
            .catch((error) => {
                console.error('❌ Error al eliminar:', error);
                alert('Error al eliminar el plato');
            });
    }
}

// ========================================
// 6. ESTADÍSTICAS
// ========================================
function cargarEstadisticas() {
    const fecha = document.getElementById('fecha-stats').value || obtenerFechaActual();
    console.log(`📊 Cargando estadísticas del ${fecha}...`);
    
    estadisticasRef.doc(fecha).get()
        .then((doc) => {
            if (doc.exists) {
                const stats = doc.data();
                
                // Mostrar totales
                document.getElementById('total-ventas').textContent = formatearPrecio(stats.totalVentas);
                document.getElementById('total-pedidos').textContent = stats.totalPedidos;
                
                const ticketPromedio = stats.totalVentas / stats.totalPedidos;
                document.getElementById('ticket-promedio').textContent = formatearPrecio(ticketPromedio);
                
                // Cargar platos más vendidos
                cargarPlatosMasVendidos(fecha);
            } else {
                // No hay datos para esta fecha
                document.getElementById('total-ventas').textContent = '0';
                document.getElementById('total-pedidos').textContent = '0';
                document.getElementById('ticket-promedio').textContent = '0';
                document.getElementById('platos-vendidos-list').innerHTML = '<p>No hay datos para esta fecha</p>';
            }
        })
        .catch((error) => {
            console.error('❌ Error al cargar estadísticas:', error);
        });
}

function cargarPlatosMasVendidos(fecha) {
    estadisticasRef.doc(fecha).collection('platosVendidos')
        .orderBy('cantidad', 'desc')
        .limit(10)
        .get()
        .then((querySnapshot) => {
            const container = document.getElementById('platos-vendidos-list');
            container.innerHTML = '';
            
            if (querySnapshot.empty) {
                container.innerHTML = '<p>No hay datos disponibles</p>';
                return;
            }
            
            let html = '<table class="tabla-platos-vendidos"><thead><tr><th>Plato</th><th>Cantidad</th><th>Total Vendido</th></tr></thead><tbody>';
            
            querySnapshot.forEach((doc) => {
                const plato = doc.data();
                html += `
                    <tr>
                        <td>${plato.nombre}</td>
                        <td>${plato.cantidad}</td>
                        <td>$${formatearPrecio(plato.total)}</td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            container.innerHTML = html;
        });
}

// ========================================
// ========================================
// 7. NAVEGACIÓN ENTRE SECCIONES
// ========================================
function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(seccion => {
        seccion.classList.remove('active');
    });
    
    // Desactivar todos los botones de tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(`seccion-${seccionId}`).classList.add('active');
    event.target.classList.add('active');
    
    // Cargar datos según la sección
    if (seccionId === 'menu') {
        cargarMenuAdmin();
    } else if (seccionId === 'estadisticas') {
        // Establecer fecha actual por defecto
        document.getElementById('fecha-stats').value = obtenerFechaActual();
        cargarEstadisticas();
    }
}

// ========================================
// 8. INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Panel de administración iniciado');
    
    // Iniciar escucha de pedidos en tiempo real
    escucharPedidos('todos');
});

// ========================================
// RESUMEN DEL FLUJO EN TIEMPO REAL:
// ========================================
// 1. El admin abre admin.html
// 2. Se ejecuta escucharPedidos() que crea un listener con onSnapshot()
// 3. El listener muestra todos los pedidos actuales
// 4. Cuando un cliente confirma un pedido en index.html:
//    - El pedido se guarda en Firestore con pedidosRef.add()
// 5. Firestore detecta el nuevo documento
// 6. onSnapshot() se activa AUTOMÁTICAMENTE en el navegador del admin
// 7. La función callback de onSnapshot() se ejecuta
// 8. Se actualiza el HTML del admin SIN RECARGAR LA PÁGINA
// 9. El admin ve el nuevo pedido aparecer instantáneamente
// 
// ✨ Esto es posible gracias a la tecnología de WebSockets
//    que Firestore usa internamente
// ========================================
