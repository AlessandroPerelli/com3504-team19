let mongoose = require('mongoose');

// Get the Schema class from mongoose
let Schema = mongoose.Schema;

// Define the schema for the Comment model
let CommentSchema = new Schema(
    {
        name: {type: String},
        message: {type: String},
        timeOfMessage: {type: Date}
    }
)

// Define the schema for the Plant model
let PlantSchema = new Schema(
    {
        // Plant Characteristics
        name: { type: String, default: 'UNKNOWN' },
        time: { type: Date },
        location: { type: String},
        desc: { type: String, maxLength: 250},
        img: {type: String }, // Image is a string due to saving the relative file path
        sight_time: {type: Date},
        height: {type: Number},
        spread: {type: Number},
        does_the_plant_have_flowers: {type: Boolean},
        colour: {type: String},
        does_the_plant_have_leaves: {type: Boolean},
        does_the_plant_have_fruit: {type: Boolean},
        full_sun: {type: Boolean},
        partial_shade: {type: Boolean},
        full_shade: {type: Boolean},
        evergreen: {type: Boolean},
        succulent: {type: Boolean},
        forest: {type: Boolean},

        // Identification Status
        identification_status: {type: Boolean}, 

        // Plant Creator
        user_nickname: {type: String},

        // List of comments attached to the plantid
        comments: [CommentSchema],
    }
);

// Configure the 'toObject' option for the schema to include getters
// and virtuals when converting to an object
PlantSchema.set('toObject', { getters: true, virtuals: true });

// Create the mongoose model 'Plant' based on the defined schema
let Plants = mongoose.model('plant', PlantSchema);

// Export the Plants model for use in other modules
module.exports = Plants;