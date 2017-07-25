var gulp = require('gulp');
var args = require('yargs').argv;
var del = require('del');
var browserSync = require('browser-sync');
var config = require('./gulp.config')();
var $ = require('gulp-load-plugins')({lazy: true});
var port = process.env.PORT || config.defaultPort;

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

gulp.task('start', function () {
	
	log('Analyzing the code uing jscs and jshint');

	return gulp
	    .src(config.alljs)
		.pipe($.if(args.verbose, $.print()))
	    .pipe($.jscs())
	    .pipe($.jshint())
	    .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
	    .pipe($.jshint.reporter('fail'));
});

//Compling less to css
gulp.task('styles', function () {
	log('Compling less to css');

	return gulp
	       .src(config.less)
	       .pipe($.plumber())
	       .pipe($.less())
	       // .on('error', errorLogger)
	       .pipe($.autoprefixer({browsers : ['last 2 versions', '> 5%']}))
	       .pipe(gulp.dest(config.temp));
});

//moving fonts to the build folder
gulp.task('fonts', function () {
	
	log('Copying fonts');

	return gulp
	       .src(config.fonts)
	       .pipe(gulp.dest(config.build + 'fonts'));
});

gulp.task('images', function() {
	log('Copying and compressing of images');

    return gulp
	       .src(config.images)
	       .pipe($.imagemin({optimizationLevel: 4}))
	       .pipe(gulp.dest(config.build + 'images'));

});
//general clean
gulp.task('clean', function (done) {
	var delConfig = [].concat(config.build, config.temp);
	log('----------clean Krishanappa-------------------')
	del(delConfig, done);
});

//Clean fonts
gulp.task('clean-fonts', function (done) {
	// var files = config.temp + '**/*.css';
	clean(config.build + 'fonts/**/*.*', done);
});

//Clean images
gulp.task('clean-images', function (done) {
	clean(config.build + 'images/**/*.*', done);
});

//Clean styles
gulp.task('clean-styles', function (done) {
	var files = config.temp + '**/*.css';
	clean(files, done);
});

//Clean styles
gulp.task('clean-code', function (done) {
	var files = [ 
	    config.temp + '**/*.js',
	    config.build + '**/*.html',
	    config.build + 'js/**/*.js'
	     ];
	clean(files, done);
});

gulp.task('less-watcher', function(){
  gulp.watch([config.less], ['styles']);
});

gulp.task('templatecache', function(){
  
  log('Caching the templates');

  return gulp
        .src(config.htmlTemplates)
        .pipe($.minifyHtml({empty: true}))
        .pipe($.angularTemplatecache(
        	config.templatecache.file,
        	config.templatecache.options
         ))
        .pipe(gulp.dest(config.temp));
});

//function to clean files in the path
function clean (path) {
	log('Cleaning '+ $.util.colors.blue(path));
	del(path);
}

//include files from bower and custom inject
gulp.task('wiredep', function () {
	log('load css and js from the bower components');
	var options = config.getWiredDefaultOptions();
    var wiredep = require('wiredep').stream;
    return gulp
          .src(config.index)
          .pipe(wiredep(options))
          .pipe($.inject(gulp.src(config.js)))
          .pipe(gulp.dest(config.client));


});

//Inject files
gulp.task('inject', ['wiredep', 'styles'], function () {
	log('Inject css to the index file');
    return gulp
          .src(config.index)
          .pipe($.inject(gulp.src(config.css)))
          .pipe(gulp.dest(config.client));

});

//Optimize tasks
gulp.task('optimize',['inject'], function() {
   log('Optimizing the Javascript, css, html');

   var templateCache = config.temp + config.templatecache.file;
   var assets = $.useref({searchPath : '/'});

   return gulp
          .src(config.index)
          .pipe($.plumber())
          .pipe($.inject(gulp.src(templateCache, {read : false}), {
               starttag: '<!-- inject:templates:js -->'
          }))
          .pipe($.useref({ searchPath: '/'}))
          .pipe(gulp.dest(config.build));
          // .pipe(assets)
          // .pipe(assets.restore)
          // .pipe(gulp.dest(config.build));
});

//Run task or start server using gulp

gulp.task('serve-dev', ['inject'], function () {
	
	var isDev = true;

	var nodeOptions = {
		script: config.nodeServer,
		delayTime: 1,
		env: {
			'PORT': port,
			'NODE_ENV': isDev ? 'dev' : 'build'

		},
		watch: [config.server]
	};

	return $.nodemon(nodeOptions)
	        .on('restart', function (ev) {
	        	log('*** nodemon restarted');
	        	log('Files changed on restart:\n '+ev);
	        	setTimeout(function () {
	        		browserSync.notify('---- Reloading the server now ------------');
	        		browserSync.reload({stream: false});
	        	}, config.browserReloadDelay);
	        	// startBrowserSync();
	        })
	        .on('start', function (ev) {
	        	log('*** nodemon started');
	        	startBrowserSync();
	        })
	        .on('crash', function (ev) {
	        	log('*** nodemon crashed');
	        })
	        .on('exit', function (ev) {
	        	log('*** nodemon exit');
	        });
});

function changeEvent(event) {
	var srcPattern = new RegExp('/.*(?=/'+config.source+')/');
	log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}
//Browser Sync Function

function startBrowserSync() {
	if(args.nosync || browserSync.active) {
		return;
	}

	log('Starting browser-sync on port ' + port);

	gulp.watch([config.less], ['styles'])
	      .on('change', function (event) {
	      	 changeEvent(event);
	      });

    var options = {
    	proxy: 'localhost:' + port,
    	port: 3000,
    	files: [
    	    config.client + '**/*.*', 
    	    '!'+config.less,
    	    config.temp + '**/*.css'
    	],
    	ghostMode: {
    		clicks: true,
    		location: false,
    		forms: true,
    		scroll: true,    		
    	},
    	injectChanges: true,
    	logFileChanges: true,
    	logLevel: 'debug',
    	logPrefix: 'gulp-patterns',
    	notify: true,
    	reloadDelay: 1000
    }

	browserSync(options);
}

// function startBrowserSync () {
// 	if(browserSync.active) {
//        return;
// 	}
// 	log('Starting browser Sync on port' + port);

// 	  gulp.watch([config.less], ['styles'])
// 	      .on('change', function (event) {
// 	      	 changeEvent(event);
// 	      });

//     var options = {
//     	proxy : 'localhost'+ port,
//     	port : 7203,
//     	files: [
//     	    config.client + '**/*',
//     	    '!'+config.less,
//     	    config.temp + '**/*.css'
//     	],
//     	ghostMode : {
//     		clicks: true,
//     		location: false,
//     		forms: true,
//             scroll: true
//     	},
//     	injectChanges: true,
//     	logFileChanges: true,
//     	logLevel: 'debug',
//     	logPrefix: 'gulp-patterns',
//     	notify: true,
//     	reloadDelay: 1000 
//     }; 

// 	browserSync(options);
// }

// error logger
function errorLogger(error) {
	log('*** Start of the error ***');
	log(error);
	log('*** End of the error ***');
	this.emit('end');
}

function log (msg) {
    if(typeof(msg) === 'object') {
    	for(var item in msg) {
    		if(msg.hasOwnProperty(item)) {
    			$.util.log($.util.colors.blue(msg[item]));
    		}
    	}
    } else {
    	$.util.log($.util.colors.blue(msg));
    }
}