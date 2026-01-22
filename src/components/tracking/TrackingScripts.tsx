import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TrackingConfig {
  facebook_pixel_id?: string;
  tiktok_pixel_id?: string;
  snapchat_pixel_id?: string;
  google_analytics_id?: string;
  google_ads_id?: string;
  clarity_project_id?: string;
  facebook_pixel_enabled?: boolean;
  tiktok_pixel_enabled?: boolean;
  snapchat_pixel_enabled?: boolean;
  google_analytics_enabled?: boolean;
  google_ads_enabled?: boolean;
  clarity_enabled?: boolean;
}

export function TrackingScripts() {
  const { user } = useAuth();
  const [config, setConfig] = useState<TrackingConfig | null>(null);

  useEffect(() => {
    if (user) {
      loadTrackingConfig();
    }
  }, [user]);

  const loadTrackingConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("tracking_config")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      if (data?.tracking_config) {
        setConfig(data.tracking_config as TrackingConfig);
      }
    } catch (error) {
      console.error("Error loading tracking config:", error);
    }
  };

  useEffect(() => {
    if (!config) return;

    // Clean up existing scripts first
    const existingScripts = document.querySelectorAll('[data-tracking-script]');
    existingScripts.forEach(script => script.remove());

    // Facebook Pixel
    if (config.facebook_pixel_enabled && config.facebook_pixel_id) {
      const fbScript = document.createElement('script');
      fbScript.setAttribute('data-tracking-script', 'facebook');
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${config.facebook_pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

    // TikTok Pixel
    if (config.tiktok_pixel_enabled && config.tiktok_pixel_id) {
      const ttScript = document.createElement('script');
      ttScript.setAttribute('data-tracking-script', 'tiktok');
      ttScript.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${config.tiktok_pixel_id}');
          ttq.page();
        }(window, document, 'ttq');
      `;
      document.head.appendChild(ttScript);
    }

    // Snapchat Pixel
    if (config.snapchat_pixel_enabled && config.snapchat_pixel_id) {
      const snapScript = document.createElement('script');
      snapScript.setAttribute('data-tracking-script', 'snapchat');
      snapScript.innerHTML = `
        (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
        {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
        a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
        r.src=n;var u=t.getElementsByTagName(s)[0];
        u.parentNode.insertBefore(r,u);})(window,document,
        'https://sc-static.net/scevent.min.js');
        snaptr('init', '${config.snapchat_pixel_id}', {});
        snaptr('track', 'PAGE_VIEW');
      `;
      document.head.appendChild(snapScript);
    }

    // Google Analytics 4
    if (config.google_analytics_enabled && config.google_analytics_id) {
      const gaScript = document.createElement('script');
      gaScript.setAttribute('data-tracking-script', 'google-analytics');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${config.google_analytics_id}`;
      document.head.appendChild(gaScript);

      const gaConfigScript = document.createElement('script');
      gaConfigScript.setAttribute('data-tracking-script', 'google-analytics-config');
      gaConfigScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.google_analytics_id}');
        ${config.google_ads_enabled && config.google_ads_id ? `gtag('config', '${config.google_ads_id}');` : ''}
      `;
      document.head.appendChild(gaConfigScript);
    }

    // Microsoft Clarity
    if (config.clarity_enabled && config.clarity_project_id) {
      const clarityScript = document.createElement('script');
      clarityScript.setAttribute('data-tracking-script', 'clarity');
      clarityScript.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${config.clarity_project_id}");
      `;
      document.head.appendChild(clarityScript);
    }

    // Cleanup on unmount
    return () => {
      const scripts = document.querySelectorAll('[data-tracking-script]');
      scripts.forEach(script => script.remove());
    };
  }, [config]);

  return null; // This component doesn't render anything
}
