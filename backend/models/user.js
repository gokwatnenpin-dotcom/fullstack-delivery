'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Customer, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });
      User.hasOne(models.Rider, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });
      User.hasMany(models.Order, {
        foreignKey: 'customer_id',
        as: 'customerOrders'
      });
      User.hasMany(models.Order, {
        foreignKey: 'rider_id',
        as: 'riderOrders'
      });
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('customer', 'rider', 'admin'),
      allowNull: false,
      defaultValue: 'customer'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return User;
};