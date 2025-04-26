
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">SnapSaver</h3>
            <p className="text-sm text-muted-foreground">
              The fastest way to download videos from your favorite social media platforms.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Platforms</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/facebook" className="text-muted-foreground hover:text-snapsaver-purple">Facebook</Link></li>
              <li><Link to="/instagram" className="text-muted-foreground hover:text-snapsaver-purple">Instagram</Link></li>
              <li><Link to="/twitter" className="text-muted-foreground hover:text-snapsaver-purple">Twitter/X</Link></li>
              <li><Link to="/youtube" className="text-muted-foreground hover:text-snapsaver-purple">YouTube</Link></li>
              <li><Link to="/pinterest" className="text-muted-foreground hover:text-snapsaver-purple">Pinterest</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-snapsaver-purple">How It Works</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-snapsaver-purple">FAQs</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-snapsaver-purple">Blog</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-snapsaver-purple">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-snapsaver-purple">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-snapsaver-purple">Copyright</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-snapsaver-purple">DMCA</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          &copy; {currentYear} SnapSaver. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
