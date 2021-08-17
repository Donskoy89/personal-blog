const build_folder = require('path').basename(__dirname);
const sourse_folder = '#src';

const gulp = require('gulp'),
    {src,dest,watch,series,parallel} = gulp,
    less = require('gulp-less'),
    browserSync = require("browser-sync").create(),
    del = require("del"),
    autoprefixer = require("gulp-autoprefixer"),
    cleanCss = require("gulp-clean-css"),
    imageMin = require("gulp-imagemin"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    panini = require("panini"),
    gcmq = require("gulp-group-css-media-queries");


const path = {
    src: {
        html: sourse_folder+'/*.html',
        css: sourse_folder+'/less/style.less',
        js: sourse_folder+'/js/main.js',
        img: sourse_folder+'/img/**/*.{jpg,png,gif,svg,webp,ico}'
    },
    build: {
        html: build_folder+'/',
        css: build_folder+'/css/',
        js: build_folder+'/js/',
        img: build_folder+'/img/'
    },
    watch: {
        html: sourse_folder+'/**/*.html',
        css: sourse_folder+'/less/**/*.less',
        js: sourse_folder+'/js**/*.js',
        img: sourse_folder+'/img/**/*.{jpg,png,gif,svg,webp,ico}'
    },
    clear: './'+build_folder+'/'
};

function clean() {
    return del(path.clear);
}

function html() {
    panini.refresh();
    return src(path.src.html)
        .pipe(panini({
            root: sourse_folder+'/',
            layouts: sourse_folder+'/layouts/',
            partials: sourse_folder+'/partials/'
        }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream());
}

function css() {
    return src(path.src.css)
        .pipe(less())
        .pipe(gcmq())
        .pipe(autoprefixer({
            overrideBrowserslist: 'last 2 versions'
        }))
        .pipe(dest(path.build.css))
        .pipe(rename({
            suffix: ".min",
        }))
        .pipe(cleanCss())
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream());
}

function js() {
    return src(path.src.js)
        .pipe(dest(path.build.js))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(dest(path.build.js))
        .pipe(browserSync.stream());
}

function img() {
    return src(path.src.img)
        .pipe(imageMin())
        .pipe(dest(path.build.img))
        .pipe(browserSync.stream());
}

function watchFiles() {
    watch(path.watch.html, html);
    watch(path.watch.css, css);
    watch(path.watch.js, js);
    watch(path.watch.img, img);
}

function serve() {
    browserSync.init({
        server: {
            baseDir: path.clear
        }
    });
}

let build = series(clean, parallel(html, css, js, img));
let watchProject = parallel(build, watchFiles, serve);

exports.build = build;
exports.watchProject = watchProject;
exports.default = watchProject;
exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.clean = clean;
exports.watchFiles = watchFiles;
exports.serve = serve;