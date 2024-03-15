var express = require("express");
var router = express.Router();

const categories = require("../public/javascripts/categories");
const {
  getCurrentDateTime,
  getPlantById,
} = require("../public/javascripts/script");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/login");
});

router.get("/login", function (req, res, next) {
  res.render("login", { title: "Welcome to Plant Viewer", showSearch: false, showProfile: false });
});

router.get("/main", function (req, res, next) {
  res.render("mainpage", { categoryData: categories, showSearch: true, showProfile: true });
});

router.get("/addplant", function (req, res, next) {
  res.render("addplant", { dateTime: getCurrentDateTime(), showSearch: false, showProfile: true});
});

router.get("/viewplant", function (req, res, next) {
  const plantId = req.query.id;
  const plantData = getPlantById(plantId, categories);

  if (plantData) {
    res.render("viewplant", { plant: plantData, showSearch: false, showProfile: true});
  } else {
    res.status(404).send("Plant not found");
  }
});

module.exports = router;
