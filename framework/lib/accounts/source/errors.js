var AccountError = (function() {
	var accountsRb = new enyo.g11n.Resources({root: "$enyo-lib/accounts"});
	
	var _errorStrings = {
		"UNKNOWN_ERROR":				accountsRb.$L("Unknown error"),
		"401_UNAUTHORIZED":				accountsRb.$L("The account credentials you entered are incorrect. Try again."),
		"408_TIMEOUT":					accountsRb.$L("Request timeout"),
		"500_SERVER_ERROR":				accountsRb.$L("Server error"),
		"503_SERVICE_UNAVAILABLE":		accountsRb.$L("Server unavailable"),
		"412_PRECONDITION_FAILED":		accountsRb.$L("The request is not suitable for the current configuration"),
		"400_BAD_REQUEST":				accountsRb.$L("Bad request"),
		"HOST_NOT_FOUND":				accountsRb.$L("Host not found"),
		"CONNECTION_TIMEOUT":			accountsRb.$L("Connection timeout"),
		"CONNECTION_FAILED":			accountsRb.$L("Connection failed"),
		"NO_CONNECTIVITY":				accountsRb.$L("Must be connected to a network to sign in"),
		"ENOTFOUND":					accountsRb.$L("Must be connected to a network to sign in"),
		"SSL_CERT_EXPIRED":				accountsRb.$L("SSL certificate expired"),
		"SSL_CERT_UNTRUSTED":			accountsRb.$L("SSL certificate untrusted"),
		"SSL_CERT_INVALID":				accountsRb.$L("SSL certificate invalid"),
		"SSL_CERT_HOSTNAME_MISMATCH":	accountsRb.$L("SSL certificate hostname mismatch"),
		"SINGLE_ACCOUNT_ONLY":			accountsRb.$L("Only one account of this type can exist"),
		"TIMESTAMP_REFUSED":			accountsRb.$L("Device date incorrect"),
		"DUPLICATE_ACCOUNT":			accountsRb.$L("Duplicate account"),
		"UNSUPPORTED_CAPABILITY":		accountsRb.$L("Your account is not configured for this service."),
		"INVALID_EMAIL_ADDRESS":		accountsRb.$L("Please enter a valid email address."),
		"INVALID_USER":					accountsRb.$L("Invalid user"),
		"ACCOUNT_RESTRICTED":			accountsRb.$L("User account restricted"),
		"ACCOUNT_LOCKED":				accountsRb.$L("Your account is locked.  Please log in using a web browser"),
		"CALENDAR_DISABLED":			accountsRb.$L("Your account does not have calendar enabled. Please log in to your account and enable it.")
	};
	
	var _numericErrorCodes = {
		"-3141601": "UNKNOWN_ERROR",
		"-3141602": "401_UNAUTHORIZED",
		"-3141603": "408_TIMEOUT",
		"-3141604": "500_SERVER_ERROR",
		"-3141605": "503_SERVICE_UNAVAILABLE",
		"-3141606": "412_PRECONDITION_FAILED",
		"-3141607": "400_BAD_REQUEST",
		"-3141608": "HOST_NOT_FOUND",
		"-3141609": "CONNECTION_TIMEOUT",
		"-3141610": "CONNECTION_FAILED",
		"-3141611": "NO_CONNECTIVITY",
		"-3141612": "SSL_CERT_EXPIRED",
		"-3141613": "SSL_CERT_UNTRUSTED",
		"-3141614": "SSL_CERT_INVALID",
		"-3141615": "SSL_CERT_HOSTNAME_MISMATCH",
		"-3141616": "DUPLICATE_ACCOUNT",
		"-3141617": "UNSUPPORTED_CAPABILITY"
	};
	
	return {
		getErrorText: function(error) {
			var text = _errorStrings["UNKNOWN_ERROR"];
	
			if (error) {
				error = _numericErrorCodes[error] || error;
				text = _errorStrings[error] || text;
			}
			return text;
		}
	}
}());

