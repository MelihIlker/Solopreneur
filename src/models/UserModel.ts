import { Model } from 'sequelize';
import * as DataTypes from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: string;
  role: string;
  name: string;
  email: string;
  password: string;
  hourlyRate?: number;
  bio?: string;
  profilePicture?: string;
  googleId?: string;
  githubId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt'>;

interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

const User = sequelize.define<UserInstance, UserAttributes>(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    githubId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    }
  },
  {
    timestamps: true,
    tableName: 'users',
  },
);

export default User;
