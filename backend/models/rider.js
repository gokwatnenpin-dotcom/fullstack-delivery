'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rider extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Rider.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });
    }
  }
  Rider.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    vehicle_info: DataTypes.JSON,
    license_info: DataTypes.JSON,
    availability_status: {
      type: DataTypes.ENUM('available', 'busy', 'offline'),
      allowNull: false,
      defaultValue: 'offline'
    },
    current_location: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Rider',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Rider;
};