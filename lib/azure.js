var singleton = function singleton() {
    var azure = require("azure");
	var blobService;
	
    this.setup = function(account, accessKey) {
		process.env["AZURE_STORAGE_ACCOUNT"] = account;
		process.env["AZURE_STORAGE_ACCESS_KEY"] = accessKey;
		blobService = azure.createBlobService();
		
        init();
    }

    function init() {
		blobService.createContainerIfNotExists("podcast-covers", { publicAccessLevel : "blob" }, 
			function(error) {
		        if (!error) {
		            // Container exists and is public
		        }
			}
		);
	}

    if(singleton.caller != singleton.getInstance) {
        throw new Error("This object cannot be instantiated.");
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