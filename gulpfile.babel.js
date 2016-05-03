'use strict';

import gulp from 'gulp';
import pug from 'gulp-pug';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postCSS from 'gulp-postcss';
import imageMin from 'gulp-imagemin';

import del from 'del';
import browserSync from 'browser-sync';

browserSync.create();

const plumberOptions = {
  errorHandler: notify.onError()
};

export const clean = () => del('./build');

export function images() {
  return gulp.src('./src/images/**/*')
    .pipe(imageMin({
      svgoPlugins: [{
        convertPathData: false
      }]
    }))
    .pipe(gulp.dest('./build/images'));
}

export function styles() {
  let browsers = [
    '> 1%',
    'last 2 versions',
    'Firefox ESR',
    'Opera 12.1'
  ];
  return gulp.src('./src/styles/*.less')
    .pipe(plumber(plumberOptions))
    .pipe(less({
      paths: ['node_modules']
    }))
    .pipe(postCSS([
      require('autoprefixer')({
        browsers: browsers
      })
    ]))
    .pipe(gulp.dest('./build/css'));
}

export function views() {
  return gulp.src([
    './src/views/*.pug',
    '!./src/views/layout.pug'
  ])
    .pipe(plumber(plumberOptions))
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('./build'));
}

export function watch() {
  gulp.watch('./src/views/**/*.pug', views);
  gulp.watch('./src/images/**/*', images);
  gulp.watch('./src/styles/**/*.less', styles);
}

export function serve() {
  browserSync.init({
    server: './build'
  });
  browserSync.watch('./build/**/*.*').on('change', browserSync.reload);
}

export const build = gulp.parallel(views, styles, images);

export default gulp.series(
  clean,
  build,
  gulp.parallel(serve, watch)
);
