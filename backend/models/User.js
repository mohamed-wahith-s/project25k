const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  
  // Student Details
  studentName: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  physics: { type: DataTypes.FLOAT },
  chemistry: { type: DataTypes.FLOAT },
  maths: { type: DataTypes.FLOAT },
  caste: { type: DataTypes.STRING },
  cutoff: { type: DataTypes.FLOAT },
  
  // Subscription status
  isSubscribed: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true
});

module.exports = User;
