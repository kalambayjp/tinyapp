class Url {
  constructor(longURL, userId) {
    this.longURL = longURL;
    this.userId = userId;
  }
};

class User {
  constructor(id, email, password, loggedIn) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.loggedIn = loggedIn;
  }
};

module.exports = {
  Url,
  User
};