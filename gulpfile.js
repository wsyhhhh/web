var del=require('del');
var gulp=require('gulp');
var uglify=require('gulp-uglify');
var mincss=require('gulp-clean-css');//压缩css
var inline=require('gulp-inline-source'); //资源内联 （主要是js，css，图片）
var include=require('gulp-include'); //资源内联（主要是html片段）
var sequence=require('gulp-sequence');
var useref=require('gulp-useref'); //合并文件
var gulpif=require('gulp-if');
var print=require('gulp-print'); //打印命中的文件
var connect=require('gulp-connect'); //本地服务器

var concat = require('gulp-concat');//文件合并
var rename = require('gulp-rename');//文件更名
var imagemin=require('gulp-imagemin');
var jshint=require('gulp-jshint');
var spriter=require('gulp-css-spriter');
var inlinecj = require('gulp-inline');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');

//清理构建目录
gulp.task('clean',function (cb) {
    del(['dist']).then(function () {
        cb()
    })
});

//js校验
gulp.task('jshint',function(){
	return gulp.src('./src/js/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

//图片压缩
gulp.task('compressimage',function(){
	return gulp.src('./src/img/*.png')
	.pipe(imagemin())
	.pipe(gulp.dest('dist/img'))
});

//雪碧图
gulp.task('spriter', function() {
    return gulp.src('./src/css/img.css')
        .pipe(spriter({
            'spriteSheet': './dist/img/sprite.png',
            'pathToSpriteSheetFromCSS': '../img/sprite.png'
        }))
        .pipe(gulp.dest('./dist/css')); 
});

//css压缩合并
gulp.task('compresscss',function () {
    return gulp.src('./src/css/*.css')
        .pipe(mincss())
        .pipe(gulp.dest('dist/css'))
});

//js压缩合并
gulp.task('compressjs',function () {
    return gulp.src('./src/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
});


gulp.task('html', function () {
    return gulp.src('./src/*.html')
        .pipe(inline())//把js内联到html中
        .pipe(include())//把html片段内联到html主文件中
        .pipe(useref())//根据标记的块  合并js或者css
        .pipe(gulpif('*.js',uglify()))
        .pipe(gulpif('*.css',mincss()))
        .pipe(connect.reload()) //重新构建后自动刷新页面
        .pipe(gulp.dest('dist'));
});

//本地服务器  支持自动刷新页面
gulp.task('connect', function() {
    connect.server({
        root: './dist', //本地服务器的根目录路径
        port:8080,
        livereload: true
    });
});

//sequence的返回函数只能运行一次 所以这里用function cb方式使用
gulp.task('watchlist',function (cb) {
    sequence('clean',['spriter','jshint','compressimage','compresscss','compressjs','html'])(cb)
});

gulp.task('watch',function () {
    gulp.watch(['./src/**'],['watchlist']);
});


//中括号外面的是串行执行， 中括号里面的任务是并行执行。
gulp.task('default',function (cb) {
    sequence('clean',['compressimage','spriter','jshint','compresscss','compressjs','html','connect'],'watch')(cb)
});



