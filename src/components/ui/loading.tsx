import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";

type LoadingProps = {
  className?: string;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'w-20 h-20',
  md: 'w-32 h-32',
  lg: 'w-48 h-48'
};

export function Loading({ className, text = "Loading...", size = 'md' }: LoadingProps) {
  const [showFallback, setShowFallback] = useState(false);
  const playerRef = useRef<Player>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fallback spinner component
  const FallbackSpinner = () => (
    <div className={sizeClasses[size] + " flex items-center justify-center"}>
      <div className="animate-spin rounded-full h-3/4 w-3/4 border-t-2 border-b-2 border-accent"></div>
    </div>
  );

  if (!isClient || showFallback) {
    return (
      <div className={cn("flex items-center justify-center w-full h-full", className)}>
        <FallbackSpinner />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center w-full h-full", className)}>
      <div className={sizeClasses[size]}>
        <Player
          ref={playerRef}
          autoplay
          loop
<<<<<<< HEAD
<<<<<<< HEAD
          src="/src/assets/Lottie.json"
=======
          src="/animations/Loading-animation.json"
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
          src="/src/assets/Lottie.json"
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
          style={{ width: '100%', height: '100%' }}
          onEvent={(event) => {
            if (event === 'error') {
              console.error('Error loading Lottie animation');
              setShowFallback(true);
            }
          }}
        />
      </div>
    </div>
  );
}

export function LoadingPage({ className = '' } = {}) {
  return (
    <div className={cn("h-screen w-full bg-background", className)}>
      <Loading className="h-full w-full" size="lg" />
    </div>
  );
}
