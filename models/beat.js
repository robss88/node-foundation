const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const beatSchema = new Schema({
	name: String,
	tempo: Number,
	public: Boolean,
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	}
});

const Beat = mongoose.model('beat', beatSchema);

module.exports = Beat;