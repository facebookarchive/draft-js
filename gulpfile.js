/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const babel = require('gulp-babel');
const del = require('del');
const concatCSS = require('gulp-concat-css');
const derequire = require('gulp-derequire');
const flatten = require('gulp-flatten');
const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const runSequence = require('run-sequence');
const through = require('through2');
const webpackStream = require('webpack-stream');

const babelOpts = require('./scripts/babel/default-options');
const babelPluginDEV = require('fbjs-scripts/babel/dev-expression');
const gulpCheckDependencies = require('fbjs-scripts/gulp/check-dependencies');

const paths = {
  dist: 'dist',
  lib: 'lib',
  src: [
    'src/**/*.js',
    '!src/**/__tests__/**/*.js',
    '!src/**/__mocks__/**/*.js'
  ],
  css: [
    'src/**/*.css'
  ]
};

// Ensure that we use another plugin that isn't specified in the default Babel
// options, converting __DEV__.
babelOpts.plugins.push(babelPluginDEV);

const buildDist = function(opts) {
  const webpackOpts = {
    debug: opts.debug,
    externals: {
      immutable: 'Immutable',
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    output: {
      filename: opts.output,
      libraryTarget: 'var',
      library: 'Draft'
    },
    plugins: [
      new webpackStream.webpack.optimize.OccurenceOrderPlugin(),
      new webpackStream.webpack.optimize.DedupePlugin()
    ]
  };
  if (!opts.debug) {
    webpackOpts.plugins.push(
      new webpackStream.webpack.optimize.UglifyJsPlugin({
        compress: {
          hoist_vars: true,
          screw_ie8: true,
          warnings: false
        }
      })
    );
  }
  return webpackStream(webpackOpts, null, function(err, stats) {
    if (err) {
      throw new gulpUtil.PluginError('webpack', err);
    }
    if (stats.compilation.errors.length) {
      gulpUtil.log('webpack', '\n' + stats.toString({colors: true}));
    }
  });
};

gulp.task('clean', function() {
  return del([paths.dist, paths.lib]);
});

gulp.task('modules', function() {
  return gulp
    .src(paths.src)
    .pipe(babel(babelOpts))
    .pipe(flatten())
    .pipe(gulp.dest(paths.lib));
});

gulp.task('css', function() {
  return gulp
    .src(paths.css)
    .pipe(through.obj(function(file, encoding, callback) {
      const contents = file.contents.toString();
      let replaced = contents.replace(
        // Regex based on MakeHasteCssModuleTransform: ignores comments,
        // strings, and URLs
        /\/\*.*?\*\/|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|url\([^)]*\)|(\.(?:public\/)?[\w-]*\/{1,2}[\w-]+)/g,
        function(match, cls) {
          if (cls) {
            return cls.replace(/\//g, '-');
          } else {
            return match;
          }
        }
      );
      replaced = replaced.replace(
        // MakeHasteCssVariablesTransform
        /\bvar\(([\w-]+)\)/g,
        function(match, name) {
          const vars = {
            'fbui-desktop-text-placeholder': '#9197a3',
            'fbui-desktop-text-placeholder-focused': '#bdc1c9',
          };
          if (vars[name]) {
            return vars[name];
          } else {
            throw new Error('Unknown CSS variable ' + name);
          }
        }
      );
      file.contents = new Buffer(replaced);
      callback(null, file);
    }))
    .pipe(concatCSS('Draft.css'))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('dist', ['modules', 'css'], function() {
  const opts = {
    debug: true,
    output: 'Draft.js'
  };
  return gulp.src('./lib/Draft.js')
    .pipe(buildDist(opts))
    .pipe(derequire())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('dist:min', ['modules'], function() {
  const opts = {
    debug: false,
    output: 'Draft.min.js',
  };
  return gulp.src('./lib/Draft.js')
    .pipe(buildDist(opts))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('check-dependencies', function() {
  return gulp
    .src('package.json')
    .pipe(gulpCheckDependencies());
});

gulp.task('watch', function() {
  gulp.watch(paths.src, ['modules']);
});

gulp.task('default', function(cb) {
  runSequence('check-dependencies', 'clean', 'modules', ['dist', 'dist:min'], cb);
});
