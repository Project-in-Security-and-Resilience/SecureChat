

import gulp from 'gulp';
import shell from 'gulp-shell';

// Define a task to copy non-JSX files to the dist folder
export function copyNonJSXFiles() {
   return gulp.src(['steganography.min.js'])
              .pipe(gulp.dest('dist/'));
}

// Specify the default task
export default copyNonJSXFiles;