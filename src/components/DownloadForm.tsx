
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from './ui/progress';

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
      const urlObj = new URL(url);
      
      // Check if the URL belongs to the correct platform
      const domainCheck = {
        'YouTube': ['youtube.com', 'youtu.be', 'youtube', 'www.youtube.com'],
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
      toast.error('Please enter a valid URL');
      return;
    }
    
    setIsLoading(true);
    setShowProgress(true);
    setDownloadProgress(0);
    
    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 500);

    try {
      // In a real application, we would call a backend API here
      // For demonstration, we'll use a direct download approach
      
      // Create a downloadable anchor element
      const downloadVideo = async () => {
        // This is a client-side only approach for demonstration
        // In a real app, you would use a backend service to process the video
        
        // Get video ID from URL (improved extraction)
        const videoId = extractVideoId(url, platform);
        
        if (!videoId) {
          throw new Error('Could not extract video ID from URL');
        }
        
        console.log(`Successfully extracted video ID: ${videoId} from platform: ${platform}`);
        
        // For demonstration, we're creating a download from the original URL
        // In a real app, you would process this through a backend
        const a = document.createElement('a');
        
        // In a real implementation, this would be the processed video URL from your backend
        // For now, we'll just use the original URL for demonstration
        a.href = url;
        a.download = `${platform.toLowerCase()}-video-${videoId}.mp4`;
        document.body.appendChild(a);
        
        // Wait for progress to complete for better UX
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Trigger download
        a.click();
        
        // Clean up
        document.body.removeChild(a);
      };
      
      await downloadVideo();
      
      toast.success(`Download started for your ${platform} video!`);
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
  
  // Extract video ID from different platform URLs - with enhanced YouTube support
  const extractVideoId = (url: string, platform: string): string | null => {
    try {
      const urlObj = new URL(url);
      
      switch(platform) {
        case 'YouTube':
          // Handle youtube.com/watch?v=VIDEO_ID
          if (urlObj.pathname.includes('/watch')) {
            return urlObj.searchParams.get('v');
          }
          // Handle youtu.be/VIDEO_ID
          else if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
          }
          // Handle youtube.com/shorts/VIDEO_ID
          else if (urlObj.pathname.includes('/shorts/')) {
            return urlObj.pathname.split('/shorts/')[1]?.split('/')[0] || null;
          }
          // Handle youtube.com/embed/VIDEO_ID
          else if (urlObj.pathname.includes('/embed/')) {
            return urlObj.pathname.split('/embed/')[1]?.split('/')[0] || null;
          }
          // Handle youtube.com/v/VIDEO_ID
          else if (urlObj.pathname.includes('/v/')) {
            return urlObj.pathname.split('/v/')[1]?.split('/')[0] || null;
          }
          break;
        
        case 'Instagram':
          // Handle instagram.com/p/CODE/ or instagram.com/reel/CODE/
          const matches = urlObj.pathname.match(/\/(p|reel|tv)\/([^\/]+)/);
          return matches ? matches[2] : null;
        
        case 'Facebook':
          // Simple extraction for Facebook videos
          const fbVideoId = urlObj.pathname.split('/').pop();
          return fbVideoId || null;
          
        case 'Twitter':
          // Handle twitter.com/user/status/ID
          if (urlObj.pathname.includes('/status/')) {
            return urlObj.pathname.split('/status/')[1]?.split('/')[0] || null;
          }
          break;
          
        case 'Pinterest':
          // Handle pinterest.com/pin/ID/
          if (urlObj.pathname.includes('/pin/')) {
            return urlObj.pathname.split('/pin/')[1]?.split('/')[0] || null;
          }
          break;
          
        default:
          return null;
      }
      
      return null;
    } catch (e) {
      console.error("Error extracting video ID:", e);
      return null;
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
