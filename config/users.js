const bcrypt = require("bcrypt");

module.exports = [
  {
    username: "admin",
    password: bcrypt.hashSync("password123", 10),
  },
  {
    username: "qwer",
    password: bcrypt.hashSync("qwerty", 10),
  },
  {
    username: "web@gmail.com",
    password: bcrypt.hashSync("web12345", 10),
  },
];
