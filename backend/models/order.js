'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, {
        foreignKey: 'customer_id',
        as: 'customer'
      });
      Order.belongsTo(models.User, {
        foreignKey: 'rider_id',
        as: 'rider'
      });
      Order.hasMany(models.Payment, {
        foreignKey: 'order_id',
        onDelete: 'CASCADE'
      });
      Order.hasMany(models.DeliveryTracking, {
        foreignKey: 'order_id',
        onDelete: 'CASCADE'
      });
    }
  }
  Order.init({
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    rider_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    pickup_location: {
      type: DataTypes.JSON,
      allowNull: false
    },
    delivery_location: {
      type: DataTypes.JSON,
      allowNull: false
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false
    },
    special_instructions: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'successful', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending'
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'card', 'transfer')
    },
    amount: DataTypes.DECIMAL(10, 2)
  }, {
    sequelize,
    modelName: 'Order',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Order;
};