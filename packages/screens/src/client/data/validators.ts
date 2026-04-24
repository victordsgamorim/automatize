import { z } from 'zod';

export const clientAddressSchema = z.object({
  id: z.string().min(1),
  addressType: z.enum(['residence', 'establishment']),
  street: z.string().min(1),
  number: z.string().min(1),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  info: z.string(),
});

export const clientPhoneSchema = z.object({
  id: z.string().min(1),
  phoneType: z.enum(['mobile', 'telephone']),
  number: z.string().min(1),
});

export const createClientSchema = z.object({
  name: z.string().min(1).max(200),
  clientType: z.enum(['individual', 'business']),
  document: z.string().min(1).max(20),
  email: z.string().email(),
  addresses: z.array(clientAddressSchema.omit({ id: true })).min(1),
  phones: z.array(clientPhoneSchema.omit({ id: true })).min(1),
});

export const updateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  clientType: z.enum(['individual', 'business']).optional(),
  document: z.string().min(1).max(20).optional(),
  email: z.string().email().optional(),
  addresses: z.array(clientAddressSchema.omit({ id: true })).optional(),
  phones: z.array(clientPhoneSchema.omit({ id: true })).optional(),
});

export const clientSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  clientType: z.enum(['individual', 'business']),
  document: z.string(),
  email: z.string().email(),
  addresses: z.array(clientAddressSchema),
  phones: z.array(clientPhoneSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});
