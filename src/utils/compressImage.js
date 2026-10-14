/** Resize and encode photos before saving them, targeting a small data URL suitable for Firestore. */
export function compressImage(file, maxBytes = 140 * 1024) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) return reject(new Error('Elegí un archivo de imagen.'));
    if (file.size > 25 * 1024 * 1024) return reject(new Error('La imagen supera los 25 MB. Elegí una más pequeña.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo abrir la imagen.'));
      img.onload = () => {
        let scale = Math.min(1, 1000 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return reject(new Error('Tu navegador no pudo procesar la imagen.'));
        let data = '';
        for (let resize = 0; resize < 5; resize++) {
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          for (let quality = 0.78; quality >= 0.36; quality -= 0.1) {
            data = canvas.toDataURL('image/webp', quality);
            if (data.startsWith('data:image/webp') && data.length * 0.75 <= maxBytes) return resolve(data);
            if (data.length * 0.75 <= maxBytes) return resolve(data);
          }
          scale *= 0.78;
        }
        if (data && data.length * 0.75 <= maxBytes * 1.25) return resolve(data);
        reject(new Error('No se pudo reducir la imagen lo suficiente. Probá con otra foto.'));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
