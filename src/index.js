const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('node:http');
const { Sequelize } = require('sequelize');
const { Client } = require('pg');
const seed = require('./seeders/seed');
const { Umzug, SequelizeStorage } = require('umzug');
const jwt = require('jsonwebtoken');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Escuta de eventos do Socket.IO
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });

  socket.on('orderUpdated', (order) => {
    io.emit('orderUpdated', order);
  });

  socket.on('newOrder', (order) => {
    io.emit('newOrder', order);
  });
});

// Importando rotas
const authRoutes = require('./routes/auth');
const tablesRoutes = require('./routes/tables');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const kitchenRoutes = require('./routes/kitchen');
const inventoryRoutes = require('./routes/inventory');
const financialReportsRoutes = require('./routes/financialReports');
const reservationsRoutes = require('./routes/reservations');
const restaurantRoutes = require('./routes/restaurants');
const usersRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/financial-reports', financialReportsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/users', usersRoutes);

const PORT = process.env.PORT || 5000;

const resetDatabase = async () => {
  const dbName = process.env.PGDATABASE;

  // Conexão com o banco 'postgres' para apagar/criar outro banco
  const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: 'postgres'
  });

  try {
    await client.connect();

    console.log(`Apagando banco de dados "${dbName}"...`);
    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`Banco de dados "${dbName}" apagado.`);

    console.log(`Criando banco de dados "${dbName}"...`);
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Banco de dados "${dbName}" criado com sucesso.`);
  } catch (error) {
    console.error('Erro ao resetar banco de dados:', error);
  } finally {
    await client.end();
  }
};

// Conectando ao banco de dados PostgreSQL com Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,  // Defina como true se você quiser ver os logs de SQL
});


const umzug = new Umzug({
  migrations: { glob: 'src/migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Conectado ao banco de dados com sucesso!');
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });

server.listen(PORT, async () => {
  const resetDb = process.argv.includes('--reset-db');

  try {
    if (resetDb) {
      console.log('Resetando banco de dados completamente...');
      await resetDatabase();

      // Reconecta ao Sequelize após recriar o banco
      await sequelize.sync({ force: true });
      console.log('Banco de dados recriado e sincronizado.');
    }

    console.log('Rodando migrações...');
    await umzug.up();
    console.log('Migrações concluídas com sucesso.');

    // Executa seed após reset do banco
    if (resetDb) {
      console.log('Executando seed após reset...');
      await seed();
      console.log('Seed concluído com sucesso após reset.');
    } else {
      // Verifica se o seed é necessário caso não haja usuários
      const [results] = await sequelize.query('SELECT COUNT(*) AS count FROM "Users"');
      const userCount = results[0].count;

      if (userCount === '0') {
        console.log('Nenhum usuário encontrado. Executando seed...');
        await seed();
        console.log('Seed concluído com sucesso.');
      } else {
        console.log(`Encontrados ${userCount} usuários. Seed não é necessário.`);
      }
    }
  } catch (error) {
    console.error('Erro ao executar migração ou seed:', error);
  }
});
