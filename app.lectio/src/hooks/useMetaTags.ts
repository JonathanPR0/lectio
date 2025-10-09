import { useEffect } from "react";

interface MetaTagsProps {
  title?: string;
  description?: string;
  ogImage?: string;
  url?: string;
}

export function useMetaTags({
  title = "Lectio - Quiz Game",
  description = "Teste seus conhecimentos bíblicos com quizzes interativos.",
  ogImage = "/og-default.png",
  url = window.location.href,
}: MetaTagsProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(
        `meta[property="${property}"]`,
      ) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    const updateNameMetaTag = (name: string, content: string) => {
      let tag = document.querySelector(
        `meta[name="${name}"]`,
      ) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // Open Graph
    updateMetaTag("og:title", title);
    updateMetaTag("og:description", description);
    updateMetaTag("og:image", `${window.location.origin}${ogImage}`);
    updateMetaTag("og:url", url);

    // Twitter
    updateNameMetaTag("twitter:title", title);
    updateNameMetaTag("twitter:description", description);
    updateNameMetaTag("twitter:image", `${window.location.origin}${ogImage}`);
  }, [title, description, ogImage, url]);
}
