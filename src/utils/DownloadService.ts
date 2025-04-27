
import { supabase } from "@/integrations/supabase/client";

export interface VideoData {
  title: string;
  downloadUrl: string;
  platform: string;
  videoId: string;
  thumbnail?: string;
  message?: string;
}

export class DownloadService {
  /**
   * Fetches the real download URL for a video from the given platform
   * @param url The user-provided URL of the video
   * @param platform The platform (YouTube, Instagram, etc.)
   * @returns VideoData containing download information
   */
  static async getDownloadUrl(url: string, platform: string): Promise<VideoData> {
    const { data, error } = await supabase.functions.invoke('video-downloader', {
      body: { url, platform },
    });
    
    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`Failed to get download URL: ${error.message}`);
    }
    
    if (!data || !data.downloadUrl) {
      throw new Error('No download URL returned from the server');
    }
    
    return data as VideoData;
  }
  
  /**
   * Triggers a file download in the browser
   * @param url The direct download URL
   * @param filename The filename to save as
   */
  static triggerDownload(url: string, filename: string): void {
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
      // Fallback to opening in a new tab if download fails
      window.open(url, "_blank");
    }
  }
  
  /**
   * Validates if a URL seems to be from a specific platform
   * @param url The URL to validate
   * @param platform The platform to check against
   * @returns boolean indicating if the URL matches the platform
   */
  static validatePlatformUrl(url: string, platform: string): boolean {
    try {
      // Process URL for consistency
      let processedUrl = url.trim();
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }
      
      const urlObj = new URL(processedUrl);
      
      // Platform-specific domain checks
      const domainCheck: Record<string, string[]> = {
        'YouTube': ['youtube.com', 'youtu.be', 'youtube', 'www.youtube.com', 'm.youtube.com'],
        'Instagram': ['instagram.com', 'www.instagram.com', 'instagr.am'],
        'Facebook': ['facebook.com', 'fb.com', 'fb.watch', 'www.facebook.com'],
        'Twitter': ['twitter.com', 'x.com', 'www.twitter.com'],
        'Pinterest': ['pinterest.com', 'pin.it', 'www.pinterest.com']
      };
      
      const platformDomains = domainCheck[platform] || [];
      return platformDomains.some(domain => urlObj.hostname.includes(domain));
    } catch (error) {
      console.error("URL validation error:", error);
      return false;
    }
  }
}
