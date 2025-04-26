
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Facebook, Instagram, Twitter, Youtube, BookMarked, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const platforms = [
    {
      name: 'Facebook',
      path: '/facebook',
      Icon: Facebook,
      color: '#1877F2'
    },
    {
      name: 'Instagram',
      path: '/instagram',
      Icon: Instagram,
      color: '#E4405F'
    },
    {
      name: 'Twitter',
      path: '/twitter',
      Icon: Twitter,
      color: '#1DA1F2'
    },
    {
      name: 'YouTube',
      path: '/youtube',
      Icon: Youtube,
      color: '#FF0000'
    },
    {
      name: 'Pinterest',
      path: '/pinterest',
      Icon: BookMarked,
      color: '#BD081C'
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
          <span className="text-2xl font-bold text-snapsaver-purple">
            Snap<span className="text-snapsaver-blue">Saver</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {platforms.map((platform) => (
            <Link
              key={platform.name}
              to={platform.path}
              className={`platform-tab ${location.pathname === platform.path ? 'active' : ''}`}
            >
              <platform.Icon size={20} color={location.pathname === platform.path ? 'white' : platform.color} />
              <span>{platform.name}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b shadow-lg md:hidden z-50">
            <div className="flex flex-col p-4 space-y-2">
              {platforms.map((platform) => (
                <Link
                  key={platform.name}
                  to={platform.path}
                  className={`platform-tab ${location.pathname === platform.path ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <platform.Icon size={20} color={location.pathname === platform.path ? 'white' : platform.color} />
                  <span>{platform.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
