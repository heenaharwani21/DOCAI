import { motion } from "framer-motion";
import { ExternalLink, Play } from "lucide-react";
import { YouTubeSource } from "./Message";

interface YouTubeSourcesProps {
  sources: YouTubeSource[];
}

export function YouTubeSources({ sources }: YouTubeSourcesProps) {
  if (!sources || sources.length === 0) return null;

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const getThumbnail = (url: string) => {
    const videoId = getVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-4 border-t border-border pt-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <Play className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Sources ({sources.length})
        </span>
      </div>
      
      <div className="space-y-3">
        {sources.map((source, index) => (
          <motion.a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02 }}
            className="flex gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex-shrink-0">
              <div className="relative w-20 h-14 rounded-md overflow-hidden bg-muted">
                {source.thumbnail || getThumbnail(source.url) ? (
                  <img
                    src={source.thumbnail || getThumbnail(source.url)!}
                    alt={source.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0 flex items-center justify-left">
              <h4 className="font-medium text-sm  group-hover:text-primary transition-colors"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                {source.title}
              </h4>
            </div>

            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
