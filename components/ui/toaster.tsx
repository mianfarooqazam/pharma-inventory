'use client';

import { useToast } from '@/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex flex-col space-y-3">
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between">
                  <ToastTitle className="text-lg font-semibold">{title}</ToastTitle>
                  <ToastClose />
                </div>
              )}
              
              {/* Divider */}
              {title && <hr className="border-gray-200" />}
              
              {/* Description */}
              {description && (
                <ToastDescription className="text-sm text-gray-600 leading-relaxed">
                  {description}
                </ToastDescription>
              )}
              
              {/* Action Buttons */}
              {action && (
                <div className="flex justify-end pt-2">
                  {action}
                </div>
              )}
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
