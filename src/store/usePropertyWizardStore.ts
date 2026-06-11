import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PropertyWizardState {
  currentStep: number;
  formData: Record<string, any>;
  isComplete: boolean;
  setStep: (step: number) => void;
  updateFormData: (data: Record<string, any>) => void;
  clearWizard: () => void;
}

export const usePropertyWizardStore = create<PropertyWizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      formData: {},
      isComplete: false,
      setStep: (step) => set({ currentStep: step }),
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      clearWizard: () => set({ currentStep: 1, formData: {}, isComplete: false }),
    }),
    {
      name: 'property-wizard-storage',
      partialize: (state) => {
        // Exclude File objects (images) from being serialized to localStorage
        // because JSON.stringify(File) destroys the File object, causing upload errors.
        const { images, ...restFormData } = state.formData;
        return {
          ...state,
          formData: restFormData
        };
      }
    }
  )
);
