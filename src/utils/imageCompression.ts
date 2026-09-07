// ÙØ´Ø±Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ø³Ù…Øª Ù…Ø±ÙˆØ±Ú¯Ø± Ø¨Ø±Ø§ÛŒ Ø¹Ú©Ø³â€ŒÙ‡Ø§ Ù‚Ø¨Ù„ Ø§Ø² Ø¢Ù¾Ù„ÙˆØ¯ØŒ ØªØ§ Ø­Ø¬Ù… Ú©Ù…ØªØ± Ø¨Ø´Ù‡ Ùˆ Ø±ÙˆÛŒ Ø§ÛŒÙ†ØªØ±Ù†Øª Ú©Ù†Ø¯ Ø³Ø±ÛŒØ¹â€ŒØªØ± Ø¢Ù¾Ù„ÙˆØ¯ Ø¨Ø´Ù‡
// ÙˆÛŒØ¯ÛŒÙˆÙ‡Ø§ Ø¯Ø³Øªâ€ŒÙ†Ø®ÙˆØ±Ø¯Ù‡ Ø¨Ø§Ù‚ÛŒ Ù…ÛŒâ€ŒÙ…Ø§Ù†Ù†Ø¯ (ÙØ´Ø±Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ ÙˆÛŒØ¯ÛŒÙˆ Ø³Ù…Øª Ù…Ø±ÙˆØ±Ú¯Ø± Ø¹Ù…Ù„ÛŒ Ù†ÛŒØ³Øª)

const MAX_DIMENSION = 1920; // Ø¨Ø²Ø±Ú¯ØªØ±ÛŒÙ† Ø¶Ù„Ø¹ Ø¹Ú©Ø³ Ø¨Ø¹Ø¯ Ø§Ø² ÙØ´Ø±Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ (Ù¾ÛŒÚ©Ø³Ù„)
const JPEG_QUALITY = 0.8;   // Ú©ÛŒÙÛŒØª Ø®Ø±ÙˆØ¬ÛŒ (Û° ØªØ§ Û±)

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

export async function compressImageIfNeeded(file: File): Promise<File> {
  // ÙÙ‚Ø· Ø¹Ú©Ø³â€ŒÙ‡Ø§ ÙØ´Ø±Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯Ø› ÙˆÛŒØ¯ÛŒÙˆ Ùˆ Ø¨Ù‚ÛŒÙ‡ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ Ù‡Ù…Ø§Ù†â€ŒØ·ÙˆØ± Ú©Ù‡ Ù‡Ø³ØªÙ†Ø¯ Ø¨Ø±Ù…ÛŒâ€ŒÚ¯Ø±Ø¯Ù†Ø¯
  if (!file.type.startsWith('image/')) return file;
  // ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ Ø®ÛŒÙ„ÛŒ Ú©ÙˆÚ†Ú© (Ú©Ù…ØªØ± Ø§Ø² Û³Û°Û° Ú©ÛŒÙ„ÙˆØ¨Ø§ÛŒØª) Ù†ÛŒØ§Ø²ÛŒ Ø¨Ù‡ ÙØ´Ø±Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ù†Ø¯Ø§Ø±Ù†Ø¯
  if (file.size < 300 * 1024) return file;

  try {
    const img = await loadImage(file);
    let { width, height } = img;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', JPEG_QUALITY)
    );

    if (!blob) return file;
    // Ø§Ú¯Ø± ÙØ´Ø±Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ø¨Ø§Ø¹Ø« Ø¨Ø²Ø±Ú¯â€ŒØªØ± Ø´Ø¯Ù† ÙØ§ÛŒÙ„ Ø´Ø¯ (Ù†Ø§Ø¯Ø±)ØŒ ÙØ§ÛŒÙ„ Ø§ØµÙ„ÛŒ Ø±Ø§ Ù†Ú¯Ù‡ Ø¯Ø§Ø±
    if (blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch {
    // Ø§Ú¯Ø± ÙØ´Ø±Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ø¨Ù‡ Ù‡Ø± Ø¯Ù„ÛŒÙ„ÛŒ Ø´Ú©Ø³Øª Ø®ÙˆØ±Ø¯ØŒ ÙØ§ÛŒÙ„ Ø§ØµÙ„ÛŒ Ø¢Ù¾Ù„ÙˆØ¯ Ø´ÙˆØ¯
    return file;
  }
}
