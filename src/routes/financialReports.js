const express = require('express');
const router = express.Router();
const { Order, Product, OrderItem } = require('../models');
const { Op } = require('sequelize');
const roleAuth = require('../middleware/roleAuth');

// Função auxiliar para calcular as estatísticas de vendas
const calculateSalesStats = (orders) => {
  const productSales = {};
  let totalRevenue = 0;

  orders.forEach(order => {
    totalRevenue += parseFloat(order.totalAmount);

    order.OrderItems.forEach(item => {
      const productName = item.Product.name;
      if (!productSales[productName]) {
        productSales[productName] = { quantity: 0, revenue: 0 };
      }
      productSales[productName].quantity += item.quantity;
      productSales[productName].revenue += parseFloat(item.Product.price) * item.quantity;
    });
  });

  return { productSales, totalRevenue };
};

// Relatório Diário
router.get('/daily', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await Order.findAll({
      where: {
        restaurantId: req.user.restaurantId,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      include: [
        {
          model: OrderItem,
          as: 'OrderItems',  // Alias correto
          include: [Product]
        }
      ]
    });

    const { productSales, totalRevenue } = calculateSalesStats(orders);

    res.json({
      date: today.toISOString().split('T')[0],
      orderCount: orders.length,
      totalRevenue,
      productSales
    });
  } catch (error) {
    console.error('Erro ao gerar relatório diário:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório diário', error: error.message });
  }
});

// Relatório Semanal
router.get('/weekly', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const orders = await Order.findAll({
      where: {
        restaurantId: req.user.restaurantId,
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: OrderItem,
          as: 'OrderItems',
          include: [Product]
        }
      ]
    });

    const { productSales, totalRevenue } = calculateSalesStats(orders);

    res.json({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      orderCount: orders.length,
      totalRevenue,
      productSales
    });
  } catch (error) {
    console.error('Erro ao gerar relatório semanal:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório semanal', error: error.message });
  }
});


// Relatório Personalizado
router.get('/custom', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Datas de início e fim são obrigatórias' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);  // Inclui o último dia inteiro

    if (start > end) {
      return res.status(400).json({ message: 'A data de início deve ser anterior à data de fim' });
    }

    const orders = await Order.findAll({
      where: {
        restaurantId: req.user.restaurantId,  // Filtra por restaurante
        createdAt: {
          [Op.between]: [start, end]
        }
      },
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ]
    });

    const { productSales, totalRevenue } = calculateSalesStats(orders);

    const dailyRevenue = {};
    orders.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0];
      dailyRevenue[day] = (dailyRevenue[day] || 0) + parseFloat(order.totalAmount);
    });

    res.json({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      orderCount: orders.length,
      totalRevenue,
      productSales,
      dailyRevenue
    });
  } catch (error) {
    console.error('Erro ao gerar relatório personalizado:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório personalizado', error: error.message });
  }
});

module.exports = router;
