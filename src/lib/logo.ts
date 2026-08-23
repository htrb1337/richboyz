const cache = new Map<string, string>();

function removeBackdropAndCrop(image: ImageData) {
  const { data, width, height } = image;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max - min;

      const isBlack = max < 38;
      const isPlate = sat < 18 && max > 150;
      const isEdgeFrame =
        (x < 8 || y < 8 || x > width - 9 || y > height - 9) && sat < 40;

      if (isBlack || isPlate || isEdgeFrame) {
        data[i + 3] = 0;
        continue;
      }

      if (max < 58) {
        data[i + 3] = Math.round(((max - 38) / 20) * data[i + 3]);
      }

      if (data[i + 3] > 16) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  return { minX, minY, maxX, maxY };
}

export function prepareLogo(src: string) {
  if (cache.has(src)) return Promise.resolve(cache.get(src)!);

  return new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const source = document.createElement("canvas");
      source.width = image.naturalWidth;
      source.height = image.naturalHeight;
      const ctx = source.getContext("2d");
      if (!ctx) {
        resolve(src);
        return;
      }

      ctx.drawImage(image, 0, 0);
      const frame = ctx.getImageData(0, 0, source.width, source.height);
      const box = removeBackdropAndCrop(frame);
      ctx.putImageData(frame, 0, 0);

      if (box.maxX <= box.minX || box.maxY <= box.minY) {
        resolve(src);
        return;
      }

      const pad = 8;
      const x = Math.max(0, box.minX - pad);
      const y = Math.max(0, box.minY - pad);
      const w = Math.min(source.width - x, box.maxX - box.minX + pad * 2);
      const h = Math.min(source.height - y, box.maxY - box.minY + pad * 2);

      const cropped = document.createElement("canvas");
      cropped.width = w;
      cropped.height = h;
      const cut = cropped.getContext("2d");
      if (!cut) {
        resolve(src);
        return;
      }
      cut.drawImage(source, x, y, w, h, 0, 0, w, h);
      const url = cropped.toDataURL("image/png");
      cache.set(src, url);
      resolve(url);
    };
    image.onerror = () => resolve(src);
    image.src = src;
  });
}
