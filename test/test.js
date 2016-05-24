var logwrangler = require('../');
var logger = logwrangler.create({
	level: logwrangler.levels.DEBUG,
	colors: true,
	outputFormat: 'json'
});

console.log(logger);

//logger.useModule('myCoolMod', {});

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
	node: 'my test node',
	message: 'testing error',
	data: {
		error: new Error('Im an error object')
	}
});



logger.error({
	data: new Error('some test error message')
});

logger.log({
	message: 'test'
});

var copy = logger.clone();
copy.log({
	message: 'copy'
});
logger.log({
	message: 'original'
});

logger.success({
	message: 'test shortcut'
});

const textLogger = logwrangler.create(true);

textLogger.error({
	message: 'test'
});
