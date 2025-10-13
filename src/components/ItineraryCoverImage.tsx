import { useState, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import heroImage from "@/assets/hero-italia.jpg";

interface ItineraryCoverImageProps {
  destination: string;
  title: string;
  onClick?: () => void;
}

export const ItineraryCoverImage = ({ destination, title, onClick }: ItineraryCoverImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // Estrae la città principale dalla destinazione (es. "Roma (+ Tivoli)" -> "Roma")
        const mainDestination = destination.split('(')[0].trim();
        const searchQuery = encodeURIComponent(mainDestination);
        
        // Cerca immagini su Wikimedia Commons
        const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&srnamespace=6&format=json&origin=*&srlimit=10`;
        
        const response = await fetch(commonsUrl);
        const data = await response.json();
        
        if (data.query?.search?.length > 0) {
          // Cerca tra i primi risultati un'immagine valida
          for (const result of data.query.search) {
            const imageTitle = result.title;
            
            const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(imageTitle)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
            const imageInfoResponse = await fetch(imageInfoUrl);
            const imageInfoData = await imageInfoResponse.json();
            
            const pages = imageInfoData.query?.pages;
            const pageId = Object.keys(pages || {})[0];
            const imgUrl = pages?.[pageId]?.imageinfo?.[0]?.url;
            
            if (imgUrl && (imgUrl.endsWith('.jpg') || imgUrl.endsWith('.jpeg') || imgUrl.endsWith('.png'))) {
              setImageUrl(imgUrl);
              setIsLoading(false);
              return;
            }
          }
        }
        
        // Se non trova nulla, usa l'immagine di default
        setIsLoading(false);
      } catch (error) {
        console.error("Errore caricamento immagine:", error);
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [destination]);

  return (
    <div className="cursor-pointer" onClick={onClick}>
      <AspectRatio ratio={16 / 9}>
        {isLoading ? (
          <div className="w-full h-full bg-muted animate-pulse" />
        ) : (
          <img
            src={imageUrl || heroImage}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback all'immagine di default se caricamento fallisce
              e.currentTarget.src = heroImage;
            }}
          />
        )}
      </AspectRatio>
    </div>
  );
};
