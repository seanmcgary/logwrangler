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
	
	if(data instanceof Error){
		data = {
			message: data.message || data.toString()
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

	use(consoleHandler);

	return _.extend(self, {
		levelToColor: levelToColor,
		levelOrdering: levelOrdering,
		levels: logLevels,
		types: extendedLevels,
		consoleHandler: consoleHandler,
		log: log,
		use: use
	});
};

module.exports = {
	create: function(options){
		return new fancyLog(options);
	},
	levels: logLevels
};