'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     */
    const passwordHash = await bcrypt.hash('admin1234', 12);

    await queryInterface.bulkInsert('Users', [{
      email: 'admin@delivery.com',
      password_hash: passwordHash,
      first_name: 'Platform',
      last_name: 'Admin',
      role: 'admin',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }], {});

    // Create admin profile (admin users don't need customer/rider profiles)
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     */
    await queryInterface.bulkDelete('Users', { email: 'admin@delivery.com' }, {});
  }
};