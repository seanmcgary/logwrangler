var fancyLog = require('../index');


var logger = fancyLog.create({
	level: fancyLog.levels.DEBUG,
	outputs: {
		custom: {
			enabled: true,
			handler: function(){
				console.log("CUSTOM");
			}
		},
		console: {
			enabled: true
		}
	}
});

logger.log({
	level: logger.levels.INFO,
	type: logger.types.SUCCESS,
	ns: 'api',
	ident: '123456',
	message: 'some message',
	data: { key: 'some value' },
});

logger.log({
	level: logger.levels.ERROR,
	type: logger.types.ERROR,
	ns: 'api',
	ident: '123456',
	message: 'some message',
	data: { key: 'some value' }
});

logger.log({
	level: logger.levels.WARN,
	ns: 'api',
	ident: '123456',
	message: 'some message',
	data: { key: 'some value' }
});

logger.log({
	level: logger.levels.DEBUG,
	ns: 'api',
	ident: '123456',
	message: 'some message',
	data: { key: 'some value' }
});

