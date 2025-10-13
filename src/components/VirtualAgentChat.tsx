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
    <>
      {/* Chat Bar - Fixed at bottom of viewport */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border transition-all duration-500 ease-in-out"
        style={{ zIndex: 9999 }}
      >
        {/* Expanded Chat Window */}
        <div
          className={cn(
            "transition-all duration-500 ease-in-out overflow-hidden",
            isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Messages */}
            <div className="h-[300px] overflow-y-auto mb-4 space-y-3">
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

        {/* Chat Input Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
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
                className="flex-1 bg-muted/50"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-gradient-hero hover:opacity-90"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind the chat bar */}
      <div className="h-20" />
    </>
  );
};
