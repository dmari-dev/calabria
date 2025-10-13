import { useEffect, useState } from "react";

interface ActivityThumbImageProps {
  query: string; // es: "Colosseo Roma"
  alt: string;
  className?: string;
}

export function ActivityThumbImage({ query, alt, className }: ActivityThumbImageProps) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const q = encodeURIComponent(query.trim());
        const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${q}&srnamespace=6&format=json&origin=*&srlimit=8`;
        const res = await fetch(searchUrl);
        const data = await res.json();
        if (!data.query?.search?.length) return;
        for (const item of data.query.search as Array<{ title: string }>) {
          const title = item.title;
          const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
          const infoRes = await fetch(infoUrl);
          const infoData = await infoRes.json();
          const pages = infoData.query?.pages || {};
          const pid = Object.keys(pages)[0];
          const url: string | undefined = pages?.[pid]?.imageinfo?.[0]?.url;
          if (url && (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png"))) {
            if (!cancelled) setSrc(url);
            break;
          }
        }
      } catch (e) {
        console.error("ActivityThumbImage error", e);
      }
    };
    setSrc("");
    run();
    return () => { cancelled = true; };
  }, [query]);

  if (!src) return <div className={"bg-muted " + (className || "")} aria-hidden="true" />;
  return <img src={src} alt={alt} className={className} />;
}
