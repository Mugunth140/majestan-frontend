import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import Step5Amenities from './Step5Amenities';
import React from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
 const methods = useForm({ defaultValues: { amenityIds: [] } });
 return <FormProvider {...methods}><form>{children}</form></FormProvider>;
};

describe('Step5Amenities', () => {
 test('renders amenities list', () => {
 const mockAmenities = [
 { id: 1, name: 'Swimming Pool' },
 { id: 2, name: 'Gym' },
 ];
 render(
 <Wrapper>
 <Step5Amenities amenities={mockAmenities} />
 </Wrapper>
 );
 expect(screen.getByText(/Swimming Pool/i)).toBeInTheDocument();
 expect(screen.getByText(/Gym/i)).toBeInTheDocument();
 });
});
