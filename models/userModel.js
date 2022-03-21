const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema({
   ID: {type: String, required: true},
   UserTag: {type: String, required: true},
   TotalTickets: {type: Number, default: 0},
   LastOnline: {type: Number, default: null},
   LastOffline: {type: Number, default: null},
   TotalHours: {type: Number, default: 0},
   MeetCount: {type: Number, default: 0},
   Ideas: {type: Array, default: []}
});

module.exports = mongoose.model('User', User);