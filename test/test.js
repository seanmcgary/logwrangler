var logwrangler = require('../index');
var logger = logwrangler.create({
	level: logwrangler.levels.DEBUG,
});

logger.useModule('myCoolMod', {});

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
	location: 'some-location',
	message: 'testing error',
	data: {
		error: new Error('Im an error object')
	}
});

logger.setOverrides({ 
	ns: 'some default ns',
	level: logger.levels.INFO,
	location: 'datacenter-1'
});
logger.log({
	message: 'test'
});

logger.use(function(options, data){
	console.log('------------------------\ncustom handler')
	console.log(data);
	console.log('------------------------')
});

var copy = logger.copy();
copy.log({
	message: 'copy'
});
logger.log({
	message: 'original'
});


