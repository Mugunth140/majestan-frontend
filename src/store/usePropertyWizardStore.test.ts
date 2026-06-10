import { expect, test, describe, beforeEach } from 'vitest';
import { usePropertyWizardStore } from './usePropertyWizardStore';

describe('usePropertyWizardStore', () => {
  beforeEach(() => {
    usePropertyWizardStore.setState({
      currentStep: 1,
      formData: {},
      isComplete: false,
    });
  });

  test('should initialize with step 1', () => {
    const state = usePropertyWizardStore.getState();
    expect(state.currentStep).toBe(1);
    expect(state.formData).toEqual({});
  });

  test('should update step', () => {
    usePropertyWizardStore.getState().setStep(2);
    expect(usePropertyWizardStore.getState().currentStep).toBe(2);
  });

  test('should update formData', () => {
    usePropertyWizardStore.getState().updateFormData({ title: 'Luxury Villa' });
    expect(usePropertyWizardStore.getState().formData.title).toBe('Luxury Villa');
  });

  test('should clear wizard', () => {
    usePropertyWizardStore.getState().setStep(5);
    usePropertyWizardStore.getState().updateFormData({ price: '100' });
    usePropertyWizardStore.getState().clearWizard();
    
    const state = usePropertyWizardStore.getState();
    expect(state.currentStep).toBe(1);
    expect(state.formData).toEqual({});
  });
});
