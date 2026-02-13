module.exports = (req, res, next) => {
  // authMiddleware deve ter setado req.usuario
  if (!req.usuario || !req.usuario.tipo) {
    return res.status(401).json({ erro: "Não autenticado" });
  }

  if (req.usuario.tipo !== "admin") {
    return res.status(403).json({ erro: "Acesso negado" });
  }

  console.log("TIPO DO USUÁRIO:", req.tipo);

  next();
};
