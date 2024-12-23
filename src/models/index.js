const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {},
  }
);

const db = {
  sequelize,
  Sequelize,
};

// Importar modelos
db.User = require('./User')(sequelize, Sequelize);
db.Table = require('./Table')(sequelize, Sequelize);
db.Product = require('./Product')(sequelize, Sequelize);
db.Order = require('./Order')(sequelize, Sequelize);
db.OrderItem = require('./OrderItem')(sequelize, Sequelize);
db.Reservation = require('./Reservation')(sequelize, Sequelize);
db.Log = require('./Log')(sequelize, Sequelize);
db.Restaurant = require('./Restaurant')(sequelize, Sequelize);

// Definir associações
// Relacionamentos com Restaurante (diretamente associados)
// Associações com o Restaurante
db.Restaurant.hasMany(db.Table, { foreignKey: 'restaurantId', as: 'tables' });
db.Restaurant.hasMany(db.Product, { foreignKey: 'restaurantId', as: 'products' });
db.Restaurant.hasMany(db.Order, { foreignKey: 'restaurantId', as: 'orders' });
db.Restaurant.hasMany(db.Reservation, { foreignKey: 'restaurantId', as: 'reservations' });
db.Restaurant.hasMany(db.Log, { foreignKey: 'restaurantId', as: 'logs' });
db.Restaurant.hasMany(db.OrderItem, { foreignKey: 'restaurantId', as: 'orderItems' });

// Relacionamento entre Restaurante e Usuário (gerente, garçom, chef)
db.Restaurant.hasMany(db.User, { foreignKey: 'restaurantId', as: 'users', allowNull: true });
db.User.belongsTo(db.Restaurant, { foreignKey: 'restaurantId', allowNull: true });

// Relacionamentos principais
db.Order.belongsTo(db.Table);
db.Table.hasMany(db.Order);

db.Order.belongsTo(db.User, { foreignKey: 'waiterId', as: 'Waiter' });  // Alias para clareza
db.User.hasMany(db.Order, { foreignKey: 'waiterId', as: 'WaiterOrders' });  // Diferencia pedidos do garçom

db.Order.belongsToMany(db.Product, { through: db.OrderItem });
db.Product.belongsToMany(db.Order, { through: db.OrderItem });
db.Order.hasMany(db.OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });

db.OrderItem.belongsTo(db.Order);
db.OrderItem.belongsTo(db.Product);
db.OrderItem.belongsTo(db.Restaurant);

db.Reservation.belongsTo(db.Table);
db.Table.hasMany(db.Reservation);

db.Log.belongsTo(db.User);
db.User.hasMany(db.Log);


// Sincronizar modelos com o banco de dados
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Modelos sincronizados com o banco de dados');
  })
  .catch((error) => {
    console.error('Erro ao sincronizar modelos:', error);
  });

module.exports = db;
