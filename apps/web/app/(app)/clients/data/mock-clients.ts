import type { Client, PaginatedResponse } from './types';

const mockClients: Client[] = [
  {
    id: '01JQF3NDEKTSV4RRFFQ69G5FA1',
    tenantId: '01JQF0NDEKTSV4RRFFQ69G5FA0',
    name: 'Maria Silva',
    clientType: 'individual',
    document: '123.456.789-00',
    email: 'maria.silva@email.com',
    addresses: [
      {
        id: '01JQF4NDEKTSV4RRFFQ69G5FA1',
        addressType: 'residence',
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        info: 'Apto 42',
      },
    ],
    phones: [
      {
        id: '01JQF5NDEKTSV4RRFFQ69G5FA1',
        phoneType: 'mobile',
        number: '(11) 99999-1234',
      },
    ],
    createdAt: '2026-01-15T10:30:00.000Z',
    updatedAt: '2026-01-15T10:30:00.000Z',
    deletedAt: null,
  },
  {
    id: '01JQF3NDEKTSV4RRFFQ69G5FA2',
    tenantId: '01JQF0NDEKTSV4RRFFQ69G5FA0',
    name: 'Tech Solutions Ltda',
    clientType: 'business',
    document: '12.345.678/0001-90',
    email: 'contato@techsolutions.com.br',
    addresses: [
      {
        id: '01JQF4NDEKTSV4RRFFQ69G5FA2',
        addressType: 'establishment',
        street: 'Av. Paulista',
        number: '1578',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        info: 'Sala 501',
      },
      {
        id: '01JQF4NDEKTSV4RRFFQ69G5FA3',
        addressType: 'establishment',
        street: 'Rua Augusta',
        number: '500',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        info: '',
      },
    ],
    phones: [
      {
        id: '01JQF5NDEKTSV4RRFFQ69G5FA2',
        phoneType: 'telephone',
        number: '(11) 3456-7890',
      },
      {
        id: '01JQF5NDEKTSV4RRFFQ69G5FA3',
        phoneType: 'mobile',
        number: '(11) 98888-5678',
      },
    ],
    createdAt: '2026-02-03T14:15:00.000Z',
    updatedAt: '2026-03-10T09:00:00.000Z',
    deletedAt: null,
  },
  {
    id: '01JQF3NDEKTSV4RRFFQ69G5FA3',
    tenantId: '01JQF0NDEKTSV4RRFFQ69G5FA0',
    name: 'João Oliveira',
    clientType: 'individual',
    document: '987.654.321-00',
    email: 'joao.oliveira@email.com',
    addresses: [
      {
        id: '01JQF4NDEKTSV4RRFFQ69G5FA4',
        addressType: 'residence',
        street: 'Rua do Comércio',
        number: '45',
        neighborhood: 'Jardins',
        city: 'Rio de Janeiro',
        state: 'RJ',
        info: '',
      },
    ],
    phones: [
      {
        id: '01JQF5NDEKTSV4RRFFQ69G5FA4',
        phoneType: 'mobile',
        number: '(21) 97777-4321',
      },
    ],
    createdAt: '2026-02-20T08:45:00.000Z',
    updatedAt: '2026-02-20T08:45:00.000Z',
    deletedAt: null,
  },
  {
    id: '01JQF3NDEKTSV4RRFFQ69G5FA4',
    tenantId: '01JQF0NDEKTSV4RRFFQ69G5FA0',
    name: 'Construções Mega S.A.',
    clientType: 'business',
    document: '98.765.432/0001-10',
    email: 'financeiro@construcoesmega.com.br',
    addresses: [
      {
        id: '01JQF4NDEKTSV4RRFFQ69G5FA5',
        addressType: 'establishment',
        street: 'Rodovia BR-101',
        number: 'Km 234',
        neighborhood: 'Zona Industrial',
        city: 'Curitiba',
        state: 'PR',
        info: 'Galpão 3',
      },
    ],
    phones: [
      {
        id: '01JQF5NDEKTSV4RRFFQ69G5FA5',
        phoneType: 'telephone',
        number: '(41) 3333-8765',
      },
      {
        id: '01JQF5NDEKTSV4RRFFQ69G5FA6',
        phoneType: 'telephone',
        number: '(41) 3333-8766',
      },
    ],
    createdAt: '2026-03-01T16:00:00.000Z',
    updatedAt: '2026-04-12T11:30:00.000Z',
    deletedAt: null,
  },
  {
    id: '01JQF3NDEKTSV4RRFFQ69G5FA5',
    tenantId: '01JQF0NDEKTSV4RRFFQ69G5FA0',
    name: 'Ana Carolina Santos',
    clientType: 'individual',
    document: '456.789.123-00',
    email: 'ana.santos@email.com',
    addresses: [
      {
        id: '01JQF4NDEKTSV4RRFFQ69G5FA6',
        addressType: 'residence',
        street: 'Rua das Palmeiras',
        number: '789',
        neighborhood: 'Aldeota',
        city: 'Fortaleza',
        state: 'CE',
        info: 'Casa 2',
      },
    ],
    phones: [
      {
        id: '01JQF5NDEKTSV4RRFFQ69G5FA7',
        phoneType: 'mobile',
        number: '(85) 99666-7890',
      },
    ],
    createdAt: '2026-03-15T13:20:00.000Z',
    updatedAt: '2026-03-15T13:20:00.000Z',
    deletedAt: null,
  },
  {
    id: '01JQF3NDEKTSV4RRFFQ69G5FA6',
    tenantId: '01JQF0NDEKTSV4RRFFQ69G5FA0',
    name: 'Restaurante Sabor & Arte',
    clientType: 'business',
    document: '11.222.333/0001-44',
    email: 'contato@saborarte.com.br',
    addresses: [
      {
        id: '01JQF4NDEKTSV4RRFFQ69G5FA7',
        addressType: 'establishment',
        street: 'Rua da Gastronomia',
        number: '321',
        neighborhood: 'Savassi',
        city: 'Belo Horizonte',
        state: 'MG',
        info: '',
      },
    ],
    phones: [
      {
        id: '01JQF5NDEKTSV4RRFFQ69G5FA8',
        phoneType: 'telephone',
        number: '(31) 3222-1111',
      },
      {
        id: '01JQF5NDEKTSV4RRFFQ69G5FA9',
        phoneType: 'mobile',
        number: '(31) 95555-2222',
      },
    ],
    createdAt: '2026-04-01T09:00:00.000Z',
    updatedAt: '2026-04-18T15:45:00.000Z',
    deletedAt: null,
  },
  {
    id: '01JQF3NDEKTSV4RRFFQ69G5FA7',
    tenantId: '01JQF0NDEKTSV4RRFFQ69G5FA0',
    name: 'Pedro Henrique Costa',
    clientType: 'individual',
    document: '321.654.987-00',
    email: 'pedro.costa@email.com',
    addresses: [
      {
        id: '01JQF4NDEKTSV4RRFFQ69G5FA8',
        addressType: 'residence',
        street: 'Av. Beira Mar',
        number: '1500',
        neighborhood: 'Iracema',
        city: 'Fortaleza',
        state: 'CE',
        info: 'Bloco B, Apto 1001',
      },
    ],
    phones: [
      {
        id: '01JQF5NDEKTSV4RRFFQ69G5FB0',
        phoneType: 'mobile',
        number: '(85) 99111-3333',
      },
    ],
    createdAt: '2026-04-05T11:30:00.000Z',
    updatedAt: '2026-04-05T11:30:00.000Z',
    deletedAt: null,
  },
  {
    id: '01JQF3NDEKTSV4RRFFQ69G5FA8',
    tenantId: '01JQF0NDEKTSV4RRFFQ69G5FA0',
    name: 'Digital Marketing Pro',
    clientType: 'business',
    document: '55.666.777/0001-88',
    email: 'hello@digitalmarketingpro.com.br',
    addresses: [
      {
        id: '01JQF4NDEKTSV4RRFFQ69G5FA9',
        addressType: 'establishment',
        street: 'Rua da Inovação',
        number: '200',
        neighborhood: 'Tech Park',
        city: 'Florianópolis',
        state: 'SC',
        info: 'Coworking, Mesa 15',
      },
    ],
    phones: [
      {
        id: '01JQF5NDEKTSV4RRFFQ69G5FB1',
        phoneType: 'mobile',
        number: '(48) 99222-4444',
      },
    ],
    createdAt: '2026-04-10T14:00:00.000Z',
    updatedAt: '2026-04-20T10:15:00.000Z',
    deletedAt: null,
  },
];

const PAGE_SIZE = 20;

export function getMockClients(
  tenantId: string,
  cursor?: string
): PaginatedResponse<Client> {
  let filtered = mockClients.filter(
    (c) => c.tenantId === tenantId && c.deletedAt === null
  );

  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (cursor) {
    const idx = filtered.findIndex((c) => c.id === cursor);
    if (idx >= 0) {
      filtered = filtered.slice(idx + 1);
    }
  }

  const hasMore = filtered.length > PAGE_SIZE;
  const page = filtered.slice(0, PAGE_SIZE);

  return {
    data: page,
    nextCursor: hasMore ? (page[page.length - 1]?.id ?? null) : null,
    hasMore,
  };
}

export function getMockClientById(id: string): Client | undefined {
  return mockClients.find((c) => c.id === id && c.deletedAt === null);
}
