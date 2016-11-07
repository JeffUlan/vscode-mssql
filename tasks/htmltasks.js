var gulp = require('gulp');
var tslint = require('gulp-tslint');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var del = require('del');
var srcmap = require('gulp-sourcemaps');
var config = require('./config');
var uglifyjs = require('uglify-js');
var minifier = require('gulp-uglify/minifier');
var tsProject = ts.createProject(config.paths.html.root + '/tsconfig.json');
var sysBuilder = require('systemjs-builder');
var cleanCSS = require('gulp-clean-css');

gulp.task('html:lint', () => {
    return gulp.src([
        config.paths.html.root + '/src/**/*.ts'
    ])
    .pipe((tslint({
        formatter: "verbose"
    })))
    .pipe(tslint.report());
});

// Compile TypeScript to JS
gulp.task('html:compile-src', function () {
  return gulp
    .src([config.paths.html.root + '/src/js/**/*.ts',
        config.paths.html.root + '/typings/**/*'])
    .pipe(srcmap.init())
    .pipe(ts(tsProject))
    .pipe(srcmap.write('.'))
    .pipe(gulp.dest(config.paths.html.out + '/dist/js'));
});

// Generate systemjs-based builds
gulp.task('html:bundle:app', function() {
  var builder = new sysBuilder('./out/src/views/htmlcontent', './src/views/htmlcontent/systemjs.config.js');
  return builder.buildStatic('app', './out/src/views/htmlcontent/dist/js/app.min.js')
    .then(function () {
      return del(['./out/src/views/htmlcontent/dist/js/**/*', '!' + './out/src/views/htmlcontent/dist/js/app.min.js']);
    })
    .catch(function(err) {
      console.error('>>> [systemjs-builder] Bundling failed'.bold.green, err);
    });
});

gulp.task('html:min-js', function() {
    return gulp.src(config.paths.html.out + '/dist/js/app.min.js')
            .pipe(minifier({mangle: false}, uglifyjs))
            .pipe(gulp.dest(config.paths.html.out + '/dist/js'))
})

gulp.task('html:bundle:css', () => {
    return new Promise((resolve, reject) => {
        gulp.src([config.paths.html.out + '/dist/css/flexbox.css',
                // config.paths.html.out + '/lib/css/bootstrap.min.css',
                config.paths.html.out + '/dist/css/styles.css'])
            .pipe(cleanCSS())
            .pipe(concat('styles.min.css'))
            .pipe(gulp.dest(config.paths.html.out + '/dist/css'))
            .on('end', resolve);
    }).then(() => {
        return del([config.paths.html.out + '/dist/css/flexbox.css',
                    // config.paths.html.out + '/lib/css/bootstrap.min.css',
                    config.paths.html.out + '/dist/css/styles.css']);
    })
})

