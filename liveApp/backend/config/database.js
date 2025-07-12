const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('Thaboera_db', 'postgres', '1234', {
  host: 'localhost',
  port: 5432,  //5433 work pc port
  dialect: 'postgres'
});

module.exports = sequelize;
