const express = require('express');
const router = express.Router();
const { Table } = require('../models');
const roleAuth = require('../middleware/roleAuth');

// Listar mesas do restaurante do usuário logado
router.get('/', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const tables = await Table.findAll({
      where: { restaurantId: req.user.restaurantId }
    });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar mesas', error });
  }
});

// Criar nova mesa (associada ao restaurante do usuário logado)
router.post('/', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const table = await Table.create({
      ...req.body,
      restaurantId: req.user.restaurantId  // Associa mesa ao restaurante
    });
    res.status(201).json(table);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar mesa', error });
  }
});

// Atualizar mesa existente
router.put('/:id', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const table = await Table.findOne({
      where: {
        id: req.params.id,
        restaurantId: req.user.restaurantId  // Garante que a mesa pertence ao restaurante correto
      }
    });

    if (!table) {
      return res.status(404).json({ message: 'Mesa não encontrada' });
    }

    await table.update(req.body);
    res.json(table);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar mesa', error });
  }
});

// Deletar mesa
router.delete('/:id', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const deleted = await Table.destroy({
      where: {
        id: req.params.id,
        restaurantId: req.user.restaurantId  // Garante que a mesa pertence ao restaurante correto
      }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Mesa não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar mesa', error });
  }
});

module.exports = router;
