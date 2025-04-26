
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadFormProps {
  platform: string;
  platformColor: string;
}

const DownloadForm = ({ platform, platformColor }: DownloadFormProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    // Basic URL validation
    try {
      const urlObj = new URL(url);
      
      // Check if the URL belongs to the correct platform
      const domainCheck = {
        'YouTube': ['youtube.com', 'youtu.be'],
        'Instagram': ['instagram.com'],
        'Facebook': ['facebook.com', 'fb.com', 'fb.watch'],
        'Twitter': ['twitter.com', 'x.com'],
        'Pinterest': ['pinterest.com', 'pin.it']
      };
      
      const platformDomains = domainCheck[platform as keyof typeof domainCheck] || [];
      const isCorrectPlatform = platformDomains.some(domain => urlObj.hostname.includes(domain));
      
      if (!isCorrectPlatform) {
        toast.error(`This doesn't look like a ${platform} URL. Please enter a valid ${platform} URL`);
        return;
      }
      
    } catch (error) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call for downloading video
    try {
      // This is just a mockup - in a real app, you'd call your backend API here
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Download started for your ${platform} video!`);
      setUrl('');
    } catch (error) {
      toast.error(`Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <label htmlFor="videoUrl" className="text-lg font-medium">
          Paste your {platform} video URL below
        </label>
        <Input 
          id="videoUrl"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={`https://${platform.toLowerCase()}.com/...`}
          className="url-input"
          disabled={isLoading}
        />
      </div>
      
      <Button 
        type="submit" 
        className="download-button w-full md:w-auto"
        style={{ 
          backgroundColor: isLoading ? '#ccc' : (platformColor || '#9b87f5'),
          color: '#fff'
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Download size={20} />
            Download Video
          </>
        )}
      </Button>
      
      <div className="text-sm text-muted-foreground">
        By using our service you accept our <a href="#" className="text-snapsaver-purple hover:underline">Terms of Service</a>
      </div>
    </form>
  );
};

export default DownloadForm;
