'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2)
      },
      method: {
        allowNull: false,
        type: Sequelize.ENUM('cash', 'card', 'transfer')
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('pending', 'successful', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      transaction_id: {
        type: Sequelize.STRING
      },
      payment_details: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('Payments', ['order_id']);
    await queryInterface.addIndex('Payments', ['status']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Payments');
  }
};