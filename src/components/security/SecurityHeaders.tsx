import { useEffect } from "react";

// Security headers component that adds meta tags for security
export function SecurityHeaders() {
  useEffect(() => {
    // Prevent clickjacking - only in production, not in iframe preview
    try {
      if (window.top !== window.self && !window.location.hostname.includes('lovableproject.com')) {
        window.top?.location.replace(window.location.href);
      }
    } catch {
      // Ignore cross-origin errors in development/preview
    }

    // Add CSP meta tag
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingCSP) {
      const cspMeta = document.createElement("meta");
      cspMeta.httpEquiv = "Content-Security-Policy";
      cspMeta.content = "frame-ancestors 'self'";
      document.head.appendChild(cspMeta);
    }

    // Disable right-click context menu in production for sensitive areas
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-protected="true"]')) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return null;
}

// Hook to detect suspicious activity
export function useSecurityMonitor() {
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        console.log("Developer tools may be open");
      }
    };

    // Check periodically
    const interval = setInterval(detectDevTools, 1000);

    // Log security events
    window.addEventListener("beforeunload", () => {
      // Cleanup sensitive data from memory
      sessionStorage.removeItem("tempData");
    });

    return () => clearInterval(interval);
  }, []);
}
