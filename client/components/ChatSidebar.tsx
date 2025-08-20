import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import {
  MessageSquare,
  Plus,
  Trash2,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onClearAll: () => void;
}

export function ChatSidebar({
  chats,
  activeChat,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onClearAll
}: ChatSidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            
          </div>
          <SidebarTrigger />
        </div>
        <Button 
          onClick={onNewChat}
          className="w-full mt-3 justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="flex-1">
        <ScrollArea className="flex-1 h-full px-2">
          <div className="space-y-1 py-2">
            {chats.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs">Start a new chat to begin</p>
              </div>
            ) : (
              <SidebarMenu>
                {chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      onHoverStart={() => setHoveredChat(chat.id)}
                      onHoverEnd={() => setHoveredChat(null)}
                      className="relative group"
                    >
                      <SidebarMenuButton
                        isActive={activeChat === chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className="w-full justify-start text-left h-auto py-3 px-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {chat.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            {chat.lastMessage}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTimestamp(chat.timestamp)}
                          </div>
                        </div>
                      </SidebarMenuButton>
                      
                      {hoveredChat === chat.id && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-destructive hover:text-destructive-foreground bg-background border border-border"
                        >
                          <Trash2 className="h-3 w-3" />
                        </motion.button>
                      )}
                    </motion.div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </div>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="space-y-2">
          <ThemeToggle
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
          />
          
          {chats.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
              onClick={onClearAll}
            >
              <Trash2 className="h-4 w-4" />
              Clear conversations
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
