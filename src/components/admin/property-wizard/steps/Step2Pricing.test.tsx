import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import Step2Pricing from './Step2Pricing';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}><form>{children}</form></FormProvider>;
};

describe('Step2Pricing', () => {
  test('renders pricing fields', () => {
    render(
      <Wrapper>
        <Step2Pricing />
      </Wrapper>
    );
    expect(screen.getByLabelText(/^Total Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Negotiable/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Maintenance Charges/i)).toBeInTheDocument();
  });
});
