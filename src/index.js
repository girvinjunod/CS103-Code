const express = require("express");
const morgan = require("morgan");
// const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const dotenv = require("dotenv");
const app = express();
const port = 3000;
const mysql = require("mysql2");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { generateAccessToken, authenticateToken } = require("./middleware/jwt");

dotenv.config();

//middleware
// Agar dapat membaca content body JSON
app.use(express.json());
// request logging
app.use(morgan("dev"));
const connection = mysql.createPool({
  connectionLimit: 10,
  host: process.env.dbhost,
  user: process.env.dbuser,
  password: process.env.dbpassword,
  database: process.env.dbname,
  // port: 3340,
});

app.get("/", (req, res) => {
  // console.log(generateAccessToken("username"));
  res.send({ err: false, msg: "Hello World!" });
});

app.post("/login", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let users = await prisma.users.findMany({
    where: { username: username },
  });
  if (users.length === 0) {
    res.status(400).send({ msg: "Username doesn't exist", err: true });
    return;
  } else {
    let compare = await bcrypt.compare(password, users[0].password);
    if (compare) {
      let token = generateAccessToken(username);
      let response = { err: false, msg: "Success", token: token };
      res.status(200).send(response);
      return;
    } else {
      res.status(400).send({ msg: "Wrong password", err: true });
      return;
    }
  }
});

//insert data user
app.post("/register", async (req, res) => {
  let { username, password } = req.body;

  let salt = await bcrypt.genSalt(saltRounds);
  let hash = await bcrypt.hash(password, salt);
  // Store hash in your password DB.
  let result = await prisma.users.create({
    data: {
      username: username,
      password: hash,
    },
  });
  res.send({ err: false, msg: "Success" });

  return;
});

app.get("/persons", authenticateToken, (req, res) => {
  let limit = req.query.limit || 100;

  connection.query("SELECT * from person limit " + limit, (err, rows) => {
    if (err) {
      res.send({ msg: err.message, err: true });
      return;
    }
    if (rows.length > 0) {
      let response = { err: false, msg: "Success", data: rows };
      res.status(200).send(response);
      return;
    }
  });
});

//get person data by id
app.get("/person/:id", (req, res) => {
  let id = req.params.id;
  connection.query("SELECT * from person where id=?", [id], (err, rows) => {
    if (err) {
      res.send({ msg: err.message, err: true });
      return;
    }
    if (rows.length > 0) {
      let response = { err: false, msg: "Success", data: rows };
      res.send(response);
      return;
    } else {
      res.send({ msg: "Data not found", err: true });
      return;
    }
  });
});

//update data person
app.put("/update/:id", (req, res) => {
  let nomor = req.params.id;
  let { lastName, firstName, Address, City } = req.body;

  connection.query(
    "update person set last_name=?, first_name=?, address=?, city=? where id=?",
    [lastName, firstName, Address, City, nomor],
    (err, rows) => {
      if (err) {
        res.send({ msg: err.message, err: true });
      }
      if (rows) {
        let response = { err: false, msg: "Success" };
        res.send(response);
      }
    }
  );

  return;
});

app.delete("/delete/:id", (req, res) => {
  let id = req.params.id;

  connection.query("delete from person where id=?", [id], (err, rows) => {
    if (err) {
      res.send({ msg: err.message, err: true });
    }
    // console.log(rows);
    if (rows) {
      let response = { err: false, msg: "Success" };
      res.send(response);
    }
  });
  return;
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
