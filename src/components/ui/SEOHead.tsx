import { useEffect } from "react";
import { SITE_TITLE } from "../../content/meta";

interface SEOHeadProps {
  title?: string;
  description?: string;
  preloadImage?: string;
  /**
   * Use `title` verbatim instead of appending the site lockup.
   *
   * Section pages want "Ventures — Said Azaizah — Life in Motion". The
   * dashboard does not: it is the front door, so its tab should read exactly
   * what index.html ships and what a search result shows, without a third
   * clause stacked on the end.
   */
  exactTitle?: boolean;
}

export default function SEOHead({
  title,
  description = "A journey shaped by identity, driven by bridge-building, and expressed through making.",
  preloadImage,
  exactTitle = false
}: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = title
      ? exactTitle
        ? title
        : `${title} — ${SITE_TITLE}`
      : SITE_TITLE;

    document.title = fullTitle;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);
    
    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", fullTitle);
    
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute("content", description);

    // Preload first image for LCP optimization
    if (preloadImage) {
      let preloadLink = document.querySelector('link[rel="preload"][as="image"][data-preload-story]');
      if (!preloadLink) {
        preloadLink = document.createElement("link");
        preloadLink.setAttribute("rel", "preload");
        preloadLink.setAttribute("as", "image");
        preloadLink.setAttribute("data-preload-story", "true");
        document.head.appendChild(preloadLink);
      }
      preloadLink.setAttribute("href", preloadImage);
      preloadLink.setAttribute("fetchpriority", "high");
    }
  }, [title, description, preloadImage, exactTitle]);

  return null;
}

