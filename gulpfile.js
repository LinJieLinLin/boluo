var gulp        = require('gulp');
var _           = require('gulp-load-plugins')();
var bowerFiles  = require('main-bower-files');
var browserSync = require('browser-sync');
var del         = require('del');
var sprite      = require('gulp.spritesmith');

var sync        = _.sync(gulp);

var sourceFiles = {
    html             : 'src/*.html',
    moduleTemplate   : 'src/application/**/*.html',
    directiveTemplate: 'src/directive/**/*.html',
    moduleScript     : 'src/application/**/*.js',
    directiveScript  : 'src/directive',
    serviceScript    : 'src/service',
    moduleMainStyle  : 'src/style/app.scss',
    commonStyle      : 'src/style/**/*.scss',
    moduleStyle      : 'src/application/**/*.scss',
    directiveStyle   : 'src/directive/**/*.scss',
    image            : ['src/image/**/*', '!src/image/sprite/**/*'],
    sprite           : 'src/image/sprite/**/*',
    psw              : 'bower_components/photoswipe/dist/default-skin'
};

var destFiles = {
    dir       : 'dist/',
    style     : 'dist/style',
    template  : 'dist/application',
    image     : 'dist/image',
    spriteScss: 'src/style/common',
    spriteImg : 'src/image',
    html      : 'dist/*.html'
};

var buildFiles = {
    dir  : 'build/',
    image: 'build/image',
    html : 'build/*.html',
    style: 'build/style'
};

var scriptsFiles  = 'src/**/*.js';

var templateFiles = ['src/**/*.html', '!src/*.html'];

var styleFiles    = ['src/**/*.scss', '!src/style/common/**/*'];

var allScssFiles = [
    sourceFiles.moduleMainStyle, 
    sourceFiles.moduleStyle, 
    sourceFiles.directiveStyle,
    sourceFiles.commonStyle];

gulp.task('init', _.shell.task('bower install'));

gulp.task('compile:html', function () {
    return gulp.src(sourceFiles.html)
        .pipe(_.inject(gulp.src(bowerFiles()), {name: 'bower'}))
        .pipe(gulp.dest(destFiles.dir));
});

gulp.task('compile:css', ['compile:sprite'], function () {
    return gulp.src(styleFiles)
        //.pipe(_.sourcemaps.init())
        .pipe(_.sass({style: 'expanded'}))
        .pipe(_.autoprefixer({browsers: ['Firefox > 0', 'Chrome > 0']}))
        //.pipe(_.sourcemaps.write('.'))
        .pipe(gulp.dest(destFiles.dir));
});

gulp.task('compile:js', function () {
    return gulp.src(scriptsFiles)
        .pipe(_.ngAnnotate({single_quotes: true}))
        .pipe(gulp.dest(destFiles.dir));
});

gulp.task('compile:tmpl', function () {
    return gulp.src(templateFiles)
        .pipe(_.minifyHtml({empty: true, quotes: true}))
        .pipe(_.ngTemplate({
            moduleName: 'tmpl',
            standalone: true,
            filePath: 'template.js'
            }))
        .pipe(gulp.dest(destFiles.template));
});

gulp.task('compile:img', ['compile:sprite'], function () {
    return gulp.src(sourceFiles.image)
        .pipe(gulp.dest(destFiles.image));
});

gulp.task('compile:sprite', function () {
    var imageFilter = _.filter('*.png', {restore: true});
    var sassFilter = _.filter('*.scss');
    return gulp.src(sourceFiles.sprite)

    .pipe(sprite({ 
        imgName: 'sprite.png', 
        cssName: 'sprite.scss', 
        imgPath: '/image/sprite.png', 
        cssTemplate: 'image-sprite-tmpl.handlebars' 
        }))
    .pipe(imageFilter)
    .pipe(gulp.dest(destFiles.spriteImg))
    .pipe(imageFilter.restore)
    .pipe(sassFilter)
    .pipe(gulp.dest(destFiles.spriteScss));
});

gulp.task('compile', [
    'compile:html', 
    'compile:js', 
    'compile:css', 
    'compile:tmpl', 
    'compile:img',
    'compile:sprite']);

gulp.task('watch', function () {
    gulp.watch(scriptsFiles, ['compile:js']);
    gulp.watch(templateFiles, ['compile:tmpl']);
    gulp.watch(allScssFiles, ['compile:css']);
    gulp.watch(sourceFiles.image, ['compile:img']);
    gulp.watch(sourceFiles.html, ['compile:html']);
    gulp.watch(sourceFiles.sprite, ['compile:css', 'compile:img']);
});

gulp.task('build:asset', sync.sync(['clean', 'init', 'compile']), function () {
    return gulp.src(destFiles.html)
        .pipe(_.useref())
        .pipe(_.if('*.css', _.minifyCss()))
        .pipe(_.if('*.js', _.uglify()))
        .pipe(_.if('*.html', _.minifyHtml({ empty: true , comments: true})))
        .pipe(gulp.dest(buildFiles.dir));
});

gulp.task('build:psw', ['build:asset'], function () {
    return gulp.src(sourceFiles.psw + '/*')
        .pipe(gulp.dest(buildFiles.style));
});

gulp.task('build:img', ['clean'], function () {
    return gulp.src(sourceFiles.image)
        .pipe(gulp.dest(buildFiles.image));
});

gulp.task('build', ['build:asset', 'build:img', 'build:psw']);

gulp.task('clean', function () {
    return del([destFiles.dir, buildFiles.dir]);
});

gulp.task('serve', sync.sync(['clean', 'init', 'compile', 'watch']), function () {
    browserSync.init({ 
        server: {
            baseDir: 'dist/', 
            routes: {
                '/bower_components': 'bower_components'
            }
        }, 
        port: 9010,
        ui: {
            port: 4400
        },
        open: false 
    });
    gulp.watch('dist/**/*').on('change', browserSync.reload);
});

gulp.task('default', ['serve']);