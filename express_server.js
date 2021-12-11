const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

const {verifyEmail, verifyLogin, generateRandomString} = require('./helpers');
const {urlDatabase, users} = require('./databases');
const {Url, User} = require('./classes');

app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["I like potatoes, cheese and gravy", "key"],
}));


/*
*         /, LOGIN/REGISTER, LOGOUT   
*/

app.get('/', (req, res) => {
  const currentUser = req.session.user_id;
  
  if (!currentUser) {
    delete req.session.user_id;
    throw `Looks like you aren't signed in/Registered. Please do so to use this awesome app!`;
  }

  return res.redirect('/urls');
});

/**  REQUEST REGISTRATION PAGE  */
app.get('/register', (req, res) => {
  const templateVars = {currentUser: {}};
  const currentUser = req.session.user_id;
  
  if (currentUser) {
    res.redirect('/urls');
  }
  res.render('register', templateVars);
});

/**  POST REGISTRATION */ 
app.post('/register', (req, res) => {
  const email = req.body.email;
  const result = verifyEmail(email, users);
  
  if (result.error) {
    console.log(result.error);
    throw result.error;
  }
  
  const userId = generateRandomString();
  const password = req.body.password;
  users[userId] = new User(userId, req.body.email, bcrypt.hashSync(password, 10), true);
  req.session.user_id = userId;

  return res.redirect('/urls');
});

/**   REQUEST LOGIN PAGE    */
app.get('/login', (req, res) => {
  const templateVars = {currentUser: {}};
  const currentUser = req.session.user_id;
  
  if (currentUser) {
    res.redirect('/urls');
  }
  res.render('login', templateVars);
});

/**   POST LOGIN INFO      */
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const result = verifyLogin(email, password, users);

  if (result.error) {
    console.log(result.error);
    throw result.error; 
  }
  
  const currentUser = result.data.id;
  req.session.user_id = currentUser;
  users[currentUser].loggedIn = true;
  
  return res.redirect('/urls');
});

/** POST REQUEST TO LOGOUT */
app.post('/logout', (req, res) => {
  const currentUser = req.session.user_id;
  
  if (!currentUser) {
    delete req.session.user_id;
    return res.redirect('/login');
  }

  currentUser.loggedIn = false;
  delete req.session.user_id;
  return res.redirect('/login');
});


/*
*    URL LIST PAGE, CREATE URL, EDIT URL, DELETE URL
*/

/** REQUEST URL'S PAGE */
app.get('/urls', (req, res) => {
  const templateVars = {currentUserUrls:{}};
  const currentUser = req.session.user_id;
  
  if (!currentUser) {
    delete req.session.user_id;
    throw `Looks like you aren't signed in/Registered. Please do so to use this awesome app!`;
  }

  templateVars["currentUser"] = users[currentUser];
  
  for (const url in urlDatabase) {
    if (urlDatabase[url].userId === users[currentUser].id) {
      templateVars.currentUserUrls[url] = urlDatabase[url];
    }
  }
  
  return res.render('urls_index', templateVars);
});

/** REQUEST CREATE NEW URL PAGE  */ 
app.get("/urls/new", (req, res) => {
  const templateVars = {};
  const currentUser = req.session.user_id;
  
  if (!currentUser) {
    delete req.session.user_id;
    throw `Looks like you aren't signed in/Registered. Please do so to use this awesome app!`;
  }

  if (users[currentUser].loggedIn === true) {  
    templateVars["currentUser"] = users[currentUser];
    res.render("urls_new", templateVars);
  } 
});

/**  POST CREATED URL   */
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = new Url(req.body.longURL, req.session.user_id);
  
  res.redirect(`/urls/${shortURL}`);        
});

/**   POST TO EDIT EXISTING URL */
app.post('/urls/:id', (req, res) => {
  const currentUser = req.session.user_id;
  
  if (!currentUser) {
    delete req.session.user_id;
    throw `Looks like you aren't signed in/Registered. Please do so to use this awesome app!`;
  }

  const shortUrl = req.params.id;

  if (users[currentUser].id === urlDatabase[shortUrl].userId) { 
    urlDatabase[shortUrl].longURL = req.body.newURL;
    return res.redirect('/urls');
  }

  delete req.session.user_id;
  throw `You can only edit/delete your own saved url's!`;
});

/**  POST REQUEST TO DELETE EXISTING URL  */
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortUrl = req.params.shortURL;
  const currentUser = req.session.user_id;
  
  if (!currentUser) {
    delete req.session.user_id;
    throw `Looks like you aren't signed in/Registered. Please do so to use this awesome app!`;
  }
  
  if (users[currentUser].id === urlDatabase[shortUrl].userId) {
    delete urlDatabase[shortUrl];
    return res.redirect('/urls');
  }

  delete req.session.user_id;
  throw `You can only edit/delete your own saved url's!`;
});

/** REQUEST PAGE WITH SPECIFIC LONG/SHORT URL PAIR */
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  const currentUser = req.session.user_id;
  
  if (!currentUser) {
    delete req.session.user_id;
    throw `Looks like you aren't signed in/Registered. Please do so to use this awesome app!`;
  }

  templateVars["currentUser"] = users[currentUser];

  return res.render('urls_show', templateVars);
});


/*
*   LINK TO FULL URL FEATURE
*/

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  return res.redirect(longURL);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});