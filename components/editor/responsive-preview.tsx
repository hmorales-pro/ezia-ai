"use client";

import { useState, useRef, useEffect } from "react";
import { Smartphone, Tablet, Monitor, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ResponsivePreviewProps {
  html: string;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  className?: string;
}

type DeviceMode = "mobile" | "tablet" | "desktop" | "fullscreen";

const DEVICE_SIZES = {
  mobile: { width: 375, height: 667, label: "Mobile" },
  tablet: { width: 768, height: 1024, label: "Tablette" },
  desktop: { width: 1200, height: 800, label: "Desktop" },
  fullscreen: { width: "100%", height: "100%", label: "Plein écran" }
};

export function ResponsivePreview({ 
  html, 
  iframeRef: externalIframeRef,
  className 
}: ResponsivePreviewProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const internalIframeRef = useRef<HTMLIFrameElement>(null);
  const iframeRef = externalIframeRef || internalIframeRef;

  // Calculer l'échelle pour adapter l'aperçu à la taille du conteneur
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || deviceMode === "fullscreen") {
        setScale(1);
        return;
      }

      const container = containerRef.current;
      const containerWidth = container.clientWidth - 48; // Padding
      const containerHeight = container.clientHeight - 120; // Header + padding

      const deviceSize = DEVICE_SIZES[deviceMode];
      if (typeof deviceSize.width === "number" && typeof deviceSize.height === "number") {
        const scaleX = containerWidth / deviceSize.width;
        const scaleY = containerHeight / deviceSize.height;
        const newScale = Math.min(scaleX, scaleY, 1);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [deviceMode]);

  const deviceSize = DEVICE_SIZES[deviceMode];
  const isFullscreen = deviceMode === "fullscreen";

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col h-full bg-gray-100",
        className
      )}
    >
      {/* Contrôles de l'appareil */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ToggleGroup 
            type="single" 
            value={deviceMode} 
            onValueChange={(value) => value && setDeviceMode(value as DeviceMode)}
          >
            <ToggleGroupItem value="mobile" aria-label="Vue mobile">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </ToggleGroupItem>
            <ToggleGroupItem value="tablet" aria-label="Vue tablette">
              <Tablet className="h-4 w-4 mr-2" />
              Tablette
            </ToggleGroupItem>
            <ToggleGroupItem value="desktop" aria-label="Vue desktop">
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </ToggleGroupItem>
            <ToggleGroupItem value="fullscreen" aria-label="Plein écran">
              <Maximize2 className="h-4 w-4 mr-2" />
              Plein écran
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {!isFullscreen && (
          <div className="text-sm text-gray-600">
            {typeof deviceSize.width === "number" && `${deviceSize.width} × ${deviceSize.height}px`}
            {scale < 1 && ` (${Math.round(scale * 100)}%)`}
          </div>
        )}
      </div>

      {/* Zone d'aperçu */}
      <div className="flex-1 overflow-hidden p-6 flex items-center justify-center">
        <div
          className={cn(
            "relative transition-all duration-300",
            !isFullscreen && "shadow-2xl"
          )}
          style={{
            width: isFullscreen ? "100%" : `${typeof deviceSize.width === "number" ? deviceSize.width : 0}px`,
            height: isFullscreen ? "100%" : `${typeof deviceSize.height === "number" ? deviceSize.height : 0}px`,
            transform: isFullscreen ? "none" : `scale(${scale})`,
            transformOrigin: "center center"
          }}
        >
          {/* Cadre de l'appareil */}
          {!isFullscreen && (
            <div
              className={cn(
                "absolute inset-0 pointer-events-none z-10",
                deviceMode === "mobile" && "ring-8 ring-gray-800 rounded-[2.5rem]",
                deviceMode === "tablet" && "ring-8 ring-gray-800 rounded-[1.5rem]",
                deviceMode === "desktop" && "ring-8 ring-gray-800 rounded-lg"
              )}
            >
              {/* Encoche pour mobile */}
              {deviceMode === "mobile" && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl" />
              )}
            </div>
          )}

          {/* Iframe */}
          <iframe
            ref={iframeRef}
            title="Website preview"
            srcDoc={html}
            className={cn(
              "w-full h-full bg-white",
              !isFullscreen && [
                deviceMode === "mobile" && "rounded-[2rem]",
                deviceMode === "tablet" && "rounded-[1rem]",
                deviceMode === "desktop" && "rounded"
              ]
            )}
            style={{
              border: "none",
              overflow: "auto"
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
            onLoad={(e) => {
              // Empêcher la navigation dans l'iframe pour éviter l'effet "inception"
              const iframe = e.currentTarget;
              try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                  // Intercepter tous les clics sur les liens
                  iframeDoc.addEventListener('click', (event) => {
                    const target = event.target as HTMLElement;
                    const link = target.closest('a');
                    if (link && link.getAttribute('href')) {
                      const href = link.getAttribute('href');
                      // Empêcher la navigation pour les liens internes et #
                      if (href?.startsWith('#') || href?.startsWith('/') || !href?.startsWith('http')) {
                        event.preventDefault();
                        // Si c'est une ancre, faire défiler vers l'élément
                        if (href?.startsWith('#')) {
                          const targetId = href.slice(1);
                          const targetElement = iframeDoc.getElementById(targetId);
                          if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                          }
                        }
                      }
                    }
                  });

                  // Empêcher la soumission de formulaires
                  iframeDoc.addEventListener('submit', (event) => {
                    event.preventDefault();
                  });
                }
              } catch (err) {
                // Ignore les erreurs de same-origin policy
                console.warn('Cannot access iframe content:', err);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}