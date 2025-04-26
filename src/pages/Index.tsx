
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Instagram, Twitter, Youtube, BookMarked, Download, ArrowRight } from 'lucide-react';

const platforms = [
  {
    name: 'Facebook',
    path: '/facebook',
    Icon: Facebook,
    color: '#1877F2',
    description: 'Download videos from Facebook posts, watch pages, and groups'
  },
  {
    name: 'Instagram',
    path: '/instagram',
    Icon: Instagram,
    color: '#E4405F',
    description: 'Save Instagram Reels, Stories, and post videos in high quality'
  },
  {
    name: 'Twitter',
    path: '/twitter',
    Icon: Twitter,
    color: '#1DA1F2',
    description: 'Download videos from tweets and Twitter/X profiles'
  },
  {
    name: 'YouTube',
    path: '/youtube',
    Icon: Youtube,
    color: '#FF0000',
    description: 'Save YouTube videos and Shorts in your preferred resolution'
  },
  {
    name: 'Pinterest',
    path: '/pinterest',
    Icon: BookMarked,
    color: '#BD081C',
    description: 'Download pin videos and idea pins in high quality'
  }
];

const Index = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-white to-snapsaver-purple/10">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Download Videos from <span className="text-snapsaver-purple">Any Platform</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              SnapSaver makes it easy to download videos from Facebook, Instagram, Twitter, YouTube, and Pinterest - all for free.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/youtube">
                <Button size="lg" className="download-button">
                  <Download size={20} />
                  Start Downloading
                </Button>
              </Link>
              <a href="#platforms">
                <Button size="lg" variant="outline">
                  Learn More
                  <ArrowRight size={16} className="ml-1" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Supported Platforms</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Choose your platform and start downloading videos in just a few clicks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <Link key={platform.name} to={platform.path}>
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-snapsaver-purple/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${platform.color}20` }}>
                        <platform.Icon size={24} color={platform.color} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{platform.name}</h3>
                        <p className="text-muted-foreground">{platform.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-snapsaver-gray-light">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How SnapSaver Works</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Download videos in three simple steps - no registration required
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 space-y-4">
              <div className="h-16 w-16 rounded-full bg-snapsaver-purple/20 flex items-center justify-center text-snapsaver-purple font-bold text-2xl mx-auto">1</div>
              <h3 className="text-xl font-medium">Copy Video URL</h3>
              <p className="text-muted-foreground">
                Find the video you want to download and copy its URL from the address bar or share menu
              </p>
            </div>
            
            <div className="text-center p-6 space-y-4">
              <div className="h-16 w-16 rounded-full bg-snapsaver-purple/20 flex items-center justify-center text-snapsaver-purple font-bold text-2xl mx-auto">2</div>
              <h3 className="text-xl font-medium">Paste URL</h3>
              <p className="text-muted-foreground">
                Choose the correct platform tab and paste the copied URL into the input field
              </p>
            </div>
            
            <div className="text-center p-6 space-y-4">
              <div className="h-16 w-16 rounded-full bg-snapsaver-purple/20 flex items-center justify-center text-snapsaver-purple font-bold text-2xl mx-auto">3</div>
              <h3 className="text-xl font-medium">Download</h3>
              <p className="text-muted-foreground">
                Click the download button and save the video to your device in your preferred quality
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Find answers to common questions about SnapSaver
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-2">Is SnapSaver free to use?</h3>
                <p className="text-muted-foreground">
                  Yes, SnapSaver is completely free to use. You can download videos from all supported platforms without any cost.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-2">Do I need to create an account?</h3>
                <p className="text-muted-foreground">
                  No, you can use SnapSaver without registration. However, creating an account allows you to save your download history.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-2">What video quality can I download?</h3>
                <p className="text-muted-foreground">
                  SnapSaver offers various quality options depending on the platform and original video quality, from low resolution to HD.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
