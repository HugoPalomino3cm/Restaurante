# 🚀 Despliegue en Vercel

## Estructura de tu proyecto

Tu aplicación tiene 3 archivos HTML:

1. **index.html** - Página pública del cliente ✅
   - URL: `https://tudominio.vercel.app/`
   
2. **admin.html** - Panel de administración ⚠️
   - URL: `https://tudominio.vercel.app/admin`
   - **IMPORTANTE**: Está accesible públicamente (ver sección de seguridad)
   
3. **poblar-datos.html** - Herramienta de desarrollo 🔧
   - Solo para desarrollo local
   - NO se debe subir a producción

## 📋 Pasos para desplegar en Vercel

### 1. Preparar el proyecto

Ya está todo listo. He creado `vercel.json` para configurar las rutas.

### 2. Instalar Vercel CLI (opcional)

```bash
npm install -g vercel
```

### 3. Desplegar

**Opción A: Desde la terminal**
```bash
cd "c:\Users\xg645\Downloads\paginaRestauranteSeñor\Restaurante"
vercel
```

**Opción B: Desde GitHub (recomendado)**
1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Conecta tu repositorio de GitHub
4. Vercel detectará automáticamente la configuración
5. Haz clic en "Deploy"

### 4. Acceder a las páginas

Una vez desplegado:
- Cliente: `https://tu-proyecto.vercel.app/`
- Admin: `https://tu-proyecto.vercel.app/admin`

## ⚠️ SEGURIDAD IMPORTANTE

### Problema actual
**admin.html está accesible para cualquier persona** que conozca la URL `/admin`. Esto es un riesgo de seguridad.

### Soluciones:

#### Opción 1: Autenticación con Firebase (Recomendado)
Implementar Firebase Authentication para que solo usuarios autorizados accedan al panel de admin.

#### Opción 2: Vercel Password Protection (Más fácil)
En Vercel, puedes proteger con contraseña:
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Password Protection
3. Activa la protección para el path `/admin`
4. **Nota**: Esta opción requiere un plan de pago en Vercel

#### Opción 3: URL secreta (Temporal)
Renombrar admin.html a algo menos obvio:
```
admin.html → admin-panel-secreto-xyz123.html
```
Luego solo tú conoces la URL. No es muy seguro, pero funciona temporalmente.

## 📦 Sobre poblar-datos.html

### Para desarrollo local:
- Mantén el archivo en tu computadora
- Úsalo para poblar datos de prueba

### Para producción:
Tienes 2 opciones:

**Opción A: Mantenerlo oculto**
- Déjalo en el proyecto
- Accede vía: `https://tu-proyecto.vercel.app/poblar-datos.html`
- Úsalo cuando necesites poblar datos en producción
- **Riesgo**: Cualquiera que conozca la URL puede usarlo

**Opción B: Eliminarlo (Recomendado)**
- Elimínalo del proyecto antes de hacer deploy
- Solo existe en tu versión local
- Más seguro para producción

## 🔧 Configuración de Firebase en Producción

Tu `firebase-config.js` ya tiene las credenciales correctas. Firebase funciona tanto en desarrollo como en producción con la misma configuración.

## 📝 Comandos Git para actualizar

Después de cualquier cambio:

```bash
git add .
git commit -m "Preparar para deploy en Vercel"
git push origin main
```

Si conectaste Vercel con GitHub, se desplegará automáticamente.

## ✅ Checklist antes de desplegar

- [ ] Verificar que firebase-config.js tiene las credenciales correctas
- [ ] Decidir qué hacer con admin.html (protegerlo)
- [ ] Decidir qué hacer con poblar-datos.html (mantener u ocultar)
- [ ] Probar localmente que todo funciona
- [ ] Hacer commit de los cambios
- [ ] Desplegar en Vercel

## 🌐 Dominios personalizados

Después del deploy, puedes:
1. Usar el dominio gratuito de Vercel: `tu-proyecto.vercel.app`
2. Conectar tu propio dominio en Settings → Domains

## 🆘 Solución de problemas

### Error de CORS con Firebase
Si tienes problemas de CORS, ve a Firebase Console → Authentication → Settings → Authorized domains y agrega tu dominio de Vercel.

### Las imágenes no cargan
Asegúrate de que Firebase Storage tenga las reglas correctas (ver CONFIGURAR-STORAGE.md).

### Admin panel no carga
Verifica la consola del navegador (F12) para ver errores de Firebase.
