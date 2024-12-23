const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const roleAuth = require('../middleware/roleAuth');

// Listar todos os produtos do restaurante do usuário logado
router.get('/', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { restaurantId: req.user.restaurantId }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar inventário', error });
  }
});

// Atualizar estoque de um produto
router.put('/:id/stock', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
        restaurantId: req.user.restaurantId  // Garante que o produto pertence ao restaurante correto
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    product.stock = req.body.stock;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar estoque', error });
  }
});

module.exports = router;
