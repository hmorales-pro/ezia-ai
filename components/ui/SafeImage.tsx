"use client";

import Image from "next/image";
import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}

export default function SafeImage({ src, alt, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  // Si on est en production, utiliser la route API
  const imageSrc = process.env.NODE_ENV === 'production' || isError
    ? `/api/images${src}`
    : src;

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      onError={() => {
        if (!isError) {
          setIsError(true);
          setImgSrc(`/api/images${src}`);
        }
      }}
      unoptimized
    />
  );
}