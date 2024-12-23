const { DataTypes } = require('sequelize');
const { sequelize } = require('../models');

module.exports = {
  up: async () => {
    const queryInterface = sequelize.getQueryInterface();

    // Restaurants Table
    await queryInterface.createTable('Restaurants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      address: {
        type: DataTypes.STRING
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });

    // Users Table (inclui waiters, managers e chefs)
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('admin', 'manager', 'waiter', 'chef'),
        defaultValue: 'waiter'
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
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });

    // Tables Table
    await queryInterface.createTable('Tables', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      number: {
        type: DataTypes.INTEGER,
        allowNull: false
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
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });

    await queryInterface.removeConstraint('Tables', 'Tables_number_key');

    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
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
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });

    // Orders Table
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
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
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      status: {
        type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'open'
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  down: async () => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.dropTable('Orders');
    await queryInterface.dropTable('Products');
    await queryInterface.dropTable('Tables');
    await queryInterface.dropTable('Users');
    await queryInterface.dropTable('Restaurants');
  }
};