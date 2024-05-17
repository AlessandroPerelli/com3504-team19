// Import the db model
const plantModel = require("../models/plants");

/**
 * Creates a new plant instance and saves it to the database.
 *
 * @param {Object} userData - The user data for creating a new plant.
 * @param {string} filePath - The file path of the plant image.
 * @returns {Promise<string|null>} - A JSON string of the created plant data or null if an error occurs.
 */
exports.create = function (userData, filePath) {
  // Create a new plant instance using the provided user data
  let plant = new plantModel({
    name: userData.name,
    time: userData.time,
    location: userData.location,
    desc: userData.desc,
    img: filePath,

    sight_time: userData.sight_time,
    height: userData.height,
    spread: userData.spread,
    colour: userData.colour,
    //Plant Characteristics
    does_the_plant_have_flowers: userData.does_the_plant_have_flowers === "on",
    does_the_plant_have_leaves: userData.does_the_plant_have_leaves === "on",
    does_the_plant_have_fruit: userData.does_the_plant_have_fruit === "on",
    full_sun: userData.full_sun === "on",
    partial_shade: userData.partial_shade === "on",
    full_shade: userData.full_shade === "on",
    evergreen: userData.evergreen === "on",
    succulent: userData.succulent === "on",
    forest: userData.forest === "on",
    identification_status: userData.identification_check==="on",

    user_nickname: userData.user_nickname,

    comments: [],
  });

  // Save the plant to the database and handle success or failure
  return plant
    .save()
    .then((plant) => {
      // Log the created plant
      console.log(plant);

      // Return the plant data as a JSON string
      return JSON.stringify(plant);
    })
    .catch((err) => {
      // Log the error if saving fails
      console.log(err);

      // Return null in case of an error
      return null;
    });
};

/**
 * Retrieves all plants from the database.
 *
 * @returns {Promise<string|null>} - A JSON string of the list of plants or null if an error occurs.
 */
exports.getAll = function () {
  // Retrieve all Plants from the database
  return plantModel.find({}).then((plants) => {
      // Return the list of plants as a JSON string
      return JSON.stringify(plants);
    })
    .catch((err) => {
      // Log the error if retrieval fails
      console.log(err);

      // Return null in case of an error
      return null;
    });
};

/**
 * Updates the comments for a specific plant.
 *
 * @param {string} plantId - The ID of the plant to update.
 * @param {string} name - The name of the commenter.
 * @param {string} comment - The comment text.
 * @param {string} date - The date of the comment.
 * @throws {Error} - Throws an error if the document is not updated.
 */
exports.updateComments = async function (plantId, name, comment, date) {
  try {
    const newComment = {
      name: name,
      message: comment,
      timeOfMessage: date,
    };

    const result = await plantModel.updateOne(
      { _id: plantId },
      { $push: { comments: newComment } }
    );

    if (result.nModified === 0) {
      console.error(
        `No documents were updated. Check if the plantId ${plantId} exists.`
      );
      throw new Error("Document not updated");
    }

    console.log(`${result.nModified} document(s) updated`);
  } catch (error) {
    console.error("Error updating value:", error.message);
    throw error;
  }
};

/**
 * Updates the name and identification status of a specific plant.
 *
 * @param {string} plantId - The ID of the plant to update.
 * @param {string} plantName - The new name of the plant.
 * @throws {Error} - Throws an error if the document is not updated.
 */
exports.updatePlant = async function(plantId, plantName){
  const result = await plantModel.updateOne(
    { _id: plantId },
    { $set: { name: plantName, identification_status: true } }
  );

  if (result.nModified === 0) {
    console.error(
      `No documents were updated. Check if the plantId ${plantId} exists.`
    );
    throw new Error("Document not updated");
  }

  console.log(`${result.nModified} document(s) updated`);


}