
import React from 'react';
import { Music2 } from 'lucide-react';
import PlatformLayout from '@/components/PlatformLayout';

const TikTokPage = () => {
  return (
    <PlatformLayout
      platform="TikTok"
      platformColor="#000000"
      description="Download TikTok videos and clips in high quality with our fast and free TikTok video downloader."
      icon={<Music2 size={24} color="#000000" />}
    />
  );
};

export default TikTokPage;
