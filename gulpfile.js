const gulp = require("gulp")
const del = require('del')
const ts = require("gulp-typescript")
const merge = require('merge2')
const { api } = require('@electron-forge/core')

const paths = {
    resource: ["src/render/**/*"],
}

gulp.task('clean', function(){
  return del('./dist', {force:true});
});

gulp.task("copy-resource-file", function () {
    return gulp.src(paths.resource).pipe(gulp.dest("dist/render"))
});

gulp.task("compile-ts", function () {
  const tsProject = ts.createProject("tsconfig.json")
  const tsResult = tsProject.src().pipe(tsProject())

  return merge([
    tsResult.dts.pipe(gulp.dest('dist/types')),
    tsResult.js.pipe(gulp.dest('dist/'))
  ])
})

gulp.task("run-app", function(){
  api.start({enableLogging:false})
})

gulp.task("default", gulp.series('clean',"compile-ts","copy-resource-file","run-app"))

gulp.watch('./src/render/**/*',gulp.series("copy-resource-file"))


