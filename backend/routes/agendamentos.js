const express = require('express');
const db = require('../db/connection');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/* =========================
   LISTAR AGENDAMENTOS
========================= */
router.get('/', authMiddleware, (req, res) => {
  const usuario_id = req.usuarioId;

  const sql = `
    SELECT 
      a.id,
      a.data,
      a.horario,
      m.nome AS medico_nome,
      m.especialidade AS medico_especialidade
    FROM agendamentos a
    JOIN medicos m ON m.id = a.medico_id
    WHERE a.usuario_id = ?
    ORDER BY a.data, a.horario
  `;

  db.query(sql, [usuario_id], (err, results) => {
    if (err) {
      console.error('ERRO MYSQL:', err);
      return res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
    }

    res.json(results);
  });
});

/* =========================
   CRIAR AGENDAMENTO
========================= */
router.post('/', authMiddleware, (req, res) => {
  console.log("===== NOVO AGENDAMENTO =====");
  console.log("BODY:", req.body);
  console.log("USUARIO_ID:", req.usuarioId);

  const usuario_id = req.usuarioId;
  const { medico_id, data, horario } = req.body;

  // 1️⃣ valida campos obrigatórios
  if (!usuario_id || !medico_id || !data || !horario) {
    return res.status(400).json({
      erro: 'Preencha todos os campos'
    });
  }

  /* ======================================================
     2️⃣ VALIDAÇÃO CORRETA DE DATA E HORÁRIO (SEM FUSO)
  ====================================================== */

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataAgendamento = new Date(data);
  dataAgendamento.setHours(0, 0, 0, 0);

  // ❌ data no passado
  if (dataAgendamento < hoje) {
    return res.status(400).json({
      erro: 'Não é possível agendar para uma data no passado'
    });
  }

  // ❌ mesmo dia, horário no passado
  if (dataAgendamento.getTime() === hoje.getTime()) {
    const [hora, minuto] = horario.split(':').map(Number);

    const agora = new Date();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
    const minutosAgendamento = hora * 60 + minuto;

    if (minutosAgendamento <= minutosAgora) {
      return res.status(400).json({
        erro: 'Não é possível agendar para um horário no passado'
      });
    }
  }

  /* ======================================================
     3️⃣ VERIFICAR SE MÉDICO JÁ TEM HORÁRIO OCUPADO
  ====================================================== */

  const sqlVerificar = `
    SELECT id FROM agendamentos
    WHERE medico_id = ?
      AND data = ?
      AND horario = ?
    LIMIT 1
  `;

  db.query(
    sqlVerificar,
    [medico_id, data, horario],
    (err, resultados) => {
      if (err) {
        console.error('ERRO MYSQL (verificação):', err);
        return res.status(500).json({
          erro: 'Erro ao verificar disponibilidade do médico'
        });
      }

      if (resultados.length > 0) {
        return res.status(400).json({
          erro: 'Este médico já possui um agendamento nesse horário'
        });
      }

      /* ======================================================
         4️⃣ INSERIR AGENDAMENTO
      ====================================================== */

      const sqlInsert = `
        INSERT INTO agendamentos (usuario_id, medico_id, data, horario)
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        sqlInsert,
        [usuario_id, medico_id, data, horario],
        (err, result) => {
          if (err) {
            console.error('ERRO MYSQL (insert):', err);
            return res.status(500).json({
              erro: 'Erro ao salvar agendamento'
            });
          }

          res.status(201).json({
            mensagem: 'Agendamento criado com sucesso',
            id: result.insertId
          });
        }
      );
    }
  );
});



/* =========================
   ATUALIZAR AGENDAMENTO
========================= */
router.put('/:id', authMiddleware, (req, res) => {
  const usuarioId = req.usuarioId;
  const agendamentoId = req.params.id;
  const { data, horario, descricao } = req.body;

  if (!data || !horario || !descricao) {
    return res.status(400).json({ erro: 'Preencha todos os campos' });
  }

  db.query(
    `UPDATE agendamentos 
     SET data = ?, horario = ?, descricao = ?
     WHERE id = ? AND usuario_id = ?`,
    [data, horario, descricao, agendamentoId, usuarioId],
    (err, result) => {
      if (err) return res.status(500).json({ erro: 'Erro ao atualizar' });

      if (result.affectedRows === 0) {
        return res.status(403).json({ erro: 'Sem permissão' });
      }

      res.json({ mensagem: 'Agendamento atualizado com sucesso' });
    }
  );
});

/* =========================
   EXCLUIR AGENDAMENTO
========================= */
router.delete('/:id', authMiddleware, (req, res) => {
  const usuarioId = req.usuarioId;
  const agendamentoId = req.params.id;

  db.query(
    'DELETE FROM agendamentos WHERE id = ? AND usuario_id = ?',
    [agendamentoId, usuarioId],
    (err, result) => {
      if (err) return res.status(500).json({ erro: 'Erro ao excluir' });

      if (result.affectedRows === 0) {
        return res.status(403).json({ erro: 'Sem permissão' });
      }

      res.json({ mensagem: 'Agendamento excluído com sucesso' });
    }
  );
});

module.exports = router;
