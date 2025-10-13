import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export const VirtualAgentChat = () => {
  const [isOpen, setIsOpen] = useState(false);
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
      {/* Chat Button - Fixed at bottom right */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-hero shadow-elevated hover:opacity-90 transition-all animate-fade-in"
          style={{ zIndex: 9999 }}
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window - Morphs to hero section position */}
      <div
        className={cn(
          "fixed bg-card border border-border shadow-elevated transition-all duration-500 ease-in-out",
          isOpen 
            ? "top-32 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl h-[500px] rounded-2xl opacity-100 scale-100" 
            : "bottom-6 right-6 w-0 h-0 rounded-full opacity-0 scale-0 pointer-events-none"
        )}
        style={{ zIndex: 9999 }}
      >
        {isOpen && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-hero rounded-t-2xl">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-white" />
                <h3 className="font-semibold text-white">Virtual Agent</h3>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
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
                        "max-w-[80%] rounded-2xl px-4 py-2",
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

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Scrivi un messaggio..."
                  className="flex-1"
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
        )}
      </div>
    </>
  );
};
