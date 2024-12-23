module.exports = (sequelize, DataTypes) => {
  const Restaurant = sequelize.define('Restaurant', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true,  // createdAt e updatedAt
  });

  // Associações
  Restaurant.associate = (models) => {
    Restaurant.hasMany(models.User, {
      foreignKey: 'restaurantId',
      as: 'users',
    });

    Restaurant.hasMany(models.Table, {
      foreignKey: 'restaurantId',
      as: 'tables',
    });

    Restaurant.hasMany(models.Product, {
      foreignKey: 'restaurantId',
      as: 'products',
    });

    Restaurant.hasMany(models.Order, {
      foreignKey: 'restaurantId',
      as: 'orders',
    });

    Restaurant.hasMany(models.Reservation, {
      foreignKey: 'restaurantId',
      as: 'reservations',
    });

    Restaurant.hasMany(models.Log, {
      foreignKey: 'restaurantId',
      as: 'logs',
    });

    Restaurant.hasMany(models.Waiter, {
      foreignKey: 'restaurantId',
      as: 'waiters',
    });

    Restaurant.hasMany(models.OrderItem, {
      foreignKey: 'restaurantId',
      as: 'orderItems',
    });
  };

  return Restaurant;
};
