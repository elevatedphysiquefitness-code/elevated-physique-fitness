'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, Loader2, User } from 'lucide-react';
import Image from 'next/image';

interface ProfileAvatarProps {
  userId?: string;
  avatarUrl?: string | null;
  userName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onAvatarChange?: (newUrl: string) => void;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
};

export default function ProfileAvatar({
  userId,
  avatarUrl,
  userName,
  size = 'md',
  editable = false,
  onAvatarChange,
}: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or WebP image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Compress image
      const compressedBlob = await compressImage(file);

      // Generate unique filename
      const ext = 'jpg';
      const fileName = `avatars/${userId}-${Date.now()}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
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

      // Update profile in database
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (dbError) {
        throw dbError;
      }

      setCurrentUrl(publicUrl);
      onAvatarChange?.(publicUrl);
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

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Max dimensions for avatar
          const maxSize = 400;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not compress image'));
                return;
              }
              resolve(blob);
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = () => reject(new Error('Could not load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleClick = () => {
    if (editable && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const getInitial = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} relative rounded-full overflow-hidden ${
          editable ? 'cursor-pointer group' : ''
        } ${currentUrl ? '' : 'bg-[#3D2314]'} flex items-center justify-center`}
        onClick={handleClick}
      >
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={userName || 'Profile'}
            fill
            className="object-cover"
            sizes={size === 'xl' ? '96px' : size === 'lg' ? '64px' : size === 'md' ? '40px' : '32px'}
          />
        ) : (
          <span className="text-white font-bold">{getInitial()}</span>
        )}

        {/* Edit overlay for editable avatars */}
        {editable && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center rounded-full">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {uploading ? (
                  <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
                ) : (
                  <Camera className={`${iconSizes[size]} text-white`} />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Error tooltip */}
      {error && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  );
}
