DBNAME=cs103_library
DBUSER=admin_test

CREATE TABLE users (
    id int AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    username varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE books(
    id int AUTO_INCREMENT,
    title varchar(255) NOT NULL,
    author varchar(255) NOT NULL,
    genre varchar(255) NOT NULL,
    year INT NOT NULL,
    publisher varchar(255) NOT NULL,
    synopsis TEXT NOT NULL,
    filepath TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE user_history(
    id int AUTO_INCREMENT,
    user_id int NOT NULL,
    book_id int NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    status varchar(30) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

