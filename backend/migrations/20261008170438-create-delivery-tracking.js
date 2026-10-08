'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DeliveryTrackings', {
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
      latitude: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 8)
      },
      longitude: {
        allowNull: false,
        type: Sequelize.DECIMAL(11, 8)
      },
      accuracy: {
        type: Sequelize.INTEGER
      },
      recordedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('DeliveryTrackings', ['order_id']);
    await queryInterface.addIndex('DeliveryTrackings', ['recordedAt']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DeliveryTrackings');
  }
};