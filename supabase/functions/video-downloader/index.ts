
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
