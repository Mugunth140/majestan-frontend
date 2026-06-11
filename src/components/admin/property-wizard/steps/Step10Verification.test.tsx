import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import Step10Verification from './Step10Verification';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
 const methods = useForm();
 return <FormProvider {...methods}><form>{children}</form></FormProvider>;
};

describe('Step10Verification', () => {
 test('renders verification fields', () => {
 render(
 <Wrapper>
 <Step10Verification />
 </Wrapper>
 );
 expect(screen.getByLabelText(/Verification Status/i)).toBeInTheDocument();
 expect(screen.getByLabelText(/Approval Status/i)).toBeInTheDocument();
 expect(screen.getByLabelText(/Publish immediately/i)).toBeInTheDocument();
 });
});
