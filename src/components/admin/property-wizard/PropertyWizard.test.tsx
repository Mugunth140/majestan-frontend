import { render, screen } from '@testing-library/react';
import { expect, test, describe, beforeEach } from 'vitest';
import PropertyWizard from './PropertyWizard';
import { usePropertyWizardStore } from '@/store/usePropertyWizardStore';

describe('PropertyWizard', () => {
  beforeEach(() => {
    usePropertyWizardStore.setState({ currentStep: 1, formData: {} });
  });

  test('renders step 1 by default', () => {
    render(<PropertyWizard isAdmin={true} />);
    expect(screen.getByText(/Step 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Basic Information/i)).toBeInTheDocument();
  });
});
