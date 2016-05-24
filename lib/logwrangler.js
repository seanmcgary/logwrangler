'use strict';

let _ = require('lodash');
let colors = require('colors');


let logLevels = {};
let levelOrdering = {};
_.each(['DEBUG', 'INFO', 'WARN', 'ERROR'], function(l, i){
	logLevels[l] = l;
	levelOrdering[l] = i;
});

let levelTypes = _.extend({
	SUCCESS: 'SUCCESS'
}, logLevels);

let parseDataObject = function(data){
	data = data || {};

	// move the error into a property of data for consistency
	if(data instanceof Error){
		data = { error: data };
	}

	if(data.error && data.error instanceof Error){
		data.error = {
			message: data.error.message || data.error.toString(),
			stack: data.error.stack || ''
		};
	}
	return data;
};

// Logwrangler module prototype stub
function LogwranglerModule(){};
LogwranglerModule.prototype.log = function(){};

function SimpleConsoleModule(options){
	let defaults = {
		colors: true,
		outputFormat: 'text'
	};
	this.options = _.defaults(_.pick(options || {}, _.keys(defaults)), defaults);

};
SimpleConsoleModule.prototype = Object.create(LogwranglerModule.prototype);
SimpleConsoleModule.prototype.getColorForType = function(type){
	let color = 'grey';
	switch(type){
		case levelTypes.WARN:
			color = 'yellow';
			break;
		case levelTypes.ERROR:
			color = 'red';
			break;
		case levelTypes.SUCCESS:
			color = 'green';
			break;
		case levelTypes.DEBUG:
		case levelTypes.INFO:
		default:
			color = 'grey';
			break;
	}
	return color;
};

SimpleConsoleModule.prototype.stringifyLogMessage = function(data){
	let logString = [];
	logString.push('{' + data.level + '}');
	logString.push('[' + data.ts.toString() + ']');
	logString.push('(' + data.cluster + ')');
	logString.push('(' + data.node + ')');
	logString.push('(' + data.ns + ')');
	logString.push('(' + data.ident + ')');
	logString = [logString.join('')];
	logString.push(data.message);
	logString = [logString.join(' - ')];
	logString.push(_.isObject(data.data) ? JSON.stringify(data.data) : data.data);
	logString = logString.join(' :: ');

	if('COLOR: ', this.options.colors){
		logString = logString[this.getColorForType(data.type)];
	}
	
	return logString;
};

SimpleConsoleModule.prototype.jsonifyLogMessage = function(data){
	data = data || {};

	
	let output = {};

	output = _.reduce(data, function(out, val, key){
		if(!_.isString(val) || (_.isString(val) && val.length)){
			out[key] = val;
		}
		return out;
	}, output);
	return JSON.stringify(output);
};

SimpleConsoleModule.prototype.log = function(initOptions, data){
	if(levelOrdering[data.level] >= levelOrdering[initOptions.level]){

		if(this.options.outputFormat == 'json'){
			console.log(this.jsonifyLogMessage(data));
			return;
		}

		let message = this.stringifyLogMessage(data);
		switch(data.level){
			case 'WARN':
				console.warn(message);
				break;
			case 'ERROR':
				console.error(message);
				break;
			default:
				console.log(message);
		}


	}
};

function Logwrangler(initOptions){
	let self = this;
	initOptions = initOptions || {};
	initOptions.level = initOptions.level || logLevels.DEBUG;

	initOptions.logOptions = _.defaults(initOptions.logOptions || {}, {
		level: logLevels.DEBUG,
		node: '',
		cluster: '',
		ns: '',
		ident: '',
		message: '',
		data: {}
	});

	let outputs = initOptions.outputs || [];

	let useModule = function(module){
		outputs.push(module);
	};

	useModule(new SimpleConsoleModule(initOptions));

	_.extend(self, {
		levels: logLevels,
		types: levelTypes,
		log: function(data){
			data = data || {};

			data = _.defaults(data, initOptions.logOptions);

			if(!data.type){
				data.type = data.level;
			}

			data.data = parseDataObject(data.data);
			data.ts = new Date();

			_.each(outputs, function(out){
				out.log(initOptions, data);
			});

		},
		info: function(data){
			data.level = logLevels.INFO,
			this.log(data);
		},
		error: function(data){
			data.level = logLevels.ERROR;

			this.log(data);
		},
		warn: function(data){
			data.level = logLevels.WARN;

			this.log(data);
		},
		success: function(data){
			data.level = logLevels.INFO;
			data.type = levelTypes.SUCCESS;

			this.log(data);
		},
		use: useModule,
		clone: function(){
			return _.cloneDeep(self);
		},
		setLogOption: function(name, value){
			initOptions.logOptions[key] = value;
		},
		setLogOptions: function(values){
			_.each(options, function(val, key){
				initOptions.logOptions[key] = val;
			});
		}
	});
	return self;
};

let inst;
exports.levels = logLevels;
exports.types = levelTypes;
exports.LogwranglerModule = LogwranglerModule;
exports.SimpleConsoleModule = SimpleConsoleModule;

exports.create = function(initOptions, forceNew){
	if(_.isBoolean(initOptions)){
		forceNew = initOptions;
		initOptions = {};
	}
	if(inst && !forceNew){
		return inst;
	}

	let localInst = new Logwrangler(initOptions);
	
	if(forceNew){
		return localInst;
	}
	inst = localInst;
	return inst;
};