
import React from 'react';
import { Twitter } from 'lucide-react';
import PlatformLayout from '@/components/PlatformLayout';

const TwitterPage = () => {
  return (
    <PlatformLayout
      platform="Twitter"
      platformColor="#1DA1F2"
      description="Download videos from Twitter/X tweets and profiles in high quality with our fast and free Twitter video downloader."
      icon={<Twitter size={24} color="#1DA1F2" />}
    />
  );
};

export default TwitterPage;
