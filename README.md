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


## Cambios de privacidad y perfiles por usuario

- Una cuenta nueva empieza con la ficha de mascota vacía; no se crea ni se muestra una mascota de ejemplo automáticamente.
- Las fichas privadas y el diario se guardan en `users/{uid}/pets/main` y `users/{uid}/entries/{entryId}`. Las reglas de `firestore.rules` permiten leer/escribir esas rutas únicamente al usuario cuyo UID coincide con la sesión.
- El ranking sigue siendo comunitario: `leaderboardProfiles/{uid}` es público y contiene solo alias, puntos, especie, tipo y nombre de mascota; no contiene correo ni teléfono. No se mezclan mascotas entre cuentas.
- La foto de la mascota aparece en el bloque inferior izquierdo de la barra lateral. Si aún no se cargó una foto, se muestra un icono de huella.
- La ruta `publicPets/{petId}` sigue siendo pública para que el QR funcione sin iniciar sesión. Es distinta del perfil privado; revisá los datos de contacto/salud que se publican allí.

### ¿Tengo que modificar la base de datos?

No hace falta crear tablas/colecciones nuevas. Para aplicar y verificar los permisos:

1. Firebase Console → **Firestore Database** → **Reglas**.
2. Copiá el archivo `firestore.rules` incluido en este proyecto y pulsá **Publicar**.
3. En **Authentication → Users**, registrá dos cuentas de prueba distintas.
4. Con cada cuenta, guardá una mascota distinta. Confirmá en Firestore que cada una aparece en `users/{UID_DE_ESE_USUARIO}/pets/main`.
5. Comprobá que el ranking contiene un documento por UID en `leaderboardProfiles`; esa colección debe poder leerse por todos, pero cada usuario solo debe escribir su propio documento.
6. Cerrá sesión e ingresá con la otra cuenta: la app carga su ficha desde su propia ruta y no debe mostrar la anterior.

**Perfiles viejos contaminados:** el cambio no borra automáticamente datos que ya estén guardados. Si encontrás una mascota de demostración dentro de `users/{uid}/pets/main`, abrí ese documento y eliminálo solo si confirmaste que es un dato de ejemplo incorrecto. Si también se creó una ficha QR falsa en `publicPets/{petId}`, eliminá únicamente ese documento asociado. No borres la colección `leaderboardProfiles`: es el ranking compartido y sus puntos se conservan.


## Cambios de esta versión: fotos ampliables y avisos de mascotas perdidas

### Fotos en grande
- Las fotos de perfil se pueden abrir desde el resumen, ficha, placa QR, navegación lateral y ficha pública.
- Las fotos de los registros del diario, las vistas previas de fotos y las fotos de avisos de la comunidad también se abren en un visor de pantalla completa.
- El visor se cierra con la X, tocando fuera de la imagen o con la tecla Escape. En móvil respeta el alto visible de pantalla.

### Avisos de mascotas perdidas
- En **Club de Buenas Huellas → Mascotas perdidas** se puede publicar nombre, descripción, zona, contacto, detalles y foto. Los avisos activos son visibles para toda la comunidad. El dueño del aviso puede marcar a la mascota como encontrada.
- En Firebase se crea automáticamente la colección `lostPetAlerts` al publicar el primer aviso. No hay que crear documentos a mano.
- **Sí hay que publicar las nuevas reglas de Firestore:** abrí Firebase Console → Firestore Database → Reglas, pegá el archivo `firestore.rules` de este ZIP y pulsá Publicar. Las reglas permiten leer los avisos públicamente, pero solo quien publicó un aviso puede cerrarlo o borrarlo.
- Los avisos hacen visible el llamado de ayuda dentro de la sección Comunidad; esta versión **no envía notificaciones push al teléfono ni mensajes automáticos**. Para eso se necesita configurar Firebase Cloud Messaging, solicitar permiso de notificaciones a cada usuario y una función de servidor que distribuya el aviso.
- El número de contacto y la foto del aviso son públicos. Publicá solo un número que aceptes compartir y evita poner una dirección exacta de domicilio.

### Probar antes de publicar
1. Ejecutá `npm install` y `npm run dev`.
2. Probá abrir una foto desde el resumen, la ficha, el menú lateral y un registro del diario en escritorio y móvil.
3. Con Firebase configurado, publicá un aviso con una cuenta y verificá que otra cuenta pueda verlo. Confirmá que solo el dueño pueda marcarlo como encontrada.
4. En esta entrega no se pudo completar una compilación de producción en el entorno de preparación por una dependencia nativa opcional de Rollup ausente; por eso, ejecutá `npm run build` localmente antes de desplegar.
