const { User, Table, Product, Restaurant } = require('../models');

async function seed() {
  try {
    const [admin, created] = await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        username: 'admin',
        password: 'admin123',  // Senha em texto puro
        role: 'admin'
      }
    });

    // Se o admin já existir, atualiza a senha (em texto puro)
    if (!created) {
      await User.update(
        { password: 'admin123' },  // Senha pura, o hook irá hashá-la
        { where: { email: 'admin@example.com' } }
      );
      console.log('Senha do admin atualizada.');
    } else {
      console.log('Administrador criado com sucesso.');
    }

    // Criar restaurantes
    const restaurants = [
      { name: 'Restaurante Central', address: 'Rua Principal, 123' },
      { name: 'Pizzaria da Esquina', address: 'Av. dos Sabores, 456' }
    ];
    const createdRestaurants = await Restaurant.bulkCreate(restaurants);

    for (const restaurant of createdRestaurants) {
      // Criar gerente para cada restaurante
      await User.findOrCreate({
        where: { email: `manager+${restaurant.id}@example.com` },
        defaults: {
          username: `manager_${restaurant.id}`,
          password: 'manager123',  // Senha em texto puro
          role: 'manager',
          restaurantId: restaurant.id
        }
      });

      // Criar mesas
      for (let i = 1; i <= 10; i++) {
        await Table.findOrCreate({
          where: { number: i, restaurantId: restaurant.id },
          defaults: {
            capacity: 4,
            status: 'available'
          }
        });
      }

      // Criar produtos
      const products = [
        { name: 'Pizza Margherita', price: 12.99, category: 'Main Course', restaurantId: restaurant.id },
        { name: 'Caesar Salad', price: 8.99, category: 'Starter', restaurantId: restaurant.id },
        { name: 'Tiramisu', price: 6.99, category: 'Dessert', restaurantId: restaurant.id }
      ];
      await Product.bulkCreate(products);

      // Criar garçons (waiters)
      const waiters = [
        {
          name: 'John Doe',
          email: `john+${restaurant.id}@example.com`,
          phone: '1234567890',
          role: 'waiter',
          restaurantId: restaurant.id,
          username: `waiter_${restaurant.id}_1`,
          password: 'waiter123'  // Senha pura
        },
        {
          name: 'Jane Smith',
          email: `jane+${restaurant.id}@example.com`,
          phone: '0987654321',
          role: 'waiter',
          restaurantId: restaurant.id,
          username: `waiter_${restaurant.id}_2`,
          password: 'waiter123'
        }
      ];

      for (const waiter of waiters) {
        const existingUser = await User.findOne({ where: { email: waiter.email } });

        if (!existingUser) {
          await User.create(waiter);  // A senha será hasheada automaticamente pelo hook
        } else {
          console.log(`Usuário com email ${waiter.email} já existe. Pulando...`);
        }
      }
    }

    console.log('Seed concluído com sucesso.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = seed;
