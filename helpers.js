const bcrypt = require('bcryptjs');

const verifyEmail = (email, db) => {
  if (!email) {
    return {error: 'No Email was given!'}
  }
  for (const user in db) {
    if (db[user]["email"] === email) {
      return {error: 'Email already in use!'}
    }
  }
  return {error: null}
}

const verifyLogin = (email, password, db) => {
  let potentialUser;
  if (!email || !password) {
    return {error: 'Missing information!'}
  }
  for (const user in db) {
    if (db[user]["email"] === email) {
      potentialUser = db[user];
    }
  }
  if (!potentialUser) {
    return {error: 'Email not found'}
  }
  if (!bcrypt.compareSync(password, potentialUser.password)) {
    return {error: 'Incorrect password'}
  }
  return {error: null, data: potentialUser};
};

const generateRandomString = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++){
    randomString += characters[Math.floor(Math.random() * 36)]
  }
  return randomString;
};

module.exports = {
  verifyEmail,
  verifyLogin,
  generateRandomString
};