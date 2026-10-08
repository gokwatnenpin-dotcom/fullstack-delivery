'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Riders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vehicle_info: {
        type: Sequelize.JSON
      },
      license_info: {
        type: Sequelize.JSON
      },
      availability_status: {
        allowNull: false,
        type: Sequelize.ENUM('available', 'busy', 'offline'),
        defaultValue: 'offline'
      },
      current_location: {
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
    await queryInterface.addIndex('Riders', ['user_id']);
    await queryInterface.addIndex('Riders', ['availability_status']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Riders');
  }
};