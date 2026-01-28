import { createClient } from './client';

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = createClient();

  // Compress image if it's too large (> 2MB)
  let fileToUpload: File | Blob = file;
  if (file.size > 2 * 1024 * 1024 && file.type.startsWith('image/')) {
    fileToUpload = await compressImage(file);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileToUpload, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    return { error: error.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl, path: data.path };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
}

/**
 * Generate a unique file path for uploads
 */
export function generateFilePath(userId: string, type: string, fileName: string): string {
  const ext = fileName.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  return `${userId}/${type}/${timestamp}.${ext}`;
}

/**
 * Compress an image file using canvas
 */
async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(blob || file),
          'image/jpeg',
          quality
        );
      };
    };
  });
}
