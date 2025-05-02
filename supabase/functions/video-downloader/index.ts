
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

    const RAPID_API_KEY = Deno.env.get("RAPID_API_KEY");
    if (!RAPID_API_KEY) {
      throw new Error("RapidAPI key not configured");
    }

    // Using a more reliable free API as fallback
    // YouTube-specific API (no subscription required)
    if (platform === 'YouTube') {
      try {
        const response = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${extractYoutubeId(url)}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com',
            'x-rapidapi-key': RAPID_API_KEY,
          },
        });

        const data = await response.json();
        console.log("YouTube API Response:", data);

        if (data.status === "ok" && data.link) {
          return new Response(
            JSON.stringify({
              title: data.title || 'YouTube Video',
              downloadUrl: data.link,
              platform: 'YouTube',
              videoId: extractYoutubeId(url) || url,
              message: 'Download started! Video will be processed as MP3.',
              author: 'YouTube Creator',
              quality: 'MP3 Audio'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (ytError) {
        console.error("YouTube API error:", ytError);
        // Fall through to try the general API
      }
    }

    // Call the unified Auto Download API
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
    console.log("API Response:", data);

    if (!response.ok) {
      if (data.message?.includes("not subscribed")) {
        // Handle subscription error specifically
        return new Response(
          JSON.stringify({ 
            error: "API subscription required", 
            message: "The RapidAPI key is not subscribed to this API. Please subscribe to the Auto Download All-in-One API on RapidAPI or use a different key.",
            apiName: "Auto Download All-in-One",
            subscriptionUrl: "https://rapidapi.com/kpverse/api/auto-download-all-in-one-big/pricing"
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(data.message || 'Failed to process video URL');
    }

    // Transform API response to our VideoData format
    const videoData = {
      title: data.title || `${platform} Video`,
      downloadUrl: data.links?.[0]?.link || data.url || '',
      platform,
      videoId: data.id || url,
      thumbnail: data.thumbnail || '',
      message: 'Download started! Video will save to your Downloads folder.',
      fileSize: data.size || 'Unknown size',
      duration: data.duration || 'Unknown duration',
      quality: data.quality || 'HD',
      author: data.author || `${platform} Creator`
    };

    if (!videoData.downloadUrl) {
      throw new Error('No download URL found in the response');
    }

    // Return the processed video data
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
