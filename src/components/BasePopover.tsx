'use client';
import { useEffect, useId, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, Transition } from 'framer-motion';
import { ArrowLeftIcon } from 'lucide-react';

// Explicitly cast TRANSITION to the correct type
const TRANSITION: Transition = { type: 'spring', bounce: 0.1, duration: 0.5 };

interface PopoverProps {
  title: string;
  children: React.ReactNode;
  buttonLabel?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onClick?: () => void;
}

export default function BasePopover({
  title,
  children,
  buttonLabel = 'Open',
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
      <div className="relative flex items-center justify-center">
        {/* Trigger Button */}
        <motion.div
          key="button"
          className="relative group"
          layoutId={`popover-${uniqueId}`}
          onClick={handleToggle}
        >
          <motion.span
            layoutId={`popover-label-${uniqueId}`}
            className="hover:text-green-600 dark:hover:text-green-600 text-gray-800 dark:text-gray-200 transition-all duration-300 cursor-pointer"
          >
            {buttonLabel}
          </motion.span>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-full h-0.5 bg-green-600 transition-all duration-300"></div>
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
                className="w-full max-w-[900px] md:h-[635px] bg-white dark:bg-[#111827] shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden"
              >
                {/* Left Panel */}
                <div className="hidden md:flex flex-col justify-between h-full w-1/2 bg-gradient-to-b from-[#A17E25] to-[#8C6A1A] dark:bg-[#1F1F1F] text-white p-6">
                  <div>
                    <h2 className="text-[24px] font-bold">Lachs Golden ERP</h2>
                    <p className="mt-2 text-[16px]">Enterprise Resource Planning Solution</p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ArrowLeftIcon className="w-5 h-5 mr-2 text-white" />
                      <span className="text-[14px]">AI-Powered Analytics & Insights</span>
                    </li>
                    {/* Add more bullets as needed */}
                  </ul>
                </div>

                {/* Content Panel */}
                <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                  <div className="w-full max-w-md space-y-4">
                    <h3 className="text-[24px] font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
                    <div className="flex flex-col items-center justify-center">
                      {children}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}