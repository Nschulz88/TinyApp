const express = require("express");
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const app = express();
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use("/styles",express.static(__dirname + "/styles"));
app.use(cookieSession({
  keys: ['fluffybunny', 'floop']
}));

app.set('view engine', "ejs");

// hardcoded mock database & users just for checking purpose
let urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "aaaaaa"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "aaaaaa"
  }
};

let users = { 
  "aaaaaa": {
    id: "aaaaaa", 
    email: "nat@nat.nat", 
    password: bcrypt.hashSync('nat', 10)
  }
}

// to generate a random ID to be used during Registration and after Login
function generateRandomString() {
  let randomString = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomString;
}

// to find only user specific URLS 
function urlsForUser(userid) {
  let userUrls = [];
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userid) {
      userUrls.push({[shortURL]: urlDatabase[shortURL].url });
    }
  }
  return(userUrls);
}

// urls index page 
app.get('/urls', (req, res) => {
  let targetUser = users[req.session.user_id];
    let templateVars = {
      urls: urlDatabase,
      isLoggedIn: !!targetUser,
      user: targetUser
    }
  if (targetUser !== undefined) {
    templateVars.urls = urlsForUser(targetUser.id);
    }
  res.render('pages/urls_index', templateVars);
});

// shows page to create new short URL or redirects to login if not logged in 
app.get("/urls/new", (req, res) => {
  let targetUser = users[req.session.user_id];
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user: targetUser,
    isLoggedIn: !!targetUser
  };
  if (targetUser) {
  res.render('pages/urls_new', templateVars);
  } else {
  res.redirect('/login');
  }
});

// route to redirect user to actual website based on its corresponding short URL
app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

// route to show user the edit page for a specific URL
app.get("/urls/:id", (req, res, next) => {
  let targetUser = users[req.session.user_id];
  const urlObj = urlDatabase[req.params.id];
  if(!urlObj){
    next();
  } else if (req.session.user_id !== urlObj.userID) {
    res.send("YOU ARE NOT AUTHORIZED!");
  } else if (urlObj) {
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

// route to display users registration form - passes in object to see if user is already registered
app.get("/register", (req, res) => {
  let targetUser = users[req.session.user_id];
  let templateVars = { 
    userDatabase: users,
    isLoggedIn: !!targetUser,
    user: targetUser
  };
  res.render('pages/register', templateVars);
});

// route to see if users login credentials check out
app.get("/login", (req, res) => {
  let targetUser = users[req.session.user_id];
  let templateVars = { 
    userDatabase: users,
    isLoggedIn: !!targetUser,
    user: targetUser
  };
  res.render('pages/login', templateVars);
});

// route to determine what info to show on homepage (/urls)
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    url: undefined,
    userID: undefined
  };
  urlDatabase[shortURL].url = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.user_id;
  let templateVars = { 
    urls: urlDatabase 
  };
  res.redirect(`/urls`);
});

// route to delete a specific URL from the database
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id
  if(req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  res.redirect(`/urls`);
});

// route to add a new URL to the database
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].url = req.body.longURL;
  res.redirect(`/urls`);
});

// route to login any registered user or send error status if user has not yet been registered
app.post("/login", (req, res) => {
  if (req.body.email && req.body.password) {
    for (let user in users) {
      if (users[user].email === req.body.email) {
        if (bcrypt.compareSync(req.body.password, users[user].password)) {
          req.session = {'user_id': users[user].id};
          res.redirect(`/urls`);
          return;
        }
      } 
    } 
  }
  res.sendStatus(403);
});

// route to logout the user and delete the cookie session
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

// route to register a new user, check his credentials and redirect to homepage if all checks out
app.post("/register", (req, res) => {
  let userPassword = req.body.password;
  let hashedPassword = bcrypt.hashSync(userPassword, 10);
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
    users[userID].password = hashedPassword;
    req.session = {'user_id': userID};
    res.redirect(`/urls`);
    return;
  }
  res.send("Please enter an email and a password");
});



// Middleware to be hit if user screws up 
app.use((req, res, next) => {
  res.status(404).render('pages/404');
});

// Middleware to be hit if server error occurs
app.use((err, req, res, next) => {
  res.status(500).render('pages/500', {err})
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});