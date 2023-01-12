const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const BookinstanceSchema = new Schema({
    book: {type: Schema.Types.ObjectId, ref:"Book", required: true},
    imprint: {type: String, required: true},
    status: {
        type: String,
        required: true,
        enum: ["Available", "Maintenance", "Loaned", "Reserved"],
        default: "Maintenance",
    },
    due_back: {type: Date, default: Date.now},
});

BookinstanceSchema.virtual("url").get(function(){
    return `/catalog/bookinstance/${this._id}`;
});

BookinstanceSchema.virtual("due_back_formatted").get(function(){
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

BookinstanceSchema.virtual("due_back_yyyy_mm_dd").get(function () {
    return DateTime.fromJSDate(this.due_back).toISODate(); //'YYYY-MM-DD' format
});

module.exports = mongoose.model("Bookinstance", BookinstanceSchema);