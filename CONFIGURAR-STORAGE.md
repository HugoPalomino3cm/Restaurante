# 📦 Configuración de Firebase Storage

Para que la subida de imágenes funcione correctamente, necesitas configurar Firebase Storage en tu proyecto.

## Paso 1: Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **restaurante-80847**

## Paso 2: Ir a Storage

1. En el menú lateral izquierdo, haz clic en **"Storage"** (ícono de carpeta)
2. Si es la primera vez, haz clic en **"Comenzar"** o **"Get Started"**
3. Aparecerá un diálogo de configuración

## Paso 3: Configurar Reglas de Seguridad

1. Acepta la configuración predeterminada en el diálogo inicial
2. Una vez creado Storage, haz clic en la pestaña **"Rules"** (Reglas)
3. **Reemplaza** las reglas existentes con las siguientes:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu/{imageId} {
      // Permitir lectura a todos
      allow read: if true;
      // Permitir escritura a todos (solo para desarrollo)
      allow write: if true;
    }
  }
}
```

4. Haz clic en **"Publicar"** o **"Publish"**
5. Espera 10-15 segundos para que las reglas se propaguen

## Paso 4: Verificar Configuración

1. Ve a la pestaña **"Files"** (Archivos) en Storage
2. Deberías ver la estructura de carpetas lista para recibir imágenes
3. Las imágenes se guardarán automáticamente en la carpeta `menu/`

## ⚠️ IMPORTANTE - Seguridad para Producción

Las reglas actuales permiten que **CUALQUIER PERSONA** pueda subir archivos. Esto está bien para desarrollo/pruebas, pero **NO es seguro para producción**.

Para producción, deberías:

1. Implementar autenticación de Firebase
2. Cambiar las reglas para que solo administradores autenticados puedan subir:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu/{imageId} {
      allow read: if true;
      // Solo usuarios autenticados pueden escribir
      allow write: if request.auth != null;
    }
  }
}
```

## 🎯 Cómo Usar la Nueva Funcionalidad

### Desde el Panel de Administración:

1. Ve a **admin.html**
2. En la sección "Gestión de Menú", haz clic en **"+ Agregar Nuevo Plato"**
3. En el campo de imagen verás dos opciones:
   - **URL de imagen**: Pega una URL externa (como antes)
   - **Subir archivo**: Selecciona un archivo de tu computadora
4. Si eliges "Subir archivo":
   - Haz clic en el botón de archivo
   - Selecciona una imagen (JPG, PNG, GIF, etc.)
   - Verás una barra de progreso mientras se sube
   - La imagen se guardará automáticamente en Firebase Storage
5. Haz clic en **"Guardar"**

## 📝 Notas Técnicas

- Las imágenes se guardan con un nombre único: `timestamp_nombreoriginal.jpg`
- La carpeta en Storage es: `menu/`
- El sistema obtiene automáticamente la URL pública de la imagen
- La URL se guarda en Firestore junto con los demás datos del plato
- Formatos soportados: JPG, PNG, GIF, WebP, y otros formatos de imagen estándar

## 🔍 Solución de Problemas

### Error: "Firebase Storage: Object 'menu/...' does not exist"
- Verifica que las reglas de Storage estén publicadas
- Espera 10-15 segundos después de publicar las reglas

### Error: "Unauthorized"
- Las reglas de Storage no permiten escritura
- Revisa el Paso 3 y asegúrate de publicar las reglas correctas

### La imagen no se sube
- Verifica tu conexión a internet
- Revisa la consola del navegador (F12) para ver errores específicos
- Asegúrate de que el archivo sea una imagen válida
- Verifica que el tamaño del archivo no sea excesivo (recomendado < 5MB)

### La barra de progreso no aparece
- Refresca la página con Ctrl+Shift+R
- Verifica que hayas agregado el script de Firebase Storage en admin.html

## ✅ Verificación Final

Para verificar que todo funciona:

1. Ve a **admin.html**
2. Agrega un plato de prueba subiendo una imagen desde tu computadora
3. Guarda el plato
4. Ve a Firebase Console → Storage → Files
5. Deberías ver la imagen en la carpeta `menu/`
6. Ve a **index.html** (página del cliente)
7. La imagen debería aparecer correctamente en el menú

---

**¡Listo!** Ahora tu panel de administración puede manejar tanto URLs externas como subida directa de archivos.
