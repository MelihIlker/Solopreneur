import sequelize from '../config/database';
import User from './UserModel';
import Customer from './CustomerModel';
import Invoice from './InvoiceModel';
import Project from './ProjectModel';
import Task from './TaskModel';

User.hasMany(Customer, { foreignKey: 'userId', as: 'customers', onDelete: 'CASCADE' });
Customer.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

User.hasMany(Invoice, { foreignKey: 'userId', as: 'invoices', onDelete: 'CASCADE' });
Invoice.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

User.hasMany(Project, { foreignKey: 'userId', as: 'projects', onDelete: 'CASCADE' });
Project.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Customer.hasMany(Project, { foreignKey: 'customerId', as: 'projects', onDelete: 'CASCADE' });
Project.belongsTo(Customer, { foreignKey: 'customerId', as: 'client' });

// FIX: Project hasMany Task, not belongsTo
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Customer.hasMany(Invoice, { foreignKey: 'customerId', as: 'invoices', onDelete: 'CASCADE' });
Invoice.belongsTo(Customer, { foreignKey: 'customerId', as: 'client' });

Project.hasMany(Invoice, { foreignKey: 'projectId', as: 'invoices', onDelete: 'CASCADE' });
Invoice.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

const models = {
  User,
  Customer,
  Invoice,
  Project,
  Task,
};

const initModels = async () => {
  await sequelize.sync({ force: false });
};

export { models, initModels, sequelize };