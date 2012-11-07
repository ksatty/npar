var winston = require ("winston");

var log = new (winston.Logger)({
	exitOnError: false,
	transports: [
		new (winston.transports.Console)({
			colorize: true
		}),
		new (winston.transports.File)({
			filename: '/tmp/log/npar.log',
			maxsize: 1048576,
			maxFiles: 10,
			json: false
		})
	],
	exceptionHandlers: [
		new (winston.transports.Console)({
			colorize: true
		}),
		new winston.transports.File({
			filename: '/tmp/log/npar.exceptions.log',
			maxsize: 1048576,
			maxFiles: 10,
			json: false
		})
	]
});

module.exports = log;