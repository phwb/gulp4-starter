'use strict';

import gulp from 'gulp';
import pug from 'gulp-pug';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import imageMin from 'gulp-imagemin';

import less from 'gulp-less';
import LessAutoPrefix from 'less-plugin-autoprefix';
import LessPluginCleanCSS from 'less-plugin-clean-css';

import del from 'del';
import browserSync from 'browser-sync';

browserSync.create();

const plumberOptions = {
  errorHandler: notify.onError()
};
const develop = true;

export const clean = () => del('./build');

export function images() {
  return gulp.src('./src/images/**/*', {since: gulp.lastRun('images')})
    .pipe(imageMin({
      svgoPlugins: [{
        convertPathData: false
      }]
    }))
    .pipe(gulp.dest('./build/images'));
}

export function styles() {
  let autoPrefix = new LessAutoPrefix({
    browsers: [
      '> 1%',
      'last 2 versions',
      'Firefox ESR',
      'Opera 12.1'
    ]
  });
  let plugins = [autoPrefix];

  if (!develop) {
    let cleanCSS = new LessPluginCleanCSS({ advanced: true });
    plugins.push(cleanCSS);
  }

  return gulp.src('./src/styles/*.less', {since: gulp.lastRun('styles')})
    .pipe(plumber(plumberOptions))
    .pipe(less({
      paths: ['node_modules'],
      plugins: plugins
    }))
    .pipe(gulp.dest('./build/css'));
}

export function views() {
  let path = [
    './src/views/*.pug',
    '!./src/views/layout.pug'
  ];
  return gulp.src(path, {since: gulp.lastRun('views')})
    .pipe(plumber(plumberOptions))
    .pipe(pug({
      pretty: true,
      data: {
        dev: develop
      }
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
