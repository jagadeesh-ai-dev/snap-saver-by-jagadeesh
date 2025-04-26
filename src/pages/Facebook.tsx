
import React from 'react';
import { Facebook } from 'lucide-react';
import PlatformLayout from '@/components/PlatformLayout';

const FacebookPage = () => {
  return (
    <PlatformLayout
      platform="Facebook"
      platformColor="#1877F2"
      description="Download videos from Facebook posts, watch pages, groups, and more in high quality with our fast and free Facebook video downloader."
      icon={<Facebook size={24} color="#1877F2" />}
    />
  );
};

export default FacebookPage;
