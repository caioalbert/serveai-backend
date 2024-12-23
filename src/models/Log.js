module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define('Log', {
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    details: {
      type: DataTypes.TEXT
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
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  });

  Log.associate = (models) => {
    Log.belongsTo(models.User, { foreignKey: 'userId' });
    Log.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' });
  };

  return Log;
};
