import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Sparkles, Loader2, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: 'user' | 'assistant', content: string };

interface DayAssistantChatProps {
  dayNumber: number;
  dayActivities: any[];
  itineraryId: string;
  onUpdate: () => void;
}

export const DayAssistantChat = ({ dayNumber, dayActivities, itineraryId, onUpdate }: DayAssistantChatProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const shouldShowCTA = messages.length >= 4 && !isLoading;

  const streamChat = async (userMessage: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-agent`;
    
    const activitiesSummary = dayActivities.map(act => 
      `${act.time} - ${act.title}: ${act.description}`
    ).join("\n");

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: [
          {
            role: "system",
            content: `Sei un assistente esperto di viaggi culturali. Stai aiutando l'utente a migliorare il programma del Giorno ${dayNumber} del suo itinerario.

Attività attuali:
${activitiesSummary}

Il tuo compito è:
1. Analizzare le attività proposte
2. Suggerire miglioramenti (orari, sequenza, durata)
3. Proporre alternative o attività aggiuntive
4. Dare consigli pratici per ottimizzare la giornata

Rispondi sempre in italiano, sii conciso e pratico.`
          },
          ...messages,
          { role: "user", content: userMessage }
        ] 
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

  const handleUpdateDay = async () => {
    setIsUpdating(true);
    
    try {
      // Raccogli tutti i suggerimenti dalla conversazione
      const suggestions = messages
        .filter(m => m.role === 'assistant')
        .map(m => m.content)
        .join("\n\n");
      
      const currentActivitiesSummary = dayActivities.map(act => 
        `${act.time} - ${act.title}: ${act.description}`
      ).join("\n");

      // Richiama generate-itinerary ma solo per aggiornare questo giorno specifico
      const { data, error } = await supabase.functions.invoke("generate-itinerary", {
        body: {
          destination: "Italia", // Placeholder, l'AI userà il contesto
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          participantsType: "single",
          participantsCount: 1,
          travelPace: "moderate",
          specificInterests: `Aggiorna SOLO il Giorno ${dayNumber} dell'itinerario.
          
Programma attuale del Giorno ${dayNumber}:
${currentActivitiesSummary}

Suggerimenti per migliorare:
${suggestions}

IMPORTANTE: Mantieni la stessa struttura JSON ma migliora solo le attività del Giorno ${dayNumber} basandoti sui suggerimenti.`,
        },
      });

      if (error) throw error;

      // Aggiorna solo il giorno specifico nell'itinerario esistente
      const { data: currentItinerary, error: fetchError } = await supabase
        .from("itineraries")
        .select("ai_content")
        .eq("id", itineraryId)
        .single();

      if (fetchError) throw fetchError;

      if (!currentItinerary?.ai_content) {
        throw new Error("Contenuto itinerario non disponibile");
      }

      const currentAiContent = currentItinerary.ai_content as any;
      const updatedContent = { ...currentAiContent };
      if (data?.days?.[dayNumber - 1]) {
        updatedContent.days[dayNumber - 1] = data.days[dayNumber - 1];
      }

      const { error: updateError } = await supabase
        .from("itineraries")
        .update({ ai_content: updatedContent })
        .eq("id", itineraryId);

      if (updateError) throw updateError;

      toast({
        title: "Giorno aggiornato!",
        description: `Il programma del Giorno ${dayNumber} è stato ottimizzato.`,
      });

      onUpdate();
      setMessages([]);
      setIsExpanded(false);
    } catch (error) {
      console.error("Errore aggiornamento giorno:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il giorno. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full bg-card rounded-2xl relative mt-4" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
      <div className="px-4 py-3 relative">
        {/* Expanded Chat Window */}
        <div
          className={cn(
            "transition-all duration-500 ease-in-out overflow-hidden origin-bottom mb-3",
            isExpanded 
              ? "max-h-[400px] opacity-100" 
              : "max-h-0 opacity-0"
          )}
        >
          <div className="h-full bg-card/95 backdrop-blur-lg border border-border rounded-2xl shadow-elevated">
            {/* Header */}
            <div className="flex items-center gap-2 pt-3 pb-2 px-4 border-b border-border/50">
              <Map className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Ottimizza il Giorno {dayNumber}</h3>
            </div>
            
            {/* Messages */}
            <div className="h-[300px] overflow-y-auto py-3 px-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs">Chiedi suggerimenti per migliorare questa giornata!</p>
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
                          "max-w-[85%] rounded-xl px-3 py-2",
                          msg.role === 'user' 
                            ? "bg-gradient-hero text-white" 
                            : "bg-muted text-foreground"
                        )}
                      >
                        <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-xl px-3 py-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
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

        {/* Chat Input Bar */}
        <div className="flex items-center gap-2 bg-background/50 rounded-full px-3 py-1.5 border border-border shadow-soft">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 flex gap-2 items-center">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              onFocus={() => setIsExpanded(true)}
              placeholder="Come posso migliorare questo giorno?"
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-8"
              disabled={isLoading}
            />
            
            {shouldShowCTA && (
              <Button
                onClick={handleUpdateDay}
                className="bg-gradient-hero hover:opacity-90 text-white gap-1.5 flex-shrink-0 h-8 text-xs"
                size="sm"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">
                  {isUpdating ? "Aggiornamento..." : `Aggiorna Giorno ${dayNumber}`}
                </span>
              </Button>
            )}
            
            <Button
              onClick={handleSendMessage}
              className="bg-gradient-hero hover:opacity-90 rounded-full flex-shrink-0 h-8 w-8"
              size="icon"
              disabled={isLoading || !message.trim()}
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
