const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../connection");
const validator = require("validator");


const router = express.Router();

/* 
   REGISTER
 */
router.post("/register", async (req, res) => {
  let { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  // 🔹 Remove espaços
  email = email.trim().toLowerCase();

  // 🔹 Valida formato
  if (!validator.isEmail(email)) {
    return res.status(400).json({ erro: "Email inválido" });
  }

  // 🔹 Validação mínima de senha
  if (senha.length < 6) {
    return res.status(400).json({ erro: "Senha deve ter no mínimo 6 caracteres" });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  db.query(
    "INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)",
    [nome, email, senhaHash],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ erro: "Email já cadastrado" });
        }
        return res.status(500).json({ erro: "Erro no servidor" });
      }

      res.status(201).json({ mensagem: "Usuário criado com sucesso" });
    }
  );
});

/* 
   LOGIN
= */
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  db.query(
    "SELECT * FROM usuario WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro no servidor" });
      }

      if (results.length === 0) {
        return res.status(401).json({ erro: "Email ou senha inválidos" });
      }

      const usuario = results[0];

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ erro: "Email ou senha inválidos" });
      }

      // 🔐 GERAR TOKEN
      const token = jwt.sign(
        {
          id: usuario.id,
          nome: usuario.nome,
          tipo: usuario.tipo
        },
        process.env.JWT_SECRET,
        { expiresIn: "4h" },
      );

      // ✅ RETORNO CORRETO
      res.json({
        mensagem: "Login realizado com sucesso",
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo
        },
      });
    },
  );
});

module.exports = router;
