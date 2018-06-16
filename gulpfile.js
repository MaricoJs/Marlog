const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps'); // 来源地图
const concat = require('gulp-concat');
const source = require('vinyl-source-stream');
const htmlmin = require('gulp-htmlmin');
const livereload = require('gulp-livereload'); // 网页自动刷新（文件变动后即时刷新页面）
const webserver = require('gulp-webserver'); // 本地服务器

// 编译并压缩js
gulp.task('convertJS', function () {
    return gulp.src(['src/js/*.js', '!src/js/*.min.js'])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(sourcemaps.init()) // 执行sourcemaps
        .pipe(gulp.dest('dist/js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('maps')) // 地图输出路径（存放位置）
        .pipe(rename({
            extname: '.min.js',
        }))
        .pipe(gulp.dest('dist/js'))
})



//html压缩
gulp.task('htmlmin', function () {

    return gulp.src('src/*.html')
        .pipe(htmlmin({
            removeComments: true, //清除HTML注释      
        }))
        .pipe(gulp.dest('./dist'));

});

// 静态服务器
gulp.task('webserver', function () {
    gulp.src('./dist') // 服务器目录（.代表根目录）
        .pipe(webserver({ // 运行gulp-webserver
            host:'172.18.168.83',
            livereload: true, // 启用LiveReload
            open: true // 服务器启动时自动打开网页
        }));
});

gulp.task('copyMinJs', function () {
    return gulp.src('src/js/**/*.min.js')
        .pipe(gulp.dest('dist/js/'))
});

// 监视文件变化，自动执行任务
gulp.task('watch', function () {
    gulp.watch(['src/js/*.js', '!src/js/*.min.js'], ['convertJS']);
    gulp.watch('src/**/*.html', ['htmlmin']);
    gulp.watch('src/js/**/*.min.js', ['copyMinJs']);

})

gulp.task('default', ['watch', 'htmlmin', 'convertJS', 'copyMinJs', 'webserver']);