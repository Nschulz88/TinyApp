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
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "aaaaaa"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "userRandomID"
  }
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
  let privUrls = [];  // Currently working on trying to only display private URLS
  for (let url in urlDatabase) {
    if (url.userID === req.cookies.user_id) {
      privUrls.push(url.userID);
      console.log(privUrls);
    }
  }
  let templateVars = {
    urls: urlDatabase,
    isLoggedIn: !!targetUser,
    user: targetUser
  }
  res.render('pages/urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let targetUser = users[req.cookies.user_id];
  let templateVars = { 
    shortURL: req.params.id,
    urls: urlDatabase,
    user: targetUser,
    isLoggedIn: !!targetUser
  };
  if (targetUser) {
  res.render('pages/urls_new', templateVars);
  }
  res.redirect('/login');
});

app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let targetUser = users[req.cookies.user_id];
  const urlObj = urlDatabase[req.params.id];
  if (req.cookies.user_id !== urlObj.userID) {
    res.send("YOU ARE NOT AUTHORIZED TO EDIT THIS!")
  }
  else if (urlObj) {
    let templateVars = { 
      shortURL: req.params.id,
      longUrl: urlObj.url,
      user: targetUser,
      isLoggedIn: !!targetUser
    };
    res.render('pages/urls_show', templateVars);
  } else {
    res.sendStatus(404);
  }

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

app.get("/login", (req, res) => {
  let targetUser = users[req.cookies.user_id];
  let templateVars = { 
    userDatabase: users,
    isLoggedIn: !!targetUser,
    user: targetUser
  };
  res.render('pages/login', templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    url: undefined,
    userID: undefined
  };
  urlDatabase[shortURL].url = req.body.longURL;
  urlDatabase[shortURL].userID = req.cookies.user_id;
  console.log("req.cookies.user_id: ", req.cookies.user_id);
  let templateVars = { urls: urlDatabase };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id
  if(req.cookies.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL]
  }
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].url = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  if (req.body.email && req.body.password) {
    for (let user in users) {
      if (users[user].email === req.body.email) {
        if (users[user].password === req.body.password) {
        res.cookie('user_id', users[user].id);
        res.redirect(`/urls`);
        return;
        } 
      } 
    }
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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