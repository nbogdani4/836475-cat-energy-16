"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require('gulp-csso');
var rename = require("gulp-rename");
var imagemin = require('gulp-imagemin');
var svgstore = require('gulp-svgstore');
var webp = require('gulp-webp');
var del = require('del');

gulp.task("css", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", gulp.series("css"));
  gulp.watch("source/**/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/img/**/sprite-*.svg", gulp.series("sprite", "refresh"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("sprite", function () {
  return gulp.src("source/img/**/sprite-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
});

gulp.task("html", function () {
  return gulp.src(
    "source/**/*.html", {
      base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("copy", function () {
  return gulp.src([
    "source/**/*.html",
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**/*.{jpg,png,svg,webp}",
    "source/js/**/*.js",
    "source/*.ico"
    ], {
      base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
})

gulp.task("img", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"))
});

gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{jpeg,png}")
    .pipe(webp())
    .pipe(gulp.dest("source/img"))
});

gulp.task("build", gulp.series("clean", "copy", "css", "sprite"));
gulp.task("start", gulp.series("build", "server"));
gulp.task("images", gulp.series("img", "webp"));
