
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, platform } = await req.json();

    if (!url || !platform) {
      return new Response(
        JSON.stringify({ error: 'URL and platform are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${platform} URL: ${url}`);

    // Basic URL validation
    try {
      const processedUrl = url.trim();
      new URL(processedUrl);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Platform-specific processing logic
    let videoData;
    
    switch (platform) {
      case 'YouTube':
        videoData = await processYouTubeVideo(url);
        break;
      case 'Instagram':
        videoData = await processInstagramVideo(url);
        break;
      case 'Facebook':
        videoData = await processFacebookVideo(url);
        break;
      case 'Twitter':
        videoData = await processTwitterVideo(url);
        break;
      case 'Pinterest':
        videoData = await processPinterestVideo(url);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported platform' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(videoData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to process video download request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Platform-specific video processing functions
async function processYouTubeVideo(url: string) {
  try {
    // Extract video ID
    let videoId = extractVideoId(url, 'YouTube');
    if (!videoId) {
      throw new Error('Could not extract YouTube video ID');
    }

    // For demo purposes, we'll use a public YouTube API endpoint
    // In a production app, you should use the official YouTube API with your API key
    const apiUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // For demonstration purposes only - this is not the real download link
    // In a real implementation, you'd use a proper YouTube API or service like ytdl
    return {
      title: data.title,
      downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: data.thumbnail_url,
      platform: 'YouTube',
      videoId: videoId,
      message: "Due to YouTube Terms of Service, we provide a direct play link. You'll need a browser extension to download the actual video."
    };
  } catch (error) {
    console.error('YouTube processing error:', error);
    throw new Error('Failed to process YouTube URL: ' + error.message);
  }
}

async function processInstagramVideo(url: string) {
  try {
    // For demo purposes only
    const videoId = extractVideoId(url, 'Instagram');
    if (!videoId) {
      throw new Error('Could not extract Instagram video ID');
    }
    
    // In a real implementation, you'd use Instagram's API or a third-party service
    return {
      title: "Instagram Video",
      downloadUrl: url,
      platform: 'Instagram',
      videoId: videoId,
      message: "This is a demo implementation. In production, you would use Instagram's API."
    };
  } catch (error) {
    console.error('Instagram processing error:', error);
    throw new Error('Failed to process Instagram URL: ' + error.message);
  }
}

async function processFacebookVideo(url: string) {
  try {
    // For demo purposes only
    const videoId = extractVideoId(url, 'Facebook');
    if (!videoId) {
      throw new Error('Could not extract Facebook video ID');
    }
    
    // In a real implementation, you'd use Facebook's API or a third-party service
    return {
      title: "Facebook Video",
      downloadUrl: url,
      platform: 'Facebook',
      videoId: videoId,
      message: "This is a demo implementation. In production, you would use Facebook's Graph API."
    };
  } catch (error) {
    console.error('Facebook processing error:', error);
    throw new Error('Failed to process Facebook URL: ' + error.message);
  }
}

async function processTwitterVideo(url: string) {
  try {
    // For demo purposes only
    const videoId = extractVideoId(url, 'Twitter');
    if (!videoId) {
      throw new Error('Could not extract Twitter video ID');
    }
    
    // In a real implementation, you'd use Twitter's API or a third-party service
    return {
      title: "Twitter Video",
      downloadUrl: url,
      platform: 'Twitter',
      videoId: videoId,
      message: "This is a demo implementation. In production, you would use Twitter's API."
    };
  } catch (error) {
    console.error('Twitter processing error:', error);
    throw new Error('Failed to process Twitter URL: ' + error.message);
  }
}

async function processPinterestVideo(url: string) {
  try {
    // For demo purposes only
    const videoId = extractVideoId(url, 'Pinterest');
    if (!videoId) {
      throw new Error('Could not extract Pinterest video ID');
    }
    
    // In a real implementation, you'd use Pinterest's API or a third-party service
    return {
      title: "Pinterest Video",
      downloadUrl: url,
      platform: 'Pinterest',
      videoId: videoId,
      message: "This is a demo implementation. In production, you would use Pinterest's API."
    };
  } catch (error) {
    console.error('Pinterest processing error:', error);
    throw new Error('Failed to process Pinterest URL: ' + error.message);
  }
}

// Reuse the existing video ID extraction logic
function extractVideoId(url: string, platform: string): string | null {
  try {
    if (platform === 'YouTube') {
      // Handle YouTube URLs without protocol
      let processedUrl = url.trim();
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }
      
      console.log("Extracting from URL:", processedUrl);
      
      // Pattern for YouTube video ID extraction - comprehensive regex approach
      const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
      const match = processedUrl.match(youtubeRegex);
      
      if (match && match[1]) {
        console.log("Matched YouTube ID via regex:", match[1]);
        return match[1];
      }
      
      // If regex doesn't work, try URL parsing
      try {
        const urlObj = new URL(processedUrl);
        
        // Handle youtube.com/watch?v=VIDEO_ID
        if (urlObj.pathname.includes('/watch')) {
          const videoId = urlObj.searchParams.get('v');
          console.log("Extracted via /watch path:", videoId);
          return videoId;
        }
        // Handle youtu.be/VIDEO_ID
        else if (urlObj.hostname.includes('youtu.be')) {
          const videoId = urlObj.pathname.slice(1);
          console.log("Extracted via youtu.be path:", videoId);
          return videoId;
        }
        // Handle youtube.com/shorts/VIDEO_ID
        else if (urlObj.pathname.includes('/shorts/')) {
          const videoId = urlObj.pathname.split('/shorts/')[1]?.split('/')[0] || null;
          console.log("Extracted via /shorts path:", videoId);
          return videoId;
        }
        // Handle youtube.com/embed/VIDEO_ID
        else if (urlObj.pathname.includes('/embed/')) {
          const videoId = urlObj.pathname.split('/embed/')[1]?.split('/')[0] || null;
          console.log("Extracted via /embed path:", videoId);
          return videoId;
        }
        // Handle youtube.com/v/VIDEO_ID
        else if (urlObj.pathname.includes('/v/')) {
          const videoId = urlObj.pathname.split('/v/')[1]?.split('/')[0] || null;
          console.log("Extracted via /v path:", videoId);
          return videoId;
        }
        
        console.log("No YouTube ID extracted via URL parsing");
      } catch (e) {
        console.error("URL parsing error:", e);
      }
      
      console.log("No YouTube ID could be extracted");
      return null;
    } else {
      // For other platforms, use the existing extraction logic
      const urlObj = new URL(url);
      
      switch(platform) {
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
    }
  } catch (e) {
    console.error("Error extracting video ID:", e);
    return null;
  }
}
