import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import Step8SEO from './Step8SEO';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}><form>{children}</form></FormProvider>;
};

describe('Step8SEO', () => {
  test('renders SEO fields', () => {
    render(
      <Wrapper>
        <Step8SEO />
      </Wrapper>
    );
    expect(screen.getByLabelText(/SEO Slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Meta Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Meta Description/i)).toBeInTheDocument();
  });
});
