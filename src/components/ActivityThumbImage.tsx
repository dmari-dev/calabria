import { useEffect, useState } from "react";

interface ActivityThumbImageProps {
  query: string; // es: "Colosseo Roma"
  alt: string;
  className?: string;
}

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export function ActivityThumbImage({ query, alt, className }: ActivityThumbImageProps) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const mainQuery = query.replace(/\s+/g, " ").trim();
        const q1 = encodeURIComponent(mainQuery);
        const candidates: string[] = [];

        const tryFetch = async (q: string) => {
          const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${q}&srnamespace=6&format=json&origin=*&srlimit=15`;
          const res = await fetch(searchUrl);
          const data = await res.json();
          if (!data.query?.search?.length) return;
          for (const item of data.query.search as Array<{ title: string }>) {
            const title = item.title;
            const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime&format=json&origin=*`;
            const infoRes = await fetch(infoUrl);
            const infoData = await infoRes.json();
            const pages = infoData.query?.pages || {};
            const pid = Object.keys(pages)[0];
            const info = pages?.[pid]?.imageinfo?.[0];
            const url: string | undefined = info?.url;
            const mime: string | undefined = info?.mime;
            if (url && mime && ALLOWED_MIME.has(mime)) {
              candidates.push(url);
              if (candidates.length >= 1) break; // basta una thumb
            }
          }
        };

        // Prima: query completa
        await tryFetch(q1);

        // Fallback: usa ultime 2 parole (spesso la città)
        if (candidates.length === 0) {
          const parts = mainQuery.split(" ").filter(Boolean);
          const last2 = encodeURIComponent(parts.slice(-2).join(" "));
          if (last2) await tryFetch(last2);
        }

        if (!cancelled) setSrc(candidates[0] || "");
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
