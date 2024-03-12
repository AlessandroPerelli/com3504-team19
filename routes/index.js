var express = require('express');
var router = express.Router();

const categories = require("../public/javascripts/categories");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/login');
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Welcome to Plant Viewer' });
});

router.get("/main", function (req, res, next) {
  res.render("mainpage", { categoryData: categories });
});

module.exports = router;