module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define('Reservation', {
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    partySize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'pending', 'cancelled'),
      defaultValue: 'pending'
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
    }
  });

  Reservation.associate = (models) => {
    Reservation.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' });
    Reservation.belongsTo(models.Table, { foreignKey: 'tableId' });
  };

  return Reservation;
};
