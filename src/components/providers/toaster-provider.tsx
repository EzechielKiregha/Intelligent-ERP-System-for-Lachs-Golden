'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      toastOptions={{
        duration: 5000,
        className: 'bg-white dark:bg-[#0f1522] border-l-4 border-green-500 dark:border-green-400 text-gray-800 dark:text-gray-200 p-4 rounded-lg shadow',
      }}
      containerClassName="fixed top-4 right-4 space-y-2"
    />
  );
};

export default ToastProvider;