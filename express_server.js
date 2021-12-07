const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVars = {urls: urlDatabase};
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
  res.render("urls_new");
});
        // post to create new short/long URL pair
app.post("/urls", (req, res) => {
   
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);        
});


// create page with specific short and long URL data
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}
  res.render('urls_show', templateVars)
})
       // ceate link to full length url page from shor URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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