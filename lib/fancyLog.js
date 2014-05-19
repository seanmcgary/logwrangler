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



var fancyLog = function(options){
	var self = this;
	
	var log = function(data){
		var dfaults = {
			level: logLevels.INFO,
			ns: '',
			ident: '',
			message: '',
			data: {},
		};

		data = _.extend(dfaults, data);
		if(!data.type){
			data.type = data.level;
		}

		data.ts = new Date();

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


		if(levelOrdering[data.level] >= levelOrdering[options.level]){
			console.log(logString);
		}		
	};

	return _.extend(self, {
		levels: logLevels,
		types: extendedLevels,
		log: log
	});
};

module.exports = {
	create: function(options){
		return new fancyLog(options);
	},
	levels: logLevels
};