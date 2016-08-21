'use strict';

// Include Gulp & Tools We'll Use
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var maps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');
var mergeStream = require('merge-stream');
var del = require('del');
var runSequence = require('run-sequence');
var through = require('through2');
var swig = require('swig');
var pngquant = require('imagemin-pngquant');
var gulpLoadPlugins = require('gulp-load-plugins');
var pkg = require('./package.json');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;
var hostedLibsUrlPrefix = 'https://code.getmdl.io';
var templateArchivePrefix = 'mdl-template-';

var AUTOPREFIXER_BROWSERS = {
  browsers: [
    'android >= 4.4',
    'android 2.3',
    'chrome >= 20',
    'ff >= 15',
    'ie >= 8',
    'ie_mob >= 10',
    'safari >= 6',
    'opera >= 12',
    'ios >= 6',
    'bb >= 10'
  ],
  grid: true,
  flexbox: true
};

var SOURCES = [
  // Component handler
  'src/mdlComponentHandler.js',
  // Polyfills/dependencies
  'src/third_party/**/*.js',
  // Base components
  'src/button/button.js',
  'src/checkbox/checkbox.js',
  'src/icon-toggle/icon-toggle.js',
  'src/menu/menu.js',
  'src/progress/progress.js',
  'src/radio/radio.js',
  'src/slider/slider.js',
  'src/snackbar/snackbar.js',
  'src/spinner/spinner.js',
  'src/switch/switch.js',
  'src/tabs/tabs.js',
  'src/textfield/textfield.js',
  'src/tooltip/tooltip.js',
  // Complex components (which reuse base components)
  'src/layout/layout.js',
  'src/data-table/data-table.js',
  // And finally, the ripples
  'src/ripple/ripple.js'
];

var IMAGEMIN = {
  interlaced: true,
  progressive: true,
  svgoPlugins: [{removeViewBox: false}],
  use: [pngquant()]
};

var SASS = {
  outputStyle: 'expanded',
  onError: console.error.bind(console, 'Sass error:')
};

var UGLIFY = {
  mangle: false,
  sourceRoot: '.',
  sourceMapIncludeSources: true,
  output: {
    // beautify: true, // beautify output?
    // source_map    : null,  // output a source map
    // bracketize: false, // use brackets every time?
    comments: false, // output comments?
    // semicolons: true,  // use semicolons to separate statements? (otherwise, newlines)
  },
  compress: {
    // sequences: false,  // join consecutive statemets with the “comma operator”
    // properties: true,  // optimize property access: a["foo"] → a.foo
    dead_code: true,  // discard unreachable code
    drop_debugger: true,  // discard “debugger” statements
    unsafe: false, // some unsafe optimizations (see below)
    conditionals: true,  // optimize if-s and conditional expressions
    comparisons: true,  // optimize comparisons
    evaluate: true,  // evaluate constant expressions
    booleans: false,  // optimize boolean expressions
    loops: true,  // optimize loops
    unused: true,  // drop unused variables/functions
    hoist_funs: true,  // hoist function declarations
    hoist_vars: true, // hoist variable declarations
    if_return: true,  // optimize if-s followed by return/continue
    join_vars: true,  // join var declarations
    cascade: true,  // try to cascade `right` into `left` in sequences
    side_effects: true,  // drop side-effect-free statements
    warnings: true,  // warn about potentially dangerous optimizations/code
    // global_defs   : {}     // global definitions
  }
};

// ***** Production build tasks ****** //

// Optimize Images
gulp.task('images', function () {
  return gulp.src('src/**/*.{svg,png,jpg}')
             .pipe($.flatten())
             .pipe($.cache($.imagemin(IMAGEMIN)))
             .pipe(gulp.dest('dist/images'));
});

// Compile and Automatically Prefix Stylesheet Templates (production)
gulp.task('styletemplates', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src('src/template.scss')
             // Generate Source Maps
             .pipe(maps.init())
             .pipe(sass(SASS))
             .pipe($.cssInlineImages({
               webRoot: 'src'
             }))
             .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
             .pipe(gulp.dest('dist'))
             .pipe($.rename({suffix: '.min', prefix: ''}))
             .pipe(csso())
             .pipe(maps.write('.'))
             .pipe(gulp.dest('dist'));
});

