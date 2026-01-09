const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const SECRET_KEY = require('./router/auth_users.js').SECRET_KEY;;
const PORT = 5000;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:SECRET_KEY,resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
  if (req.session.authorization) {
          let token = req.session.authorization['accessToken'];
  
          // Verify JWT token
          jwt.verify(token, SECRET_KEY, (err, user) => {
              if (!err) {
                  req.user = user;
                  next(); // Proceed to the next middleware
              } else {
                  return res.status(403).json({ message: "User not authenticated" });
              }
          });
      } else {
          return res.status(403).json({ message: "User not logged in" });
      }
});
 


app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
