//Getting the orm instance
var orm = require("../lib/model")
  , Seq = orm.Seq();

//Creating our module
module.exports = {
	model: {
		url: {
			type: Seq.STRING,
            allowNull: false
		},
		filename: {
			type: Seq.STRING,
			allowNull: false
		},
		mimetype: {
			type: Seq.STRING,
			allowNull: false
		},
		size: {
			type: Seq.INTEGER,
			allowNull: false
		},
		key: {
			type: Seq.STRING,
			allowNull: false
		}
	},
    relations: {},
    options: {}
}
