import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Map, Calendar, Users, Brain, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-tourists.jpg";
// import { Header } from "@/components/Header";
import { ForYouSection } from "@/components/ForYouSection";
import { VirtualAgentChat } from "@/components/VirtualAgentChat";

const Index = () => {
  const navigate = useNavigate();

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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Italian cultural heritage" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/50 to-background/30" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Powered by AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in leading-tight">
              CulturExperience
            </h1>
            
            <p className="text-base md:text-lg text-white font-inter mb-8 animate-fade-in leading-relaxed">
              Il tuo tour operator virtuale che crea viaggi culturali personalizzati 
              utilizzando l'intelligenza artificiale.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Button 
                size="lg" 
                className="bg-gradient-hero hover:opacity-90 transition-opacity text-lg px-8"
                onClick={() => navigate("/auth")}
              >
                Inizia Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Scopri di Più
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Agent Chat Bar */}
      <VirtualAgentChat />

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
