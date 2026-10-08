'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     */
    const passwordHash = await bcrypt.hash('password123', 12);

    // Create sample customer
    const customerResult = await queryInterface.bulkInsert('Users', [{
      email: 'customer@delivery.com',
      password_hash: passwordHash,
      first_name: 'John',
      last_name: 'Customer',
      role: 'customer',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }], {});

    const customerId = await queryInterface.sequelize.query(
      'SELECT id FROM Users WHERE email = \'customer@delivery.com\'',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('Customers', [{
      user_id: customerId[0][0].id,
      phone: '+1 555 0100',
      address: JSON.stringify({ street: '123 Customer St', city: 'Sample City', zipcode: '12345' }),
      created_at: new Date(),
      updated_at: new Date()
    }], {});

    // Create sample rider
    const riderResult = await queryInterface.bulkInsert('Users', [{
      email: 'rider@delivery.com',
      password_hash: passwordHash,
      first_name: 'Jane',
      last_name: 'Rider',
      role: 'rider',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }], {});

    const riderId = await queryInterface.sequelize.query(
      'SELECT id FROM Users WHERE email = \'rider@delivery.com\'',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('Riders', [{
      user_id: riderId[0][0].id,
      vehicle_info: JSON.stringify({ type: 'motorcycle', model: 'Honda CB500', year: 2023, license_plate: 'RIDER123' }),
      license_info: JSON.stringify({ number: 'DL123456', state: 'CA', expires: '2025-12-31' }),
      availability_status: 'available',
      current_location: JSON.stringify({ latitude: 40.7128, longitude: -74.0060 }),
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     */
    await queryInterface.bulkDelete('Riders', {});
    await queryInterface.bulkDelete('Customers', {});
    await queryInterface.bulkDelete('Users', {
      email: { [Sequelize.Op.in]: ['customer@delivery.com', 'rider@delivery.com'] }
    });
  }
};