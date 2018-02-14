var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var less = require('gulp-less');
var header = require('gulp-header');
var tap = require('gulp-tap');
var nano = require('gulp-cssnano');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var concat = require('gulp-concat');
var uglyfly = require('gulp-uglyfly');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var pkg = require('./package.json');
var fileInclude = require('gulp-file-include');
var yargs = require('yargs')
    .options({
        'w': {
            alias: 'watch',
            type: 'boolean'
        },
        's': {
            alias: 'server',
            type: 'boolean'
        },
        'p': {
            alias: 'port',
            type: 'number'
        }
    }).argv;

var options = {
	base: {base: 'src'},
	less: {base: 'src/less'},
	js: {base: 'src/js'},
	fonts: {base: 'src/fonts'},
	html: {base: 'src/view'}
}

var dists = {
	base: __dirname + '/dist',
	less: __dirname + '/dist/css',
	js: __dirname + '/dist/js',
	fonts: __dirname + '/dist/fonts',
	html: __dirname + '/dist/view',
}

var paths = {
	less: __dirname + '/src/less/',
	js: __dirname + '/src/js/',
	fonts: __dirname + '/src/fonts/',
	html: __dirname + '/src/view/',
}

var jsCommon = [
	paths.js + 'light7/intro.js',
	paths.js + 'light7/device.js',
	paths.js + 'light7/util.js',
	paths.js + 'light7/detect.js',
	paths.js + 'light7/zepto-adapter.js',
	paths.js + 'light7/fastclick.js',
	paths.js + 'light7/template7.js',
	paths.js + 'light7/page.js',
	paths.js + 'light7/tabs.js',
	paths.js + 'light7/bar-tab.js',
	paths.js + 'light7/modal.js',
	paths.js + 'light7/pull-to-refresh-js-scroll.js',
	paths.js + 'light7/pull-to-refresh.js',
	paths.js + 'light7/infinite-scroll.js',
	paths.js + 'light7/notification.js',
	paths.js + 'light7/index.js',
	paths.js + 'light7/panels.js',
	paths.js + 'light7/router.js',
	paths.js + 'light7/last-position.js',
	paths.js + 'light7/init.js',
	paths.js + 'light7/cn.js'
];

gulp.task('build:style', function (){
    var banner = [
        '/*!',
        ' *	本样式文件属于--',
        ' *	开发团队:云赢',
        ' */',
        ''].join('\n');
    gulp.src(['./src/less/base.less','./src/less/global.less'],options.less)
        .pipe(sourcemaps.init())
        .pipe(less().on('error', function (e) {
            console.error(e.message);
            this.emit('end');
        }))
        .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dists.less))
        .pipe(browserSync.reload({stream: true}))
        .pipe(nano({
            zindex: false,
            autoprefixer: false
        }))
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest(dists.less));
        
    gulp.src('./src/less/common/*.css',{base: 'src/less/common'})
		.pipe(gulp.dest(dists.less));
});

gulp.task('build:js',function (){
	gulp.src(jsCommon)
	.pipe(concat('base.js'))
	.pipe(gulp.dest(dists.js))
	.pipe(browserSync.reload({stream: true}))
	.pipe(uglyfly())
	.pipe(rename(function (path) {
        path.basename += '.min';
    }))
	.pipe(gulp.dest(dists.js));
	
	gulp.src('./src/js/common/*.js',{base: 'src/js/common'})
	.pipe(gulp.dest(dists.js));
});

gulp.task('build:fonts',function (){
	gulp.src(['./src/fonts/*.?(eot|svg|ttf|woff|woff2)'],options.fonts)
	.pipe(gulp.dest(dists.fonts));
});
//复制fonts文件

gulp.task('build:html',function (){
	gulp.src(['./src/view/*.html','./src/view/*/**.html','!./src/view/template/*.html'])//排除template文件夹
    .pipe(fileInclude({
      	prefix: '@@',
      	basepath: '@file',
      	indent: true,
      	context: {
      		target: [0,0],
      		title: '山西证券',
      		level: 0
      	}
    }))
    .pipe(gulp.dest(dists.html));
    
    gulp.src(['./src/images/**/*.?(png|jpg|gif|js|eot|svg|ttf|woff|woff2|json)'],{base:'./src/images'})
    .pipe(gulp.dest( __dirname + '/dist/images/'));
})

gulp.task('release', ['build:style','build:js','build:fonts','build:html']);

gulp.task('watch', ['release'], function () {
    gulp.watch(['./src/less/*','./src/less/**/*','./src/less/***/**/*','./src/less/****/***/**/*'], ['build:style']);
    gulp.watch(['./src/js/*','./src/js/*/**'], ['build:js']);
    gulp.watch(['./src/fonts/*'],['build:fonts']);
    gulp.watch(['./src/view/*','./src/view/*/**'],['build:html']);
});

gulp.task('server', function () {
    yargs.p = yargs.p || 8080;
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        ui: {
            port: yargs.p + 1,
            weinre: {
                port: yargs.p + 2
            }
        },
        port: yargs.p,
        startPath: '/view'
    });
    gulp.watch(["./dist/view/*.html","./dist/view/**/*.html","./dist/view/***/**/*.html"]).on("change", browserSync.reload);
});

// 参数说明
//  -w: 实时监听
//  -s: 启动服务器
//  -p: 服务器启动端口，默认8080
gulp.task('default', ['release'], function () {
    if (yargs.s) {
        gulp.start('server');
    }

    if (yargs.w) {
        gulp.start('watch');
    }
});
