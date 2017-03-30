/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var babel = require('gulp-babel');
var del = require('del');
var cleanCSS = require('gulp-clean-css');
var concatCSS = require('gulp-concat-css');
var derequire = require('gulp-derequire');
var flatten = require('gulp-flatten');
var gulp = require('gulp');
var gulpUtil = require('gulp-util');
var header = require('gulp-header');
var packageData = require('./package.json');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var through = require('through2');
var webpackStream = require('webpack-stream');

var fbjsConfigurePreset = require('babel-preset-fbjs/configure');
var gulpCheckDependencies = require('fbjs-scripts/gulp/check-dependencies');

var moduleMap = require('./scripts/module-map');

var paths = {
  dist: 'dist',
  lib: 'lib',
  src: [
    'src/**/*.js',
    '!src/**/__tests__/**/*.js',
    '!src/**/__mocks__/**/*.js',
  ],
  css: [
    'src/**/*.css',
  ],
};

var babelOptsJS = {
  presets: [
    fbjsConfigurePreset({
      stripDEV: true,
      rewriteModules: {map: moduleMap},
    }),
  ],
};

var babelOptsFlow = {
  presets: [
    fbjsConfigurePreset({
      target: 'flow',
      rewriteModules: {map: moduleMap},
    }),
  ],
};

var COPYRIGHT_HEADER = `/**
 * Draft v<%= version %>
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
`;

var buildDist = function(opts) {
  var webpackOpts = {
    debug: opts.debug,
    externals: {
      immutable: 'Immutable',
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    output: {
      filename: opts.output,
      libraryTarget: 'var',
      library: 'Draft',
    },
    plugins: [
      new webpackStream.webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          opts.debug ? 'development' : 'production'
        ),
      }),
      new webpackStream.webpack.optimize.OccurenceOrderPlugin(),
      new webpackStream.webpack.optimize.DedupePlugin(),
    ],
  };
  if (!opts.debug) {
    webpackOpts.plugins.push(
      new webpackStream.webpack.optimize.UglifyJsPlugin({
        compress: {
          hoist_vars: true,
          screw_ie8: true,
          warnings: false,
        },
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
    .pipe(babel(babelOptsJS))
    .pipe(flatten())
    .pipe(gulp.dest(paths.lib));
});

gulp.task('flow', function() {
  return gulp
    .src(paths.src)
    .pipe(babel(babelOptsFlow))
    .pipe(flatten())
    .pipe(rename({extname: '.js.flow'}))
    .pipe(gulp.dest(paths.lib));
});

gulp.task('css', function() {
  return gulp
    .src(paths.css)
    .pipe(through.obj(function(file, encoding, callback) {
      var contents = file.contents.toString();
      var replaced = contents.replace(
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
          var vars = {
            'fig-secondary-text': '#9197a3',
            'fig-light-20': '#bdc1c9',
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
    // Avoid rewriting rules *just in case*, just compress
    .pipe(cleanCSS({advanced: false}))
    .pipe(header(COPYRIGHT_HEADER, {version: packageData.version}))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('dist', ['modules', 'css'], function() {
  var opts = {
    debug: true,
    output: 'Draft.js',
  };
  return gulp.src('./lib/Draft.js')
    .pipe(buildDist(opts))
    .pipe(derequire())
    .pipe(header(COPYRIGHT_HEADER, {version: packageData.version}))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('dist:min', ['modules'], function() {
  var opts = {
    debug: false,
    output: 'Draft.min.js',
  };
  return gulp.src('./lib/Draft.js')
    .pipe(buildDist(opts))
    .pipe(header(COPYRIGHT_HEADER, {version: packageData.version}))
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

gulp.task('dev', function() {
  gulp.watch(paths.src, ['modules', 'dist']);
});

gulp.task('default', function(cb) {
  runSequence('check-dependencies', 'clean', ['modules', 'flow'], ['dist', 'dist:min'], cb);
});
