import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class DeliveryTracking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DeliveryTracking.belongsTo(models.Order, {
        foreignKey: 'order_id',
        onDelete: 'CASCADE'
      });
    }
  }
  DeliveryTracking.init({
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    location: DataTypes.JSON,
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')
    },
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'DeliveryTracking',
    tableName: 'DeliveryTrackings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return DeliveryTracking;
};