//Getting the orm instance
var orm = require("../lib/model")
  , Seq = orm.Seq();

//Creating our module
module.exports = {
	model: {
		title: {
			type: Seq.STRING,
            allowNull: false
		},
		description: {
			type: Seq.STRING,
			allowNull: false
		},
		coverLocation: {
			type: Seq.STRING,
			allowNull: false
		},
		url: {
			type: Seq.STRING,
			allowNull: false
		},
		ownerUserId: {
			type: Seq.INTEGER,
			allowNull: false
		}
	},
    relations:{
       hasMany: [
       		{ name: "Episode" },
       		{ name: "User" }
       ]
    }
}
