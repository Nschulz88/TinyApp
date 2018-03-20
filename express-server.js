var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

// this sets the view engine to ejs
app.set('view engine', "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// urls index page 
app.get('/urls', (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render('pages/urls_index', templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id,
    urls: urlDatabase
  };
  res.render('pages/urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});