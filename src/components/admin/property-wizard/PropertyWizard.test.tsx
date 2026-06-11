import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, describe, beforeEach } from 'vitest';
import PropertyWizard from './PropertyWizard';
import { usePropertyWizardStore } from '@/store/usePropertyWizardStore';

describe('PropertyWizard', () => {
 beforeEach(() => {
 usePropertyWizardStore.setState({ currentStep: 1, formData: {} });
 });

 test('renders step 1 by default', () => {
 render(<PropertyWizard isAdmin={true} availableCities={[]} availableSublocations={[]} amenities={[]} />);
 expect(screen.getByText(/Property Title/i)).toBeInTheDocument();
 });
});
