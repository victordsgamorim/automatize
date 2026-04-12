import { describe, it, expect } from 'vitest';
import { clientFormSchema } from '../clientFormSchema';

const validIndividualForm = {
  clientType: 'individual' as const,
  name: 'John Doe',
  document: '529.982.247-25',
  addresses: [
    {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'Sao Paulo',
      state: 'SP',
    },
  ],
  phones: [{ phoneType: 'mobile' as const, number: '(11) 98765-4321' }],
};

describe('clientFormSchema', () => {
  it('accepts valid individual form', () => {
    const result = clientFormSchema.parse(validIndividualForm);
    expect(result.name).toBe('John Doe');
    expect(result.document).toBe('52998224725');
  });

  it('accepts valid business form with CNPJ', () => {
    const result = clientFormSchema.parse({
      ...validIndividualForm,
      clientType: 'business',
      document: '11.222.333/0001-81',
    });
    expect(result.document).toBe('11222333000181');
  });

  it('rejects missing name', () => {
    expect(() =>
      clientFormSchema.parse({ ...validIndividualForm, name: '' })
    ).toThrow();
  });

  it('rejects invalid document', () => {
    expect(() =>
      clientFormSchema.parse({
        ...validIndividualForm,
        document: '00000000000',
      })
    ).toThrow();
  });

  it('rejects empty addresses array', () => {
    expect(() =>
      clientFormSchema.parse({ ...validIndividualForm, addresses: [] })
    ).toThrow();
  });

  it('rejects empty phones array', () => {
    expect(() =>
      clientFormSchema.parse({ ...validIndividualForm, phones: [] })
    ).toThrow();
  });

  it('accepts telephone phoneType', () => {
    const result = clientFormSchema.parse({
      ...validIndividualForm,
      phones: [{ phoneType: 'telephone' as const, number: '(11) 3456-7890' }],
    });
    expect(result.phones[0].phoneType).toBe('telephone');
  });

  it('rejects invalid phoneType', () => {
    expect(() =>
      clientFormSchema.parse({
        ...validIndividualForm,
        phones: [{ phoneType: 'fax' as never, number: '12345678' }],
      })
    ).toThrow();
  });

  it('accepts valid address with establishment type', () => {
    const result = clientFormSchema.parse({
      ...validIndividualForm,
      addresses: [
        {
          addressType: 'establishment' as const,
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
        },
      ],
    });
    expect(result.addresses[0].addressType).toBe('establishment');
  });
});
