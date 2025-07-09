import { Model } from 'sequelize';
import * as DataTypes from 'sequelize';
import sequelize from '../config/database';

interface ProjectAttributes {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  customerId?: string;
}

type ProjectCreationAttributes = Omit<ProjectAttributes, 'id' | 'createdAt' | 'updatedAt'>;
interface ProjectInstance
  extends Model<ProjectAttributes, ProjectCreationAttributes>,
    ProjectAttributes {}

const Project = sequelize.define<ProjectInstance, ProjectAttributes>(
  'Project',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Not Started',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    budget: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'projects',
  },
);

export default Project;
