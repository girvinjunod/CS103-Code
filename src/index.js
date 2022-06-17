const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const dotenv = require("dotenv");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { generateAccessToken, authenticateToken } = require("./middleware/jwt");

dotenv.config();

//middleware
app.use(express.json());
// request logging
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send({ err: false, msg: "OK" });
});

app.post("/login", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  try {
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
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: err.message, err: true });
  }
});

//insert data user
app.post("/register", async (req, res) => {
  let { username, password, name } = req.body;

  try {
    let salt = await bcrypt.genSalt(saltRounds);
    let hash = await bcrypt.hash(password, salt);
    // Store hash in your password DB.
    await prisma.users.create({
      data: {
        name: name,
        username: username,
        password: hash,
      },
    });
    res.send({ err: false, msg: "Success" });

    return;
  } catch (err) {
    console.log(err);
    res.status(400).send({ msg: "Invalid payload", err: true });
    return;
  }
});

app.get("/books", authenticateToken, async (req, res) => {
  let genre = req.query.genre;
  let limit = req.query.limit;
  let books;
  if (genre && limit) {
    books = await prisma.books.findMany({
      where: { genre: genre },
      take: limit * 1,
      select: {
        id: true,
        title: true,
        genre: true,
        author: true,
        year: true,
      },
    });
  } else if (genre) {
    books = await prisma.books.findMany({
      where: { genre: genre },
      select: {
        id: true,
        title: true,
        genre: true,
        author: true,
        year: true,
      },
    });
  } else if (limit) {
    books = await prisma.books.findMany({
      take: limit * 1,
      select: {
        id: true,
        title: true,
        genre: true,
        author: true,
        year: true,
      },
    });
  } else {
    books = await prisma.books.findMany({
      select: {
        id: true,
        title: true,
        genre: true,
        author: true,
        year: true,
      },
    });
  }
  res.send({ err: false, msg: "Success", books: books });
  return;
});

app.post("/books", authenticateToken, async (req, res) => {
  let { title, author, genre, year, publisher, synopsis, filepath } = req.body;
  console.log(req.body);
  try {
    await prisma.books.create({
      data: {
        title: title,
        author: author,
        genre: genre,
        year: year,
        publisher: publisher,
        synopsis: synopsis,
        filepath: filepath,
      },
    });
    res.send({ err: false, msg: "Success" });
  } catch (err) {
    console.log(err);
    res.status(400).send({ msg: "Invalid payload", err: true });
    return;
  }
});

app.get("/books/:id", authenticateToken, async (req, res) => {
  //get book detail
  let id = req.params.id;
  let book = await prisma.books.findUnique({
    where: {
      id: id * 1,
    },
    select: {
      id: true,
      title: true,
      genre: true,
      author: true,
      year: true,
      publisher: true,
      synopsis: true,
    },
  });
  res.send({ err: false, msg: "Success", book: book });
});

app.post("/borrow/:userid/:bookid", authenticateToken, async (req, res) => {
  let userid = req.params.userid;
  let bookid = req.params.bookid;
  await prisma.user_history.create({
    data: {
      users: {
        connect: {
          id: userid * 1,
        },
      },
      books: {
        connect: {
          id: bookid * 1,
        },
      },
      start_time: new Date(),
      status: "borrowed",
    },
  });
  res.send({ err: false, msg: "Success" });
});

app.get("/borrow/history/:userid", authenticateToken, async (req, res) => {
  let userid = req.params.userid;
  let history = await prisma.user_history.findMany({
    where: {
      users: {
        id: userid * 1,
      },
    },
    select: {
      id: true,
      books: {
        select: {
          id: true,
          title: true,
          author: true,
          genre: true,
          year: true,
        },
      },
      start_time: true,
      end_time: true,
      status: true,
    },
  });
  res.send({ err: false, msg: "Success", history: history });
});

app.post("/return/:borrowid", authenticateToken, async (req, res) => {
  let borrowid = req.params.borrowid;
  await prisma.user_history.update({
    where: {
      id: borrowid * 1,
    },
    data: {
      end_time: new Date(),
      status: "returned",
    },
  });
  res.send({ err: false, msg: "Success" });
});

app.get("/borrow/:userid/now", authenticateToken, async (req, res) => {
  //get list of currently borrowed book
  let userid = req.params.userid;
  let history = await prisma.user_history.findMany({
    where: {
      users: {
        id: userid * 1,
      },
      status: "borrowed",
    },
    select: {
      id: true,
      books: {
        select: {
          id: true,
          title: true,
          author: true,
          genre: true,
          year: true,
        },
      },
      start_time: true,
      status: true,
    },
  });
  res.send({ err: false, msg: "Success", books: history });
});

app.get("/download/:bookid", authenticateToken, async (req, res) => {
  let bookid = req.params.bookid;
  try {
    let book = await prisma.books.findUnique({
      where: {
        id: bookid * 1,
      },
      select: {
        filepath: true,
      },
    });
    const filePath = path.join(__dirname, "./data/");
    res.sendFile(filePath + book.filepath);
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Error getting file", err: true });
    return;
  }
});

app.listen(port, () => {
  console.log(`Library API listening on http://localhost:${port}`);
});
