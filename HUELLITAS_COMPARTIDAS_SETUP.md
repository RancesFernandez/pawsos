# Huellitas compartidas — configuración de Firebase

## Qué hace esta función
- Los registros del Diario siguen siendo privados por defecto.
- Cada recuerdo tiene un botón **Compartir**. Solo al pulsarlo se publica una copia con el título, nota, foto, fecha, tipo y nombre/foto de la mascota.
- La pestaña **Huellitas compartidas** muestra las publicaciones que las personas eligieron compartir.
- Otros usuarios autenticados pueden reaccionar con ❤️ 🥰 🐾 😂 👏. Cada usuario puede tener una reacción por publicación; al elegir otra, reemplaza la anterior, y al volver a tocar la misma, la quita.
- El botón **Dejar de compartir** elimina la publicación comunitaria, no el registro privado del diario.
- El contenido privado del perfil (teléfono, WhatsApp, dirección, salud, etc.) no se copia a las publicaciones.

## Regla de Firestore: copiar y pegar
1. Entrá a https://console.firebase.google.com/ y elegí el mismo proyecto que usa la web.
2. Abrí **Firestore Database → Reglas**.
3. En el editor, reemplazá el contenido completo por el archivo `firestore.rules` que viene en este proyecto.
4. Presioná **Publicar**.

**Importante:** se debe reemplazar el archivo completo, no pegar solo el bloque `sharedPaws`, porque el archivo incluido conserva las reglas existentes de usuarios, fichas QR, avisos de mascotas perdidas y ranking, además de las nuevas reglas comunitarias.

## Prueba recomendada
1. Iniciá sesión con una cuenta.
2. En **Diario de huellitas**, creá un recuerdo de prueba y presioná **Compartir**.
3. Abrí **Huellitas compartidas** y verificá que aparece.
4. Reaccioná con un emoji.
5. Probá con otra cuenta autenticada para confirmar que puede ver la publicación y reaccionar.
6. Volvé a la primera cuenta y presioná **Dejar de compartir**. La publicación debe desaparecer de la comunidad, pero el registro debe continuar en el diario privado.

## Notas de privacidad y operación
- Las publicaciones y reacciones son visibles para usuarios autenticados de esta app, no para visitantes anónimos.
- No compartas información sensible en el título, la nota o la foto. La foto que elegís para el recuerdo se publica junto con él.
- Si Firestore devuelve `permission-denied`, verificá que publicaste el archivo completo de reglas en el proyecto correcto y que el usuario inició sesión.
- Las reglas de Firestore no sustituyen la moderación comunitaria. Para una comunidad abierta más grande, conviene añadir reportes/bloqueos y límites anti-spam.
- Firebase no elimina automáticamente las subcolecciones de reacciones al borrar un documento padre. Las reacciones de una publicación eliminada quedan inaccesibles desde el feed; una limpieza administrativa periódica puede eliminarlas si se desea.
