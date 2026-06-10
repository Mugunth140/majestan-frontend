"use client";

import { useToastStore } from "./toast-store";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed! bottom-4! right-4! z-[100]! flex! flex-col! gap-3!">
      <AnimatePresence>
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="text-emerald-500!" size={20} />,
            error: <AlertCircle className="text-rose-500!" size={20} />,
            info: <Info className="text-blue-500!" size={20} />,
            warning: <AlertTriangle className="text-amber-500!" size={20} />,
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="flex! items-center! gap-3! rounded-xl! bg-white! p-4! pr-10! shadow-[0_8px_30px_rgb(0,0,0,0.08)]! border! border-gray-100! relative! min-w-[300px]! overflow-hidden!"
            >
              {/* Subtle accent line */}
              <div 
                className={`absolute! left-0! top-0! bottom-0! w-1! ${
                  toast.type === "success" ? "bg-emerald-500!" : 
                  toast.type === "error" ? "bg-rose-500!" : 
                  toast.type === "warning" ? "bg-amber-500!" : "bg-blue-500!"
                }`} 
              />
              {icons[toast.type]}
              <p className="text-sm! font-medium! text-gray-800!">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute! right-3! top-1/2! -translate-y-1/2! text-gray-400! hover:text-gray-600! transition-colors!"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
