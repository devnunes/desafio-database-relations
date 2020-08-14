import AppError from '@shared/errors/AppError';

import FakeCustomerRepository from '@modules/customers/repositories/fakes/FakeCustomerRepository';

import CreateCustomerService from './CreateCustomerService';

let fakeCustomerRepository: FakeCustomerRepository;
let createCustomerService: CreateCustomerService;

describe('CreateCustomer', () => {
  beforeEach(() => {
    fakeCustomerRepository = new FakeCustomerRepository();
    createCustomerService = new CreateCustomerService(fakeCustomerRepository);
  });

  it('should be able to create a new customer', async () => {
    const customer = await createCustomerService.execute({
      name: 'name',
      email: 'email@teste.com',
    });

    expect(customer).toHaveProperty('id');
    expect(customer.name).toBe('name');
    expect(customer.email).toBe('email@teste.com');
  });

  it('should not be able to create a customer with one e-mail thats already registered', async () => {
    await createCustomerService.execute({
      name: 'name',
      email: 'email@teste.com',
    });

    await expect(
      createCustomerService.execute({
        name: 'name',
        email: 'email@teste.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
