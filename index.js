const express = require("express");
const app = express();
const port = 3000;
const mysql = require("mysql2");

const connection = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "admin_test",
  password: "csbackend",
  database: "test",
  // port: 3340,
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/test", (req, res) => {
  connection.query("SELECT * from person", (err, rows) => {
    if (err) {
      res.send({ msg: err.message, err: true });
      return;
    }
    if (rows.length > 0) {
      let response = { err: false, msg: "Success", data: rows };
      res.send(response);
      return;
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
