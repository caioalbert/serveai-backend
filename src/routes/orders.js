const express = require('express');
const router = express.Router();
const { Order, Table, User, Product, OrderItem } = require('../models');
const roleAuth = require('../middleware/roleAuth');

// Buscar pedidos do restaurante do usuário logado
router.get('/', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        restaurantId: req.user.restaurantId
      },
      include: [
        Table,
        { model: User, as: 'Waiter' },  // Corrigido para 'Waiter'
        { model: OrderItem, as: 'OrderItems' },  // Certifique-se de que OrderItems está correto
        Product
      ]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedidos', error });
  }
});

// Criar novo pedido
router.post('/', roleAuth(['admin', 'manager', 'waiter']), async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      restaurantId: req.user.restaurantId
    });
    if (req.body.products) {
      const items = req.body.products.map(product => ({
        orderId: order.id,
        productId: product.id,
        quantity: product.quantity,
        price: product.price,
        status: product.requiresProduction ? 'pending' : 'ready'
      }));
      await OrderItem.bulkCreate(items);
    }
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar pedido', error });
  }
});

// Adicionar itens ao pedido existente
router.post('/:id/items', roleAuth(['admin', 'manager', 'waiter']), async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        restaurantId: req.user.restaurantId
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    const items = req.body.products.map(product => ({
      orderId: order.id,
      productId: product.id,
      quantity: product.quantity,
      price: product.price,
      status: product.requiresProduction ? 'pending' : 'ready'
    }));

    await OrderItem.bulkCreate(items);

    // Atualizar status do pedido para 'in_progress' se itens exigirem produção
    const requiresKitchen = items.some(item => item.status === 'pending');
    if (requiresKitchen && order.status === 'open') {
      await order.update({ status: 'in_progress' });
    }

    res.json({ message: 'Itens adicionados ao pedido', order });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao adicionar itens ao pedido', error });
  }
});

// Atualizar pedido existente
router.put('/:id', roleAuth(['admin', 'manager', 'waiter']), async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        restaurantId: req.user.restaurantId
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    await order.update(req.body);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar pedido', error });
  }
});

// Deletar pedido
router.delete('/:id', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const deleted = await Order.destroy({
      where: {
        id: req.params.id,
        restaurantId: req.user.restaurantId
      }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Pedido não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar pedido', error });
  }
});

module.exports = router;
