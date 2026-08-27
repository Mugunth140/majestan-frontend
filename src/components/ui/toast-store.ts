import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  timerId: ReturnType<typeof setTimeout>;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    const timerId = setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
    set((state) => ({ toasts: [...state.toasts, { id, type, message, timerId }] }));
  },
  removeToast: (id) => {
    set((state) => {
      const toast = state.toasts.find((t) => t.id === id);
      if (toast) clearTimeout(toast.timerId);
      return { toasts: state.toasts.filter((t) => t.id !== id) };
    });
  },
}));

export const toast = {
  success: (message: string) => useToastStore.getState().addToast("success", message),
  error: (message: string) => useToastStore.getState().addToast("error", message),
  info: (message: string) => useToastStore.getState().addToast("info", message),
  warning: (message: string) => useToastStore.getState().addToast("warning", message),
};
