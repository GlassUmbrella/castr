
// https://github.com/JeyDotC/articles/blob/master/EXPRESS%20WITH%20SEQUELIZE.md

var filesystem = require("fs");
var models = {};
var relationships = {};

var singleton = function singleton(){
    var Sequelize = require("sequelize-mysql").sequelize;
    var sequelize = null;
    var modelsPath = "";
	
    this.setup = function (path, database, username, password, obj) {

        console.log("Database: path:" + path + ", database:" + database + ", username:" + username + ", password:" + password);

        modelsPath = path;

        if(arguments.length == 3) {
            sequelize = new Sequelize(database, username);
        } else if(arguments.length == 4) {
            sequelize = new Sequelize(database, username, password);
        } else if(arguments.length == 5) {
            sequelize = new Sequelize(database, username, password, obj);
        }
		
        init();
    }

    this.model = function(name) {
        return models[name];
    }

    this.Seq = function() {
        return Sequelize;
    }

    function init() {
		var userModel = require("../models/user");
		var podcastModel = require("../models/podcast");
		var episodeModel = require("../models/episode");
		var inviteModel = require("../models/invite");
		
		models["User"] = sequelize.define("User", userModel.model, userModel.options);
		models["Podcast"] = sequelize.define("Podcast", podcastModel.model, podcastModel.options);
		models["Episode"] = sequelize.define("Episode", episodeModel.model, episodeModel.options);
		models["Invite"] = sequelize.define("Invite", inviteModel.model, inviteModel.options);
		
		relationships["User"] = userModel.relations;
		relationships["Podcast"] = podcastModel.relations;
		relationships["Episode"] = episodeModel.relations;
		
        for(var entityName in relationships) {
        	var associations = relationships[entityName];
        	for(var type in associations) {
        		for(var instance in associations[type]) {
        			var association = associations[type][instance];
					console.log("Adding association: " + entityName + " " + type + " " + association.name);
					if(association.table) {
						models[entityName][type](models[association.name], { joinTableName: association.table });
					} else {
						models[entityName][type](models[association.name]);
					}
        		}
        	}
        }
        
        sequelize.sync();
    }

    if(singleton.caller != singleton.getInstance) {
        throw new Error("This object cannot be instanciated");
    }
}

singleton.instance = null;

singleton.getInstance = function() {
    if(this.instance === null) {
        this.instance = new singleton();
    }
    return this.instance;
}

module.exports = singleton.getInstance();