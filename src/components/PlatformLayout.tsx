
import React from 'react';
import { Card, CardContent } from './ui/card';
import DownloadForm from './DownloadForm';

interface PlatformLayoutProps {
  platform: string;
  platformColor: string;
  description: string;
  icon: React.ReactNode;
}

const PlatformLayout = ({ platform, platformColor, description, icon }: PlatformLayoutProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: `${platformColor}30` }}>
              {icon}
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              {platform} Video Downloader
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>
        
        <Card className="border-2 shadow-lg">
          <CardContent className="pt-6">
            <DownloadForm platform={platform} platformColor={platformColor} />
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">How to download {platform} videos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 border rounded-lg bg-white shadow-sm">
              <div className="h-10 w-10 rounded-full bg-snapsaver-purple/20 flex items-center justify-center text-snapsaver-purple font-bold">1</div>
              <h3 className="font-medium">Copy Video URL</h3>
              <p className="text-sm text-muted-foreground">
                Find the video you want to download and copy its URL from the address bar or share button
              </p>
            </div>
            <div className="space-y-2 p-4 border rounded-lg bg-white shadow-sm">
              <div className="h-10 w-10 rounded-full bg-snapsaver-purple/20 flex items-center justify-center text-snapsaver-purple font-bold">2</div>
              <h3 className="font-medium">Paste URL</h3>
              <p className="text-sm text-muted-foreground">
                Paste the copied URL into the input field above
              </p>
            </div>
            <div className="space-y-2 p-4 border rounded-lg bg-white shadow-sm">
              <div className="h-10 w-10 rounded-full bg-snapsaver-purple/20 flex items-center justify-center text-snapsaver-purple font-bold">3</div>
              <h3 className="font-medium">Download</h3>
              <p className="text-sm text-muted-foreground">
                Click the download button and select your preferred video quality
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformLayout;
