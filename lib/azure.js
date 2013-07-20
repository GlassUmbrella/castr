var singleton = function singleton() {
    var azure = require("azure");
	var blobService;
	
    this.setup = function(account, accessKey) {
		process.env["AZURE_STORAGE_ACCOUNT"] = account;
		process.env["AZURE_STORAGE_ACCESS_KEY"] = accessKey;
		blobService = azure.createBlobService();
		
        init();
    }

    this.upload = function(containerName, blobName, fileName, callback) {
    	blobService.
    }

    function init() {
    	createPublicContainer("podcast-covers");
    	createPublicContainer("podcast-audio");
	}

	function createPublicContainer(containerName) {
		blobService.createContainerIfNotExists(containerName, { publicAccessLevel : "blob" }, 
			function(error) {
		        if (!error) {
		            // Container exists and is public
		            console.log("Azure container \"{0}\" created.".format(containerName));
		        } else {
		        	console.log("Azure container \"{0}\" creation failed.".format(containerName));
		        }
			}
		);
	}

    if(singleton.caller != singleton.getInstance) {
        throw new Error("This object cannot be init.");
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