import { Request, Response, NextFunction } from 'express';
import Customer from '../models/CustomerModel';

export const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, phoneNumber, address, userId } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Name are required.' });
      return;
    }

    const newCustomer = await Customer.create({
      name,
      email,
      phoneNumber,
      address,
      userId,
    });

    res.status(201).json({
      message: 'Customer created successfully.',
      customer: {
        id: newCustomer.id,
        name: newCustomer.name,
        email: newCustomer.email,
        phoneNumber: newCustomer.phoneNumber,
        address: newCustomer.address,
        userId: newCustomer.userId,
      },
    });
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ message: 'Internal server error!' });
  }
};

export const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, phoneNumber, address, customerId } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Name are required.' });
      return;
    }

    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    await customer.update({
      name: name || customer.name,
      email: email || customer.email,
      phoneNumber: phoneNumber || customer.phoneNumber,
      address: address || customer.address,
    });

    res.status(201).json({
      message: 'Customer updated successfully.',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
      },
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Internal server error!' });
  }
};

export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { customerId } = req.body;

    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    await customer.destroy();

    res.status(200).json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Internal server error!' });
  }
};

//? Admin-only routes

export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await Customer.findAll({
      attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'userId'],
    });

    res.status(200).json(customers);
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.params.id;

    const customer = await Customer.findByPk(customerId, {
      attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'userId'],
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const uptadeCustomerInformation = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.params.id;
    const { name, email, phoneNumber, address, userId } = req.body;

    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    await customer.update({ name, email, phoneNumber, address, userId });

    res.status(200).json({
      message: 'User role updated successfully.',
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
        userId: customer.userId,
      },
    });
  } catch (error) {
    console.error('Update customer information error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.params.id;

    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      res.status(404).json({ message: 'Customer not found.' });
      return;
    }

    await customer.destroy();

    res.status(200).json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error('Delete customer by ID error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
