var express = require("express");
var router = express.Router();
var plants = require("../controllers/plants");
var categories = require("../public/javascripts/categories");
var multer = require("multer");
var bcrypt = require("bcrypt");
var path = require("path");
var session = require("express-session");
const { formatDateTime } = require("../public/javascripts/plantUtilities");

/**
 * Storage configuration for multer.
 */
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    // Make the file name the date + the file name
    filename = Date.now() + "-" + file.originalname;
    cb(null, filename);
  },
});
let upload = multer({ storage: storage });

router.use(
  session({
    secret: "changeme",
    resave: false,
    saveUninitialized: false,
  })
);

/**
 * GET home page and redirect to main.
 */
router.get("/", function (req, res, next) {
  res.redirect("/main");
});

router.get("/login", function (req, res, next) {
  res.render("login", {
    title: "Welcome to Plant Viewer",
    showSearch: false,
    showProfile: false,
  });
});

/**
 * GET login page.
 */
router.get("/main", function (req, res, next) {
  let result = plants.getAll();
  result.then((plant) => {
    let data = JSON.parse(plant);
    console.log(data);
    res.render("mainpage", {
      plantData: data,
      categoryData: categories,
      showSearch: true,
      showProfile: true,
    });
  });
});

/**
 * GET main page with all plants.
 */
router.get("/addplant", function (req, res, next) {
  res.render("addplant", {
    dateTime: new Date().toISOString().split("T")[0],
    layout: false,
  });
});

/**
 * GET add plant page.
 */
router.get("/viewplant", function (req, res, next) {
  console.log("Route /viewplant called"); // Added log

  const plantId = req.query.id;
  console.log("Requested plant ID:", plantId);

  // Fetch all plants then find the requested one
  plants
    .getAll()
    .then((plant) => {
      const allPlantsData = JSON.parse(plant);
      const plantData = allPlantsData.find((p) => p._id === plantId);
      if (plantData) {
        // Format sight_time and time before passing to the template
        plantData.sight_time_formatted = formatDateTime(plantData.sight_time);
        plantData.time_formatted = formatDateTime(plantData.time);

        res.render("components/plant", {
          plant: plantData,
          layout: false,
          comments: plantData.comments,
        });
      } else {
        res.status(404).send("Plant not found");
      }
    })
    .catch((error) => {
      console.error("Error fetching plant details:", error); // Existing log
      res.status(500).send("Error processing request");
    });
});

/**
 * POST update comments for a plant.
 */
router.post("/updateComments", async (req, res) => {
  const { plantId, name, comment, date } = req.body;
  try {
    await plants.updateComments(plantId, name, comment, date);
    res.status(200).send("Comment added successfully");
  } catch (error) {
    console.error("Error in /updateComments endpoint:", error.message);
    res.status(500).send("Error adding comment");
  }
});

/**
 * GET user page if logged in, otherwise redirect to login.
 */
router.get("/user", function (req, res, next) {
  if (req.session.user) {
    res.render("user", {
      user: req.session.user,
      showSearch: true,
      showProfile: true,
      categoryData: categories,
    });
  } else {
    res.redirect("/login");
  }
});

/**
 * GET data from DBpedia.
 */
router.post("/dbpedia", function (req, res, next) {});

const fetch = require("node-fetch");

router.get("/dbpedia", function (req, res, next) {
  const plantName = req.query.plantName;
  if (!plantName) {
    return res.status(400).send("Plant name is required");
  }

  const resource = `http://dbpedia.org/resource/${plantName}`;
  console.log(resource);

  const endpointUrl = "https://dbpedia.org/sparql";
  const sparqlQuery = ` 
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    
    SELECT ?label ?description ?taxon (URI("http://dbpedia.org/resource/${plantName}") AS ?page)
    WHERE {
        <${resource}> rdfs:label ?label .
        <${resource}> dbo:abstract ?description .
        <${resource}> dbp:taxon ?taxon .

        FILTER (langMatches(lang(?label), "en")) .
        FILTER (langMatches(lang(?description), "en")) .
    }`;

  const encodedQuery = encodeURIComponent(sparqlQuery);
  const url = `${endpointUrl}?query=${encodedQuery}&format=json`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.results.bindings.length > 0) {
        let bindings = data.results.bindings;
        res.render("dbpedia_results", {
          name: bindings[0].label.value,
          description: bindings[0].description.value,
          taxon: bindings[0].taxon.value,
          page: bindings[0].page.value,
        });
        console.log("I did this right");
      } else {
        res.status(404).send("Plant not found");
      }
    })
    .catch((error) => {
      console.error("Error fetching DBPedia data:", error);
      res.status(500).send("Internal Server Error");
    });
});

/**
 * POST add a new plant.
 */
router.post("/add", upload.single("img"), function (req, res) {
  let userData = req.body;
  if (!req.file) {
    return res.status(400).send("No file");
  }

  let filePath = req.file.path;

  let filename = filePath.split(/\\|\//).pop();

  let result = plants.create(userData, filename);
  res.redirect("/main");
});

/**
 * GET all plants.
 */
router.get("/plants", function (req, res, next) {
  plants
    .getAll()
    .then((plantList) => {
      console.log(plantList);
      return res.status(200).send(plantList);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

/**
 * POST login.
 */
router.post("/login", function (req, res, next) {
  res.redirect("/main");
});

/**
 * POST set username.
 */
router.post("/setusername", function (req, res, next) {
  res.redirect("/login");
});

/**
 * POST edit plant currently open. Redirects to main after update.
 */
router.post("/editplant",  async function(req,res,next){
  const plantId = req.body.plantId;
  const plantName = req.body.name;
  console.log("i get here");
  console.log(req.body);

  try {
    await plants.updatePlant(plantId, plantName);
    console.log(plantId);
    // Redirect to /main after updating the plant
    res.redirect("/main");
  } catch (error) {
    console.error("Error in /editplant endpoint:", error.message);
    res.status(500).send("Error updating plant: " + error.message);
  }
});

module.exports = router;
