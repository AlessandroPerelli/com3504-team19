let mongoose = require('mongoose');

// Get the Schema class from mongoose
let Schema = mongoose.Schema;

//     name: userData.name,
//     time: userData.time,
//     location: userData.location,
//     size: userData.size,
//     desc: userData.desc,
//     categories: userData.categories,
//     img: filePath,

// Define the schema for the Plant model
let PlantSchema = new Schema(
    {
        // Define the name
        plant_name: { type: String, required: true },
        post_time: {type: String},
        sight_time: {type: String},

        longitude: {type: Number},
        Latitude: {type: Number},

        height: {type: Number},
        spread: {type: Number},

        description: {type: String, max: 250},


        img: {type: String }
    }
);

// Configure the 'toObject' option for the schema to include getters
// and virtuals when converting to an object
PlantSchema.set('toObject', { getters: true, virtuals: true });

// Create the mongoose model 'Plant' based on the defined schema
let Plants = mongoose.model('plant', PlantSchema);

// Export the Student model for use in other modules
module.exports = Plants;