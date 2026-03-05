'use client';

import type { Message } from '@travel-planner/shared';

interface MessageItemProps {
  message: Message;
  senderLabel: string;
  isOwn: boolean;
  showHeader: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export function MessageItem({
  message,
  senderLabel,
  isOwn,
  showHeader,
  isFirst,
  isLast,
}: MessageItemProps) {
  const bubbleRadius = isOwn
    ? `rounded-2xl ${isFirst ? 'rounded-tr-sm' : ''} ${isLast ? '' : 'rounded-br-sm'}`
    : `rounded-2xl ${isFirst ? 'rounded-tl-sm' : ''} ${isLast ? '' : 'rounded-bl-sm'}`;

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${showHeader ? 'mt-4' : 'mt-0.5'}`}>
      {showHeader && (
        <div className={`flex items-baseline gap-2 mb-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold text-foreground">{senderLabel}</span>
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
      <div
        className={`px-3.5 py-2 text-sm max-w-sm md:max-w-md break-words ${bubbleRadius} ${
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
