var express = require("express");
var router = express.Router();
var plants = require("../controllers/plants");
var users = require("../models/users");
var categories = require("../public/javascripts/categories")
var multer = require("multer");
var bcrypt = require("bcrypt");
var path = require("path");
var session = require("express-session");
const { formatDateTime } = require("../public/javascripts/plantUtilities");


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads');
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

/* GET home page. */
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

router.get("/main", function (req, res, next) {
  let result = plants.getAll();
  result.then(plant => {
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

router.get("/addplant", function (req, res, next) {
  // if (req.session.user) {
  res.render("addplant", {
    dateTime: new Date().toISOString().split("T")[0],
    layout: false,
  });
  // } else {
  //   res.redirect("/login");
  // }
});

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

router.post('/dbpedia',function(req, res, next) {
  
});

router.get('/dbpedia', function (req, res, next) {
  console.log(req.query);
  const plantName = req.query.plantName;
  console.log("Hello i have the "+plantName);
  const resource = `http://dbpedia.org/resource/${plantName}`;
  console.log(resource);
  console.log("hellO");
  const endpointUrl = 'https://dbpedia.org/sparql';
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

    }`
  const encodedQuery = encodeURIComponent(sparqlQuery);
  console.log("hello 2");
  const url = `${endpointUrl}?query=${encodedQuery}&format=json`;

  fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log("hello3");
        if(data){
          let bindings = data.results.bindings;
          let results = JSON.stringify(bindings);

          console.log("hello4");
          console.log("I did this right");
          res.render('dbpedia_results', {
            name: bindings[0].label.value,
            description: bindings[0].description.value,
            taxon: bindings[0].taxon.value,
            page: bindings[0].page.value
          });
          console.log("I did this right");
        }
        else{
          res.status(404).send("Plant not found"); 
        }
      });
      res.redirect('/login')
});




router.post("/add", upload.single("img"), function (req, res) {
  let userData = req.body;
  if (!req.file) {
    return res.status(400).send("No file");
  }

  let filePath = req.file.path;

  let filename = filePath.split(/\\|\//).pop();

  let result = plants.create(userData, filename);
  console.log(result);
  res.redirect("/main");
});


router.post("/adduser", function (req, res) {
  // Check if passwords match
  if (req.body.password !== req.body.confirmpassword) {
    return res.status(400).send("Passwords do not match");
  }

  // Hash the password
  bcrypt.hash(req.body.password, 10, function (err, hash) {
    if (err) {
      return res.status(500).send("Error hashing password");
    }

    // Create a user instance
    const defaultAvatar = "/images/avatar.png";
    const user = new users({
      email: req.body.email,
      username: req.body.username,
      password: hash,
      avatar: defaultAvatar,
    });

    // Save the user to the database
    user
      .save()
      .then((data) => {
        console.log("Successfully created a new User");
        res.redirect("/main");
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

// route to get all plants
router.get('/plants', function (req, res, next) {
  plants.getAll().then(plantList => {
    console.log(plantList);
    return res.status(200).send(plantList);
  }).catch(err => {
    console.log(err);
    res.status(500).send(err);
  });
})

router.post("/login", function (req, res, next) {
   res.redirect("/main");
});

router.post("/setusername",function (req, res, next) {
  res.redirect("/login");
});


module.exports = router;