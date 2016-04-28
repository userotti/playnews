var gulp = require('gulp');

gulp.task('copyvendors', function() {
   gulp.src('./bower_components/phaser/build/phaser.min.js')
   .pipe(gulp.dest('./dist'));
});
