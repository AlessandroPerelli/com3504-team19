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
        name: { type: String, default: 'UNKNOWN' },
        time: { type: Date },
        // Define location as two values Lat and Long
        location: { type: String},
        // description of plant
        desc: { type: String, maxLength: 250},
        // Define the img field with type String
        img: {type: String },


        // Time of sighting
        sight_time: {type: Date},

        //Plant Characteristics
        does_the_plant_have_flowers: {type: Boolean},
        flower_colour: {type: String},
        does_the_plant_have_leaves: {type: Boolean},
        does_the_plant_have_fruit: {type: Boolean},
        full_sun: {type: Boolean},
        partial_shade: {type: Boolean},
        full_shade: {type: Boolean},
        evergreen: {type: Boolean},
        succulent: {type: Boolean},
        forest: {type: Boolean},

        identification_status: {type: Boolean},

        user_nickname: {type: String},
    }
);

// Configure the 'toObject' option for the schema to include getters
// and virtuals when converting to an object
PlantSchema.set('toObject', { getters: true, virtuals: true });

// Create the mongoose model 'Plant' based on the defined schema
let Plants = mongoose.model('plant', PlantSchema);

// Export the Student model for use in other modules
module.exports = Plants;