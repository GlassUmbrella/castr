//Getting the orm instance
var orm = require("../lib/model")
  , Seq = orm.Seq();

//Creating our module
module.exports = {
	model: {
		emailAddress: {
			type: Seq.STRING,
			unique: true,
            allowNull: false
		},
		name: {
			type: Seq.STRING,
			allowNull: false
		},
		password: {
			type: Seq.STRING,
			allowNull: false
		},
		resetCode: {
			type: Seq.STRING,
			allowNull: true
		},
		resetRequestTime: {
			type: Seq.DATE,
			allowNull: true
		}
	},
    relations:{
       hasMany: [ { name: "PodcastUser" } ]
    }
}
