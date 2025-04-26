
import React from 'react';
import { BookMarked } from 'lucide-react';
import PlatformLayout from '@/components/PlatformLayout';

const PinterestPage = () => {
  return (
    <PlatformLayout
      platform="Pinterest"
      platformColor="#BD081C"
      description="Save Pinterest pin videos and idea pins in high quality with our fast and free Pinterest video downloader."
      icon={<BookMarked size={24} color="#BD081C" />}
    />
  );
};

export default PinterestPage;
