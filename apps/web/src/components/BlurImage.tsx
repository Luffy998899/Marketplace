'use client';

import Image from 'next/image';
import { useState } from 'react';

interface BlurImageProps {
  src: string;
  alt: string;
  blurDataUrl?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/** next/image wrapper with blur-up placeholder + fade-in on load. */
export function BlurImage({ src, alt, blurDataUrl, sizes, priority, className }: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? '(max-width: 768px) 50vw, 25vw'}
      priority={priority}
      placeholder={blurDataUrl ? 'blur' : 'empty'}
      blurDataURL={blurDataUrl}
      onLoad={() => setLoaded(true)}
      className={`object-cover transition-all duration-700 ${
        loaded ? 'scale-100 blur-0' : 'scale-105 blur-md'
      } ${className ?? ''}`}
    />
  );
}
