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
    return res.redirect('/login');
  } else if (users[currentUser].loggedIn) {
    return res.redirect('/urls');
  } 
});

/**  REQUEST REGISTRATION PAGE  */
app.get('/register', (req, res) => {
  const templateVars = {currentUser: {}, error: null};
  const userId = req.session.user_id;
  
  if (userId) {
    return res.redirect('/urls');
  }
  return res.render('register', templateVars);
});

/**  POST REGISTRATION */ 
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const result = verifyEmail(email, password, users);
  
  if (result.error) {
    const templateVars = {currentUser: {}, error: result.error};

    console.log(result.error);
    return res.render('register', templateVars);
  }
  
  const userId = generateRandomString();
  users[userId] = new User(userId, email, bcrypt.hashSync(password, 10), true);
  req.session.user_id = userId;

  return res.redirect('/urls');
});

/**   REQUEST LOGIN PAGE    */
app.get('/login', (req, res) => {
  const templateVars = {currentUser: {}, error: null};
  const currentUser = req.session.user_id;
  
  if (currentUser) {
    return res.redirect('/urls');
  }
  return res.render('login', templateVars);
});

/**   POST LOGIN INFO      */
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const result = verifyLogin(email, password, users);

  if (result.error) {
    const templateVars = {currentUser: {}, error: result.error};

    console.log(result.error);
    return res.render('login', templateVars);
  }
  
  const currentUser = result.data.id;
  req.session.user_id = currentUser;
  users[currentUser].loggedIn = true;
  
  return res.redirect('/urls');
});

/** POST REQUEST TO LOGOUT */
app.post('/logout', (req, res) => {
  const currentUser = req.session.user_id;

  currentUser.loggedIn = false;
  req.session = null;

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
    templateVars.error = `Looks like you aren't signed in/Registered. Please do so to use this awesome app!`;
    templateVars.currentUser = {};

    return res.render('login', templateVars);
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
    
    return res.redirect('/login');
  }

  if (users[currentUser].loggedIn) {  
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
    templateVars.error = `Looks like you aren't signed in/Registered. Please do so to use this awesome app!`;
    templateVars.currentUser = {};

    return res.render('login', templateVars);
  }

  const shortUrl = req.params.id;

  if (users[currentUser].id !== urlDatabase[shortUrl].userId) { 
    templateVars.error = `This feature is only available for your own url's`;
    templateVars.currentUser = users[currentUser];
    
    users[currentUser].loggedIn = false;
    req.session = null;

    return res.render('login', templateVars);
  }

  urlDatabase[shortUrl].longURL = req.body.newURL;
  return res.redirect('/urls');
});

/**  POST REQUEST TO DELETE EXISTING URL  */
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortUrl = req.params.shortURL;
  const currentUser = req.session.user_id;
  
  if (!currentUser) {
    templateVars.error = `Looks like you aren't signed in/Registered. Please do so to use this awesome app!`;
    templateVars.currentUser = {};

    return res.render('login', templateVars);
  }
  
  if (users[currentUser].id !== urlDatabase[shortUrl].userId) {
    templateVars.error = `This feature is only available for your own url's`;
    templateVars.currentUser = users[currentUser];
    
    users[currentUser].loggedIn = false;
    req.session = null;

    return res.render('login', templateVars);
  }
  delete urlDatabase[shortUrl];
  return res.redirect('/urls');
});

/** REQUEST PAGE WITH SPECIFIC LONG/SHORT URL PAIR */
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  const currentUser = req.session.user_id;
  
  if (!currentUser) {
    templateVars.error = `Looks like you aren't signed in/Registered. Please do so to use this awesome app!`;
    templateVars.currentUser = {};

    return res.render('login', templateVars);
  }

  templateVars["currentUser"] = users[currentUser];

  if (templateVars.currentUser.id !== urlDatabase[templateVars.shortURL].userId) {
    templateVars.error = `This feature is only available for your own url's`;
    
    users[currentUser].loggedIn = false;
    req.session = null;

    return res.render('login', templateVars);
  }
  return res.render('urls_show', templateVars);
});


/*
*   LINK TO FULL URL FEATURE
*/

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const currentUser = req.session.user_id;
  const templateVars = {};
  
  if (!currentUser) {
    templateVars.error = `Looks like you aren't signed in/Registered. Please do so to use this awesome app!`;
    templateVars.currentUser = {};

    return res.render('login', templateVars);
  }

  if (users[currentUser].id !== urlDatabase[req.params.shortURL].userId) {
    templateVars.error = `This feature is only available for your own url's`;
    templateVars.currentUser = users[currentUser];
    
    users[currentUser].loggedIn = false;
    req.session = null;

    return res.render('login', templateVars);
  }

  return res.redirect(longURL);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});