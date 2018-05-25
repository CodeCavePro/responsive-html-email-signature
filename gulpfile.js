var gulp = require('gulp'),
    sass = require("gulp-sass"),
    prettify = require('gulp-jsbeautifier'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    inlinesource = require('gulp-inline-source'),
    inlineImages = require('gulp-inline-images'),
    inlineCss = require('gulp-inline-css'),
    twig = require('gulp-twig'),
    yaml = require('js-yaml'),
    fs = require('fs');

gulp.task('default', [ 'html:prettify' ]);

// Tidy up resulting HTML files
gulp.task('html:prettify', [ 'html:inline:css' ], function () {
    return gulp.src('./*.html')
        .pipe(prettify({
            indent_char: " ",
            indent_size: 2,
            selector_separator_newline: true,
            end_with_newline: true,
        }))
        .pipe(gulp.dest('./'));;
});

// Inline CSS rules in HTML file
gulp.task('html:inline:css', [ 'html:inline:images', 'html:inline:sources' ], function () {
    return gulp.src([
            './*.html',
            '!./*-inlined.html'
        ])
        .pipe(inlineCss({
            preserveMediaQueries: true
        }))
        .pipe(rename({
            suffix: "-inlined",
        }))
        .pipe(gulp.dest('./'));
});

// Include base64-encoded images
gulp.task('html:inline:images', [ 'twig:compile' ], function () {
    return gulp.src('./src/*.html')
        .pipe(inlineImages({/* options */}))
        .pipe(gulp.dest('./'));
});

// Inline external JavaScript and CSS files
gulp.task('html:inline:sources', [ 'twig:compile', 'scss:compile' ], function () {
    return gulp.src('./src/*.html')
        .pipe(inlinesource({
            compress: false,
            pretty: true
        }))
        .pipe(gulp.dest('./'));
});

// SCSS to CSS compilation
gulp.task('scss:compile', function () {
    return gulp.src("./scss/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: [ 'last 2 versions' ],
            cascade: false
        }))
        .pipe(gulp.dest("css/"))
        .pipe(sourcemaps.write("./", {
            addComment: false
        }))
        .pipe(gulp.dest("css/"));
});

gulp.task('twig:compile', function () {
    var email = yaml.safeLoad(fs.readFileSync('./src/email.yml', 'utf8'));
    return gulp.src('./src/email.twig')
        .pipe(twig({
            data: email
        }))
        .pipe(gulp.dest('./src'));
});

gulp.task('watch', function () {
    gulp.watch('scss/**/*.scss', [ 'scss:compile' ]);
});