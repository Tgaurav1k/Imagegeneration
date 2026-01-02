'use client';

import { useEffect, useState, CSSProperties } from 'react';
import Image from 'next/image';
import { decode } from 'blurhash';

interface BlurHashImageProps {
  src: string;
  blurhash: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  onLoad?: () => void;
  priority?: boolean;
  unoptimized?: boolean;
  sizes?: string;
}

/**
 * BlurHashImage Component
 * 
 * Shows BlurHash placeholder instantly (0ms), then fades to actual image when loaded.
 * Provides instant visual feedback while images are loading.
 */
export function BlurHashImage({
  src,
  blurhash,
  alt,
  width,
  height,
  className = '',
  fill,
  onLoad,
  priority = false,
  unoptimized = false,
  sizes,
}: BlurHashImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null);

  // Decode BlurHash to data URL
  useEffect(() => {
    if (!blurhash) return;

    try {
      const size = 32; // Small size for BlurHash (32x32 is optimal)
      const pixels = decode(blurhash, size, size);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.createImageData(size, size);
        imageData.data.set(pixels);
        ctx.putImageData(imageData, 0, 0);
        setBlurDataUrl(canvas.toDataURL());
      }
    } catch (error) {
      console.error('Error decoding BlurHash:', error);
    }
  }, [blurhash]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  // If no BlurHash, just show regular image
  if (!blurhash || !blurDataUrl) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          onLoad={handleImageLoad}
          priority={priority}
          unoptimized={unoptimized}
          sizes={sizes}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onLoad={handleImageLoad}
        priority={priority}
        unoptimized={unoptimized}
        sizes={sizes}
      />
    );
  }

  // Show BlurHash placeholder with fade transition to actual image
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* BlurHash Placeholder - Always visible until image loads */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: imageLoaded ? 0 : 1,
          backgroundImage: `url(${blurDataUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px)',
          transform: 'scale(1.1)', // Slight scale to hide blur edges
        }}
      />

      {/* Actual Image - Fades in when loaded */}
      <div
        className="relative transition-opacity duration-300"
        style={{
          opacity: imageLoaded ? 1 : 0,
        }}
      >
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            onLoad={handleImageLoad}
            priority={priority}
            unoptimized={unoptimized}
            sizes={sizes}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleImageLoad}
            priority={priority}
            unoptimized={unoptimized}
            sizes={sizes}
          />
        )}
      </div>
    </div>
  );
}
