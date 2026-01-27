import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
}

const defaultMeta = {
  title: "SellGenius | نمو براندات الأزياء Shopify في MENA",
  description: "محتوى منتجات وإعلانات Meta وسكريبتات فيديو قصيرة—مصمم لبراندات الأزياء Shopify/DTC في مصر والسعودية والإمارات لزيادة التحويلات والمبيعات.",
  keywords: "Shopify, fashion, MENA, Meta Ads, Facebook ads, Instagram ads, وصف منتجات, إعلانات فيسبوك, إعلانات انستجرام, براند أزياء, التجارة الإلكترونية",
  image: "https://sellgenius.app/og-image.png",
  type: "website"
};

export default function SEOHead({ 
  title, 
  description, 
  keywords,
  image,
  type,
  noindex = false 
}: SEOHeadProps) {
  const location = useLocation();
  const currentUrl = `https://sellgenius.app${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title || defaultMeta.title;

    // Helper function to update or create meta tag
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    // Update meta tags
    updateMetaTag('description', description || defaultMeta.description);
    updateMetaTag('keywords', keywords || defaultMeta.keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title || defaultMeta.title, true);
    updateMetaTag('og:description', description || defaultMeta.description, true);
    updateMetaTag('og:image', image || defaultMeta.image, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', type || defaultMeta.type, true);

    // Twitter tags
    updateMetaTag('twitter:title', title || defaultMeta.title);
    updateMetaTag('twitter:description', description || defaultMeta.description);
    updateMetaTag('twitter:image', image || defaultMeta.image);

    // Robots
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', currentUrl);
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', currentUrl);
      document.head.appendChild(canonical);
    }

  }, [title, description, keywords, image, type, noindex, currentUrl]);

  return null;
}
