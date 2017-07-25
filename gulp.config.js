module.exports = function (argument) {
	
	var client = './src/client/';
	var clientApp = client +'app/';
	var server = './src/server/';
	var temp = './.tmp/';
    
	var config = {

		alljs: [
           './src/**/*.js',
           './*.js'
		],
        build: './build/',
		client: client,

		index: client + 'index.html',

		css : temp + 'styles.css',

		fonts:'./bower_components/font-awesome/fonts/**/*.*',

		images: client + 'images/**/*.*',

		htmlTemplates: client + '**/*.html',

		js: [
           clientApp + '**/*.module.js',
           clientApp + '**/*.js',
           '!' + clientApp + '**/*.spec.js',
		],

		less: client + '/styles/styles.less',
		server: server,
		temp: temp,
        
        /**
        * Template Cache
        */  
         templatecache: {
            file: 'templates.js',
            options: {
            	module: 'app.core',
            	standAlone: false,
            	root: 'app/'
            }
         },
        /**
        * browser Sync
        */        
		browserReloadDelay: 1000,

		/* Bower and NPM locations */

		bower: {
			json: require('./bower.json'),
			directory: './bower_components',
			ignorePath: '../..'
		},
		defaultPort: 7203,
		nodeServer: './src/server/app.js'
	};

	config.getWiredDefaultOptions = function () {
		var options = {
            bowerJSON: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
		};
		return options;
	};

	return config;
};