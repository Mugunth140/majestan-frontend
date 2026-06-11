import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import Step7OwnerInfo from './Step7OwnerInfo';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}><form>{children}</form></FormProvider>;
};

describe('Step7OwnerInfo', () => {
  test('renders owner fields', () => {
    render(
      <Wrapper>
        <Step7OwnerInfo isAdmin={true} />
      </Wrapper>
    );
    expect(screen.getByLabelText(/Owner Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
  });
});
