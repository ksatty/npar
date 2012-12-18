var npar = function(caller) {
	return new NPar(caller);
};

var NPar = function(caller) {
	this.type = "Npar";

	this._config = {
		"timeout": 2000
	}

	this.caller = caller;
	this.caller && (this.caller.npar = this);
	this.caller || (this.caller = {});

	this._count = 0;
	this._executed = 0;

	this.processes = {};
	this.results = {};
	this.errors = null;
};

NPar.prototype.config = function(config, value) {
	if (value) {
		this._config[config] = value;
	} else {
		for (var c in config) {
			this._config[c] = config[c];
		}
	}

	return this;
};

NPar.prototype.add = function(processData) {
	if (typeof processData == "function") {
		processData = {
			"name": "process_" + this._count,
			"process": processData,
			"args": (function (args){
				var ret = [];
				for (var a = 1; a < args.length; a++) {
					ret.push(args[a]);
				}
				return ret;
			})(arguments)
		}
	}

	if (this.processes[processData.name] != null) {
		return this;
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

	return function(err, result) {
		_self._internalCallback (name, err, result);
	}
};

NPar.prototype._createTimeoutCallback = function(name) {
	var _self = this;

	return function() {
		if (_self.processes[name].timeout) {
			clearTimeout(_self.processes[name].timeout);
		}

		_self.processes[name].timeExeeded = true;
		_self._addError (name, "TIMEOUT: " + (timeElapsed = (new Date().getTime() - _self.processes[name].startTime) / 1000));
		_self._incrementExecution ();
	}
};

NPar.prototype._internalCallback = function(name, err, result) {
	if (!this.processes[name]) {
		this._addError (name, "PROCESS NOT FOUND");
	} else if (this.processes[name].timeExeeded === true) {
		var timeElapsed = (new Date().getTime() - this.processes[name].startTime) / 1000;
	} else {
		if (this.processes[name].timeout) {
			clearTimeout(this.processes[name].timeout);
		}

		if (err) {
			this._addError (name, err);
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

		this._executed = 0;
		this.errors = null;
		this.results = {};
	}
};

NPar.prototype._addError = function(name, error) {
	this.errors || (this.errors = {})

	this.errors[name] = error;
};

NPar.prototype.exec = function(callback) {
	this.callback = callback;

	if (this._count == 0) {
		this.callback.apply (this.caller, [new Error("No processes specified")]);
		return;
	}

	for (var name in this.processes) {
		try {
			var timeout = this._config.timeout;

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