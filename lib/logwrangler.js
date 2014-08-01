var colors = require('colors');
var _ = require('lodash');

var logLevels = {
	DEBUG: 'DEBUG',
	INFO: 'INFO',
	WARN: 'WARN',
	ERROR: 'ERROR'
};

var extendedLevels = _.extend(logLevels, {
	SUCCESS: 'SUCCESS'
});

var levelOrdering = {};
levelOrdering[logLevels.DEBUG] = 0;
levelOrdering[logLevels.INFO] = 1;
levelOrdering[logLevels.WARN] = 2;
levelOrdering[logLevels.ERROR] = 3;

var levelToColor = {};
levelToColor[logLevels.DEBUG] = 'grey';
levelToColor[logLevels.INFO] = 'grey';
levelToColor[logLevels.WARN] = 'yellow';
levelToColor[logLevels.ERROR] = 'red';
levelToColor[logLevels.SUCCESS] = 'green';


var consoleHandler = function(options, data){
	var stringifyLogMessage = function(options, data){
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

		logString = logString[levelToColor[data.type]];
		return logString;
	};

	if(this.levelOrdering[data.level] >= this.levelOrdering[options.level]){
		var message = stringifyLogMessage(options, data);

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

var parseDataObject = function(data){
	if(!data){
		return {};
	}

	// move the error into a property of data for consistency
	if(data instanceof Error){
		data = {
			error: data
		};
	}

	if(data.error && data.error instanceof Error){
		data.error = {
			message: data.error.message || data.error.toString(),
			stack: data.error.stack || ''
		};
	}
	return data;
};

var logwrangler = function(options){
	var self = this;
	options = options || {};

	self.levelToColor = levelToColor;
	self.levels = logLevels;
	self.levelOrdering = levelOrdering;
	self.types = extendedLevels;

	var outputs = [];
	self.overrides = {};
	self.dfaults = {
		level: logLevels.INFO,
		ns: '',
		ident: '',
		message: '',
		node: '',
		data: {},
	};

	var log = self.log = function(data){

		data.data = parseDataObject(data.data);
		data = _.extend(_.cloneDeep(self.dfaults), data);
		data = _.extend(data, self.overrides);
		if(!data.type){
			data.type = data.level;
		}
		data.ts = new Date();

		_.each(outputs, function(output){
			output.apply(self, [options, data]);
		});
	};

	var use = self.use = function(output){
		outputs.push(output);
	};

	var useModule = self.useModule = function(moduleName, initParams){
		var mod;
		try {
			mod = require(moduleName);
		} catch(e){
			log({
				level: logLevels.ERROR,
				ns: 'logwrangler',
				data: {
					error: e
				}
			});
		}

		if(!mod){
			return;
		}

		mod = new mod(initParams);
		use(mod);
	};

	var setOverrides = self.setOverrides = function(overrides){
		overrides = overrides || {};
		var validOverridFields = ['ns', 'message', 'level', 'ident', 'node'];
		self.overrides = _.pick(overrides, validOverridFields);
	};

	var copy = self.copy = function(){
		return _.cloneDeep(self);
	};

	setOverrides(options.overrides);

	use(consoleHandler);
};

var parentInst;
var inst;
module.exports = {
	create: function(options, forceNew){
		if(inst && !forceNew){
			return inst;
		}

		inst = new logwrangler(options);
		return inst;
	},
	levels: logLevels
};