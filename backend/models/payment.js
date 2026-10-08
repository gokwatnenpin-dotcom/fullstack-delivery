'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payment.belongsTo(models.Order, {
        foreignKey: 'order_id',
        onDelete: 'CASCADE'
      });
    }
  }
  Payment.init({
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    method: {
      type: DataTypes.ENUM('cash', 'card', 'transfer'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'successful', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending'
    },
    transaction_id: DataTypes.STRING,
    payment_details: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Payment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Payment;
};