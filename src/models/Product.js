module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    stock: {
      type: DataTypes.INTEGER,
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
    }
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' });
    Product.belongsToMany(models.Order, { through: models.OrderItem });
  };

  return Product;
};
