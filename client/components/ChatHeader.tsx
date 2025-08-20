import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export function ChatHeader() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <SidebarTrigger />
          </motion.div>
        )}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">DOCAI</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Additional header actions can be added here */}
      </div>
    </div>
  );
}
