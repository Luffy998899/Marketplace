'use client';

import { useCallback, useRef, useState } from 'react';
import { useFinePointer } from '@/lib/useMediaQuery';
import { BlurImage } from './BlurImage';

interface HoverPreviewVideoProps {
  poster: string;
  posterAlt: string;
  blurDataUrl?: string;
  videoUrl?: string;
  sizes?: string;
  imageClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Cross-fades from poster image to muted loop video on desktop hover. */
export function HoverPreviewVideo({
  poster,
  posterAlt,
  blurDataUrl,
  videoUrl,
  sizes,
  imageClassName,
  className = '',
  children,
}: HoverPreviewVideoProps) {
  const finePointer = useFinePointer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const onEnter = useCallback(() => {
    if (!finePointer || !videoUrl || !videoRef.current) return;
    setPlaying(true);
    videoRef.current.currentTime = 0;
    void videoRef.current.play().catch(() => setPlaying(false));
  }, [finePointer, videoUrl]);

  const onLeave = useCallback(() => {
    setPlaying(false);
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  }, []);

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <BlurImage
        src={poster}
        alt={posterAlt}
        blurDataUrl={blurDataUrl}
        sizes={sizes}
        className={`${playing ? 'opacity-0' : 'opacity-100'} ${imageClassName ?? ''}`}
      />

      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {children}
    </div>
  );
}
