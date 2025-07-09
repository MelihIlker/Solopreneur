import { Model } from 'sequelize';
import * as DataTypes from 'sequelize';
import sequelize from '../config/database';

interface CustomerAttributes {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
}

type CustomerCreationAttributes = Omit<CustomerAttributes, 'id' | 'createdAt' | 'updatedAt'>;
interface CustomerInstance
  extends Model<CustomerAttributes, CustomerCreationAttributes>,
    CustomerAttributes {}

const Customer = sequelize.define<CustomerInstance, CustomerAttributes>(
  'Customer',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'customers',
  },
);

export default Customer;
