var gulp = require("gulp");
// var browser = require('browser-sync');
var connect = require('gulp-connect');
gulp.task("server", function() {
  connect.server({
    root: './',
    livereload: false
  });
});
gulp.task("default",['server'], function() {
});
