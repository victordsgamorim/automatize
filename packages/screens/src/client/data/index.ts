export type {
  Client,
  ClientAddress,
  ClientPhone,
  ClientType,
  ClientAddressType,
  ClientPhoneType,
  CreateClientInput,
  UpdateClientInput,
  PaginatedResponse,
} from './types';
export {
  clientSchema,
  clientAddressSchema,
  clientPhoneSchema,
  createClientSchema,
  updateClientSchema,
} from './validators';
export { ClientRemoteDatasource } from './remote-datasource';
export { ClientRepository } from './repository';
