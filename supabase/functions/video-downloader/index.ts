
// Supabase Edge Function to handle video downloads
// Production implementation for extracting videos from various platforms

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { url, platform } = await req.json();
    console.log(`Processing ${platform} URL: ${url}`);

    // Validate inputs
    if (!url || !platform) {
      return new Response(
        JSON.stringify({ error: 'URL and platform are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Platform-specific video processing
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
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Return the video data
    return new Response(
      JSON.stringify(videoData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing video:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process video' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// YouTube video extraction using ytdl-core functionality (production implementation)
async function processYouTubeVideo(url: string) {
  console.log(`Extracting YouTube video from URL: ${url}`);
  
  // Extract video ID from URL
  let videoId = "";
  try {
    const urlObj = new URL(url);
    
    if (url.includes('youtu.be')) {
      videoId = urlObj.pathname.substring(1);
    } else if (url.includes('youtube.com/watch')) {
      videoId = urlObj.searchParams.get('v') || "";
    } else if (url.includes('youtube.com/shorts')) {
      videoId = urlObj.pathname.split('/shorts/')[1];
    }
  } catch (error) {
    console.error('Error extracting YouTube video ID:', error);
    throw new Error('Invalid YouTube URL');
  }
  
  if (!videoId) {
    throw new Error('Could not extract YouTube video ID');
  }
  
  try {
    // Using a third-party API service that specializes in YouTube extraction
    // Replace YOUR_RAPID_API_KEY with the actual key from your Supabase secrets
    const RAPID_API_KEY = Deno.env.get("RAPID_API_KEY");
    if (!RAPID_API_KEY) {
      throw new Error("YouTube API key not configured");
    }

    const apiURL = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
    
    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
      }
    });

    const data = await response.json();
    
    if (data.status === 'fail') {
      throw new Error(data.msg || "Failed to extract YouTube video");
    }
    
    // Get video info via oEmbed API for metadata (title, author, etc)
    const oEmbedResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    const videoInfo = await oEmbedResponse.json();
    
    return {
      title: videoInfo.title || `YouTube Video ${videoId}`,
      downloadUrl: data.link, // Direct download link from the API
      platform: 'YouTube',
      videoId: videoId,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      message: 'Download started! Video will save to your Downloads folder.',
      fileSize: data.filesize || 'Unknown size',
      duration: "Available after download",
      quality: data.quality || '128kbps', // Audio quality from API
      author: videoInfo.author_name || 'YouTube Creator'
    };
  } catch (error) {
    console.error('YouTube extraction error:', error);
    throw new Error(`Failed to extract YouTube video: ${error.message}`);
  }
}

// Instagram video extraction (production implementation)
async function processInstagramVideo(url: string) {
  console.log(`Extracting Instagram video from URL: ${url}`);
  
  // Extract Instagram shortcode from URL
  let shortcode = "";
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length > 0) {
      // The post ID is typically the last or second-to-last segment
      shortcode = pathParts[0] === 'p' || pathParts[0] === 'reel' ? pathParts[1] : pathParts[0];
    }
  } catch (error) {
    console.error('Error extracting Instagram shortcode:', error);
    throw new Error('Invalid Instagram URL');
  }
  
  if (!shortcode) {
    throw new Error('Could not extract Instagram post ID');
  }
  
  try {
    // Using a third-party API service for Instagram
    // Replace YOUR_RAPID_API_KEY with the actual key from your Supabase secrets
    const RAPID_API_KEY = Deno.env.get("RAPID_API_KEY");
    if (!RAPID_API_KEY) {
      throw new Error("Instagram API key not configured");
    }
    
    const apiURL = `https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com'
      }
    });
    
    const data = await response.json();
    
    if (!data.media || data.media.length === 0) {
      throw new Error("No media found in Instagram post");
    }
    
    // Find the first video in the media array
    const videoMedia = data.media.find((item: any) => item.type === 'video');
    
    if (!videoMedia) {
      throw new Error("No video found in Instagram post");
    }
    
    return {
      title: data.title || `Instagram Post ${shortcode}`,
      downloadUrl: videoMedia.url, // Direct download URL
      platform: 'Instagram',
      videoId: shortcode,
      thumbnail: data.thumbnail || '',
      message: 'Instagram video download complete!',
      fileSize: 'Unknown size', // Instagram API doesn't provide this
      duration: 'Unknown duration', // Instagram API doesn't provide this
      author: data.owner?.username || 'Instagram User'
    };
  } catch (error) {
    console.error('Instagram extraction error:', error);
    throw new Error(`Failed to extract Instagram video: ${error.message}`);
  }
}

// Facebook video extraction (production implementation)
async function processFacebookVideo(url: string) {
  console.log(`Extracting Facebook video from URL: ${url}`);
  
  // Extract Facebook video ID
  let videoId = "";
  try {
    // Facebook URLs have complex patterns
    const urlObj = new URL(url);
    
    if (url.includes('/videos/')) {
      const videoPath = url.split('/videos/')[1];
      videoId = videoPath.split('/')[0].split('?')[0];
    } else if (url.includes('fb.watch')) {
      videoId = urlObj.pathname.substring(1);
    } else if (url.includes('watch/?v=')) {
      videoId = urlObj.searchParams.get('v') || "";
    }
  } catch (error) {
    console.error('Error extracting Facebook video ID:', error);
    throw new Error('Invalid Facebook URL');
  }
  
  if (!videoId) {
    // If we couldn't identify a specific pattern, use the URL as ID
    videoId = url;
  }
  
  try {
    // Using a third-party API service for Facebook
    // Replace YOUR_RAPID_API_KEY with the actual key from your Supabase secrets
    const RAPID_API_KEY = Deno.env.get("RAPID_API_KEY");
    if (!RAPID_API_KEY) {
      throw new Error("Facebook API key not configured");
    }
    
    const apiURL = `https://facebook-reel-and-video-downloader.p.rapidapi.com/app/main.php?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'facebook-reel-and-video-downloader.p.rapidapi.com'
      }
    });
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.message || "Failed to extract Facebook video");
    }
    
    // Use the highest quality video available
    const downloadUrl = data.links?.hd || data.links?.sd || data.links?.Download || '';
    
    if (!downloadUrl) {
      throw new Error("No download URL found for Facebook video");
    }
    
    return {
      title: data.title || `Facebook Video`,
      downloadUrl: downloadUrl,
      platform: 'Facebook',
      videoId: videoId,
      thumbnail: data.thumbnail || '',
      message: 'Facebook video saved to your downloads!',
      fileSize: 'Unknown size', // API doesn't provide this
      duration: data.duration || 'Unknown duration',
      author: data.author || 'Facebook Page'
    };
  } catch (error) {
    console.error('Facebook extraction error:', error);
    throw new Error(`Failed to extract Facebook video: ${error.message}`);
  }
}

