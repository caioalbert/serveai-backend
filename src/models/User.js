const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'waiter', 'chef'),
      defaultValue: 'waiter',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Restaurants',
        key: 'id'
      },
      allowNull: true,  // Pode ser null para admin
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.associate = (models) => {
    User.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', allowNull: true });
    User.hasMany(models.Log, { foreignKey: 'userId' });
  };

  User.prototype.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
