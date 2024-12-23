module.exports = (sequelize, DataTypes) => {
  const Table = sequelize.define('Table', {
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'reserved'),
      defaultValue: 'available'
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

  Table.associate = (models) => {
    Table.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' });
    Table.hasMany(models.Order, { foreignKey: 'tableId' });
    Table.hasMany(models.Reservation, { foreignKey: 'tableId' });
  };

  return Table;
};
