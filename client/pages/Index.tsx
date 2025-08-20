import { useState, useEffect, useCallback } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { ChatHeader } from "@/components/ChatHeader";
import { MessageType, YouTubeSource } from "@/components/Message";
import { motion } from "framer-motion";

interface ResponseWithSources {
  content: string;
  sources: YouTubeSource[];
}

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: MessageType[];
}

export default function Index() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem("chatgpt-chats");
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setChats(parsedChats);
        if (parsedChats.length > 0) {
          setActiveChat(parsedChats[0].id);
        }
      } catch (error) {
        console.error("Failed to load chats from localStorage:", error);
      }
    }
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("chatgpt-chats", JSON.stringify(chats));
    }
  }, [chats]);

  const generateChatTitle = (message: string): string => {
    const firstSentence = message.split(/[.!?]/)[0];
    return firstSentence.length <= 40
      ? firstSentence
      : firstSentence.slice(0, 40) + "...";
  };

  const handleNewChat = useCallback(async () => {
    try {
      await fetch("http://localhost:8000/new_chat", {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to reset chat in backend:", error);
    }
    setChats([]);
    setActiveChat(null);
  }, []);
  
  const handleSendMessage = useCallback(
    async (content: string) => {
      const messageId = `msg-${Date.now()}`;
      const timestamp = new Date();
  
      const userMessage: MessageType = {
        id: messageId,
        content,
        role: "user",
        timestamp,
      };
  
      // ✅ Add message to current chat or create new one
      if (!activeChat) {
        const newChatId = `chat-${Date.now()}`;
        const newChat: Chat = {
          id: newChatId,
          title: generateChatTitle(content),
          lastMessage: content,
          timestamp,
          messages: [userMessage],
        };
  
        setChats((prevChats) => [newChat, ...prevChats]);
        setActiveChat(newChatId);
      } else {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === activeChat
              ? {
                  ...chat,
                  messages: [...chat.messages, userMessage],
                  lastMessage: content.slice(0, 50) + "...",
                  timestamp,
                }
              : chat
          )
        );
      }
  
      setIsTyping(true);
  
      try {
        const response = await fetch("https://5cff42d0a5b9.ngrok-free.app/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        });
  
        const data: { answer: string; sources?: Record<string, string> } = await response.json();

  
        // ✅ Normalize backend response
        const assistantMessage: MessageType = {
          id: `msg-${Date.now()}`,
          content: data.answer, // backend returns "answer"
          role: "assistant",
          timestamp: new Date(),
          sources: data.sources
            ? Object.entries(data.sources).map(([title, url]) => ({
                title,
                url,
              }))
            : [],
        };
  
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === (activeChat || prevChats[0].id)
              ? {
                  ...chat,
                  messages: [...chat.messages, assistantMessage],
                  lastMessage: data.answer.slice(0, 50) + "...",
                  timestamp: assistantMessage.timestamp,
                }
              : chat
          )
        );
      } catch (error) {
        console.error("Failed to fetch response:", error);
      } finally {
        setIsTyping(false);
      }
    },
    [activeChat]
  );
  
  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChat(chatId);
  }, []);

  const handleDeleteChat = useCallback(
    (chatId: string) => {
      setChats((prevChats) => {
        const filteredChats = prevChats.filter((chat) => chat.id !== chatId);
        if (activeChat === chatId) {
          setActiveChat(filteredChats.length > 0 ? filteredChats[0].id : null);
        }
        return filteredChats;
      });
    },
    [activeChat]
  );

  const handleClearAll = useCallback(() => {
    setChats([]);
    setActiveChat(null);
    localStorage.removeItem("chatgpt-chats");
  }, []);

 

  const currentChat = chats.find((chat) => chat.id === activeChat);
  const messages = currentChat?.messages || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen overflow-hidden"
    >
      <SidebarProvider defaultOpen={true}>
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onNewChat={handleNewChat}

          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onClearAll={handleClearAll}
        />

        <SidebarInset className="flex flex-col">
          <ChatHeader />

          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            isEmpty={!currentChat}
          />

          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isTyping}
            placeholder={
              currentChat
                ? "Type your message here..."
                : "Start a new conversation..."
            }
          />
        </SidebarInset>
      </SidebarProvider>
    </motion.div>
  );
}
