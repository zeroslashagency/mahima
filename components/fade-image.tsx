"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

interface FadeImageProps extends Omit<ImageProps, "onLoad"> {
  fadeDelay?: number;
}

export function FadeImage({ className, fadeDelay = 0, ...props }: FadeImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeout = setTimeout(() => {
            setIsVisible(true);
          }, fadeDelay);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, [fadeDelay]);

  return (
    <div ref={ref} className="relative h-full w-full">
      <Image
        {...props}
        className={`${className || ""} transition-all duration-700 ease-out motion-reduce:transition-none ${
          isVisible && isLoaded
            ? "opacity-100 scale-100"
            : "opacity-0 scale-[1.02] motion-reduce:opacity-100 motion-reduce:scale-100"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
