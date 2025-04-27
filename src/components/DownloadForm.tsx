
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from './ui/progress';
import { supabase } from "@/integrations/supabase/client";

interface DownloadFormProps {
  platform: string;
  platformColor: string;
}

const DownloadForm = ({ platform, platformColor }: DownloadFormProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    // Basic URL validation
    try {
      // For YouTube specifically, we may need to handle URLs that don't have proper protocol
      let processedUrl = url.trim();
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }
      
      console.log("Processing URL:", processedUrl);
      
      const urlObj = new URL(processedUrl);
      
      // Check if the URL belongs to the correct platform
      const domainCheck = {
        'YouTube': ['youtube.com', 'youtu.be', 'youtube', 'www.youtube.com', 'm.youtube.com'],
        'Instagram': ['instagram.com', 'www.instagram.com', 'instagr.am'],
        'Facebook': ['facebook.com', 'fb.com', 'fb.watch', 'www.facebook.com'],
        'Twitter': ['twitter.com', 'x.com', 'www.twitter.com'],
        'Pinterest': ['pinterest.com', 'pin.it', 'www.pinterest.com']
      };
      
      const platformDomains = domainCheck[platform as keyof typeof domainCheck] || [];
      const isCorrectPlatform = platformDomains.some(domain => urlObj.hostname.includes(domain));
      
      if (!isCorrectPlatform) {
        toast.error(`This doesn't look like a ${platform} URL. Please enter a valid ${platform} URL`);
        return;
      }
    } catch (error) {
      console.error("URL validation error:", error);
      toast.error('Please enter a valid URL');
      return;
    }
    
    setIsLoading(true);
    setShowProgress(true);
    setDownloadProgress(0);
    
    // Start progress animation
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 95 ? 95 : newProgress; // Max out at 95% until actual completion
      });
    }, 300);

    try {
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('video-downloader', {
        body: { url: url.trim(), platform },
      });
      
      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }
      
      if (!data || !data.downloadUrl) {
        throw new Error('No download URL returned');
      }
      
      console.log("Video data received:", data);
      
      // Complete the progress bar to 100%
      setDownloadProgress(100);
      
      // Trigger the download using the URL received from the edge function
      triggerDownload(data.downloadUrl, data.title || `${platform.toLowerCase()}-video`);
      
      // Show success message with any additional info from the backend
      toast.success(data.message || `Download started for your ${platform} video!`);
      setUrl('');
    } catch (error) {
      console.error("Download error:", error);
      toast.error(`Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setTimeout(() => {
        setShowProgress(false);
      }, 1000);
    }
  };
  
  // Function to trigger the actual download
  const triggerDownload = (url: string, filename: string) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      console.log(`Download triggered for URL: ${url}`);
    } catch (error) {
      console.error("Error triggering download:", error);
      // If direct download fails, try opening in new tab
      window.open(url, "_blank");
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
      
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Downloading...</span>
            <span>{Math.round(downloadProgress)}%</span>
          </div>
          <Progress value={downloadProgress} className="h-2" />
        </div>
      )}
      
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
