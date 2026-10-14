export function compressImage(file, maxBytes = 220 * 1024) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) return reject(new Error('Elegí un archivo de imagen.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo abrir la imagen.'));
      img.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let quality = 0.78; let data = canvas.toDataURL('image/jpeg', quality);
        while (data.length * 0.75 > maxBytes && quality > 0.32) { quality -= 0.08; data = canvas.toDataURL('image/jpeg', quality); }
        if (data.length * 0.75 > maxBytes) { canvas.width = Math.round(canvas.width * .75); canvas.height = Math.round(canvas.height * .75); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); data = canvas.toDataURL('image/jpeg', .42); }
        resolve(data);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
