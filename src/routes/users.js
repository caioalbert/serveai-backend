const express = require('express');
const router = express.Router();
const { User } = require('../models');
const roleAuth = require('../middleware/roleAuth');
const bcrypt = require('bcryptjs');

// Listar usuários do restaurante do usuário logado
router.get('/', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const whereClause = req.user.role === 'admin' ? {} : { restaurantId: req.user.restaurantId };
    const users = await User.findAll({ where: whereClause });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error });
  }
});

// Criar novo usuário
router.post('/', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { password, ...userData } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      restaurantId: req.user.restaurantId  // Associa o usuário ao restaurante do criador
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar usuário', error });
  }
});

// Atualizar usuário
router.put('/:id', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { password, ...updates } = req.body;
    
    const user = await User.findOne({
      where: {
        id: req.params.id,
        restaurantId: req.user.restaurantId  // Garante que o usuário pertence ao restaurante
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    await user.update(updates);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar usuário', error });
  }
});

// Deletar usuário
router.delete('/:id', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: {
        id: req.params.id,
        restaurantId: req.user.restaurantId  // Garante que o usuário pertence ao restaurante correto
      }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário', error });
  }
});

module.exports = router;
