const express = require('express');
const router = express.Router();
const { Reservation, Table } = require('../models');
const roleAuth = require('../middleware/roleAuth');

// Criar nova reserva
router.post('/', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const reservation = await Reservation.create({
      ...req.body,
      restaurantId: req.user.restaurantId  // Associa a reserva ao restaurante do usuário
    });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar reserva', error });
  }
});

// Buscar reservas do restaurante do usuário logado
router.get('/', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { restaurantId: req.user.restaurantId },
      include: [{ model: Table }],
      order: [['date', 'ASC']]
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar reservas', error });
  }
});

// Atualizar reserva existente
router.put('/:id', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      where: {
        id: req.params.id,
        restaurantId: req.user.restaurantId
      }
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva não encontrada' });
    }

    await reservation.update(req.body);
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar reserva', error });
  }
});

// Deletar reserva
router.delete('/:id', roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const deleted = await Reservation.destroy({
      where: {
        id: req.params.id,
        restaurantId: req.user.restaurantId
      }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Reserva não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar reserva', error });
  }
});

module.exports = router;
