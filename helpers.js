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
  if (password !== potentialUser.password) {
    return {error: 'Incorrect password'}
  }
  return {error: null, data: potentialUser};
}
module.exports = {
  verifyEmail,
  verifyLogin
};