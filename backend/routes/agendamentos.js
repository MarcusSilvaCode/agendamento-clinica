const express = require("express");
const db = require("../db/connection");
const authMiddleware = require("../middlewares/authMiddleware");
const verificarAdmin = require("../middlewares/adminMiddleware");

const router = express.Router();

/* =========================
   LISTAR AGENDAMENTOS DO USUÁRIO
========================= */
router.get("/", authMiddleware, (req, res) => {
  const usuario_id = req.usuarioId;

  const sql = `
    SELECT 
      a.id,
      a.data,
      a.hora,
      a.status,
      m.nome AS medico_nome,
      m.especialidade AS medico_especialidade
    FROM agendamento a
    JOIN medico m ON m.id = a.medico_id
    WHERE a.usuario_id = ?
    ORDER BY a.data, a.hora
  `;

  db.query(sql, [usuario_id], (err, results) => {
    if (err) {
      console.error("ERRO MYSQL:", err);
      return res.status(500).json({ erro: "Erro ao buscar agendamentos" });
    }

    res.json(results);
  });
});

/* =========================
   CRIAR AGENDAMENTO
========================= */
router.post("/", authMiddleware, (req, res) => {
  const usuario_id = req.usuarioId;
  const { medico_id, data, hora } = req.body;

  if (!usuario_id || !medico_id || !data || !hora) {
    return res.status(400).json({
      erro: "Preencha todos os campos",
    });
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataAgendamento = new Date(data);
  dataAgendamento.setHours(0, 0, 0, 0);

  if (dataAgendamento < hoje) {
    return res.status(400).json({
      erro: "Não é possível agendar para uma data no passado",
    });
  }

  if (dataAgendamento.getTime() === hoje.getTime()) {
    const [horaAg, minutoAg] = hora.split(":").map(Number);
    const agora = new Date();

    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
    const minutosAgendamento = horaAg * 60 + minutoAg;

    if (minutosAgendamento <= minutosAgora) {
      return res.status(400).json({
        erro: "Não é possível agendar para um horário no passado",
      });
    }
  }

  const sqlVerificar = `
    SELECT id FROM agendamento
    WHERE medico_id = ?
      AND data = ?
      AND hora = ?
    LIMIT 1
  `;

  db.query(sqlVerificar, [medico_id, data, hora], (err, resultados) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        erro: "Erro ao verificar disponibilidade",
      });
    }

    if (resultados.length > 0) {
      return res.status(400).json({
        erro: "Este médico já possui um agendamento nesse horário",
      });
    }

    const sqlInsert = `
      INSERT INTO agendamento
      (usuario_id, medico_id, data, hora, status)
      VALUES (?, ?, ?, ?, 'agendado')
    `;

    db.query(sqlInsert, [usuario_id, medico_id, data, hora], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          erro: "Erro ao salvar agendamento",
        });
      }

      res.status(201).json({
        mensagem: "Agendamento criado com sucesso",
        id: result.insertId,
      });
    });
  });
});

/* =========================
   ATUALIZAR AGENDAMENTO
========================= */
router.put("/:id", authMiddleware, (req, res) => {
  const usuarioId = req.usuarioId;
  const agendamentoId = req.params.id;
  const { data, hora, status } = req.body;

  if (!data || !hora) {
    return res.status(400).json({ erro: "Preencha data e hora" });
  }

  db.query(
    `UPDATE agendamento
     SET data = ?, hora = ?, status = ?
     WHERE id = ? AND usuario_id = ?`,
    [data, hora, status || "agendado", agendamentoId, usuarioId],
    (err, result) => {
      if (err) return res.status(500).json({ erro: "Erro ao atualizar" });

      if (result.affectedRows === 0) {
        return res.status(403).json({ erro: "Sem permissão" });
      }

      res.json({ mensagem: "Agendamento atualizado com sucesso" });
    }
  );
});

/* =========================
   EXCLUIR AGENDAMENTO
========================= */
router.delete("/:id", authMiddleware, (req, res) => {
  const usuarioId = req.usuarioId;
  const agendamentoId = req.params.id;

  db.query(
    "DELETE FROM agendamento WHERE id = ? AND usuario_id = ?",
    [agendamentoId, usuarioId],
    (err, result) => {
      if (err) return res.status(500).json({ erro: "Erro ao excluir" });

      if (result.affectedRows === 0) {
        return res.status(403).json({ erro: "Sem permissão" });
      }

      res.json({ mensagem: "Agendamento excluído com sucesso" });
    }
  );
});

/* =========================
   LISTAR TODOS (ADMIN)
========================= */
router.get("/admin", authMiddleware, verificarAdmin, (req, res) => {
  const sql = `
    SELECT 
      a.id,
      a.data,
      a.hora,
      a.status,
      u.nome AS paciente_nome,
      m.nome AS medico_nome,
      m.especialidade
    FROM agendamento a
    JOIN usuario u ON a.usuario_id = u.id
    JOIN medico m ON a.medico_id = m.id
    ORDER BY a.data, a.hora
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("ERRO MYSQL (admin list):", err);
      return res.status(500).json({ erro: "Erro ao buscar agendamentos (admin)" });
    }

    res.json(rows);
  });
});

/* =========================
   ALTERAR STATUS (ADMIN)
========================= */
router.put("/admin/:id/status", authMiddleware, verificarAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const statusValidos = ["agendado", "confirmado", "cancelado", "finalizado"];

  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: "Status inválido" });
  }

  db.query(
    "UPDATE agendamento SET status = ? WHERE id = ?",
    [status, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro ao atualizar status" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Agendamento não encontrado" });
      }

      res.json({ mensagem: "Status atualizado com sucesso" });
    }
  );
});

/*ADMIN- ALTERAR STATUS */

router.put("/admin/:id/status", authMiddleware, verificarAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const statusValidos = ["agendado", "confirmado", "cancelado", "concluido"];

  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: "Status inválido" });
  }

  db.query(
    "UPDATE agendamento SET status = ? WHERE id = ?",
    [status, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro ao atualizar status" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Agendamento não encontrado" });
      }

      res.json({ mensagem: "Status atualizado com sucesso" });
    }
  );
});

module.exports = router;