// Compile and Automatically Prefix Stylesheets (production)
gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src('src/**/*.scss')
             .pipe(maps.init())
             .pipe(sass(SASS).on('error', sass.logError))
             .pipe($.cssInlineImages({
               webRoot: 'src'
             }))
             .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
             .pipe(gulp.dest('dist'))
             .pipe($.rename({suffix: '.min', prefix: ''}))
             // Minify Styles
             .pipe(csso())
             .pipe(maps.write('.'))
             .pipe(gulp.dest('dist'));
});

// Concatenate And Minify JavaScript
gulp.task('scripts', function () {
  return gulp.src(SOURCES)
             .pipe(maps.init())
             // Concatenate Scripts
             .pipe($.concat('material.js'))
             .pipe($.iife({
               useStrict: true
             }))
             .pipe(gulp.dest('dist'))
             // Minify Scripts
             .pipe(uglify(UGLIFY))
             .pipe($.rename({suffix: '.min', prefix: ''}))
             // Write Source Maps
             .pipe(maps.write('.'))
             .pipe(gulp.dest('dist'));
});

// Clean Output Directory
gulp.task('clean', function () {
  return del([
    'dist',
    '.publish',
    '.tmp'
  ]);
});

// Build Production Files, the Default Task
gulp.task('default', ['all']);

// Build production files and microsite
gulp.task('all', ['clean'], function (cb) {
  runSequence(
    [
      'styletemplates',
      'styles',
      'scripts',
      'assets',
      'pages',
      'templates',
      'images'
    ],
    cb);
});

/**
 * Generates an HTML file based on a template and file metadata.
 */
function applyTemplate() {
  return through.obj(function (file, enc, cb) {
    var data = {
      page: file.page,
      content: file.contents.toString()
    };
    var templateFile = path.join(__dirname, 'docs', '_templates', file.page.layout + ".html");
    var tpl = swig.compileFile(templateFile, {
      cache: false
    });
    file.contents = new Buffer(tpl(data));
    cb(null, file);
  });
}

/**
 * Generates an index.html file for each README in MDL/src directory.
 */
gulp.task('components', ['demos'], function () {
  return gulp.src('src/**/README.md', {
    base: 'src'
  })
             // Add basic front matter.
             .pipe($.header('---\nlayout: component\nbodyclass: component\ninclude_prefix: ../../\n---\n\n'))
             .pipe($.frontMatter({
               property: 'page',
               remove: true
             }))
             .pipe($.marked())
             .pipe(function () {
               return through.obj(function (file, enc, cb) {
                 file.page.component = file.relative.split('/')[0];
                 cb(null, file);
               });
             }())
             .pipe(applyTemplate())
             .pipe($.rename(function (path) {
               return path.basename = 'index';
             }))
             .pipe(gulp.dest('dist/components'));
});

/**
 * Copies demo files from MDL/src directory.
 */
gulp.task('demoresources', function () {
  return gulp.src([
    'src/**/demos.css',
    'src/**/demo.css',
    'src/**/demo.js'
  ], {
    base: 'src'
  })
             .pipe($.if('*.scss', sass(SASS).on('error', sass.logError)))
             .pipe($.cssInlineImages({
               webRoot: 'src'
             }))
             .pipe($.if('*.css', autoprefixer(AUTOPREFIXER_BROWSERS)))
             .pipe(gulp.dest('dist/components'));
});

/**
 * Generates demo files for testing made of all the snippets and the demo file
 * put together.
 */
gulp.task('demos', ['demoresources'], function () {
  /**
   * Retrieves the list of component folders.
   */
  
  function getComponentFolders() {
    return fs.readdirSync('src')
             .filter(function (file) {
               return fs.statSync(path.join('src', file))
                        .isDirectory();
             });
  }
  
  var tasks = getComponentFolders().map(function (component) {
    return gulp.src([
      path.join('src', component, 'snippets', '*.html'),
      path.join('src', component, 'demo.html')
    ])
               .pipe($.concat('/demo.html'))
               // Add basic front matter.
               .pipe($.header('---\nlayout: demo\nbodyclass: demo\ninclude_prefix: ../../\n---\n\n'))
               .pipe($.frontMatter({
                 property: 'page',
                 remove: true
               }))
               .pipe($.marked())
               .pipe(function () {
                 return through.obj(function (file, enc, cb) {
                   file.page.component = component;
                   cb(null, file);
                 });
               }())
               .pipe(applyTemplate())
               .pipe(gulp.dest(path.join('dist', 'components', component)));
  });
  
  return mergeStream(tasks);
});

/**
 * Generates an HTML file for each md file in _pages directory.
 */
