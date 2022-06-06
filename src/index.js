const express = require("express");
const morgan = require("morgan");
// const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const dotenv = require("dotenv");
const app = express();
const port = process.env.PORT || 3000;

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { generateAccessToken, authenticateToken } = require("./middleware/jwt");

dotenv.config();

//middleware
// Agar dapat membaca content body JSON
app.use(express.json());
// request logging
app.use(morgan("dev"));

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
  await prisma.users.create({
    data: {
      username: username,
      password: hash,
    },
  });
  res.send({ err: false, msg: "Success" });

  return;
});

app.get("/persons", authenticateToken, async (req, res) => {
  let limit = req.query.limit || 100;

  let ret = await prisma.person.findMany({
    take: limit,
  });
  return res.send({ err: false, msg: "Success", data: ret });
});

//get person data by id
app.get("/person/:id", async (req, res) => {
  let id = req.params.id;
  let ret = await prisma.person.findUnique({
    where: { id: id * 1 },
  });
  if (ret) {
    return res.send({ err: false, msg: "Success", data: ret });
  } else {
    return res.send({ err: true, msg: "Data not found" });
  }
});

//update data person
app.put("/update/:id", async (req, res) => {
  let nomor = req.params.id;
  let { lastName, firstName, Address, City } = req.body;

  await prisma.person.update({
    where: { id: nomor },
    data: {
      last_name: lastName,
      first_mame: firstName,
      address: Address,
      city: City,
    },
  });
  return res.send({ err: false, msg: "Success" });
});

app.delete("/delete/:id", async (req, res) => {
  let id = req.params.id;

  await prisma.person.delete({
    where: { id: id },
  });

  return res.send({ err: false, msg: "Success" });
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
