'use strict';

import plugins from 'gulp-load-plugins';
import yargs from 'yargs';
import browser from 'browser-sync';
import gulp from 'gulp';
import panini from 'panini';
import yaml from 'js-yaml';
import fs from 'fs';
import webpackStream from 'webpack-stream';
import webpack2 from 'webpack';
import named from 'vinyl-named';
import autoprefixer from 'autoprefixer';
import { processBlogFiles } from './src/services/blogprocessor';
const sassFunction = require('gulp-sass')(require('sass'));

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
const PRODUCTION = !!yargs.argv.production;

// Load settings from settings.yml
const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

// Build the "dist" folder by running all of the below tasks
// Sass must be run later so UnCSS can search for used classes in the others assets.
gulp.task('build', gulp.series(gulp.parallel(buildBlogFiles, pages, javascript, copy), sass));

// Build the site, run the server, and watch for file changes
gulp.task('default', gulp.series('build', server, watch));

// Delete the "dist" folder
// This happens every time a build starts
// function clean(done) {
//   rimraf(PATHS.dist, done);
// }

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
function copy() {
  gulp.src(PATHS.rootAssets, { encoding: false }).pipe(gulp.dest(PATHS.dist));
  return gulp.src(PATHS.assets, { encoding: false }).pipe(gulp.dest(PATHS.dist + '/assets'));
}

// Copy page templates into finished HTML files
function pages() {
  return gulp
    .src('src/pages/**/*.{html,hbs,handlebars}')
    .pipe(
      panini({
        root: 'src/pages/',
        layouts: 'src/layouts/',
        partials: 'src/partials/',
        data: 'src/data/',
        helpers: 'src/helpers/'
      })
    )
    .pipe(gulp.dest(PATHS.dist));
}

// Load updated HTML templates and partials into Panini
function resetPages(done) {
  panini.refresh();
  done();
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
  const postCssPlugins = [
    // Autoprefixer
    autoprefixer()

    // UnCSS - Uncomment to remove unused styles in production
    // PRODUCTION && uncss.postcssPlugin(UNCSS_OPTIONS),
  ].filter(Boolean);

  return gulp
    .src('src/assets/scss/app.scss')
    .pipe($.sourcemaps.init())
    .pipe(
      sassFunction({
        includePaths: PATHS.sass
      }).on('error', function (err) {
        console.log(err.message + ' on line ' + err.lineNumber + ' in file : ' + err.fileName);
      })
    )
    .pipe($.postcss(postCssPlugins))
    .pipe($.if(PRODUCTION, $.cleanCss({ compatibility: 'ie9' })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/assets/css'))
    .pipe(browser.reload({ stream: true }));
}

let webpackConfig = {
  mode: PRODUCTION ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            compact: false
          }
        }
      }
    ]
  },
  devtool: !PRODUCTION && 'source-map'
};

// Combine JavaScript into one file
// In production, the file is minified
function javascript() {
  return gulp
    .src(PATHS.entries)
    .pipe(named())
    .pipe($.sourcemaps.init())
    .pipe(webpackStream(webpackConfig, webpack2))
    .pipe(
      $.if(
        PRODUCTION,
        $.uglify().on('error', (e) => {
          console.log(e);
        })
      )
    )
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

// Copy images to the "dist" folder
// In production, the images are compressed
// Removed ==> Console logs: gulp-imagemin: Minified 0 images, so this function is obsolete
// function images() {
//   return gulp
//     .src('src/assets/img/**/*')
//     .pipe(
//       $.if(PRODUCTION, $.imagemin([$.imagemin.jpegtran({ progressive: true })]))
//     )
//     .pipe(gulp.dest(PATHS.dist + '/assets/img'));
// }

// Start a server with BrowserSync to preview the site in
function server(done) {
  browser.init(
    {
      server: {
        baseDir: PATHS.dist,
        serveStaticOptions: {
          extensions: ['html']
        }
      },
      port: PORT
    },
    done
  );
}

// Reload the browser with BrowserSync
function reload(done) {
  browser.reload();
  done();
}

function buildBlogFiles(done) {
  processBlogFiles();
  done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
  gulp.watch(PATHS.assets, copy);
  gulp
    .watch([__dirname + '/../../../blog/*.md', 'src/services/*.js'])
    .on('all', gulp.series(buildBlogFiles, resetPages, pages, browser.reload));
  gulp
    .watch([
      'src/pages/**/*.html',
      '!src/pages/blog/20*.html' // skip processed blog entries
    ])
    .on('all', gulp.series(pages, browser.reload));
  gulp.watch('src/{layouts,partials}/**/*.html').on('all', gulp.series(resetPages, pages, browser.reload));
  gulp.watch('src/data/**/*.{js,json,yml}').on('all', gulp.series(resetPages, pages, browser.reload));
  gulp.watch('src/helpers/**/*.js').on('all', gulp.series(resetPages, pages, browser.reload));
  gulp.watch('src/assets/scss/**/*.scss').on('all', sass);
  gulp.watch('src/assets/js/**/*.js').on('all', gulp.series(javascript, browser.reload));
}
