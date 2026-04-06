const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false, // Disable console logging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected Successfully!');
    // Sync models to database
    await sequelize.sync({ force: false }); // Change to true only for dev teardowns
  } catch (err) {
    console.error('Unable to connect to PostgreSQL:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
