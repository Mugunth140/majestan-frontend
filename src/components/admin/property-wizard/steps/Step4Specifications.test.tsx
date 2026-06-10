import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import Step4Specifications from './Step4Specifications';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}><form>{children}</form></FormProvider>;
};

describe('Step4Specifications', () => {
  test('renders specifications fields', () => {
    render(
      <Wrapper>
        <Step4Specifications />
      </Wrapper>
    );
    expect(screen.getByLabelText(/Bedrooms/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bathrooms/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Carpet Area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Furnishing/i)).toBeInTheDocument();
  });
});
