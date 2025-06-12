const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.authenticate = authenticate;
