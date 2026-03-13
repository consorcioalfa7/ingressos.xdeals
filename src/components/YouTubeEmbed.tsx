'use client';

import { useState } from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

export function YouTubeEmbed({ videoId, title = 'YouTube video' }: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!videoId) {
    return null;
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
