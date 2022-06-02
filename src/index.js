const express = require("express");
const morgan = require("morgan");
// const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const dotenv = require("dotenv");
const app = express();
const port = 3000;
const mysql = require("mysql2");

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

app.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  connection.query(
    "SELECT * from users where username=? limit 1",
    [username],
    (err, rows) => {
      if (err || rows.length === 0) {
        res.status(400).send({ msg: "Username doesn't exist", err: true });
        return;
      }
      bcrypt.compare(password, rows[0].password, function (err, result) {
        // result == true
        if (result) {
          let token = generateAccessToken(username);
          let response = { err: false, msg: "Success", token: token };
          res.status(200).send(response);
          return;
        } else {
          res.status(400).send({ msg: "Wrong password", err: true });
          return;
        }
      });
    }
  );
});

//insert data user
app.post("/register", (req, res) => {
  let { username, password } = req.body;

  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      // Store hash in your password DB.
      connection.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hash],
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
    });
  });
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
