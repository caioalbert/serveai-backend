const jwt = require('jsonwebtoken');

const roleAuth = (roles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      if (roles.includes('public')) {
        return next();
      }
      return res.status(401).json({ message: 'Token não fornecido.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente.' });
      }

      next();
    } catch (error) {
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
  };
};

module.exports = roleAuth;  // Certifique-se de exportar corretamente
