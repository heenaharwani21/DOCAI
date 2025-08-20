import { useEffect, useRef, useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Message, MessageType, TypingIndicator } from "./Message";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";

interface ChatWindowProps {
  messages: MessageType[];
  isTyping?: boolean;
  isEmpty?: boolean;
}

export function ChatWindow({ messages, isTyping = false, isEmpty = false }: ChatWindowProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Auto-scroll to bottom only when new messages arrive (not when user is manually scrolling)
  useEffect(() => {
    const shouldAutoScroll = messages.length > lastMessageCount || isTyping;

    if (shouldAutoScroll && bottomRef.current && !userHasScrolled) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }

    setLastMessageCount(messages.length);
  }, [messages, isTyping, lastMessageCount, userHasScrolled]);

  // Reset user scroll flag when new messages arrive
  useEffect(() => {
    if (messages.length > lastMessageCount) {
      setUserHasScrolled(false);
    }
  }, [messages.length, lastMessageCount]);

  // Handle scroll events to detect manual scrolling
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    if (target) {
      const { scrollTop, scrollHeight, clientHeight } = target;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50; // 50px threshold
      setUserHasScrolled(!isAtBottom);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const scrollElement = scrollAreaRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  if (isEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto" >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Start a conversation</h2>
          
        </motion.div>
      </div>
    );
  }

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      setUserHasScrolled(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background relative">
      <div
        ref={scrollAreaRef}
        className="flex-1 h-full custom-scrollbar force-scrollbar"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <div className="max-w-4xl mx-auto min-h-full py-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <Message
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
              />
            ))}
            {isTyping && <TypingIndicator key="typing" />}
          </AnimatePresence>
          <div ref={bottomRef} className="h-4" />

        </div>
      </div>

      {/* Scroll to bottom button */}
      {userHasScrolled && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.button>
      )}
    </div>
  );
}
