const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product } = require('../models');
const { Op } = require('sequelize');
const roleAuth = require('../middleware/roleAuth');

// Buscar fila de pedidos
router.get('/queue', roleAuth(['admin', 'chef']), async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        restaurantId: req.user.restaurantId,  // Filtra por restaurante
        status: {
          [Op.in]: ['pending', 'preparing']
        }
      },
      include: [
        {
          model: OrderItem,
          include: [Product],
          where: {
            status: {
              [Op.in]: ['pending', 'preparing']
            }
          }
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar fila de pedidos', error });
  }
});

// Atualizar item de pedido
router.put('/item/:id', roleAuth(['admin', 'chef']), async (req, res) => {
  try {
    const item = await OrderItem.findOne({
      where: {
        id: req.params.id
      },
      include: [{ model: Order, where: { restaurantId: req.user.restaurantId } }]
    });

    if (!item) {
      return res.status(404).json({ message: 'Item do pedido não encontrado' });
    }

    item.status = req.body.status || item.status;
    await item.save();

    const updatedItem = await OrderItem.findByPk(req.params.id, {
      include: [Product]
    });

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar item do pedido', error });
  }
});

module.exports = router;
