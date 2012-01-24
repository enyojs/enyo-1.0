(function() {
	//* @protected
	//* register palm sources of logLevel settings
	setupLoggingLevel = function() {
		var fc = enyo.fetchRootFrameworkConfig();
		if (fc) {
			enyo.setLogLevel(fc.logLevel);
		}
		var uc = enyo.fetchFrameworkConfig();
		if (uc) {
			enyo.setLogLevel(uc.logLevel);
		}
		var ai = enyo.fetchAppInfo();
		if (ai) {
			enyo.setLogLevel(ai.logLevel);
		}
	};

	// launch right away to control logging for app load
	setupLoggingLevel();
})();
