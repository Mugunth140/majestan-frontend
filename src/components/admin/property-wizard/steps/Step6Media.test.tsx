import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import Step6Media from './Step6Media';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({ defaultValues: { images: [] } });
  return <FormProvider {...methods}><form>{children}</form></FormProvider>;
};

describe('Step6Media', () => {
  test('renders media uploader', () => {
    render(
      <Wrapper>
        <Step6Media />
      </Wrapper>
    );
    expect(screen.getByText(/Drag and drop/i)).toBeInTheDocument();
  });
});
