const express = require("express");
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use("/styles",express.static(__dirname + "/styles"));
app.use(cookieParser());

// this sets the view engine to ejs
app.set('view engine', "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let randomString = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomString;
}

// urls index page 
app.get('/urls', (req, res) => {
  console.log("Checking my cookie: ", req.cookies.username);
    let templateVars = { 
      urls: urlDatabase,
      username: req.cookies["username"]
    };
    res.render('pages/urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render('pages/urls_new');
});

app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id,
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('pages/urls_show', templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  let templateVars = { urls: urlDatabase };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id
  console.log("my shortURL is:", shortURL);
  delete urlDatabase[shortURL]
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  console.log("my longURL is:", req.body.longURL);
  console.log("my longURL is:", req.params.id);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  console.log("Checking req.body.username", req.body.username);
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});