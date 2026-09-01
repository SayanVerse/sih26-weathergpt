import React from 'react';
import { Bot, User, Sparkles, MapPin, CheckCircle2, AlertCircle, Edit2, Copy, RefreshCw, FileText, Download } from 'lucide-react';
import { AIChatMessage } from '../../types/ai';
import { Badge } from '../ui/Badge';
import { motion } from 'motion/react';

interface ChatMessageItemProps {
  message: AIChatMessage;
  onRegenerate?: (id: string) => void;
}

const ParagraphWithBlur: React.FC<{ text: string }> = ({ text }) => {
  const segments = React.useMemo(() => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    const result: Array<{ text: string; isBold: boolean }> = [];
    
    parts.forEach(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const words = part.slice(2, -2).split(' ');
        words.forEach((w, idx) => {
          result.push({
            text: w + (idx < words.length - 1 ? ' ' : ''),
            isBold: true
          });
        });
      } else {
        const words = part.split(' ');
        words.forEach((w, idx) => {
          result.push({
            text: w + (idx < words.length - 1 ? ' ' : ''),
            isBold: false
          });
        });
      }
    });
    return result;
  }, [text]);

  return (
    <p className="leading-relaxed flex flex-wrap">
      {segments.map((seg, index) => {
        const delay = (index * 15) / 1000;
        return (
          <motion.span
            key={index}
            initial={{ filter: 'blur(8px)', opacity: 0, y: 12 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: delay,
              ease: 'easeOut'
            }}
            className={seg.isBold ? "font-semibold text-zinc-900 dark:text-zinc-100" : "text-zinc-800 dark:text-zinc-200"}
            style={{
              display: 'inline-block',
              willChange: 'transform, filter, opacity',
              whiteSpace: 'pre-wrap'
            }}
          >
            {seg.text === '' ? '\u00A0' : seg.text}
          </motion.span>
        );
      })}
    </p>
  );
};

const ListItemWithBlur: React.FC<{ text: string }> = ({ text }) => {
  const segments = React.useMemo(() => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    const result: Array<{ text: string; isBold: boolean }> = [];
    
    parts.forEach(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const words = part.slice(2, -2).split(' ');
        words.forEach((w, idx) => {
          result.push({
            text: w + (idx < words.length - 1 ? ' ' : ''),
            isBold: true
          });
        });
      } else {
        const words = part.split(' ');
        words.forEach((w, idx) => {
          result.push({
            text: w + (idx < words.length - 1 ? ' ' : ''),
            isBold: false
          });
        });
      }
    });
    return result;
  }, [text]);

  return (
    <span className="flex flex-wrap inline-block">
      {segments.map((seg, index) => {
        const delay = (index * 15) / 1000;
        return (
          <motion.span
            key={index}
            initial={{ filter: 'blur(8px)', opacity: 0, y: 12 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: delay,
              ease: 'easeOut'
            }}
            className={seg.isBold ? "font-semibold text-zinc-900 dark:text-zinc-100" : "text-zinc-800 dark:text-zinc-200"}
            style={{
              display: 'inline-block',
              willChange: 'transform, filter, opacity',
              whiteSpace: 'pre-wrap'
            }}
          >
            {seg.text === '' ? '\u00A0' : seg.text}
          </motion.span>
        );
      })}
    </span>
  );
};

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onRegenerate }) => {
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';
  const isError = message.status === 'error';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  // Helper to format basic markdown (bold **text**, bullet points, linebreaks)
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.split('\n\n');

    return (
      <div className="space-y-2.5">
        {paragraphs.map((p, idx) => {
          // Check for bullet list
          if (p.trim().startsWith('- ') || p.trim().startsWith('* ')) {
            const items = p.split('\n');
            return (
              <ul key={idx} className="space-y-1 my-1 pl-4 list-disc marker:text-blue-500 text-zinc-800 dark:text-zinc-200">
                {items.map((item, iIdx) => {
                  const cleaned = item.replace(/^[-*]\s+/, '');
                  
                  // Use ListItemWithBlur for finished AI messages
                  if (!isUser && !isStreaming && !isError) {
                    return (
                      <li key={iIdx}>
                        <ListItemWithBlur text={cleaned} />
                      </li>
                    );
                  }
                  
                  return <li key={iIdx}>{renderInlineMarkdown(cleaned)}</li>;
                })}
              </ul>
            );
          }

          // Use ParagraphWithBlur for finished AI messages
          if (!isUser && !isStreaming && !isError) {
            return (
              <ParagraphWithBlur key={idx} text={p} />
            );
          }

          return (
            <p key={idx} className="leading-relaxed">
              {renderInlineMarkdown(p)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`flex w-full ${
        isUser ? 'justify-end' : 'justify-start group relative'
      } animate-in fade-in slide-in-from-bottom-2 duration-200 mb-6`}
    >


      {/* Bubble Container */}
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] relative`}
      >
        {/* Floating Action Toolbar for AI Messages */}
        {!isUser && !isStreaming && !isError && (
          <div className="absolute -top-8 right-0 hidden group-hover:flex items-center gap-2 bg-zinc-900 text-zinc-300 rounded-xl px-2 py-1.5 shadow-lg border border-zinc-700/50 z-10 transition-opacity">
            <button className="p-1 hover:text-white transition-colors" title="AI Refine"><Sparkles className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:text-white transition-colors" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
            {onRegenerate && (
              <button onClick={() => onRegenerate(message.id)} className="p-1 hover:text-white transition-colors" title="Regenerate">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={handleCopy} className="p-1 hover:text-white transition-colors" title="Copy">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Message Card */}
        <div
          className={`p-4 sm:p-5 text-sm transition-all ${
            isUser
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl'
              : isError
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 rounded-2xl'
              : 'bg-transparent text-zinc-800 dark:text-zinc-200'
          }`}
        >
          {renderFormattedContent(message.content)}

          {/* Actionable Tips / Insights Badge list if returned */}
          {!isUser && message.metadata?.actionableTips && message.metadata.actionableTips.length > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                Key Factors:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {message.metadata.actionableTips.map((tip, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
