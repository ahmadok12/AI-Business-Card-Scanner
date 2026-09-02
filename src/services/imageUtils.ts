/**
 * Crops a normalized bounding box [ymin, xmin, ymax, xmax] (0 to 1000) from a base64 image
 */
export function cropImageRegion(
  base64Image: string,
  box: [number, number, number, number] // [ymin, xmin, ymax, xmax] (0-1000)
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const [ymin, xmin, ymax, xmax] = box;
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // Convert normalized 0-1000 coordinates to actual pixel dimensions
        let sx = Math.max(0, (xmin / 1000) * width);
        let sy = Math.max(0, (ymin / 1000) * height);
        let sw = Math.min(width - sx, ((xmax - xmin) / 1000) * width);
        let sh = Math.min(height - sy, ((ymax - ymin) / 1000) * height);

        // Add 5% padding around QR code for clear margin
        const padX = sw * 0.05;
        const padY = sh * 0.05;
        sx = Math.max(0, sx - padX);
        sy = Math.max(0, sy - padY);
        sw = Math.min(width - sx, sw + padX * 2);
        sh = Math.min(height - sy, sh + padY * 2);

        if (sw <= 0 || sh <= 0) {
          resolve(base64Image);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(sw);
        canvas.height = Math.round(sh);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Image);
          return;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        const croppedUrl = canvas.toDataURL('image/png');
        resolve(croppedUrl);
      } catch (err) {
        console.warn('Failed to crop QR code:', err);
        resolve(base64Image);
      }
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for cropping'));
    };
    img.src = base64Image;
  });
}

export function downloadImageToDevice(dataUrl: string, filename: string): void {
  try {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Failed to download image:', err);
  }
}