// Twitter video extraction (production implementation)
async function processTwitterVideo(url: string) {
  console.log(`Extracting Twitter video from URL: ${url}`);
  
  // Extract Twitter tweet ID
  let tweetId = "";
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Most Twitter URLs end with the tweet ID as the last path segment
    if (pathParts.length >= 3 && pathParts[1] === 'status') {
      tweetId = pathParts[2];
    } else if (pathParts.length >= 2 && pathParts[0] === 'x' && pathParts[pathParts.length - 2] === 'status') {
      // Handle x.com URLs
      tweetId = pathParts[pathParts.length - 1];
    }
  } catch (error) {
    console.error('Error extracting Twitter tweet ID:', error);
    throw new Error('Invalid Twitter URL');
  }
  
  if (!tweetId) {
    throw new Error('Could not extract Twitter tweet ID');
  }
  
  try {
    // Using a third-party API service for Twitter
    // Replace YOUR_RAPID_API_KEY with the actual key from your Supabase secrets
    const RAPID_API_KEY = Deno.env.get("RAPID_API_KEY");
    if (!RAPID_API_KEY) {
      throw new Error("Twitter API key not configured");
    }
    
    const apiURL = `https://twitter-downloader-download-twitter-videos-gifs-and-images.p.rapidapi.com/twitter?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'twitter-downloader-download-twitter-videos-gifs-and-images.p.rapidapi.com'
      }
    });
    
    const data = await response.json();
    
    if (!data.success || !data.download) {
      throw new Error("No video data found in Twitter post");
    }
    
    // Select the highest quality video
    const videoData = data.download.find((item: any) => item.type === 'mp4');
    
    if (!videoData) {
      throw new Error("No video found in Twitter post");
    }
    
    return {
      title: data.title || `Twitter Video ${tweetId}`,
      downloadUrl: videoData.url, // Direct download URL
      platform: 'Twitter',
      videoId: tweetId,
      thumbnail: data.media?.thumbnail || '',
      message: 'Twitter video download successful!',
      fileSize: videoData.size || 'Unknown size',
      duration: 'Unknown duration', // Twitter API doesn't provide this
      author: data.author?.name || 'Twitter User'
    };
  } catch (error) {
    console.error('Twitter extraction error:', error);
    throw new Error(`Failed to extract Twitter video: ${error.message}`);
  }
}

// Pinterest video extraction (production implementation)
async function processPinterestVideo(url: string) {
  console.log(`Extracting Pinterest video from URL: ${url}`);
  
  // Extract Pinterest pin ID from URL
  let pinId = "";
  try {
    // Handle different Pinterest URL formats
    if (url.includes('pin.it')) {
      // Short URL format: https://pin.it/abc123
      const urlObj = new URL(url);
      pinId = urlObj.pathname.substring(1); // Remove leading slash
    } else if (url.includes('pinterest.com/pin/')) {
      // Regular URL format: https://www.pinterest.com/pin/123456789/
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && pathParts[0] === 'pin') {
        pinId = pathParts[1];
      }
    }
  } catch (error) {
    console.error('Error extracting Pinterest pin ID:', error);
    throw new Error('Invalid Pinterest URL');
  }
  
  if (!pinId) {
    throw new Error('Could not extract Pinterest pin ID');
  }
  
  console.log(`Extracted Pinterest pin ID: ${pinId}`);
  
  try {
    // Using a third-party API service for Pinterest
    // Replace YOUR_RAPID_API_KEY with the actual key from your Supabase secrets
    const RAPID_API_KEY = Deno.env.get("RAPID_API_KEY");
    if (!RAPID_API_KEY) {
      throw new Error("Pinterest API key not configured");
    }
    
    const apiURL = `https://pinterest-video-and-image-downloader.p.rapidapi.com/pinterest?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'pinterest-video-and-image-downloader.p.rapidapi.com'
      }
    });
    
    const data = await response.json();
    
    if (!data.status || !data.data) {
      throw new Error("Failed to extract Pinterest video");
    }
    
    // Find the video URL
    let videoUrl = '';
    let thumbnailUrl = '';
    
    if (data.data.videos && data.data.videos.length > 0) {
      videoUrl = data.data.videos[0].url;
    } else if (data.data.video_url) {
      videoUrl = data.data.video_url;
    } else {
      throw new Error("No video found in Pinterest pin");
    }
    
    if (data.data.thumbnail) {
      thumbnailUrl = data.data.thumbnail;
    }
    
    return {
      title: data.data.title || `Pinterest Pin ${pinId}`,
      downloadUrl: videoUrl,
      platform: 'Pinterest',
      videoId: pinId,
      thumbnail: thumbnailUrl,
      message: 'Pinterest video saved to your device!',
      fileSize: 'Unknown size', // Pinterest API doesn't provide this
      duration: 'Unknown duration', // Pinterest API doesn't provide this
      author: data.data.username || 'Pinterest Creator',
      quality: 'HD'
    };
  } catch (error) {
    console.error('Pinterest extraction error:', error);
    throw new Error(`Failed to extract Pinterest video: ${error.message}`);
  }
}
