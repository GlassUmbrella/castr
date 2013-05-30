//Getting the orm instance
var orm = require("../lib/model")
  , Seq = orm.Seq();

//Creating our module
module.exports = {
	model: {
		isOwner: { //Maybe make this a role...
			type: Seq.BOOLEAN
		},
		test: {
			type: Seq.STRING
		}
	},
    relations:{
       belongsTo: [
       		{ name: "Podcasts" },
       		{ name: "Users" }
       ]
    }
}
