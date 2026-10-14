# Huellita QR — MVP React + PWA

Una primera versión visual y funcional para administrar una ficha de mascota, generar un QR, mostrar una ficha pública de emergencia y guardar recuerdos de bienestar.

## Requisitos

- Node.js 20 LTS o posterior recomendado
- npm
- Un navegador moderno

## Ejecutar en local

```bash
npm install
npm run dev
```

Abrí la URL local que muestra Vite.

## Generar versión de producción

```bash
npm run build
npm run preview
```

El resultado se genera en `dist/`.

## Qué incluye

- React + Vite.
- Componentes organizados por función y CSS independiente.
- Diseño responsive para desktop y móvil.
- Configuración PWA con `vite-plugin-pwa`.
- Perfil editable con información de identidad, contacto, salud y rutina.
- Foto de mascota guardada como data URL en el navegador (límite de 3 MB).
- QR descargable en PNG y vista imprimible.
- Ficha pública de emergencia de demostración.
- Diario de huellitas con filtros, búsqueda, alta y eliminación.
- Persistencia local con `localStorage`.
- Datos demo precargados para que se pueda explorar inmediatamente.

## Importante: límites de esta demo

**Los datos se guardan solamente en el navegador y dispositivo actual.** Todavía no hay backend, autenticación, sincronización entre dispositivos, control de acceso ni almacenamiento de fotos remoto. No uses datos reales sensibles para publicar esta demo.

La ficha QR usa una ruta hash (`#/pet/ID`) y actualmente muestra los datos locales del dispositivo. Para que un QR funcione desde cualquier teléfono en producción, cada perfil debe guardarse en un backend y el QR debe apuntar a una URL pública permanente. Un siguiente paso recomendado es conectar Supabase con políticas RLS, autenticación del dueño, tabla de mascotas, tabla de recuerdos y campos públicos explícitamente seleccionados.

El botón de notificaciones es decorativo en este MVP. No se implementan push notifications, recordatorios de salud ni avisos veterinarios.

Los iconos de PWA se declaran en el manifiesto, pero este paquete inicial no incluye archivos PNG para ellos. Antes de publicar, generar `public/pwa-192.png` y `public/pwa-512.png` a partir del favicon o de un icono de marca cuadrado. La PWA se debe probar sobre HTTPS (o localhost).

## Estructura

```text
src/
  components/
    Dashboard/
    Diary/
    PetAvatar/
    PetProfile/
    PublicPet/
    QRCard/
    Sidebar/
    StatCard/
    Topbar/
  data/
  hooks/
  styles/
  utils/
  App.jsx
  main.jsx
```

## Próximos pasos sugeridos

1. Conectar Supabase y definir qué campos son públicos en la ficha QR.
2. Crear autenticación y perfiles por usuario.
3. Hacer que el QR apunte a la URL pública real, no a datos locales.
4. Añadir recordatorios configurables (vacunas, antiparasitarios, controles) con fechas y confirmación de cumplimiento.
5. Añadir exportación/backup de los datos.
6. Incorporar analítica respetuosa con la privacidad para medir uso recurrente y compartir.
7. Generar iconos PWA y probar instalación en Android/iOS.
8. Preparar pruebas de validación y una política de privacidad.

## Buenas prácticas incluidas

- Componentes pequeños con estilos encapsulados por carpeta.
- Lógica reutilizable para fechas y almacenamiento.
- Formularios controlados y límites básicos de entrada.
- Etiquetas y nombres accesibles para botones.
- Responsive layout y estados vacíos.
- `React.StrictMode`.
- PWA con actualización automática del service worker.
