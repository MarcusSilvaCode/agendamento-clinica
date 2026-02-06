const express = require('express');
const db = require('../db/connection');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/* =========================
   LISTAR MÉDICOS
========================= */
router.get('/', authMiddleware, (req, res) => {
  db.query(
    'SELECT id, nome, especialidade FROM medicos ORDER BY nome',
    (err, results) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar médicos' });
      }
      res.json(results);
    }
  );
});

module.exports = router;
