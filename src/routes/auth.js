const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, Restaurant } = require('../models');
const bcrypt = require('bcryptjs');

// Registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, restaurantId } = req.body;

    // Se o usuário não for admin, o restaurantId deve ser obrigatório
    if (role !== 'admin' && !restaurantId) {
      return res.status(400).json({ message: 'restaurantId é obrigatório para essa função' });
    }

    // Verifica se o restaurante existe
    if (restaurantId) {
      const restaurant = await Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurante não encontrado' });
      }
    }

    const user = await User.create({
      username,
      password,
      role,
      restaurantId: role === 'admin' ? null : restaurantId
    });

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao registrar usuário', error });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Buscando usuário com o username: ", username)

    const user = await User.findOne({ where: { username } });
    console.log('Senha inserida:', password);
    console.log('Senha armazenada:', user.password);

    console.log("Usuário: ", user)
    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    // Comparação manual de senha usando bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Is Match? ", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Senha incorreta' });
    }

    // Adicionar restaurantId no token
    const token = jwt.sign(
      { id: user.id, role: user.role, restaurantId: user.restaurantId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        restaurantId: user.restaurantId
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao fazer login', error });
  }
});
module.exports = router;
