const bcrypt = require('bcryptjs');

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "user2RandomID"
  }
};

const user1Pass = "purple-monkey-dinosaur";
const user2Pass = "dishwasher-funk";

let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync(user1Pass, 10),
    loggedIn: false
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync(user2Pass, 10),
    loggedIn: false
  }
};

module.exports = {
  urlDatabase,
  users
};