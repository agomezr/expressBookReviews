const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const SECRET_KEY = "JWT_SECRET_KEY";

let users = [
  {"username": "alberto", "password": "12345"},
  {"username": "luis", "password": "54321"},
];

const isValid = (username)=>{ 
 return users.some((user) => user.username === username);
}

// Check if the user with the given username and password exists
const authenticatedUser = (username,password)=>{ 
    return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
      const username = req.body.username;
      const password = req.body.password;
  
      // Check if username or password is missing
      if (!username || !password) {
          return res.status(404).json({ message: "Error logging in" });
      }
  
      // Authenticate user
      if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign(
            {
              data: username
            }, 
            SECRET_KEY, 
            { expiresIn: 60 * 60 }
        );
  
          // Store access token and username in session
          req.session.authorization = {
              accessToken, username
          }
          return res.status(200).send("User successfully logged in");
      } else {
          return res.status(208).json({ message: "Invalid Login. Check username and password." });
      }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbnQuery = req.params.isbn;
  const username = req.session.authorization.username;
  const review = req.body.review;

  if (!books[isbnQuery]){
    return res.status(404).json({message: "Book not found"});
  }

  let message = "Review posted successfully";

  if (books[isbnQuery].reviews[username]){
    message = "Review updated successfully";
  } 

  books[isbnQuery].reviews[username] = review;

  return res.status(200).send(message); 
});

// Delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbnQuery = req.params.isbn;
  const username = req.session.authorization.username;
  const review = req.body.review;

  if (!books[isbnQuery]){
    return res.status(404).json({message: "Book not found"});
  }

  if (!books[isbnQuery].reviews[username]){
    return res.status(404).json({message: "Review not found"});
  }

  delete(books[isbnQuery].reviews[username]);

  return res.status(200).send("Review deleted successfully"); 
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

module.exports.SECRET_KEY = SECRET_KEY;
