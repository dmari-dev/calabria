import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Map, Calendar, Users, Brain, ArrowRight, Landmark, MessageSquare } from "lucide-react";
import heroImage from "@/assets/hero-tourists.jpg";
import heroMilano from "@/assets/hero-milano.jpg";
import heroFirenze from "@/assets/hero-firenze.jpg";
import heroVenezia from "@/assets/hero-venezia.jpg";
import pitagoraImage from "@/assets/pitagora-portrait.jpg";
// import { Header } from "@/components/Header";
import { ForYouSection } from "@/components/ForYouSection";
import { VirtualAgentChat } from "@/components/VirtualAgentChat";

const Index = () => {
  const navigate = useNavigate();
  const chatRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [selectedCity, setSelectedCity] = useState<string | undefined>();
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);

  const handleOpenChat = () => {
    setIsChatDialogOpen(true);
  };

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
    setSelectedCity(city);
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
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px]">
        {/* Barra azzurra sopra */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-primary z-10"></div>
        
        <div className="grid md:grid-cols-2 h-full">
          {/* Colonna sinistra - Testo */}
          <div className="bg-white flex items-center justify-center px-8 md:px-16 py-12">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
                Inizia il tuo viaggio alla scoperta del patrimonio culturale della tua città
              </h1>
              
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                Esplora i tesori nascosti e i luoghi simbolo della tua destinazione. Dalla storia millenaria ai capolavori artistici, ogni città italiana custodisce patrimoni culturali unici che aspettano solo di essere scoperti.
              </p>
              
              <Button 
                size="lg" 
                className="bg-gradient-hero hover:opacity-90 transition-opacity px-10 py-6 text-sm"
                style={{ borderRadius: '6px' }}
                onClick={() => handleCreateItinerary()}
              >
                Crea il Tuo Itinerario
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Colonna destra - Immagine */}
          <div className="relative h-full">
            <img 
              src={heroImage} 
              alt="Patrimonio culturale calabrese" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Virtual Agent Chat Bar */}
      <section ref={chatRef} className="w-full py-16" style={{ backgroundColor: '#EBF1FF' }}>
        <div className="max-w-7xl mx-auto px-5" style={{ marginTop: '-100px' }}>
          <VirtualAgentChat initialCity={selectedCity} autoExpand={!!selectedCity} />
        </div>
      </section>

      {/* For You Section */}
      <section className="py-12 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ForYouSection />
        </div>
      </section>

      {/* Chiedi a Pitagora Section */}
      <section className="py-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left - Dark content */}
          <div className="bg-secondary p-12 md:p-20 flex flex-col justify-center min-h-[600px]">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Chiedi a Pitagora
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Fatti raccontare i segreti dei luoghi, trova tappe e idee per il tuo viaggio.
            </p>
            <div>
              <Button 
                size="lg"
                className="gap-2 text-white border-2 border-white hover:bg-white hover:text-secondary transition-all"
                style={{ 
                  backgroundColor: '#C50972',
                  borderRadius: '6px',
                  padding: '1.5rem 2rem'
                }}
                onClick={handleOpenChat}
              >
                <MessageSquare className="w-5 h-5" />
                Avvia chat
              </Button>
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative min-h-[600px]">
            <img 
              src={pitagoraImage} 
              alt="Pitagora" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Stats */}
            <div className="bg-muted/30 rounded-lg p-8 space-y-8">
              <div className="flex items-start gap-4">
                <Landmark className="w-12 h-12 flex-shrink-0" style={{ color: '#C50972' }} />
                <div>
                  <p className="text-4xl font-bold text-foreground mb-1" style={{ fontFamily: 'Titillium Web' }}>66.728</p>
                  <p className="text-muted-foreground">Beni culturali</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Landmark className="w-12 h-12 flex-shrink-0" style={{ color: '#C50972' }} />
                <div>
                  <p className="text-4xl font-bold text-foreground mb-1" style={{ fontFamily: 'Titillium Web' }}>1.268</p>
                  <p className="text-muted-foreground">Luoghi della cultura</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Landmark className="w-12 h-12 flex-shrink-0" style={{ color: '#C50972' }} />
                <div>
                  <p className="text-4xl font-bold text-foreground mb-1" style={{ fontFamily: 'Titillium Web' }}>128</p>
                  <p className="text-muted-foreground">Parchi e giardini</p>
                </div>
              </div>
            </div>

            {/* Right - Text and CTA */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                I numeri di una ricca eredità culturale
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                Dati, indicatori e analisi per leggere il sistema di fruizione e valorizzazione del patrimonio dei beni culturali regionale
              </p>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-sm"
                style={{ borderRadius: '6px' }}
                onClick={() => window.open('https://www.beniculturali.it', '_blank')}
              >
                Visita l&apos;osservatorio
              </Button>
            </div>
          </div>
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
                Inizia Adesso
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

      {/* Chat Dialog */}
      <Dialog open={isChatDialogOpen} onOpenChange={setIsChatDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold">Chiedi a Pitagora</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-6 pt-0">
            <VirtualAgentChat autoExpand={true} />
          </div>
        </DialogContent>
      </Dialog>

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
