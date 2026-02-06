require('dotenv').config();
console.log('SERVER CORRETO CARREGADO');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const authRoutes = require('./db/routes/auth');
const agendamentosRoutes = require('./routes/agendamentos')
const medicosRoutes = require('./routes/medicos');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/agendamentos', agendamentosRoutes);
app.use('/medicos', medicosRoutes);


// conexão com o banco
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // coloque a senha se existir
  database: 'agendamento_db'
});

// testar conexão
db.connect(err => {
  if (err) {
    console.error('Erro ao conectar no MySQL:', err);
    return;
  }
  console.log('MySQL conectado com sucesso!');
});

// rota teste
app.get('/', (req, res) => {
  res.send('API rodando 🚀');
});

// 🔹 rota para listar agendamentos
app.get('/agendamentos', (req, res) => {
  const sql = 'SELECT * FROM agendamentos';

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
    }

    res.json(results);
  });
});
app.post('/agendamentos', (req, res) => {
  const { usuario_id, data, horario, descricao } = req.body;

  const sql = `
    INSERT INTO agendamentos (usuario_id, data, horario, descricao)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [usuario_id, data, horario, descricao], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao criar agendamento' });
    }

    res.status(201).json({
      mensagem: 'Agendamento criado com sucesso',
      id: result.insertId
    });
  });
});
app.delete('/agendamentos/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM agendamentos WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao excluir agendamento' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

    res.json({ mensagem: 'Agendamento excluído com sucesso' });
  });
});
app.get('/agendamentos/:id', (req, res) => {
  const { id } = req.params;

  db.query(
    'SELECT * FROM agendamentos WHERE id = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0]);
    }
  );
});
app.put('/agendamentos/:id', (req, res) => {
  const { id } = req.params;
  const { data, horario, descricao } = req.body;

  db.query(
    'UPDATE agendamentos SET data = ?, horario = ?, descricao = ? WHERE id = ?',
    [data, horario, descricao, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ mensagem: 'Agendamento atualizado com sucesso' });
    }
  );
});


// servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
