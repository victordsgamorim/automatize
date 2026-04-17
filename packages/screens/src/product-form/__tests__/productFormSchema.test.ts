import { describe, it, expect } from 'vitest';
import { productFormSchema } from '../productFormSchema';

const validProduct = {
  name: 'Widget Pro',
  price: 29.99,
  quantity: 10,
  info: 'A reliable widget',
};

describe('productFormSchema', () => {
  it('accepts a valid product', () => {
    const result = productFormSchema.parse(validProduct);
    expect(result.name).toBe('Widget Pro');
    expect(result.price).toBe(29.99);
    expect(result.quantity).toBe(10);
  });

  it('accepts product with optional fields omitted', () => {
    const result = productFormSchema.parse({
      name: 'Basic Product',
      price: 5,
      quantity: 1,
    });
    expect(result.name).toBe('Basic Product');
    expect(result.photoUrl).toBeUndefined();
    expect(result.companyId).toBeUndefined();
  });

  it('accepts product with all optional fields', () => {
    const result = productFormSchema.parse({
      ...validProduct,
      photoUrl: 'https://example.com/photo.jpg',
      companyId: 'company-1',
    });
    expect(result.photoUrl).toBe('https://example.com/photo.jpg');
    expect(result.companyId).toBe('company-1');
  });

  it('rejects missing name', () => {
    expect(() =>
      productFormSchema.parse({ ...validProduct, name: '' })
    ).toThrow();
  });

  it('rejects negative price', () => {
    expect(() =>
      productFormSchema.parse({ ...validProduct, price: -1 })
    ).toThrow();
  });

  it('accepts price of zero', () => {
    const result = productFormSchema.parse({ ...validProduct, price: 0 });
    expect(result.price).toBe(0);
  });

  it('rejects negative quantity', () => {
    expect(() =>
      productFormSchema.parse({ ...validProduct, quantity: -1 })
    ).toThrow();
  });

  it('accepts quantity of zero', () => {
    const result = productFormSchema.parse({
      ...validProduct,
      quantity: 0,
    });
    expect(result.quantity).toBe(0);
  });

  it('rejects non-integer quantity', () => {
    expect(() =>
      productFormSchema.parse({ ...validProduct, quantity: 1.5 })
    ).toThrow();
  });

  it('defaults info to empty string when omitted', () => {
    const { info: _info, ...withoutInfo } = validProduct;
    const result = productFormSchema.parse(withoutInfo);
    expect(result.info).toBe('');
  });
});
