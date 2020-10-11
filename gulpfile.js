/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const packageData = require('./package.json');
const moduleMap = require('./scripts/module-map');
const fbjsConfigurePreset = require('babel-preset-fbjs/configure');
const del = require('del');
const gulpCheckDependencies = require('fbjs-scripts/gulp/check-dependencies');
const gulp = require('gulp');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const concatCSS = require('gulp-concat-css');
const derequire = require('gulp-derequire');
const flatten = require('gulp-flatten');
const header = require('gulp-header');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const gulpUtil = require('gulp-util');
const StatsPlugin = require('stats-webpack-plugin');
const through = require('through2');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpackStream = require('webpack-stream');

const paths = {
  dist: 'dist',
  lib: 'lib',
  src: [
    'src/**/*.js',
    '!src/**/__tests__/**/*.js',
    '!src/**/__mocks__/**/*.js',
  ],
  css: ['src/**/*.css'],
};

const babelOptsJS = {
  presets: [
    fbjsConfigurePreset({
      stripDEV: true,
      rewriteModules: {map: moduleMap},
    }),
  ],
  plugins: [
    require('@babel/plugin-proposal-nullish-coalescing-operator'),
    require('@babel/plugin-proposal-optional-chaining'),
    require('@babel/plugin-proposal-optional-catch-binding'),
  ],
};

const babelOptsFlow = {
  presets: [
    fbjsConfigurePreset({
      target: 'flow',
      rewriteModules: {map: moduleMap},
    }),
  ],
  plugins: [
    require('@babel/plugin-proposal-nullish-coalescing-operator'),
    require('@babel/plugin-proposal-optional-chaining'),
    require('@babel/plugin-proposal-optional-catch-binding'),
  ],
};

var COPYRIGHT_HEADER = `/**
 * Draft v<%= version %>
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
`;

const buildDist = opts => {
  const webpackOpts = {
    externals: {
      immutable: {
        root: 'Immutable',
        commonjs2: 'immutable',
        commonjs: 'immutable',
        amd: 'immutable',
      },
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react',
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom',
      },
    },
    output: {
      filename: opts.output,
      libraryTarget: 'umd',
      library: 'Draft',
    },
    plugins: [
      new webpackStream.webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          opts.debug ? 'development' : 'production',
        ),
      }),
      new webpackStream.webpack.LoaderOptionsPlugin({
        debug: opts.debug,
      }),
      new StatsPlugin(`../meta/bundle-size-stats/${opts.output}.json`, {
        chunkModules: true,
      }),
    ],
  };
  if (!opts.debug) {
    webpackOpts.plugins.push(new UglifyJsPlugin());
  }
  const wpStream = webpackStream(webpackOpts, null, function(err, stats) {
    if (err) {
      throw new gulpUtil.PluginError('webpack', err);
    }
    if (stats.compilation.errors.length) {
      gulpUtil.log('webpack', '\n' + stats.toString({colors: true}));
    }
  });
  return wpStream;
};

/**************** Tasks *****************/

// Builds the CSS
exports.css = function css() {
  return (
    gulp
      .src(paths.css)
      .pipe(
        through.obj(function(file, encoding, callback) {
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
            },
          );
          replaced = replaced.replace(
            // MakeHasteCssVariablesTransform
            /\bvar\(([\w-]+)\)/g,
            function(match, name) {
              const vars = {
                'fig-secondary-text': '#9197a3',
                'fig-light-20': '#bdc1c9',
              };
              if (vars[name]) {
                return vars[name];
              } else {
                throw new Error('Unknown CSS variable ' + name);
              }
            },
          );
          file.contents = Buffer.from(replaced);
          callback(null, file);
        }),
      )
      .pipe(concatCSS('Draft.css'))
      // Avoid rewriting rules *just in case*, just compress
      .pipe(cleanCSS({advanced: false}))
      .pipe(header(COPYRIGHT_HEADER, {version: packageData.version}))
      .pipe(gulp.dest(paths.dist))
  );
};

// Cleans artifacts
exports.clean = function clean() {
  return del([paths.dist, paths.lib]);
};

// Transforms modules
exports.modules = function modules() {
  return gulp
    .src(paths.src)
    .pipe(babel(babelOptsJS))
    .pipe(flatten())
    .pipe(gulp.dest(paths.lib));
};

// Outputs built flow files
exports.flow = function flow() {
  return gulp
    .src(paths.src)
    .pipe(babel(babelOptsFlow))
    .pipe(flatten())
    .pipe(rename({extname: '.js.flow'}))
    .pipe(gulp.dest(paths.lib));
};

// Builds for development
exports.dist = gulp.series(exports.modules, exports.css, function outputDist() {
  return gulp
    .src('./lib/Draft.js')
    .pipe(
      buildDist({
        debug: true,
        output: 'Draft.js',
      }),
    )
    .pipe(derequire())
    .pipe(
      gulpif('*.js', header(COPYRIGHT_HEADER, {version: packageData.version})),
    )
    .pipe(gulp.dest(paths.dist));
});

// Builds for production
exports.dist_min = gulp.series(exports.modules, function outputDistMin() {
  return gulp
    .src('./lib/Draft.js')
    .pipe(
      buildDist({
        debug: false,
        output: 'Draft.min.js',
      }),
    )
    .pipe(
      gulpif('*.js', header(COPYRIGHT_HEADER, {version: packageData.version})),
    )
    .pipe(gulp.dest(paths.dist));
});

// Checks for "wrong" dependencies (file://, for example).
exports.check_dependencies = function check_dependencies() {
  return gulp.src('package.json').pipe(gulpCheckDependencies());
};

// Watches to build modules
exports.watch = function watch() {
  gulp.watch(paths.src, exports.modules);
};

// Watches to build dev artifact
exports.dev = function dev() {
  gulp.watch(paths.src, exports.dist);
};

// Builds everything
exports.default = gulp.series(
  exports.check_dependencies,
  exports.clean,
  gulp.parallel(exports.modules, exports.flow),
  gulp.parallel(exports.dist, exports.dist_min),
);
