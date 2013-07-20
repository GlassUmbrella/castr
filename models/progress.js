//Getting the orm instance
var orm = require("../lib/model")
  , Seq = orm.Seq();

//Creating our module
module.exports = {
	model: {
		time: {
			type: Seq.INTEGER,
            defaultValue: 0
		}
	},
    relations: {
    	belongsTo: [
	   		{ name: "Episode" },
	   		{ name: "User" }
		]
    },
    options: {
    	tableName: "Progress"
    }
}
