import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { Sparkles, Map, Calendar, Users, Brain, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-tourists.jpg";
import heroMilano from "@/assets/hero-milano.jpg";
import heroFirenze from "@/assets/hero-firenze.jpg";
import heroVenezia from "@/assets/hero-venezia.jpg";
// import { Header } from "@/components/Header";
import { ForYouSection } from "@/components/ForYouSection";
import { VirtualAgentChat } from "@/components/VirtualAgentChat";

const Index = () => {
  const navigate = useNavigate();
  const chatRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const heroSlides = [
    {
      image: heroImage,
      city: null,
      title: "CulturExperience",
      subtitle: "Il tuo tour operator virtuale che crea viaggi culturali personalizzati utilizzando l'intelligenza artificiale.",
    },
    {
      image: heroMilano,
      city: "Milano",
      title: "Scopri Milano",
      subtitle: "Arte, moda e cultura nel cuore della Lombardia. Lasciati guidare dalla storia e dalla modernità milanese.",
    },
    {
      image: heroFirenze,
      city: "Firenze",
      title: "Esplora Firenze",
      subtitle: "La culla del Rinascimento ti aspetta con i suoi capolavori artistici e la sua bellezza senza tempo.",
    },
    {
      image: heroVenezia,
      city: "Venezia",
      title: "Vivi Venezia",
      subtitle: "Naviga tra i canali della Serenissima e scopri la magia di una città unica al mondo.",
    },
  ];

  const handleCreateItinerary = (city?: string) => {
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const features = [
    {
      icon: Brain,
      title: "AI Generativa",
      description: "L'intelligenza artificiale crea itinerari personalizzati basati sui tuoi interessi culturali"
    },
    {
      icon: Map,
      title: "Destinazioni Autentiche",
      description: "Scopri luoghi meno conosciuti e valorizza il patrimonio culturale italiano"
    },
    {
      icon: Calendar,
      title: "Pianificazione Ottimizzata",
      description: "Itinerari giorno per giorno con orari, costi e percorsi ottimizzati"
    },
    {
      icon: Users,
      title: "Per Tutti",
      description: "Viaggiatori singoli, coppie, famiglie o gruppi - itinerari su misura per te"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header moved to App-level layout */}
      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden">
        <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[450px] md:h-[550px]">
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={slide.image} 
                      alt={slide.city ? `${slide.city} cultural heritage` : "Italian cultural heritage"} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/50 to-background/30" />
                  </div>
                  
                  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    <div className="max-w-3xl">
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-fade-in">
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Powered by AI</span>
                      </div>
                      
                      <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in leading-tight">
                        {slide.title}
                      </h1>
                      
                      <p className="text-base md:text-lg text-white font-inter mb-8 animate-fade-in leading-relaxed">
                        {slide.subtitle}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                        <Button 
                          size="lg" 
                          className="bg-gradient-hero hover:opacity-90 transition-opacity text-lg px-8"
                          onClick={() => handleCreateItinerary(slide.city || undefined)}
                        >
                          Crea il Tuo Itinerario
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        {!slide.city && (
                          <Button 
                            size="lg" 
                            variant="outline"
                            className="text-lg px-8"
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                          >
                            Scopri di Più
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Dot Navigation */}
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  current === index 
                    ? 'bg-primary scale-125' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </section>

      {/* Virtual Agent Chat Bar */}
      <section ref={chatRef} className="py-6 bg-gradient-to-br from-background to-muted/30 -mt-[60px]">
        <div className="max-w-7xl mx-auto px-5">
          <VirtualAgentChat />
        </div>
      </section>

      {/* For You Section */}
      <section className="py-12 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ForYouSection />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Perché Scegliere <span className="bg-gradient-hero bg-clip-text text-transparent">Itinerari Intelligenti</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trasforma la pianificazione del tuo viaggio culturale in un'esperienza unica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="border-border/50 hover:shadow-soft transition-all group"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="shadow-elevated border-primary/20 bg-gradient-card">
            <CardContent className="pt-12 pb-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto a Partire?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Crea il tuo primo itinerario culturale personalizzato in pochi minuti
              </p>
              <Button 
                size="lg"
                className="bg-gradient-hero hover:opacity-90 transition-opacity text-lg px-8"
                onClick={() => navigate("/auth")}
              >
                Inizia Ora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>© 2025 Itinerari Intelligenti. Viaggi culturali personalizzati con AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
