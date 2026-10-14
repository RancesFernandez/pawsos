/** Resize and encode photos before saving them, targeting a small data URL suitable for Firestore. */
export function compressImage(file, maxBytes = 140 * 1024) {
  return new Promise((resolve, reject) => {
    if (!file || !(file.type || '').startsWith('image/')) {
      reject(new Error('Elegí un archivo de imagen.'));
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      reject(new Error('La imagen supera los 25 MB. Elegí una más pequeña.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo abrir la imagen. Probá guardarla como JPG y volver a seleccionarla.'));
      img.onload = () => {
        try {
          // Start smaller and progressively reduce dimensions/quality. This handles
          // high-detail iPhone photos that did not fit within the previous 5 passes.
          let scale = Math.min(1, 1000 / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) {
            reject(new Error('Tu navegador no pudo procesar la imagen.'));
            return;
          }
          let best = '';
          const formats = ['image/jpeg', 'image/webp'];
          for (let resize = 0; resize < 12; resize++) {
            canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
            canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            for (const format of formats) {
              for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42, 0.32, 0.24]) {
                const data = canvas.toDataURL(format, quality);
                // Some browsers silently fall back to JPEG when WebP isn't supported.
                if (!data.startsWith('data:image/')) continue;
                best = data;
                const estimatedBytes = Math.ceil((data.length - data.indexOf(',') - 1) * 0.75);
                if (estimatedBytes <= maxBytes) {
                  resolve(data);
                  return;
                }
              }
            }
            scale *= 0.78;
          }
          // Prefer a usable compressed image over failing after arbitrary retry limits.
          if (best) {
            const estimatedBytes = Math.ceil((best.length - best.indexOf(',') - 1) * 0.75);
            if (estimatedBytes <= maxBytes * 1.25) {
              resolve(best);
              return;
            }
          }
          reject(new Error('No se pudo reducir la imagen. Probá recortarla o elegir una foto más pequeña.'));
        } catch {
          reject(new Error('No se pudo procesar esta foto en el navegador. Probá con otra imagen JPG o HEIC.'));
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
