import React from 'react';
import { usePropertyWizardStore } from '@/store/usePropertyWizardStore';

interface PropertyWizardProps {
  isAdmin: boolean;
}

export default function PropertyWizard({ isAdmin }: PropertyWizardProps) {
  const { currentStep } = usePropertyWizardStore();

  return (
    <div className="w-full! max-w-5xl! mx-auto! bg-white! rounded-2xl! shadow-sm! border! border-gray-100! p-8!">
      <h2 className="text-xl! font-bold!">Step {currentStep}: Basic Information</h2>
      {/* Wizard steps content will go here */}
    </div>
  );
}
