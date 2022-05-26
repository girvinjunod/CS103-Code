const express = require("express");
const morgan = require("morgan");
const app = express();
const port = 3000;
const mysql = require("mysql2");

//middleware
// Agar dapat membaca content body JSON
app.use(express.json());
// request logging
app.use(morgan("dev"));

const connection = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "admin_test",
  password: "csbackend",
  database: "test",
  // port: 3340,
});

app.get("/", (req, res) => {
  res.send({ err: false, msg: "Hello World!" });
});

app.get("/persons", (req, res) => {
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

//insert data person
app.post("/register", (req, res) => {
  let { lastName, firstName, Address, City } = req.body;

  connection.query(
    "INSERT INTO person (last_name, first_name, address, city) VALUES (?, ?, ?, ?)",
    [lastName, firstName, Address, City],
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
