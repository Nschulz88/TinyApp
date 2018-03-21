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
  },
  "aaaaaa": {
    id: "aaaaaa", 
    email: "nat@nat.nat", 
    password: "nat"
  }
}

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
  let targetUser = users[req.cookies.user_id];
  console.log(targetUser);
  let templateVars = {
    urls: urlDatabase,
    isLoggedIn: !!targetUser,
    user: targetUser
  }
  // if (req.cookies.user_id) {
  //   templateVars = { 
  //     userDatabase: users[req.cookies.user_id]
  //   };
  // } else {
  //   templateVars = {
  //     userDatabase: undefined
  //   }
  // }
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
  let targetUser = users[req.cookies.user_id];
  let templateVars = { 
    shortURL: req.params.id,
    urls: urlDatabase,
    userDatabase: users,
    isLoggedIn: !!targetUser
  };
  res.render('pages/urls_show', templateVars);
});

app.get("/register", (req, res) => {
  let targetUser = users[req.cookies.user_id];
  let templateVars = { 
    userDatabase: users,
    isLoggedIn: !!targetUser,
    user: targetUser
  };
  res.render('pages/register', templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  let templateVars = { urls: urlDatabase };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id
  delete urlDatabase[shortURL]
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    for (let user in users) {
      if (users[user].email === req.body.email) {
        console.log(users[user].email);
        res.send("This email has already been registered");
        return;
      }
    }
      let userID = generateRandomString();
      users[userID] = {};
      users[userID].id = userID;
      users[userID].email = req.body.email;
      users[userID].password = req.body.password;
      res.cookie('user_id', userID);
      res.redirect(`/urls`);
      return;
    }
    res.send("Please enter an email and a password");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});