
import React from 'react';
import { Instagram } from 'lucide-react';
import PlatformLayout from '@/components/PlatformLayout';

const InstagramPage = () => {
  return (
    <PlatformLayout
      platform="Instagram"
      platformColor="#E4405F"
      description="Save Instagram videos, Reels, Stories, and IGTV videos in high quality with our fast and free Instagram downloader."
      icon={<Instagram size={24} color="#E4405F" />}
    />
  );
};

export default InstagramPage;
