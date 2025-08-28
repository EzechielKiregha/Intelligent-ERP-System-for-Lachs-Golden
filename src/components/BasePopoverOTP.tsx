'use client';
import { useEffect, useId, useState } from 'react';
import { AnimatePresence, MotionConfig, Transition, motion } from 'framer-motion';
import { ArrowLeftIcon, Bell, Cross, EyeClosed, Minus, X } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

// Explicitly cast TRANSITION to the correct type
const TRANSITION: Transition = { type: 'spring', bounce: 0.1, duration: 0.5 };

interface PopoverProps {
  title: string;
  children: React.ReactNode;
  buttonLabel?: string;
  icon?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onClick?: () => void;
}

export default function BasePopoverOTP({
  title,
  children,
  buttonLabel,
  icon = false,
  isOpen: controlledIsOpen,
  onClose,
}: PopoverProps) {
  const uniqueId = useId();
  const [isOpen, setIsOpen] = useState(controlledIsOpen || false);

  // Sync controlled `isOpen` prop with internal state
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  // Close popover with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        if (onClose) onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && onClose) onClose();
  };

  return (
    <MotionConfig transition={TRANSITION}>
      <div className="relative flex items-center justify-center bg-transparent">
        {/* Trigger Button */}
        <motion.div
          key="button"
          className="relative group bg-transparent"
          layoutId={`popover-${uniqueId}`}
          onClick={handleToggle}
        >
          <motion.button
            layoutId={`popover-label-${uniqueId}`}
            className="transition-all duration-300 rounded-md bg-transparent cursor-pointer"
          >
            {buttonLabel ? buttonLabel : icon && (
              <Button variant="outline" size="icon" className="transition ease-in-out duration-150 hover:shadow-lg hover:scale-105 motion-safe:transform">
                <Bell className="h-5 w-5 text-[#A17E25] dark:text-[#D4AF37]" />
              </Button>
            )}
          </motion.button>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-full h-0.5 bg-sidebar-accent transition-all duration-300"></div>
        </motion.div>

        {/* Full-Page Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Popover Content */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="w-[60%] md:w-[50%] bg-sidebar rounded-lg text-gray-800 shadow-lg overflow-hidden relative flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center p-4 border-b border-gray-200">
                  <Button
                    variant={"ghost"}
                    onClick={() => {
                      setIsOpen(false);
                      if (onClose) onClose();
                    }}
                    className="flex items-center bg-sidebar-accent text-sidebar-accent-foreground hover:text-[#eebd73]"
                  >
                    <X size={20} className="mr-2" />
                  </Button>
                  <h3 className="text-lg font-semibold text-sidebar-foreground ml-auto">{title}</h3>
                </div>

                {/* Content */}
                <ScrollArea className="h-56 w-full border rounded-md p-2">
                  <div className="flex-1 min-h-full bg-sidebar flex flex-col items-center justify-center p-6 overflow-y-auto">
                    {children}
                  </div>
                </ScrollArea>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}