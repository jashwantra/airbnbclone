const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    place : {type:mongoose.Schema.Types.ObjectId, required:true, ref:"Place"},
    user : {type:mongoose.Schema.Types.ObjectId, required:true},
    checkIn: {type: Date, required:true},
    checkOut: {type: Date, required:true},
    numberOfGuests : Number,
    name: {type: String, required:true},
    phone: String,
    price: Number
});

const BookingModel = new mongoose.model("Booking", bookingSchema);

module.exports = BookingModel;