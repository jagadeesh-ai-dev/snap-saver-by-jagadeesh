
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { X } from 'lucide-react';

interface AdModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onCancel: () => void;
  title: string;
  platform: string;
}

const AdModal = ({ isOpen, onComplete, onCancel, title, platform }: AdModalProps) => {
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen) {
      setTimeRemaining(15);
      setProgress(0);
      
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newValue = prev - 1;
          setProgress(((15 - newValue) / 15) * 100);
          
          if (newValue <= 0) {
            clearInterval(timer);
            onComplete();
          }
          
          return newValue;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, onComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onCancel();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Your download is preparing</DialogTitle>
          <Button 
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background 
                      transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 
                      focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-center h-40 bg-gray-100 rounded">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">
                  {platform} Video
                </p>
                <p className="text-sm text-gray-500 mb-4">{title || 'Your video is being processed'}</p>
                <p className="text-xs text-gray-400">
                  This helps us keep the service free
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Download begins in:</span>
              <span className="font-semibold">{timeRemaining}s</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full" 
              disabled={timeRemaining > 0} 
              onClick={onComplete}
            >
              {timeRemaining > 0 ? `Please wait (${timeRemaining}s)` : 'Download Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdModal;
