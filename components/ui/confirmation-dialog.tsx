"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, CheckCircle, Edit3, Trash2, Info } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive" | "warning" | "edit";
  icon?: React.ReactNode;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
  icon
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case "destructive":
        return <Trash2 className="h-6 w-6 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-orange-600" />;
      case "edit":
        return <Edit3 className="h-6 w-6 text-blue-600" />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
  };

  const getButtonStyles = () => {
    switch (variant) {
      case "destructive":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-600";
      case "warning":
        return "bg-orange-600 hover:bg-orange-700 focus:ring-orange-600";
      case "edit":
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600";
      default:
        return "bg-green-600 hover:bg-green-700 focus:ring-green-600";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${
              variant === "destructive" ? "bg-red-100" :
              variant === "warning" ? "bg-orange-100" :
              variant === "edit" ? "bg-blue-100" :
              "bg-green-100"
            }`}>
              {getIcon()}
            </div>
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900 text-center">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2">
          <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={`w-full sm:w-auto order-1 sm:order-2 ${getButtonStyles()}`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
