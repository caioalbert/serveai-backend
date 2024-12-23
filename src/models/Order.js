module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'open'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Restaurants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    tableId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Tables',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    waiterId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',  // Alterado de 'Waiters' para 'Users'
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' });
    Order.belongsTo(models.Table, { foreignKey: 'tableId' });
    Order.belongsTo(models.User, { foreignKey: 'waiterId', as: 'Waiter' });
    
    // Associações necessárias para OrderItem
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });
    models.OrderItem.belongsTo(models.Order, { foreignKey: 'orderId' });
  };
  

  return Order;
};
