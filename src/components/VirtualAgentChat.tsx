import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, UserPlus, Sparkles, Loader2, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: 'user' | 'assistant', content: string };

interface VirtualAgentChatProps {
  initialCity?: string;
  autoExpand?: boolean;
}

export const VirtualAgentChat = ({ initialCity, autoExpand }: VirtualAgentChatProps) => {
  const [isExpanded, setIsExpanded] = useState(autoExpand || false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-inizializza la conversazione quando viene passata una città
  useEffect(() => {
    if (initialCity && !hasInitialized) {
      setHasInitialized(true);
      setIsExpanded(true);
      const initialMessage = `Voglio visitare ${initialCity}`;
      setMessages([{ role: "user", content: initialMessage }]);
      setIsLoading(true);
      
      streamChat(initialMessage)
        .catch(error => {
          console.error("Errore chat:", error);
          toast({
            title: "Errore",
            description: "Si è verificato un errore nell'avvio della conversazione",
            variant: "destructive",
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [initialCity, hasInitialized]);

  // Mostra CTA dopo 3+ scambi di messaggi
  const shouldShowCTA = messages.length >= 6 && !isLoading;

  const handleCreateItinerary = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Estrai informazioni dalla conversazione per creare l'itinerario
      const conversation = messages.map(m => m.content).join("\n");
      
      // Estrai la destinazione dalla conversazione
      const italianCities = [
        'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze',
        'Bari', 'Catania', 'Venezia', 'Verona', 'Messina', 'Padova', 'Trieste', 'Brescia',
        'Parma', 'Modena', 'Prato', 'Reggio Calabria', 'Perugia', 'Livorno', 'Cagliari',
        'Foggia', 'Rimini', 'Salerno', 'Ferrara', 'Ravenna', 'Siena', 'Pisa', 'Bergamo',
        'Toscana', 'Sicilia', 'Sardegna', 'Puglia', 'Calabria', 'Campania', 'Lazio',
        'Lombardia', 'Veneto', 'Emilia-Romagna', 'Piemonte', 'Liguria', 'Umbria',
        'Marche', 'Abruzzo', 'Trentino', 'Friuli'
      ];
      
      let destination = 'Italia';
      let detectedCity = '';
      
      // Cerca città o regioni nella conversazione
      for (const city of italianCities) {
        if (conversation.toLowerCase().includes(city.toLowerCase())) {
          detectedCity = city;
          destination = city;
          break;
        }
      }
      
      // Crea un titolo descrittivo
      const title = detectedCity 
        ? `Itinerario a ${detectedCity}`
        : 'Itinerario culturale in Italia';
      
      // Crea l'itinerario nel database con stato "in_progress"
      const { data: itinerary, error: createError } = await supabase
        .from("itineraries")
        .insert({
          user_id: user.id,
          title: title,
          destination: destination,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "in_progress",
          participants_count: 1,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Genera l'itinerario con l'AI usando la conversazione come contesto
      const { error: aiError } = await supabase.functions.invoke(
        "generate-itinerary",
        {
          body: {
            itineraryId: itinerary.id,
          },
        }
      );

      if (aiError) throw aiError;

      toast({
        title: "Itinerario creato!",
        description: "Il tuo itinerario personalizzato è pronto.",
      });

      // Naviga all'itinerario creato
      navigate(`/itinerary/${itinerary.id}`);
    } catch (error) {
      console.error("Errore creazione itinerario:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare l'itinerario. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const streamChat = async (userMessage: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-agent`;
    
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: [...messages, { role: "user", content: userMessage }] 
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || "Errore nella risposta");
    }

    if (!resp.body) throw new Error("Nessuna risposta dal server");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;
    let assistantContent = "";

    // Aggiungi messaggio assistente vuoto
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const newMessages = [...prev];
              const lastIndex = newMessages.length - 1;
              if (newMessages[lastIndex]?.role === "assistant") {
                newMessages[lastIndex] = {
                  ...newMessages[lastIndex],
                  content: assistantContent
                };
              }
              return newMessages;
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Flush finale
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw || raw.startsWith(":") || !raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const newMessages = [...prev];
              const lastIndex = newMessages.length - 1;
              if (newMessages[lastIndex]?.role === "assistant") {
                newMessages[lastIndex] = {
                  ...newMessages[lastIndex],
                  content: assistantContent
                };
              }
              return newMessages;
            });
          }
        } catch { /* ignore */ }
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = message.trim();
    setMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      await streamChat(userMessage);
    } catch (error) {
      console.error("Errore chat:", error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Si è verificato un errore",
        variant: "destructive",
      });
      // Rimuovi l'ultimo messaggio assistente vuoto in caso di errore
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.role === "assistant" && 
            newMessages[newMessages.length - 1]?.content === "") {
          newMessages.pop();
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-card relative" style={{ zIndex: 9999, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', borderRadius: '6px' }}>
      <div className="px-4 sm:px-6 lg:px-8 relative py-4">
        {/* Expanded Chat Window - Opens upward */}
        <div
          className={cn(
            "absolute left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 bottom-full transition-all duration-500 ease-in-out overflow-hidden origin-bottom",
            isExpanded 
              ? "h-[50vh] opacity-100" 
              : "h-0 opacity-0"
          )}
        >
          <div className="h-full bg-card/95 backdrop-blur-lg border border-border rounded-t-md px-4 sm:px-6 shadow-elevated">
            {/* Header */}
            <div className="flex items-center gap-2 pt-4 pb-2 border-b border-border/50">
              <Map className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Il tuo prossimo itinerario</h3>
            </div>
            
            {/* Messages */}
            <div className="h-[calc(100%-3rem)] overflow-y-auto py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageCircle className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">Inizia dicendomi dove vuoi andare o cosa vuoi fare! 🌍</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2",
                          msg.role === 'user' 
                            ? "bg-gradient-hero text-white" 
                            : "bg-muted text-foreground"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chat Input Bar - Boxed */}
        <div className="flex items-center gap-3 bg-background/50 px-4 py-2 border border-border shadow-soft" style={{ borderRadius: '6px' }}>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 flex gap-2 items-center">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              onFocus={() => setIsExpanded(true)}
              placeholder="Inserisci cosa vuoi fare o dove vuoi andare..."
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isLoading}
            />
            
            {/* CTA Buttons */}
            {shouldShowCTA && (
              !user ? (
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-hero hover:opacity-90 text-white gap-2 flex-shrink-0 px-6 py-5 text-sm"
                  style={{ borderRadius: '6px' }}
                  size="sm"
                  disabled={isGenerating}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Registrati</span>
                </Button>
              ) : (
                <Button
                  onClick={handleCreateItinerary}
                  className="bg-gradient-hero hover:opacity-90 text-white gap-2 flex-shrink-0 px-6 py-5 text-sm"
                  style={{ borderRadius: '6px' }}
                  size="sm"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isGenerating ? "Generazione..." : "Crea itinerario"}
                  </span>
                </Button>
              )
            )}
            
            <Button
              onClick={handleSendMessage}
              className="bg-gradient-hero hover:opacity-90 flex-shrink-0"
              style={{ borderRadius: '6px' }}
              size="icon"
              disabled={isLoading || !message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
