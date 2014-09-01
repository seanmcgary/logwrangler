var _ = require('lodash');
var colors = require('colors');


var logLevels = {};
var levelOrdering = {};
_.each(['DEBUG', 'INFO', 'WARN', 'ERROR'], function(l, i){
	logLevels[l] = l;
	levelOrdering[l] = i;
});

var levelTypes = _.extend({
	SUCCESS: 'SUCCESS'
}, logLevels);

var parseDataObject = function(data){
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

function SimpleConsoleModule(){};
SimpleConsoleModule.prototype = Object.create(LogwranglerModule.prototype);
SimpleConsoleModule.prototype.getColorForType = function(type){
	var color = 'grey';
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
	var logString = [];
	logString.push('{' + data.level + '}');
	logString.push('[' + data.ts.toString() + ']');
	logString.push('(' + data.node + ')');
	logString.push('(' + data.ns + ')');
	logString.push('(' + data.ident + ')');
	logString = [logString.join('')];
	logString.push(data.message);
	logString = [logString.join(' - ')];
	logString.push(_.isObject(data.data) ? JSON.stringify(data.data) : data.data);
	logString = logString.join(' :: ');

	logString = logString[this. getColorForType(data.type)];
	return logString;
};

SimpleConsoleModule.prototype.log = function(initOptions, data){
	if(levelOrdering[data.level] >= levelOrdering[initOptions.level]){
		console.log(this.stringifyLogMessage(data));
	}
};


function EnchancedConsoleModule(){};
EnchancedConsoleModule.prototype = Object.create(SimpleConsoleModule.prototype);
EnchancedConsoleModule.prototype.log = function(initOptions, data){

	if(levelOrdering[data.level] >= levelOrdering[initOptions.level]){
		var message = this.stringifyLogMessage(data);

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
	var self = this;
	initOptions = initOptions || {};
	initOptions.level = initOptions.level || logLevels.DEBUG;

	initOptions.logOptions = _.defaults(initOptions.logOptions || {}, {
		level: logLevels.DEBUG,
		node: '',
		ns: '',
		ident: '',
		message: '',
		data: {}
	});
	//console.log('options', initOptions);

	var outputs = initOptions.outputs || [];

	var useModule = function(module){
		outputs.push(module);
	};

	useModule(new SimpleConsoleModule());

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

var inst;
exports.levels = logLevels;
exports.types = levelTypes;
exports.LogwranglerModule = LogwranglerModule;
exports.SimpleConsoleModule = SimpleConsoleModule;
exports.EnchancedConsoleModule = EnchancedConsoleModule;

exports.create = function(initOptions, forceNew){
	if(inst && !forceNew){
		return inst;
	}

	var localInst = new Logwrangler(initOptions);
	
	if(forceNew){
		return localInst;
	}
	inst = localInst;
	return inst;
};