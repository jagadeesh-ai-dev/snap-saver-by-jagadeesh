
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from './ui/progress';
import AdModal from './AdModal';
import { DownloadService, VideoData } from '@/utils/DownloadService';

interface DownloadFormProps {
  platform: string;
  platformColor: string;
}

const DownloadForm = ({ platform, platformColor }: DownloadFormProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    // Validate if URL seems to be from the correct platform
    if (!DownloadService.validatePlatformUrl(url, platform)) {
      toast.error(`This doesn't look like a ${platform} URL. Please enter a valid ${platform} URL`);
      return;
    }
    
    setIsLoading(true);
    setShowProgress(true);
    setDownloadProgress(0);
    setError(null);
    
    // Start progress animation
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 95 ? 95 : newProgress; // Max out at 95% until actual completion
      });
    }, 300);

    try {
      // Fetch the download link
      const data = await DownloadService.getDownloadUrl(url.trim(), platform);
      
      console.log("Video data received:", data);
      
      // Complete the progress bar to 100%
      setDownloadProgress(100);
      setVideoData(data);
      
      // Show ad modal
      setShowAdModal(true);
      
    } catch (error) {
      console.error("Download error:", error);
      
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      if (error instanceof Error && error.message.includes("API subscription required")) {
        toast.error("API Subscription Required", {
          description: "The developer needs to subscribe to the RapidAPI service for this feature to work.",
          action: {
            label: "Learn More",
            onClick: () => window.open("https://rapidapi.com/kpverse/api/auto-download-all-in-one-big/pricing", "_blank"),
          },
          duration: 10000,
        });
      } else {
        toast.error(`Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setShowProgress(false);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };
  
  const handleAdComplete = () => {
    setShowAdModal(false);
    
    // After ad completes, trigger the actual download
    if (videoData) {
      DownloadService.triggerDownload(videoData);
      
      // Show success message with any additional info
      toast.success(videoData.message || `Download started for your ${platform} video!`);
      
      // Reset form
      setUrl('');
      setTimeout(() => {
        setShowProgress(false);
        setVideoData(null);
      }, 1000);
    }
  };
  
  const handleAdCancel = () => {
    setShowAdModal(false);
    toast.info("Download canceled");
    
    setTimeout(() => {
      setShowProgress(false);
      setVideoData(null);
    }, 1000);
  };
  
  return (
    <>
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
              <span>{videoData ? 'Download ready' : 'Processing...'}</span>
              <span>{Math.round(downloadProgress)}%</span>
            </div>
            <Progress value={downloadProgress} className="h-2" />
          </div>
        )}
        
        {error && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-md flex items-start gap-3 text-red-800">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Unable to download video</p>
              <p className="text-sm mt-1">{error}</p>
              {error.includes("API subscription required") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs border-red-300 hover:bg-red-100"
                  onClick={() => window.open("https://rapidapi.com/kpverse/api/auto-download-all-in-one-big/pricing", "_blank")}
                >
                  Subscribe to API
                </Button>
              )}
            </div>
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
      
      {/* Ad Modal */}
      <AdModal
        isOpen={showAdModal}
        onComplete={handleAdComplete}
        onCancel={handleAdCancel}
        title={videoData?.title || ''}
        platform={platform}
      />
    </>
  );
};

export default DownloadForm;
