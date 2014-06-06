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
		console.log(stringifyLogMessage(options, data));
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

var fancyLog = function(options){
	var self = this;
	var outputs = [];

	options = _.extend({ 
		level: logLevels.INFO
	}, options);

	var log = function(data){
		var dfaults = {
			level: logLevels.INFO,
			ns: '',
			ident: '',
			message: '',
			data: {},
		};

		data.data = parseDataObject(data.data);
		data = _.extend(dfaults, data);
		if(!data.type){
			data.type = data.level;
		}
		data.ts = new Date();

		_.each(outputs, function(output){
			output.apply(self, [options, data]);
		});
	};

	var use = function(output){
		outputs.push(output);
	};

	var useModule = function(moduleName, initParams){
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

	use(consoleHandler);

	return _.extend(self, {
		levelToColor: levelToColor,
		levelOrdering: levelOrdering,
		levels: logLevels,
		types: extendedLevels,
		consoleHandler: consoleHandler,
		log: log,
		use: use,
		useModule: useModule
	});
};

var inst;
module.exports = {
	create: function(options, forceNew){
		if(inst && !forceNew){
			return inst;
		}

		inst = new fancyLog(options);
		return inst;
	},
	levels: logLevels
};