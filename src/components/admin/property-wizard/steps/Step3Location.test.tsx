import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import Step3Location from './Step3Location';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}><form>{children}</form></FormProvider>;
};

describe('Step3Location', () => {
  test('renders location fields', () => {
    render(
      <Wrapper>
        <Step3Location availableCities={[]} availableSublocations={[]} />
      </Wrapper>
    );
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address Line 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pincode/i)).toBeInTheDocument();
  });
});
