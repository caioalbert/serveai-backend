// src/routes/restaurants.js
const express = require('express');
const { Restaurant, User } = require('../models');
const roleAuth = require('../middleware/roleAuth');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.post('/', roleAuth(['admin']), async (req, res) => {
  const { name, address, managerName, managerEmail, managerPassword, username } = req.body;

  // Validação do campo username
  if (!username) {
    return res.status(400).json({ message: 'O campo "username" é obrigatório para o gerente' });
  }

  try {
    const newRestaurant = await Restaurant.create({ name, address });

    const hashedPassword = await bcrypt.hash(managerPassword, 10);
    const newManager = await User.create({
      username,  // Certifique-se de incluir o campo username
      name: managerName,
      email: managerEmail,
      password: hashedPassword,
      role: 'manager',
      restaurantId: newRestaurant.id
    });

    res.status(201).json({ newRestaurant, newManager });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar restaurante e gerente', error });
  }
});

// Listar todos os restaurantes (Apenas admin)
router.get('/', roleAuth(['admin']), async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar restaurantes', error });
  }
});

// Obter restaurante por ID (Apenas admin ou gerente do restaurante)
router.get('/:id', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findOne({
      where: {
        id,
        ...(req.user.role === 'manager' && { id: req.user.restaurantId })  // Restringe gerente ao seu restaurante
      }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurante não encontrado' });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar restaurante', error });
  }
});

// Atualizar restaurante (Apenas admin ou gerente do restaurante)
router.put('/:id', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    const restaurant = await Restaurant.findOne({
      where: {
        id,
        ...(req.user.role === 'manager' && { id: req.user.restaurantId })  // Restringe gerente ao seu restaurante
      }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurante não encontrado' });
    }

    await restaurant.update({ name, address });
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar restaurante', error });
  }
});

// Excluir restaurante (Apenas admin pode excluir)
router.delete('/:id', roleAuth(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurante não encontrado' });
    }

    await restaurant.destroy();
    res.status(200).json({ message: 'Restaurante excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir restaurante', error });
  }
});

module.exports = router;
