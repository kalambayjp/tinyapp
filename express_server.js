const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
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
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render('urls_index', templateVars)
});
        // create post request to delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})


// route to create new URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});
        // post to create new short/long URL pair
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);        
});

// edit an existing URL
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL
  res.redirect('/urls');
});


// create page with specific short and long URL data
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]}
  res.render('urls_show', templateVars)
})
       // create link to full length url page from shor URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// registration page
app.get('/register', (req, res) => {
  res.render('register');
});

// register endpoint
app.post('/register', (req, res) => {
  const userId = generateRandomString();
  users[userId] = {  
    "id": userId,
    "email": req.body.email,
    "password": req.body.password 
  };
  res.cookie('user_id', userId);
  res.redirect('/urls');
});


// route for login
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

// route for logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
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