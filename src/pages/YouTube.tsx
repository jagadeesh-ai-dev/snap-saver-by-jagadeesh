
import React from 'react';
import { Youtube } from 'lucide-react';
import PlatformLayout from '@/components/PlatformLayout';

const YouTubePage = () => {
  return (
    <PlatformLayout
      platform="YouTube"
      platformColor="#FF0000"
      description="Download videos and Shorts from YouTube in various qualities including HD and 4K with our fast and free YouTube downloader."
      icon={<Youtube size={24} color="#FF0000" />}
    />
  );
};

export default YouTubePage;
