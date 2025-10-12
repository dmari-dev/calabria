import { 
  Church, 
  Building2, 
  Home, 
  ShoppingBag, 
  Castle,
  Trees,
  Landmark,
  Mountain,
  Waves,
  UtensilsCrossed,
  Coffee,
  Wine,
  Camera,
  Palette,
  Music,
  Theater,
  Building,
  MapPin,
  LucideIcon
} from "lucide-react";

interface IconMapping {
  keywords: string[];
  icon: LucideIcon;
  color: string;
}

const iconMappings: IconMapping[] = [
  // Religious
  { keywords: ["chiesa", "church", "cattedrale", "cathedral", "basilica", "duomo", "cappella", "chapel", "santuario", "sanctuary"], icon: Church, color: "text-purple-500" },
  
  // Historical Buildings
  { keywords: ["palazzo", "palace", "castello", "castle", "fortezza", "fortress", "rocca", "torre", "tower"], icon: Castle, color: "text-amber-600" },
  
  // Monuments
  { keywords: ["monumento", "monument", "statua", "statue", "fontana", "fountain", "arco", "arch", "obelisco"], icon: Landmark, color: "text-stone-600" },
  
  // Villas & Houses
  { keywords: ["villa", "casa", "house", "residenza", "residence", "palazzo storico"], icon: Home, color: "text-rose-500" },
  
  // Markets & Shopping
  { keywords: ["mercato", "market", "mercatino", "shopping", "negozio", "shop", "boutique", "fiera", "bazar"], icon: ShoppingBag, color: "text-green-600" },
  
  // Gardens & Parks
  { keywords: ["giardino", "garden", "parco", "park", "verde", "giardini", "gardens", "botanico", "botanical"], icon: Trees, color: "text-emerald-600" },
  
  // Museums & Galleries
  { keywords: ["museo", "museum", "galleria", "gallery", "pinacoteca", "esposizione", "exhibition"], icon: Palette, color: "text-indigo-600" },
  
  // Landmarks & Viewpoints
  { keywords: ["panorama", "viewpoint", "belvedere", "vista", "view", "piazza", "square"], icon: Landmark, color: "text-blue-600" },
  
  // Nature & Mountains
  { keywords: ["montagna", "mountain", "collina", "hill", "sentiero", "trail", "trekking", "hiking"], icon: Mountain, color: "text-slate-600" },
  
  // Water & Beaches
  { keywords: ["mare", "sea", "spiaggia", "beach", "costa", "coast", "lago", "lake", "fiume", "river"], icon: Waves, color: "text-cyan-600" },
  
  // Food & Dining
  { keywords: ["ristorante", "restaurant", "trattoria", "osteria", "cucina", "cuisine", "pranzo", "lunch", "cena", "dinner"], icon: UtensilsCrossed, color: "text-orange-600" },
  
  // Cafes & Bars
  { keywords: ["caffè", "cafe", "coffee", "bar", "pasticceria", "bakery", "gelateria"], icon: Coffee, color: "text-amber-700" },
  
  // Wine & Tasting
  { keywords: ["vino", "wine", "cantina", "winery", "degustazione", "tasting", "enoteca"], icon: Wine, color: "text-red-700" },
  
  // Photography & Sightseeing
  { keywords: ["foto", "photo", "fotografare", "photography", "panoramica", "scenic"], icon: Camera, color: "text-violet-600" },
  
  // Entertainment & Culture
  { keywords: ["teatro", "theater", "theatre", "concerto", "concert", "opera", "spettacolo", "show"], icon: Theater, color: "text-pink-600" },
  
  // Music
  { keywords: ["musica", "music", "musicale", "musical", "jazz", "live music"], icon: Music, color: "text-fuchsia-600" },
  
  // General Buildings
  { keywords: ["edificio", "building", "architettura", "architecture", "centro", "center"], icon: Building2, color: "text-gray-600" },
];

export const getActivityIcon = (title: string, description: string = ""): { icon: LucideIcon; color: string } => {
  const searchText = `${title} ${description}`.toLowerCase();
  
  for (const mapping of iconMappings) {
    if (mapping.keywords.some(keyword => searchText.includes(keyword))) {
      return { icon: mapping.icon, color: mapping.color };
    }
  }
  
  // Default fallback
  return { icon: MapPin, color: "text-primary" };
};
