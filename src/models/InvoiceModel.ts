import { Model } from 'sequelize';
import * as DataTypes from 'sequelize';
import sequelize from '../config/database';

interface InvoiceAttributes {
  id: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  amount: number;
  status: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  customerId: string;
  projectId?: string;
}

type InvoiceCreationAttributes = Omit<InvoiceAttributes, 'id' | 'createdAt' | 'updatedAt'>;
interface InvoiceInstance
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>,
    InvoiceAttributes {}

const Invoice = sequelize.define<InvoiceInstance, InvoiceAttributes>(
  'Invoice',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    issueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Paid', 'Overdue'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'invoices',
  },
);

export default Invoice;
