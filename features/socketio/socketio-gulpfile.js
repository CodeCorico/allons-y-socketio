'use strict';

module.exports = function($gulp) {

  var sourcemaps = require('gulp-sourcemaps'),
      uglify = require('gulp-uglify'),
      rename = require('gulp-rename');

  $gulp.task('socketio', function(done) {

    $gulp
      .src('node_modules/socket.io-client/socket.io.js')
      .pipe($gulp.dest('./public/vendor'))
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(rename({
        extname: '.min.js'
      }))
      .pipe(sourcemaps.write('./'))
      .pipe($gulp.dest('./public/vendor'))
      .on('end', done);
  });

  return 'socketio';
};