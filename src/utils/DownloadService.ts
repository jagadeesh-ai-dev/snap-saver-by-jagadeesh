import { supabase } from "@/integrations/supabase/client";

export interface VideoData {
  title: string;
  downloadUrl: string;
  platform: string;
  videoId: string;
  thumbnail?: string;
  message?: string;
  fileSize?: string;
  duration?: string;
  quality?: string;
  author?: string;
}

export class DownloadService {
  /**
   * Fetches the real download URL for a video from the given platform
   * @param url The user-provided URL of the video
   * @param platform The platform (YouTube, Instagram, etc.)
   * @returns VideoData containing download information
   */
  static async getDownloadUrl(url: string, platform: string): Promise<VideoData> {
    console.log(`Requesting download URL for: ${url} from platform: ${platform}`);
    
    try {
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
      
      console.log("Received video data:", data);
      return data as VideoData;
    } catch (error) {
      console.error("Error in getDownloadUrl:", error);
      throw error;
    }
  }
  
  /**
   * Triggers a file download in the browser
   * @param videoData The video data with download information
   */
  static triggerDownload(videoData: VideoData): void {
    try {
      const { downloadUrl, title, platform } = videoData;
      
      // Create a safe filename based on platform and video title
      const safeTitle = this.getSafeFilename(title || `${platform.toLowerCase()}-video`);
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${platform}-${safeTitle}-${timestamp}`;
      
      // Check if the URL is a direct file (ends with a video extension)
      const isDirectFile = /\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i.test(downloadUrl);
      
      if (isDirectFile) {
        // For direct video file URLs
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${filename}.mp4`;
        a.setAttribute('target', '_blank');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // For URLs that might need to be opened in a new tab (e.g. downloadable page)
        window.open(downloadUrl, "_blank");
      }
      
      console.log(`Download triggered for URL: ${downloadUrl}, filename: ${filename}.mp4`);
    } catch (error) {
      console.error("Error triggering download:", error);
      // Fallback to opening in a new tab if download fails
      window.open(videoData.downloadUrl, "_blank");
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

  /**
   * Creates a safe filename from a string by removing special characters
   * @param input The original filename or title
   * @returns A safe filename string
   */
  static getSafeFilename(input: string): string {
    // Remove special characters that aren't allowed in filenames
    let safe = input.replace(/[\\/:*?"<>|]/g, '-');
    // Trim to reasonable length
    safe = safe.substring(0, 50);
    // Replace multiple spaces/dashes with single dash
    safe = safe.replace(/\s+/g, '-').replace(/-+/g, '-');
    return safe;
  }

  /**
   * Gets a human-readable file size string
   * @param bytes Size in bytes
   * @returns Formatted file size string
   */
  static formatFileSize(bytes?: number): string {
    if (!bytes || bytes === 0) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }
}
