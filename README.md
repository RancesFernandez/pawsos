# Huellita — React + PWA + Firebase

App responsive para fichas QR de mascotas, diario con fotos comprimidas, puntos de cuidado y ranking comunitario.

## Requisitos y ejecución
- Node.js 20 o posterior recomendado.
- `npm install`
- `npm run dev`
- Producción local: `npm run build` y `npm run preview`.

## Configurar Firebase paso a paso

1. Entrá a https://console.firebase.google.com/ y pulsá **Crear un proyecto**. Podés desactivar Google Analytics para mantenerlo simple.
2. Dentro del proyecto, tocá el engranaje **Configuración del proyecto** → **General** → **Tus aplicaciones** → icono web `</>`.
3. Registrá la app como `Huellita Web`. Copiá la configuración del SDK (apiKey, authDomain, projectId y appId). Son identificadores de cliente, no una clave privada de servidor.
4. En la raíz del proyecto, duplicá `.env.example` y nombrá la copia `.env.local`. Pegá cada valor después del `=`. No subas `.env.local a GitHub.
5. En Firebase Console → **Authentication** → **Comenzar** → **Sign-in method**, habilitá **Correo electrónico/Contraseña**.
6. En **Firestore Database** → **Crear base de datos**. Para comenzar, elegí modo producción y una ubicación cercana a tus usuarios (la ubicación no se puede cambiar fácilmente luego).
7. Abrí Firestore → pestaña **Reglas** y pegá el contenido de `firestore.rules`. Pulsá **Publicar**. Las reglas separan las mascotas privadas del documento público que ve quien escanea el QR.
8. En Authentication → **Settings / Configuración** → **Authorized domains**, comprobá que esté tu dominio de producción y `localhost` para desarrollo (Firebase puede incluir localhost automáticamente).
9. Reiniciá Vite luego de editar variables: detené con `Ctrl+C` y ejecutá `npm run dev` otra vez.
10. Registrá una cuenta desde la pantalla inicial. Editá la mascota y guardá. Se crea una ficha privada para el dueño y una ficha pública limitada para el QR.

## Plan gratuito: atención a las fotos
- Firebase Authentication con email/contraseña tiene cuota sin costo para el uso habitual.
- Cloud Firestore tiene cuota gratuita (en el plan Spark, por ejemplo, hasta 1 GiB almacenado, 20.000 escrituras/día y 50.000 lecturas/día para la edición Standard; revisá siempre la página de precios actual).
- **Importante:** desde el 3 de febrero de 2026, Cloud Storage for Firebase requiere el plan Blaze vinculado a facturación para crear o mantener acceso a buckets. Aunque hay cuotas de uso sin costo en Blaze, requiere un método de pago y el uso por encima de las cuotas puede generar cargos. Esta versión por eso comprime fotos en el navegador y las guarda dentro de los documentos del diario en Firestore (límite de objetivo aproximado 220 KB por foto), sin usar Storage. No guardes imágenes enormes ni datos médicos innecesarios.
- Configurá alertas de presupuesto si activás Blaze. Las alertas avisan, pero no necesariamente bloquean el gasto.

## Cómo funciona el QR sin login
El QR apunta a `/#/pet/ID`. Esa ruta consulta `publicPets/{ID}` sin pedir autenticación. Los datos privados del dueño y el diario viven en `users/{uid}/...` y solo el dueño autenticado puede acceder. Antes de publicar, revisá qué campos de contacto/salud querés que sean visibles públicamente.

## Diario, fotos y puntos
- Al adjuntar una imagen, se convierte a JPEG, se limita a 1200 px y se comprime antes de guardarse.
- Cada nuevo registro suma 10 puntos de cuidado en la interfaz; el ranking público permite filtrar por especie y tipo de animal.
- Para un lanzamiento real, conviene migrar la asignación de puntos a un backend confiable (por ejemplo, Cloud Functions), porque las reglas de cliente no pueden impedir completamente que alguien manipule sus puntos.
- En esta versión no se integra Firebase Storage. La foto queda en el documento de Firestore y tiene un tamaño máximo objetivo para respetar el límite de documento.

## Estructura destacada
- `src/components/*`: componentes React con CSS separado.
- `src/firebase.js`: inicialización opcional de Firebase.
- `src/services/firebaseData.js`: acceso a Firestore.
- `src/utils/compressImage.js`: compresión de fotos en el navegador.
- `firestore.rules`: reglas de seguridad iniciales.

## Limitaciones / antes de producción
1. El ranking usa un documento público con alias y categorías; no se publica el email.
2. Los puntos son una mecánica MVP y deben validarse en servidor para evitar fraude.
3. La ficha QR pública muestra campos de contacto y de emergencia; el dueño debe revisar esos campos antes de publicar.
4. Probar en un proyecto Firebase de desarrollo y verificar reglas con usuarios distintos antes de cargar datos reales.
5. No se implementó restablecimiento de contraseña ni verificación de email en esta iteración.

## Responsive, imágenes y caché
- La interfaz incluye ajustes específicos para pantallas pequeñas, con formularios y tarjetas que se adaptan sin desbordamientos horizontales.
- Las fotos se redimensionan y comprimen en el navegador (WebP cuando está disponible) antes de guardarse; se limita el archivo original a 25 MB y se intenta mantener la imagen optimizada cerca de 140 KB.
- La recompensa es opcional y, si se completa, aparece tanto en la ficha pública que abre el QR como en la vista de la placa QR.
- El service worker conserva únicamente recursos estáticos necesarios para cargar la aplicación; no hay caché de ejecución para peticiones dinámicas y se limpian cachés antiguas.
- No incluyas `.env.local` en repositorios públicos ni compartas credenciales de configuración. Copiá `.env.example` a `.env.local` y completá los valores de tu proyecto Firebase.