// Copy and bundle dependencies into one file (vendor/vendors.js)
// system.config.js can also bundled for convenience
gulp.task('html:vendor', () => {
    gulp.src([config.paths.html.root + '/node_modules/rxjs/**/*'])
    .pipe(gulp.dest(config.paths.html.out + '/lib/js/rxjs'));

    gulp.src([config.paths.html.root + '/src/js/libs/slickgrid/*'])
    .pipe(gulp.dest(config.paths.html.out + '/lib/js/slickgrid'))

  gulp.src([config.paths.html.root + '/node_modules/angular2-in-memory-web-api/**/*'])
    .pipe(gulp.dest(config.paths.html.out + '/lib/js/angular2-in-memory-web-api'));

  // concatenate non-angular2 libs, shims & systemjs-config
  gulp.src([
    config.paths.html.root + '/node_modules/angular2-slickgrid/libs/SlickGrid/lib/jquery-1.7.min.js',
    config.paths.html.root + '/node_modules/angular2-slickgrid/libs/SlickGrid/lib/jquery.event.drag-2.2.js',
    config.paths.html.root + '/node_modules/angular2-slickgrid/libs/SlickGrid/lib/jquery-ui-1.8.16.custom.min.js',
    config.paths.html.root + '/node_modules/underscore/underscore-min.js',
    config.paths.html.root + '/node_modules/angular2-slickgrid/libs/SlickGrid/slick.core.js',
    config.paths.html.root + '/node_modules/angular2-slickgrid/libs/SlickGrid/slick.grid.js',
    config.paths.html.root + '/node_modules/angular2-slickgrid/libs/SlickGrid/slick.editors.js',
    config.paths.html.root + '/node_modules/angular2-slickgrid/libs/SlickGrid/plugins/slick.dragrowselector.js',
    config.paths.html.root + '/node_modules/angular2-slickgrid/libs/SlickGrid/plugins/slick.autosizecolumn.js',
    config.paths.html.root + '/node_modules/core-js/client/shim.min.js',
    config.paths.html.root + '/node_modules/zone.js/dist/zone.js',
    config.paths.html.root + '/node_modules/reflect-metadata/Reflect.js',
    config.paths.html.root + '/node_modules/systemjs/dist/system.src.js',
    config.paths.html.root + '/systemjs.config.js'
  ])
    .pipe(concat('vendors.min.js'))
    .pipe(minifier({}, uglifyjs))
    .pipe(gulp.dest(config.paths.html.out + '/lib/js'));

  // copy source maps
  gulp.src([
    // config.paths.html.root + '/node_modules/es6-shim/es6-shim.map',
    config.paths.html.root + '/node_modules/reflect-metadata/Reflect.js.map',
    config.paths.html.root + '/node_modules/systemjs/dist/system-polyfills.js.map',
    config.paths.html.root + '/node_modules/systemjs-plugin-json/json.js'
  ]).pipe(gulp.dest(config.paths.html.out + '/lib/js'));

  gulp.src([
    config.paths.html.root + '/node_modules/bootstrap/dist/css/bootstrap.*',
    config.paths.html.root + '/node_modules/angular2-slickgrid/components/css/SlickGrid.css',
    config.paths.html.root + '/node_modules/angular2-slickgrid/libs/SlickGrid/slick.grid.css'
  ]).pipe(gulp.dest(config.paths.html.out + '/lib/css'));

  gulp.src([
      config.paths.html.root + '/node_modules/angular2-slickgrid/index.js',
      config.paths.html.root + '/node_modules/angular2-slickgrid/components/**/*.js'
  ], { base: config.paths.html.root + '/node_modules/angular2-slickgrid' }).pipe(gulp.dest(config.paths.html.out + '/lib/js/angular2-slickgrid'))

  return gulp.src([config.paths.html.root + '/node_modules/@angular/**/*'])
    .pipe(gulp.dest(config.paths.html.out + '/lib/js/@angular'));
});

gulp.task('html:copy:assets', () => {
    gulp.src([
        config.paths.html.root + '/src/html/*'
    ])
    .pipe(gulp.dest(config.paths.html.out + '/dist/html'));

    gulp.src([
        config.paths.html.root + '/src/css/**/*'
    ])
    .pipe(gulp.dest(config.paths.html.out + '/dist/css'));

    gulp.src([
        config.paths.html.root + '/src/images/*'
    ])
    .pipe(gulp.dest(config.paths.html.out + '/dist/images'))

    return gulp.src([
        config.paths.html.root + '/src/js/**/*.json',
    ])
    .pipe(gulp.dest(config.paths.html.out + '/dist/js'));
});

gulp.task('html:compile', gulp.series('html:compile-src'))

gulp.task('html:app', gulp.series(['html:compile', 'html:copy:assets', 'html:bundle:app', 'html:min-js', 'html:bundle:css']));

gulp.task('html:bundle', () => {
    return gulp.src([
        config.paths.html.out + '/lib/js/vendors.min.js',
        config.paths.html.out + '/dist/js/app.min.js'
        ])
    .pipe(concat('app.bundle.js'))
    .pipe(gulp.dest(config.paths.html.out + '/dist/js'));
});

gulp.task('html:build', gulp.series('html:lint', 'html:vendor', 'html:app', 'html:bundle'));
