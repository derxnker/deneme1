const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Tickets = new Schema({
    ID: {type: String, required: true},
    TicketAuthor: {type: String, required: true},
    TicketOpenDate: {type: Number, required: true},
    TicketClosedDate: {type: Number, default: null},
    TicketContent: {type: String, default: null},
    TicketStaff: {type: String, default: null}
});

module.exports = mongoose.model('Tickets', Tickets);

/*ID: message.channel.id
	- TicketAuthor: 
	- TicketAuthorTag:
        - TicketOpenDate:
	- TicketClosedDate:
	- TicketContent:
	- TicketStaff: */