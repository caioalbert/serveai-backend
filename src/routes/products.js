const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const roleAuth = require('../middleware/roleAuth');

// Listar produtos do restaurante do usuário logado
router.get('/', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { restaurantId: req.user.restaurantId }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error });
  }
});

// Criar novo produto
router.post('/', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      restaurantId: req.user.restaurantId  // Associa produto ao restaurante do usuário
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar produto', error });
  }
});

// Atualizar produto existente
router.put('/:id', roleAuth(['admin', 'manager']), async (req, res) => {
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

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar produto', error });
  }
});

// Deletar produto
router.delete('/:id', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: {
        id: req.params.id,
        restaurantId: req.user.restaurantId  // Garante que o produto pertence ao restaurante correto
      }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Produto não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar produto', error });
  }
});

module.exports = router;
