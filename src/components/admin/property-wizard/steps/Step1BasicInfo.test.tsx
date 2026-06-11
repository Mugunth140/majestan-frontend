import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import Step1BasicInfo from './Step1BasicInfo';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
 const methods = useForm();
 return <FormProvider {...methods}><form>{children}</form></FormProvider>;
};

describe('Step1BasicInfo', () => {
 test('renders basic info fields', () => {
 render(
 <Wrapper>
 <Step1BasicInfo />
 </Wrapper>
 );
 expect(screen.getByLabelText(/Property Title/i)).toBeInTheDocument();
 expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
 expect(screen.getByLabelText(/Property Type/i)).toBeInTheDocument();
 });
});
