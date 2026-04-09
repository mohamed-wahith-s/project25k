const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

// College Table
const College = sequelize.define('College', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  collegeCode: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING },
  district: { type: DataTypes.STRING }
});

// Departments / Branches Table
const Department = sequelize.define('Department', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  branchName: { type: DataTypes.STRING, allowNull: false },
  branchCode: { type: DataTypes.STRING },
  
  // Cutoffs for the 7 TNEA Communities
  oc: { type: DataTypes.FLOAT },
  bc: { type: DataTypes.FLOAT },
  bcm: { type: DataTypes.FLOAT },
  mbc: { type: DataTypes.FLOAT },
  sc: { type: DataTypes.FLOAT },
  sca: { type: DataTypes.FLOAT },
  st: { type: DataTypes.FLOAT },
  
  // Available seats per community
  seats: { type: DataTypes.JSONB }
});

College.hasMany(Department, { as: 'branches', onDelete: 'CASCADE' });
Department.belongsTo(College);

module.exports = { College, Department };
