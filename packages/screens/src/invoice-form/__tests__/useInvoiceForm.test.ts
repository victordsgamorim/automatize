import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInvoiceForm } from '../useInvoiceForm';

// Mock generateId
vi.mock('@automatize/utils', () => ({
  generateId: () => 'test-id-' + Math.random().toString(36).substr(2, 9),
}));

describe('useInvoiceForm', () => {
  // ── Initial State ───────────────────────────────────────────────────────────
  it('initializes with empty values', () => {
    const { result } = renderHook(() => useInvoiceForm());

    expect(result.current.clientId).toBeUndefined();
    expect(result.current.clientName).toBeUndefined();
    expect(result.current.clientAddresses).toEqual([]);
    expect(result.current.clientPhones).toEqual([]);
    expect(result.current.products).toEqual([]);
    expect(result.current.technicians).toEqual([]);
    expect(result.current.warrantyMonths).toBe(0);
    expect(result.current.additionalInfo).toBe('');
    expect(result.current.total).toBe(0);
  });

  it('initializes with provided initialData', () => {
    const initialData = {
      clientId: 'client-1',
      clientName: 'Test Client',
      warrantyMonths: 12,
      additionalInfo: 'Some info',
    };

    const { result } = renderHook(() => useInvoiceForm({ initialData }));

    expect(result.current.clientId).toBe('client-1');
    expect(result.current.clientName).toBe('Test Client');
    expect(result.current.warrantyMonths).toBe(12);
    expect(result.current.additionalInfo).toBe('Some info');
  });

  // ── Client Operations ───────────────────────────────────────────────────────
  describe('client operations', () => {
    it('selectClient sets client id and name', () => {
      const { result } = renderHook(() => useInvoiceForm());

      act(() => {
        result.current.selectClient({
          id: 'client-1',
          name: 'Test Client',
        } as never);
      });

      expect(result.current.clientId).toBe('client-1');
      expect(result.current.clientName).toBe('Test Client');
    });

    it('selectClient clears addresses and phones', () => {
      const { result } = renderHook(() => useInvoiceForm());

      act(() => {
        result.current.selectClient({
          id: 'client-1',
          name: 'Test Client',
        } as never);
      });

      expect(result.current.clientAddresses).toEqual([]);
      expect(result.current.clientPhones).toEqual([]);
    });

    it('clearClient resets client state', () => {
      const { result } = renderHook(() => useInvoiceForm());

      act(() => {
        result.current.selectClient({
          id: 'client-1',
          name: 'Test Client',
        } as never);
      });

      act(() => {
        result.current.clearClient();
      });

      expect(result.current.clientId).toBeUndefined();
      expect(result.current.clientName).toBeUndefined();
    });

    it('pickClientAddress sets single address', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const address = {
        id: 'addr-1',
        street: 'Street',
        number: '123',
        neighborhood: 'Neighborhood',
        city: 'City',
        state: 'SP',
      };

      act(() => {
        result.current.pickClientAddress(address);
      });

      expect(result.current.clientAddresses).toHaveLength(1);
      expect(result.current.clientAddresses[0]).toEqual(address);
    });

    it('addClientAddress adds address with generated id', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const addressData = {
        street: 'Street',
        number: '123',
        neighborhood: 'Neighborhood',
        city: 'City',
        state: 'SP',
      };

      act(() => {
        result.current.addClientAddress(addressData);
      });

      expect(result.current.clientAddresses).toHaveLength(1);
      expect(result.current.clientAddresses[0].street).toBe('Street');
      expect(result.current.clientAddresses[0].id).toBeDefined();
    });

    it('removeClientAddress removes address by id', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const address = {
        id: 'addr-1',
        street: 'Street',
        number: '123',
        neighborhood: 'Neighborhood',
        city: 'City',
        state: 'SP',
      };

      act(() => {
        result.current.pickClientAddress(address);
      });

      act(() => {
        result.current.removeClientAddress('addr-1');
      });

      expect(result.current.clientAddresses).toHaveLength(0);
    });

    it('pickClientPhone toggles phone selection', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const phone = {
        id: 'phone-1',
        phoneType: 'mobile' as const,
        number: '11999999999',
      };

      act(() => {
        result.current.pickClientPhone(phone);
      });

      expect(result.current.clientPhones).toHaveLength(1);

      act(() => {
        result.current.pickClientPhone(phone);
      });

      expect(result.current.clientPhones).toHaveLength(0);
    });

    it('addClientPhone adds phone with generated id', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const phoneData = { phoneType: 'mobile' as const, number: '11999999999' };

      act(() => {
        result.current.addClientPhone(phoneData);
      });

      expect(result.current.clientPhones).toHaveLength(1);
      expect(result.current.clientPhones[0].number).toBe('11999999999');
      expect(result.current.clientPhones[0].id).toBeDefined();
    });

    it('removeClientPhone removes phone by id', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const phone = {
        id: 'phone-1',
        phoneType: 'mobile' as const,
        number: '11999999999',
      };

      act(() => {
        result.current.pickClientPhone(phone);
      });

      act(() => {
        result.current.removeClientPhone('phone-1');
      });

      expect(result.current.clientPhones).toHaveLength(0);
    });
  });

  // ── Product Operations ───────────────────────────────────────────────────────
  describe('product operations', () => {
    it('addProduct adds product with quantity 1', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const product = {
        id: 'prod-1',
        name: 'Product',
        price: 100,
        quantity: 10,
      };

      act(() => {
        result.current.addProduct(product as never);
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].productId).toBe('prod-1');
      expect(result.current.products[0].quantity).toBe(1);
      expect(result.current.products[0].totalPrice).toBe(100);
    });

    it('addProduct does not duplicate existing product', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const product = {
        id: 'prod-1',
        name: 'Product',
        price: 100,
        quantity: 10,
      };

      act(() => {
        result.current.addProduct(product as never);
        result.current.addProduct(product as never);
      });

      expect(result.current.products).toHaveLength(1);
    });

    it('removeProduct removes product by id', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const product = {
        id: 'prod-1',
        name: 'Product',
        price: 100,
        quantity: 10,
      };

      act(() => {
        result.current.addProduct(product as never);
      });

      const productId = result.current.products[0].id;

      act(() => {
        result.current.removeProduct(productId);
      });

      expect(result.current.products).toHaveLength(0);
    });

    it('updateProductQuantity updates quantity and totalPrice', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const product = {
        id: 'prod-1',
        name: 'Product',
        price: 100,
        quantity: 10,
      };

      act(() => {
        result.current.addProduct(product as never);
      });

      const productId = result.current.products[0].id;

      act(() => {
        result.current.updateProductQuantity(productId, 5);
      });

      expect(result.current.products[0].quantity).toBe(5);
      expect(result.current.products[0].totalPrice).toBe(500);
    });

    it('updateProductQuantity clamps quantity to available stock', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const product = {
        id: 'prod-1',
        name: 'Product',
        price: 100,
        quantity: 10,
      };

      act(() => {
        result.current.addProduct(product as never);
      });

      const productId = result.current.products[0].id;

      act(() => {
        result.current.updateProductQuantity(productId, 100);
      });

      expect(result.current.products[0].quantity).toBe(10);

      act(() => {
        result.current.updateProductQuantity(productId, 0);
      });

      expect(result.current.products[0].quantity).toBe(1);
    });

    it('incrementProductQuantity increments quantity', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const product = {
        id: 'prod-1',
        name: 'Product',
        price: 100,
        quantity: 10,
      };

      act(() => {
        result.current.addProduct(product as never);
      });

      const productId = result.current.products[0].id;

      act(() => {
        result.current.incrementProductQuantity(productId);
      });

      expect(result.current.products[0].quantity).toBe(2);
    });

    it('decrementProductQuantity decrements quantity', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const product = {
        id: 'prod-1',
        name: 'Product',
        price: 100,
        quantity: 10,
      };

      act(() => {
        result.current.addProduct(product as never);
      });

      const productId = result.current.products[0].id;

      act(() => {
        result.current.updateProductQuantity(productId, 3);
      });

      act(() => {
        result.current.decrementProductQuantity(productId);
      });

      expect(result.current.products[0].quantity).toBe(2);
    });

    it('decrementProductQuantity does not go below 1', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const product = {
        id: 'prod-1',
        name: 'Product',
        price: 100,
        quantity: 10,
      };

      act(() => {
        result.current.addProduct(product as never);
      });

      const productId = result.current.products[0].id;

      act(() => {
        result.current.decrementProductQuantity(productId);
      });

      expect(result.current.products[0].quantity).toBe(1);
    });
  });

  // ── Technician Operations ───────────────────────────────────────────────────
  describe('technician operations', () => {
    it('addTechnician adds technician', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const tech = { id: 'tech-1', name: 'Technician' };

      act(() => {
        result.current.addTechnician(tech as never);
      });

      expect(result.current.technicians).toHaveLength(1);
      expect(result.current.technicians[0].name).toBe('Technician');
      expect(result.current.technicians[0].active).toBe(true);
    });

    it('addTechnician does not duplicate existing technician', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const tech = { id: 'tech-1', name: 'Technician' };

      act(() => {
        result.current.addTechnician(tech as never);
        result.current.addTechnician(tech as never);
      });

      expect(result.current.technicians).toHaveLength(1);
    });

    it('removeTechnician removes technician by id', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const tech = { id: 'tech-1', name: 'Technician' };

      act(() => {
        result.current.addTechnician(tech as never);
      });

      act(() => {
        result.current.removeTechnician('tech-1');
      });

      expect(result.current.technicians).toHaveLength(0);
    });

    it('toggleTechnician toggles active state', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const tech = { id: 'tech-1', name: 'Technician' };

      act(() => {
        result.current.addTechnician(tech as never);
      });

      expect(result.current.technicians[0].active).toBe(true);

      act(() => {
        result.current.toggleTechnician('tech-1');
      });

      expect(result.current.technicians[0].active).toBe(false);
    });

    it('addNewTechnician adds new technician with generated id', () => {
      const { result } = renderHook(() => useInvoiceForm());

      act(() => {
        result.current.addNewTechnician('New Technician');
      });

      expect(result.current.technicians).toHaveLength(1);
      expect(result.current.technicians[0].name).toBe('New Technician');
      expect(result.current.technicians[0].id).toBeDefined();
    });

    it('addNewTechnician does nothing for empty string', () => {
      const { result } = renderHook(() => useInvoiceForm());

      act(() => {
        result.current.addNewTechnician('   ');
      });

      expect(result.current.technicians).toHaveLength(0);
    });
  });

  // ── Warranty & Info ───────────────────────────────────────────────────────
  describe('warranty and info', () => {
    it('setWarrantyMonths updates warranty months', () => {
      const { result } = renderHook(() => useInvoiceForm());

      act(() => {
        result.current.setWarrantyMonths(12);
      });

      expect(result.current.warrantyMonths).toBe(12);
    });

    it('setAdditionalInfo updates additional info', () => {
      const { result } = renderHook(() => useInvoiceForm());

      act(() => {
        result.current.setAdditionalInfo('Some additional info');
      });

      expect(result.current.additionalInfo).toBe('Some additional info');
    });
  });

  // ── Total Calculation ───────────────────────────────────────────────────────
  describe('total calculation', () => {
    it('calculates total from products', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const product1 = {
        id: 'prod-1',
        name: 'Product 1',
        price: 100,
        quantity: 10,
      };
      const product2 = {
        id: 'prod-2',
        name: 'Product 2',
        price: 50,
        quantity: 10,
      };

      act(() => {
        result.current.addProduct(product1 as never);
        result.current.addProduct(product2 as never);
      });

      expect(result.current.total).toBe(150);
    });

    it('updates total when quantity changes', () => {
      const { result } = renderHook(() => useInvoiceForm());

      const product = {
        id: 'prod-1',
        name: 'Product',
        price: 100,
        quantity: 10,
      };

      act(() => {
        result.current.addProduct(product as never);
      });

      const productId = result.current.products[0].id;

      expect(result.current.total).toBe(100);

      act(() => {
        result.current.updateProductQuantity(productId, 3);
      });

      expect(result.current.total).toBe(300);
    });
  });

  // ── Form Operations ─────────────────────────────────────────────────────────
  describe('form operations', () => {
    it('getFormData returns current form data', () => {
      const { result } = renderHook(() => useInvoiceForm());

      act(() => {
        result.current.selectClient({
          id: 'client-1',
          name: 'Test Client',
        } as never);
        result.current.setWarrantyMonths(12);
        result.current.setAdditionalInfo('Info');
      });

      const formData = result.current.getFormData();

      expect(formData.clientId).toBe('client-1');
      expect(formData.clientName).toBe('Test Client');
      expect(formData.warrantyMonths).toBe(12);
      expect(formData.additionalInfo).toBe('Info');
    });

    it('resetForm resets all state', () => {
      const { result } = renderHook(() => useInvoiceForm());

      act(() => {
        result.current.selectClient({
          id: 'client-1',
          name: 'Test Client',
        } as never);
        result.current.addProduct({
          id: 'prod-1',
          name: 'Product',
          price: 100,
          quantity: 10,
        } as never);
        result.current.addTechnician({
          id: 'tech-1',
          name: 'Technician',
        } as never);
        result.current.setWarrantyMonths(12);
        result.current.setAdditionalInfo('Info');
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.clientId).toBeUndefined();
      expect(result.current.clientName).toBeUndefined();
      expect(result.current.products).toEqual([]);
      expect(result.current.technicians).toEqual([]);
      expect(result.current.warrantyMonths).toBe(0);
      expect(result.current.additionalInfo).toBe('');
    });
  });

  // ── onDataChange Callback ─────────────────────────────────────────────────
  describe('onDataChange callback', () => {
    it('calls onDataChange when state changes', async () => {
      const onDataChange = vi.fn();

      const { result } = renderHook(() => useInvoiceForm({ onDataChange }));

      await act(async () => {
        result.current.selectClient({
          id: 'client-1',
          name: 'Test Client',
        } as never);
      });

      await waitFor(() => {
        expect(onDataChange).toHaveBeenCalledWith(
          expect.objectContaining({
            clientId: 'client-1',
            clientName: 'Test Client',
          })
        );
      });
    });

    it('does not call onDataChange on initial render', () => {
      const onDataChange = vi.fn();

      renderHook(() => useInvoiceForm({ onDataChange }));

      expect(onDataChange).not.toHaveBeenCalled();
    });
  });
});
