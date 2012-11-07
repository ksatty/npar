var log  = require("./logger")
	conf = {
		"timeout": 2000
	};

var npar = function(caller) {
	return new NPar(caller);
};

var NPar = function(caller) {
	this.type = "Npar";

	this.caller = caller;
	this.caller && (this.caller.npar = this);
	this.caller || (this.caller = {});

	this._count = 0;
	this._executed = 0;

	this.processes = {};
	this.results = {};
	this.errors = null;
};

NPar.prototype.add = function(processData) {
	if (typeof processData == "function") {
		processData = {
			"name": "process_" + this._count,
			"process": processData,
			"args": (function (args){
				var ret = [];
				for (var a = 1; a < arguments.length; a++) {
					ret.push(arguments[a]);
				}
				return ret;
			})(arguments)
		}
	}

	var namedProcess = {
		"process": processData.process,
		"args": processData.args || [],
		"callback": this._createCallback (processData.name),
		"timeoutCallback": this._createTimeoutCallback (processData.name)
	};
	namedProcess.args.push(namedProcess.callback);

	this.processes[processData.name] = namedProcess;
	this._count ++;

	return this;
};

NPar.prototype._createCallback = function(name) {
	var _self = this;

	return function(result) {
		_self._internalCallback (name, result);
	}
};

NPar.prototype._createTimeoutCallback = function(name) {
	var _self = this;

	return function() {
		if (_self.processes[name].timeout) {
			clearTimeout(_self.processes[name].timeout);
		}

		_self.processes[name].timeExeeded = true;
		_self._addError (name, "TIMEOUT");
		_self._incrementExecution ();
	}
};

NPar.prototype._internalCallback = function(name, result) {
	if (!this.processes[name]) {
		this._addError (name, "PROCESS NOT FOUND");
	} else if (this.processes[name].timeExeeded === true) {
		var timeElapsed = (new Date().getTime() - this.processes[name].startTime) / 1000;
		log.error ("npar process time exeeded", {"name": name, "result": result, "time_elapsed": timeElapsed});
	} else {
		if (this.processes[name].timeout) {
			clearTimeout(this.processes[name].timeout);
		}

		if (result.error) {
			this._addError (name, result.error);
		} else {
			this.results[name] = result;
		}
	}

	this._incrementExecution ();
};

NPar.prototype._incrementExecution = function() {
	this._executed ++;

	if (this._executed == this._count) {
		this.callback.apply (this.caller, [this.errors, this.results]);
	}
};

NPar.prototype._addError = function(name, error) {
	this.errors || (this.errors = {})

	this.errors[name] = error;
};

NPar.prototype.exec = function(callback) {
	this.callback = callback;

	for (var name in this.processes) {
		try {
			var timeout = conf.timeout;

			if (timeout) {
				this.processes[name].timeout = setTimeout (this.processes[name].timeoutCallback, timeout);
			}
			this.processes[name].startTime = new Date().getTime();
			this.processes[name].process.apply (this.caller, this.processes[name].args);
		} catch (e) {
			if (this.processes[name].timeout) {
				clearTimeout(this.processes[name].timeout);
			}

			this._addError (name, e.message);
			this._incrementExecution ();
		}
	}
};

module.exports = npar;