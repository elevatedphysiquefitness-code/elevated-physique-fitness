'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, Loader2, X, Check } from 'lucide-react';
import Image from 'next/image';

interface AdminImageUploadProps {
  imageKey: string; // Unique key for this image (e.g., 'about-hero', 'services-inperson')
  className?: string;
  aspectRatio?: string; // e.g., 'aspect-square', 'aspect-video', 'aspect-[4/3]'
  placeholder?: React.ReactNode;
  alt?: string;
}

export default function AdminImageUpload({
  imageKey,
  className = '',
  aspectRatio = 'aspect-square',
  placeholder,
  alt = 'Image',
}: AdminImageUploadProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAdminAndLoadImage();
  }, [imageKey]);

  const checkAdminAndLoadImage = async () => {
    const supabase = createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setIsAdmin(profile?.role === 'admin');
    }

    // Load existing image
    const { data: imageData } = await supabase
      .from('site_images')
      .select('image_url')
      .eq('image_key', imageKey)
      .single();

    if (imageData?.image_url) {
      setImageUrl(imageData.image_url);
    }

    setLoading(false);
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Max dimensions
          const maxWidth = 1920;
          const maxHeight = 1920;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Compress to target size (max 1MB)
          let quality = 0.9;
          const targetSize = 1024 * 1024; // 1MB

          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Could not compress image'));
                  return;
                }

                if (blob.size > targetSize && quality > 0.1) {
                  quality -= 0.1;
                  tryCompress();
                } else {
                  resolve(blob);
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress();
        };
        img.onerror = () => reject(new Error('Could not load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or WebP image');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Compress image
      const compressedBlob = await compressImage(file);

      // Generate unique filename
      const ext = 'jpg';
      const fileName = `site-images/${imageKey}-${Date.now()}.${ext}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Save to database (upsert)
      const { error: dbError } = await supabase
        .from('site_images')
        .upsert({
          image_key: imageKey,
          image_url: publicUrl,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'image_key',
        });

      if (dbError) {
        throw dbError;
      }

      setImageUrl(publicUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (isAdmin && !uploading) {
      fileInputRef.current?.click();
    }
  };

  if (loading) {
    return (
      <div className={`${aspectRatio} ${className} bg-brown-100 animate-pulse`} />
    );
  }

  return (
    <div className={`relative ${aspectRatio} ${className} overflow-hidden group`}>
      {/* Image or Placeholder */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brown-200 to-brown-300 flex items-center justify-center">
          {placeholder || (
            <div className="text-center text-brown-500">
              <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">No image uploaded</p>
            </div>
          )}
        </div>
      )}

      {/* Admin Edit Overlay */}
      {isAdmin && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={handleClick}
            disabled={uploading}
            className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              ) : success ? (
                <Check className="h-8 w-8 mx-auto text-green-400" />
              ) : (
                <>
                  <Camera className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">
                    {imageUrl ? 'Change Image' : 'Upload Image'}
                  </p>
                </>
              )}
            </div>
          </button>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-xs p-2 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs p-2 text-center">
          Image uploaded successfully!
        </div>
      )}
    </div>
  );
}
