import { Model } from 'sequelize';
import * as DataTypes from 'sequelize';
import sequelize from '../config/database';

interface TaskAttributes {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  projectId: string;
}

type TaskCreationAttributes = Omit<TaskAttributes, 'id' | 'createdAt' | 'updatedAt'>;
interface TaskInstance extends Model<TaskAttributes, TaskCreationAttributes>, TaskAttributes {}

const Task = sequelize.define<TaskInstance, TaskAttributes>(
  'Task',
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
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      allowNull: false,
      defaultValue: 'Medium',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'tasks',
  },
);

export default Task;
