'use strict';

var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    scssLint = require('gulp-scss-lint'),
    sourcemaps = require('gulp-sourcemaps'),
    cssComb = require('gulp-csscomb'),
    autoprefixer = require('gulp-autoprefixer'),
    stylestats = require('gulp-stylestats'),
    cssnano = require('gulp-cssnano'),
    jshint = require('gulp-jshint'),
    modernizr = require('gulp-modernizr'),
    stylish = require('jshint-stylish'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    favicons = require("gulp-favicons");

// SASS Task
//

var styles = (function() {
    return {
        compile: function(config) {
            gulp.src('./assets/styles/' + config.src + '.scss')
                .pipe(scssLint({
                    'config': 'scss-lint.yml',
                }));

            return sass('./assets/styles/' + config.src + '.scss', {
                    precision: 10,
                    sourcemap: true
                })
                .pipe(sourcemaps.init())
                .on('error', sass.logError)
                .pipe(autoprefixer("last 5 version", "> .5%", "ie 8", "ie 7", "ie 6"))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest('./dist/' + config.dest))
                .pipe(rename(config.rename + '.css'))
                .pipe(gulp.dest('./dist/' + config.dest));

            return this;
        }
    };
}());

gulp.task('sass', function() {
    return styles
        .compile({
            src: 'app',
            rename: 'main',
            dest: 'css'
        });
});

// CSS Task
//

var css = (function() {
    return {
        compile: function(config) {
            gulp.src('./dist/css/' + config.src + '.css')
                .pipe(cssComb())
                .pipe(gulp.dest('./dist/' + config.dest))
                .pipe(cssnano({
                    compatibility: 'ie6'
                  }))
                .pipe(rename(config.rename + '.min.css'))
                .pipe(gulp.dest('./dist/' + config.dest));

            return this;
        }
    };
}());

gulp.task('css', ['sass'], function() {
    return css
        .compile({
            src: 'main',
            rename: 'main',
            dest: 'css/'
        });
});

// Style Stats Task
//

var stats = (function() {
    return {
        compile: function(config) {
          gulp.src('./dist/css/' + config.src + '.css')
              .pipe(stylestats({
                  type: config.format,
                  outfile: true
            }))
            .pipe(gulp.dest(config.dest));

            return this;
        }
    };
}());

gulp.task('stats', ['css'], function() {
    return stats
        .compile({
            src: 'main',
            format: 'json',
            dest: 'data/'
        });
});

// Scripts Task
//

var scripts = (function() {
    return {
        compile: function(config) {
            gulp.src('./assets/scripts/' + config.src + '.js')
                .pipe(jshint())
                .pipe(jshint.reporter('jshint-stylish'))
                .pipe(rename(config.rename + '.js'))
                .pipe(gulp.dest('./dist/' + config.dest));

            return this;
        }
    };
}());

gulp.task('scripts', function() {
    return scripts
        .compile({
            src: 'app',
            rename: 'main',
            dest: 'js'
        });
});

// JS Task
//

var js = (function() {
    return {
        compile: function(config) {
            gulp.src('./dist/js/' + config.src + '.js')
                .pipe(uglify())
                .pipe(rename(config.rename + '.min.js'))
                .pipe(gulp.dest('./dist/' + config.dest));

            return this;
        }
    };
}());

gulp.task('js', ['scripts'], function() {
    return js
        .compile({
            src: 'main',
            rename: 'main',
            dest: 'js'
        });
});

// Modernizr Task
//

var mdrnzr = (function() {
    return {
        compile: function(config) {
            gulp.src('./assets/{js,css}/' + config.src + '.{js,css}')
                .pipe(modernizr(config.rename + '.js'))
                .pipe(gulp.dest('./dist/' + config.dest))
                .pipe(uglify())
                .pipe(rename(config.rename + '.min.js'))
                .pipe(gulp.dest('./dist/' + config.dest));

            return this;
        }
    };
}());

gulp.task('modernizr', ['js', 'css'], function() {
    return mdrnzr
        .compile({
            src: 'main',
            rename: 'modernizr.custom',
            dest: 'js'
        });
});

// Favicons Task
//

var icons = (function() {
    return {
        compile: function(config) {
          gulp.src('assets/' + config.src + 'favicon.src.png')
              .pipe(favicons({
                  appName: "My Favicons",
                  appDescription: "These are my Favicons",
                  developerName: "Bryan Colosky",
                  developerURL: "http://bryancolosky.com/",
                  background: config.background,
                  path: 'assets/' + config.path,
                  url: "http://bryancolosky.com/",
                  display: "standalone",
                  orientation: "landscape",
                  version: 1.0,
                  logging: false,
                  online: false,
                  html: config.html,
                  replace: true
              }))
              .pipe(gulp.dest('assets/' + config.dest));

            return this;
        }
    };
}());

gulp.task('icons', function() {
    return icons
        .compile({
            src: 'images/favicons/',
            dest: 'images/favicons/',
            html: '_includes/favicons.html',
            path: 'images/favicons/',
            background: 'transparent'
        });

});

gulp.task('watch', function() {
    gulp.watch(['assets/styles/**/*.scss'], ['sass']);
    gulp.watch(['assets/scripts/**/*.js'], ['scripts']);
    gulp.watch(['assets/images/favicons/*.src.png'], ['icons']);
});

gulp.task('default', ['sass', 'scripts', 'watch']);
gulp.task('build', ['modernizr', 'icons']);
