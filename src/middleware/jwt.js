const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generateAccessToken = (username) => {
  return jwt.sign({ username: username }, process.env.TOKEN, {
    expiresIn: "1800s",
  });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.status(401).send({ err: true, message: "No token provided." });

  jwt.verify(token, process.env.TOKEN, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).send({ err: true, msg: "Forbidden" });
    }

    req.user = user;

    next();
  });
};

module.exports = { generateAccessToken, authenticateToken };
