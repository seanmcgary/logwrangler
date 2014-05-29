var fancyLog = require('../index');


var logger = fancyLog.create({
	level: fancyLog.levels.DEBUG,
});

logger.use(function(options, data){
	//console.log(arguments);
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

logger.log({
	level: logger.levels.DEBUG,
	ns: 'api',
	ident: '123456',
	message: 'testing error',
	data: new Error('Im an error object')
});

logger.log({
	level: logger.levels.ERROR,
	ns: 'api',
	ident: '123456',
	message: 'testing error',
	data: {
		error: new Error('Im an error object')
	}
});

