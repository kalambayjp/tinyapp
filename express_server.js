const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {verifyEmail, verifyLogin} = require('./helpers')

app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(cookieParser());

class Url {
  constructor(longURL, userId) {
    this.longURL = longURL;
    this.userId = userId;
  }
};

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

class User {
  constructor(id, email, password, loggedIn) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.loggedIn = loggedIn;
  }
}

let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur",
    loggedIn: false
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk",
    loggedIn: false
  }
}

function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++){
    randomString += characters[Math.floor(Math.random() * 36)]
  }
  return randomString;
};
//route to home page with list of URLs
app.get('/urls', (req, res) => {
  const templateVars = {currentUserUrls: {}, email: "", loggedIn: null};
  if (users[req.cookies.user_id]) {
    templateVars.email = users[req.cookies.user_id]["email"];
  }
  
  if (req.cookies.user_id) { 
    const currentUser = req.cookies.user_id;
    
    for (const url in urlDatabase) {
      if (urlDatabase[url].userId === currentUser) {
        templateVars.currentUserUrls[url] = urlDatabase[url];
      }
    }

    if (users[currentUser].loggedIn === true) {
      templateVars.loggedIn = true;
    }
  }
  
  res.render('urls_index', templateVars)
});
        // create post request to delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const currentUser = req.cookies.user_id;
  const shortUrl = req.params.shortURL
  
  if (currentUser === urlDatabase[shortUrl].userId) {
    delete urlDatabase[shortUrl];
    res.redirect('/urls');
  }
  // console.log(urlDatabase[shortUrl])
  res.redirect('/login');
});


// route to create new URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {email: ""};

  if (!req.cookies.user_id) {
    return res.redirect('/login');
  }
  
  const currentUser = users[req.cookies.user_id];

  if (currentUser.loggedIn === true) {  
    templateVars.email = currentUser.email;
    res.render("urls_new", templateVars);
  } 
});
        // post to create new short/long URL pair
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = new Url(req.body.longURL, req.cookies.user_id)
  res.redirect(`/urls/${shortURL}`);        
});

// edit an existing URL
app.post('/urls/:id', (req, res) => {
  const currentUser = req.cookies.user_id;
  const shortUrl = req.params.id
  if (currentUser === urlDatabase[shortUrl].userId) { 
    urlDatabase[shortUrl].longURL = req.body.newURL
    res.redirect('/urls');
  }
  // console.log(urlDatabase[shortUrl]);

  res.redirect('/login')
});


// create page with specific short and long URL data
app.get('/urls/:shortURL', (req, res) => {
  
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, email: ""}
  if (users[req.cookies.user_id]) {
    templateVars.email = users[req.cookies.user_id]["email"];
  }
  res.render('urls_show', templateVars)
})
       // create link to full length url page from shor URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// registration page
app.get('/register', (req, res) => {
  const templateVars = {email: ""};
  res.render('register', templateVars);
});

// register endpoint
app.post('/register', (req, res) => {
  // fetch data
  const email = req.body.email;
  
  const result = verifyEmail(email, users);

  if (result.error) {
    console.log(result.error);
    return res.redirect('/register');
  }
  
  const userId = generateRandomString();
  users[userId] = new User(userId, req.body.email, req.body.password, true)
  
  res.cookie('user_id', userId);
  res.redirect('/urls');

});


app.get('/login', (req, res) => {
  const templateVars = {email: ""}
  res.render('login', templateVars)
})


// route for login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const result = verifyLogin(email, password, users);

  if (result.error) {
    console.log(result.error);
    return res.redirect('/login');
  }

  const currentUser = result.data.id;
  res.cookie('user_id', currentUser);

  users[currentUser].loggedIn = true;
  
  res.redirect('/urls');
});



// route for logout
app.post('/logout', (req, res) => {
  const currentUser = users[req.cookies.user_id];
  currentUser.loggedIn = false;
  res.clearCookie('user_id');
  res.redirect('/urls');
});




app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});






















// examples code:
// app.get('/', (req, res) => { 
//   res.send('Hellooo');
// });

// app.get('/urls.json', (req, res) => { 
//   res.json(urlDatabase);
// });

// app.get('/hello', (req, res) => { 
//   res.send("<html><body>Hello <b>World</b></body></html>\n")
// })