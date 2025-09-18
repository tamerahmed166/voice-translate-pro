const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const del = require('del');
const browserSync = require('browser-sync').create();

// Paths
const paths = {
  src: {
    html: '*.html',
    css: 'styles.css',
    js: 'script.js',
    images: 'assets/**/*.{png,jpg,jpeg,gif,svg}',
    fonts: 'assets/fonts/**/*'
  },
  dist: {
    base: 'dist/',
    css: 'dist/css/',
    js: 'dist/js/',
    images: 'dist/assets/',
    fonts: 'dist/assets/fonts/'
  }
};

// Clean dist directory
function clean() {
  return del(['dist/**/*']);
}

// Copy HTML files
function copyHTML() {
  return src(paths.src.html)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.dist.base));
}

// Process CSS
function processCSS() {
  return src(paths.src.css)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(dest(paths.dist.css));
}

// Process JavaScript
function processJS() {
  return src(paths.src.js)
    .pipe(concat('bundle.js'))
    .pipe(uglify())
    .pipe(dest(paths.dist.js));
}

// Optimize images
function optimizeImages() {
  return src(paths.src.images)
    .pipe(imagemin())
    .pipe(dest(paths.dist.images));
}

// Copy fonts
function copyFonts() {
  return src(paths.src.fonts)
    .pipe(dest(paths.dist.fonts));
}

// Copy other assets
function copyAssets() {
  return src(['manifest.json', 'sw.js', 'robots.txt', 'sitemap.xml'])
    .pipe(dest(paths.dist.base));
}

// Browser sync
function serve() {
  browserSync.init({
    server: {
      baseDir: paths.dist.base
    }
  });
}

// Watch files
function watchFiles() {
  watch(paths.src.html, copyHTML);
  watch(paths.src.css, processCSS);
  watch(paths.src.js, processJS);
  watch(paths.src.images, optimizeImages);
}

// Build task
const build = series(
  clean,
  parallel(
    copyHTML,
    processCSS,
    processJS,
    optimizeImages,
    copyFonts,
    copyAssets
  )
);

// Development task
const dev = series(
  build,
  parallel(serve, watchFiles)
);

// Production task
const prod = series(build);

// Export tasks
exports.clean = clean;
exports.copyHTML = copyHTML;
exports.processCSS = processCSS;
exports.processJS = processJS;
exports.optimizeImages = optimizeImages;
exports.copyFonts = copyFonts;
exports.copyAssets = copyAssets;
exports.serve = serve;
exports.watch = watchFiles;
exports.build = build;
exports.dev = dev;
exports.prod = prod;
exports.default = dev;
