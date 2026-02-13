const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  const partes = authHeader.split(" ");

  if (partes.length !== 2) {
    return res.status(401).json({ erro: "Token mal formatado" });
  }

  const [tipo, token] = partes;

  if (tipo !== "Bearer") {
    return res.status(401).json({ erro: "Token mal formatado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ erro: "Token inválido ou expirado" });
    }

    // 🔥 SALVANDO USUÁRIO COMPLETO
    req.usuario = decoded;
    req.usuarioId = decoded.id;
    req.tipo = decoded.tipo;

    console.log("TOKEN DECODIFICADO:", decoded);


    next();
  });
};
