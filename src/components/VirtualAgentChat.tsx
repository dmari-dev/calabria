import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export const VirtualAgentChat = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent', content: string }>>([]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setMessages([...messages, { role: 'user', content: message }]);
    setMessage("");
    
    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: 'Ciao! Sono il tuo assistente virtuale. Come posso aiutarti a creare il tuo itinerario culturale perfetto?' 
      }]);
    }, 1000);
  };

  return (
    <div className="w-full bg-card rounded-3xl relative" style={{ zIndex: 9999, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
      <div className="px-4 sm:px-6 lg:px-8 relative py-4">
        {/* Expanded Chat Window - Absolute positioned to overlay hero section */}
        <div
          className={cn(
            "absolute left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 bottom-full transition-all duration-500 ease-in-out overflow-hidden",
            isExpanded 
              ? "h-[50vh] opacity-100" 
              : "h-0 opacity-0"
          )}
        >
          <div className="h-full bg-card/95 backdrop-blur-lg border border-border rounded-t-2xl px-4 sm:px-6 shadow-elevated">
            {/* Messages */}
            <div className="h-full overflow-y-auto py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageCircle className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">Inizia una conversazione con il nostro assistente virtuale</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
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
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Input Bar - Boxed */}
        <div className="flex items-center gap-3 bg-background/50 rounded-full px-4 py-2 border border-border shadow-soft">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              onFocus={() => setIsExpanded(true)}
              placeholder="Chiedimi qualcosa sul tuo viaggio culturale..."
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-gradient-hero hover:opacity-90 rounded-full"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
