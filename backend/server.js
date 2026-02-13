require("dotenv").config();
console.log("SERVER CORRETO CARREGADO");

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const authRoutes = require("./db/routes/auth");
const agendamentoRoutes = require("./routes/agendamentos"); // singular
const medicosRoutes = require("./routes/medicos");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   CONEXÃO COM O BANCO
========================= */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "agendamento_db",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar no MySQL:", err);
    return;
  }
  console.log("MySQL conectado com sucesso!");
});

/* =========================
   ROTAS PRINCIPAIS
========================= */

app.use("/auth", authRoutes);
app.use("/agendamento", agendamentoRoutes);
app.use("/medicos", medicosRoutes);

/* =========================
   ROTA TESTE
========================= */
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

/* =========================
   CRUD DIRETO (SIMPLIFICADO)
   (Sem conflito e compatível com seu banco)
========================= */

// LISTAR TODOS
app.get("/agendamento-teste", (req, res) => {
  const sql = "SELECT * FROM agendamento";

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao buscar agendamentos" });
    }

    res.json(results);
  });
});

// CRIAR
app.post("/agendamento-teste", (req, res) => {
  const { usuario_id, medico_id, data, hora } = req.body;

  if (!usuario_id || !medico_id || !data || !hora) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  const sql = `
    INSERT INTO agendamento (usuario_id, medico_id, data, hora, status)
    VALUES (?, ?, ?, ?, 'agendado')
  `;

  db.query(sql, [usuario_id, medico_id, data, hora], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao criar agendamento" });
    }

    res.status(201).json({
      mensagem: "Agendamento criado com sucesso",
      id: result.insertId,
    });
  });
});

// BUSCAR POR ID
app.get("/agendamento-teste/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM agendamento WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ erro: "Agendamento não encontrado" });
      }

      res.json(result[0]);
    }
  );
});

// ATUALIZAR
app.put("/agendamento-teste/:id", (req, res) => {
  const { id } = req.params;
  const { data, hora, status } = req.body;

  const sql = `
    UPDATE agendamento
    SET data = ?, hora = ?, status = ?
    WHERE id = ?
  `;

  db.query(sql, [data, hora, status || "agendado", id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Agendamento não encontrado" });
    }

    res.json({ mensagem: "Agendamento atualizado com sucesso" });
  });
});

// DELETAR
app.delete("/agendamento-teste/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM agendamento WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Agendamento não encontrado" });
      }

      res.json({ mensagem: "Agendamento excluído com sucesso" });
    }
  );
});

/* =========================
   SERVIDOR
========================= */
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
