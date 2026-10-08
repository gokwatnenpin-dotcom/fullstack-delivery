'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      customer_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      rider_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      pickup_location: {
        allowNull: false,
        type: Sequelize.JSON
      },
      delivery_location: {
        allowNull: false,
        type: Sequelize.JSON
      },
      items: {
        allowNull: false,
        type: Sequelize.JSON
      },
      special_instructions: {
        type: Sequelize.TEXT
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
        defaultValue: 'pending'
      },
      payment_status: {
        allowNull: false,
        type: Sequelize.ENUM('pending', 'successful', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'card', 'transfer')
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2)
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
    await queryInterface.addIndex('Orders', ['customer_id']);
    await queryInterface.addIndex('Orders', ['rider_id']);
    await queryInterface.addIndex('Orders', ['status']);
    await queryInterface.addIndex('Orders', ['payment_status']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};