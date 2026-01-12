const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const getBooks = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(books), 1000);
  });
};

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  try {
    const books = await getBooks();

    return res.send(JSON.stringify(books,null,4));
  } catch (error) {
    res.status(500).json({ message: "Error retrieving all books" });
  }
});

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!doesExist(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }

  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user. No username or password provided."});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  const isbn = req.params.isbn;
  
  try {
    const books = await getBooks();
    
    if (!books[isbn]){
      return res.status(404).json({message: "Book not found"});
    }

    return res.send(JSON.stringify(books[isbn],null,4));
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books by ISBN" });
  }

 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  const authorQuery = req.params.author.toLowerCase();

  try {
    const books = await getBooks();

    const filteredBooks = Object.values(books).filter((book)=> {
      return book.author.toLowerCase().includes(authorQuery);
    });

    if (filteredBooks.length > 0){
      return res.send(JSON.stringify(filteredBooks,null,4));
    }

    return res.status(404).json({message: "No books found for this author"});
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books by author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  const titleQuery = req.params.title.toLowerCase();

  try {
    const books = await getBooks();

    const filteredBooks = Object.values(books).filter((book)=> {
      return book.title.toLowerCase().includes(titleQuery);
    });

    if (filteredBooks.length > 0){
      return res.send(JSON.stringify(filteredBooks,null,4));
    }

    return res.status(404).json({message: "No books found for this title"});
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books by title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const books = await getBooks();

    if (!books[isbn]){
      return res.status(404).json({message: "Book not found"});
    }

    return res.send(JSON.stringify(books[isbn].reviews,null,4));
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books by review" });
  }
});

module.exports.general = public_users;
