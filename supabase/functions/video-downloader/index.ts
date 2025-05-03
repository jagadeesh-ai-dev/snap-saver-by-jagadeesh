
// Supabase Edge Function to handle video downloads using Auto Download All-in-One API
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

    // Use the API key directly (in a real production app, we would use the Supabase secret system)
    const RAPID_API_KEY = "565479a35cmsh198b1c697bc8727p14fb1ejsn1727bfaeb1f5";
    if (!RAPID_API_KEY) {
      throw new Error("RapidAPI key not configured");
    }

    // First try the unified Auto Download API for all platforms
    try {
      const response = await fetch('https://auto-download-all-in-one-big.p.rapidapi.com/v1/social/autolink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'auto-download-all-in-one-big.p.rapidapi.com',
          'x-rapidapi-key': RAPID_API_KEY,
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      console.log("Auto Download API Response:", data);

      if (!response.ok) {
        if (data.message?.includes("not subscribed") || response.status === 429) {
          // Handle subscription error specifically
          console.error("API subscription error:", data);
          if (platform === 'YouTube') {
            console.log("Falling back to YouTube MP3 API for YouTube");
            // Continue to YouTube fallback
          } else {
            return new Response(
              JSON.stringify({ 
                error: "API subscription required", 
                message: `The RapidAPI key is not subscribed to the Auto Download All-in-One API for ${platform}. Please subscribe to the API on RapidAPI or use a different key.`,
                apiName: "Auto Download All-in-One",
                subscriptionUrl: "https://rapidapi.com/kpverse/api/auto-download-all-in-one-big/pricing",
                platform
              }),
              { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          console.error("API error response:", data);
          if (platform === 'YouTube') {
            console.log("Falling back to YouTube MP3 API for YouTube");
            // Continue to YouTube fallback
          } else {
            throw new Error(data.message || `Failed to process ${platform} video URL`);
          }
        }
      } else if (data.links && data.links.length > 0) {
        // Successfully got links from auto download API
        
        // Find the best video link
        const videoLinks = data.links.filter(link => 
          typeof link.type === 'string' && link.type.includes('video')
        );
        
        if (videoLinks.length > 0) {
          // Sort by quality (if available) and pick the highest
          const bestVideoLink = videoLinks.sort((a, b) => 
            (b.quality?.toString() || '').localeCompare(a.quality?.toString() || '')
          )[0];
          
          console.log("Found video link:", bestVideoLink);
          
          const videoData = {
            title: data.title || `${platform} Video`,
            downloadUrl: bestVideoLink.link,
            platform,
            videoId: data.id || extractVideoId(url, platform),
            thumbnail: data.thumbnail || '',
            message: 'Download started! Video will save to your Downloads folder.',
            fileSize: bestVideoLink.size || data.size || 'Unknown size',
            duration: data.duration || 'Unknown duration',
            quality: bestVideoLink.quality || data.quality || 'HD',
            author: data.author || `${platform} Creator`,
            isVideo: true
          };

          return new Response(
            JSON.stringify(videoData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // If we got here with YouTube and no video links were found,
      // or the API returned an error for YouTube, fall through to the YouTube MP3 API
    } catch (error) {
      console.error("Error with Auto Download API:", error);
      // For non-YouTube platforms, we need to return an error
      if (platform !== 'YouTube') {
        return new Response(
          JSON.stringify({ 
            error: error.message || 'Failed to process video',
            platform: platform || 'Unknown',
            url: url || 'Unknown URL',
            message: `Failed to download ${platform} video. The API may require a subscription.`
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // For YouTube, continue to fallback
      console.log("Falling back to YouTube API for YouTube");
    }
    
    // YouTube-specific video download API (separate from MP3)
    if (platform === 'YouTube') {
      try {
        const videoId = extractYoutubeId(url);
        if (!videoId) {
          throw new Error("Could not extract YouTube video ID");
        }
        
        // Try YouTube Video Downloader API (different from MP3)
        try {
          console.log("Trying YouTube Video Downloader API");
          const videoDownloaderResponse = await fetch(`https://youtube-video-download-info.p.rapidapi.com/dl?id=${videoId}`, {
            method: 'GET',
            headers: {
              'x-rapidapi-host': 'youtube-video-download-info.p.rapidapi.com',
              'x-rapidapi-key': RAPID_API_KEY,
            },
          });
          
          const videoData = await videoDownloaderResponse.json();
          console.log("YouTube Video Downloader API Response:", videoData);
          
          if (videoDownloaderResponse.ok && videoData.link && videoData.link.length > 0) {
            // Find best quality MP4 video
            const mp4Videos = videoData.link.filter(item => 
              item.url && item.type && item.type.includes('video/mp4')
            );
            
            if (mp4Videos.length > 0) {
              // Sort by quality and pick the highest
              const bestQualityVideo = mp4Videos.sort((a, b) => (b.quality || 0) - (a.quality || 0))[0];
              
              return new Response(
                JSON.stringify({
                  title: videoData.title || 'YouTube Video',
                  downloadUrl: bestQualityVideo.url,
                  platform: 'YouTube',
                  videoId: videoId,
                  message: 'Download started! Video will be processed as MP4.',
                  author: videoData.author || 'YouTube Creator',
                  quality: bestQualityVideo.quality ? `${bestQualityVideo.quality}p` : 'HD',
                  fileSize: bestQualityVideo.size || 'Unknown size',
                  thumbnail: videoData.thumb || '',
                  isVideo: true
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        } catch (videoApiError) {
          console.error("YouTube Video Downloader API error:", videoApiError);
          // Fall through to MP3 API
        }

        // If video downloader didn't work, fallback to MP3
        console.log("Falling back to YouTube MP3 API");
        const response = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com',
            'x-rapidapi-key': RAPID_API_KEY,
          },
        });

        const data = await response.json();
        console.log("YouTube MP3 API Response:", data);

        if (data.status === "ok" && data.link) {
          return new Response(
            JSON.stringify({
              title: data.title || 'YouTube Video',
              downloadUrl: data.link,
              platform: 'YouTube',
              videoId: videoId,
              message: 'Download started! Only audio (MP3) version is available for this video.',
              author: 'YouTube Creator',
              quality: 'MP3 Audio',
              fileSize: data.filesize ? `${Math.round(data.filesize / 1024)} KB` : 'Unknown size',
              isAudioOnly: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (data.status === "processing") {
          // Handle videos that are still being processed
          return new Response(
            JSON.stringify({
              error: "Video is still processing",
              message: "This video is currently being processed by YouTube. Please try again in a few minutes.",
              title: data.title || "YouTube Video",
              videoId: videoId,
              duration: data.duration || 'Unknown duration',
              platform: 'YouTube'
            }),
            { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error(data.msg || "Failed to process YouTube video");
        }
      } catch (ytError) {
        console.error("YouTube API error:", ytError);
        
        return new Response(
          JSON.stringify({ 
            error: "YouTube download failed", 
            message: ytError.message || "Could not download this YouTube video.",
            platform: 'YouTube'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // If we get here, it means none of the methods worked
    return new Response(
      JSON.stringify({ 
        error: "Download failed", 
        message: `Could not download video from ${platform}. API subscription may be required.`,
        platform: platform,
        url: url
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing video:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process video',
        platform: req.json?.platform || 'Unknown',
        url: req.json?.url || 'Unknown URL'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to extract YouTube video ID from various URL formats
function extractYoutubeId(url) {
  try {
    const urlObj = new URL(url);
    
    // Handle youtube.com URLs
    if (urlObj.hostname.includes('youtube.com')) {
      // Regular videos: youtube.com/watch?v=VIDEO_ID
      const videoParam = urlObj.searchParams.get('v');
      if (videoParam) return videoParam;
      
      // Shorts: youtube.com/shorts/VIDEO_ID
      if (urlObj.pathname.includes('/shorts/')) {
        return urlObj.pathname.split('/shorts/')[1];
      }
    }
    
    // Handle youtu.be URLs: youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.substring(1);
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting YouTube ID:", error);
    return null;
  }
}

// Generic function to extract video IDs from different platforms
function extractVideoId(url, platform) {
  if (platform === 'YouTube') {
    return extractYoutubeId(url);
  }
  
  try {
    const urlObj = new URL(url);
    
    // Extract the last part of the path as a generic ID
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      return pathParts[pathParts.length - 1];
    }
    
    return urlObj.pathname;
  } catch (error) {
    console.error(`Error extracting ${platform} ID:`, error);
    return url;
  }
}

