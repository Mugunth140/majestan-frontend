import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import Step9Availability from './Step9Availability';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}><form>{children}</form></FormProvider>;
};

describe('Step9Availability', () => {
  test('renders availability fields', () => {
    render(
      <Wrapper>
        <Step9Availability />
      </Wrapper>
    );
    expect(screen.getByLabelText(/Available From/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Available Until/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Availability Status/i)).toBeInTheDocument();
  });
});