gulp.task('pages', ['components'], function () {
  return gulp.src('docs/_pages/*.md')
             .pipe($.frontMatter({
               property: 'page',
               remove: true
             }))
             .pipe($.marked())
             .pipe(applyTemplate())
             .pipe($.replace('$$version$$', pkg.version))
             .pipe($.replace('$$hosted_libs_prefix$$', hostedLibsUrlPrefix))
             .pipe($.replace('$$template_archive_prefix$$', templateArchivePrefix))
             /* Replacing code blocks class name to match Prism's. */
             .pipe($.replace('class="lang-', 'class="language-'))
             /* Translate html code blocks to "markup" because that's what Prism uses. */
             .pipe($.replace('class="language-html', 'class="language-markup'))
             .pipe($.rename(function (path) {
               if (path.basename !== 'index') {
                 path.dirname = path.basename;
                 path.basename = 'index';
               }
             }))
             .pipe(gulp.dest('dist'));
});

/**
 * Copies assets from MDL and _assets directory.
 */
gulp.task('assets', function () {
  return gulp.src('docs/_assets/**/*')
             .pipe($.if(/\.js/i, $.replace('$$version$$', pkg.version)))
             .pipe($.if(/\.js/i, $.replace('$$hosted_libs_prefix$$', hostedLibsUrlPrefix)))
             .pipe($.if(/\.(svg|jpg|png)$/i, $.imagemin({
               progressive: true,
               interlaced: true
             })))
             .pipe($.if(/\.css/i, autoprefixer(AUTOPREFIXER_BROWSERS)))
             .pipe($.if(/\.css/i, csso()))
             .pipe($.if(/\.js/i, uglify({
               preserveComments: 'some',
               sourceRoot: '.',
               sourceMapIncludeSources: true
             })))
             .pipe(gulp.dest('dist/assets'));
});

/**
 * Defines the list of resources to watch for changes.
 */
function watch() {
  gulp.watch(['src/**/*.js', '!src/**/README.md'], ['scripts', 'demos', 'components', reload]);
  gulp.watch(['src/**/*.{scss,css}'], ['styles', 'styletemplates', reload]);
  gulp.watch(['src/**/*.html'], ['pages', reload]);
  gulp.watch(['src/**/*.{svg,png,jpg}'], ['images', reload]);
  gulp.watch(['src/**/README.md'], ['pages', reload]);
  gulp.watch(['templates/**/*'], ['templates', reload]);
  gulp.watch(['docs/**/*'], ['pages', 'assets', reload]);
  gulp.watch(['package.json', 'bower.json']);
}

gulp.task('templates:styles', function () {
  return gulp.src('templates/**/*.css')
             .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
             //.pipe(csso())
             .pipe(gulp.dest('dist/templates'));
});

gulp.task('templates:static', function () {
  return gulp.src('templates/**/*.html')
             .pipe($.replace('$$version$$', pkg.version))
             .pipe($.replace('$$hosted_libs_prefix$$', hostedLibsUrlPrefix))
             .pipe(gulp.dest('dist/templates'));
});

// This task can be used if you want to test the templates against locally
// built version of the MDL libraries.
gulp.task('templates:localtestingoverride', function () {
  return gulp.src('templates/**/*.html')
             .pipe($.replace('$$version$$', '.'))
             .pipe($.replace('$$hosted_libs_prefix$$', ''))
             .pipe(gulp.dest('dist/templates'));
});

gulp.task('templates:images', function () {
  return gulp.src('templates/*/images/**/*')
             .pipe($.imagemin({
               progressive: true,
               interlaced: true
             }))
             .pipe(gulp.dest('dist/templates'));
});

gulp.task('templates:fonts', function () {
  return gulp.src('templates/*/fonts/**/*')
             .pipe(gulp.dest('dist/templates/'));
});

gulp.task('templates', [
  'templates:static',
  'templates:images',
  'templates:fonts',
  'templates:styles'
]);

/**
 * Serves the landing page from "out" directory.
 */
gulp.task('serve:browsersync', function () {
  browserSync({
    notify: false,
    server: {
      baseDir: ['dist']
    }
  });
  
  watch();
});

gulp.task('serve', function () {
  $.connect.server({
    root: 'dist',
    port: 5000,
    livereload: true
  });
  
  watch();
  
  gulp.src('dist/index.html')
      .pipe($.open({
        uri: 'http://localhost:5000'
      }));
});
