import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, UserPlus, Sparkles, Loader2, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type Message = { role: 'user' | 'assistant', content: string };

interface VirtualAgentChatProps {
  initialCity?: string;
  autoExpand?: boolean;
  expandDirection?: 'up' | 'down';
}

export const VirtualAgentChat = ({ initialCity, autoExpand, expandDirection = 'down' }: VirtualAgentChatProps) => {
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

  // Espandi quando richiesto dal contenitore (CTA)
  useEffect(() => {
    if (autoExpand && !isExpanded) {
      setIsExpanded(true);
    }
  }, [autoExpand, isExpanded]);

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

    const data = await resp.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Aggiungi la risposta completa dell'assistente
    setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Expanded Chat Window - Opens upward or downward based on expandDirection */}
      {expandDirection === 'up' ? (
        <div
          className={cn(
            "absolute left-0 right-0 bottom-full mb-4 transition-all duration-500 ease-in-out overflow-hidden origin-bottom",
            isExpanded 
              ? "max-h-[500px] opacity-100" 
              : "max-h-0 opacity-0"
          )}
        >
          <div className="h-[500px] bg-white rounded-lg shadow-elevated flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border/50 bg-muted/30">
              <Map className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Il tuo prossimo itinerario</h3>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
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
                            ? "text-white" 
                            : "bg-muted text-foreground"
                        )}
                        style={msg.role === 'user' ? { backgroundColor: '#C50972' } : {}}
                      >
                         <div className="text-sm prose prose-sm max-w-none dark:prose-invert break-words overflow-wrap-anywhere">
                           <ReactMarkdown 
                             components={{
                               a: ({node, ...props}) => <a {...props} className="break-all underline" target="_blank" rel="noopener noreferrer" />
                             }}
                           >
                             {msg.content}
                           </ReactMarkdown>
                         </div>
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
      ) : (
        <div
          className={cn(
            "bg-white rounded-lg shadow-elevated transition-all duration-500 ease-in-out overflow-hidden mb-4",
            isExpanded 
              ? "max-h-[500px] opacity-100" 
              : "max-h-0 opacity-0"
          )}
        >
          <div className="h-[500px] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border/50 bg-muted/30">
              <Map className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Il tuo prossimo itinerario</h3>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
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
                            ? "text-white" 
                            : "bg-muted text-foreground"
                        )}
                        style={msg.role === 'user' ? { backgroundColor: '#C50972' } : {}}
                      >
                         <div className="text-sm prose prose-sm max-w-none dark:prose-invert break-words overflow-wrap-anywhere">
                           <ReactMarkdown 
                             components={{
                               a: ({node, ...props}) => <a {...props} className="break-all underline" target="_blank" rel="noopener noreferrer" />
                             }}
                           >
                             {msg.content}
                           </ReactMarkdown>
                         </div>
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
      )}

      {/* Chat Input Bar */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-soft border border-white/20"
        style={{ borderRadius: '6px' }}
      >
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="icon"
          className="flex-shrink-0 text-foreground"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 flex gap-2 items-center">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            onFocus={() => setIsExpanded(true)}
            placeholder="Chiedi a Pitagora cosa vuoi fare e cosa vuoi vedere"
            className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground"
            disabled={isLoading}
          />
          
          {/* CTA Buttons */}
          {shouldShowCTA && (
            !user ? (
              <Button
                onClick={() => navigate("/auth")}
                className="hover:opacity-90 text-white gap-2 flex-shrink-0 px-6 py-5 text-sm"
                style={{ borderRadius: '6px', backgroundColor: '#C50972' }}
                size="sm"
                disabled={isGenerating}
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Registrati</span>
              </Button>
            ) : (
              <Button
                onClick={handleCreateItinerary}
                className="hover:opacity-90 text-white gap-2 flex-shrink-0 px-6 py-5 text-sm"
                style={{ borderRadius: '6px', backgroundColor: '#C50972' }}
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
            className="hover:opacity-90 flex-shrink-0 text-white"
            style={{ borderRadius: '6px', backgroundColor: '#C50972' }}
            size="icon"
            disabled={isLoading || !message.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
