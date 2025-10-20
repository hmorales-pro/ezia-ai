"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-right"
      richColors
      toastOptions={{
        style: {
          background: 'white',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
        },
        className: 'sonner-toast',
      }}
      {...props}
    />
  );
};

export { Toaster };
