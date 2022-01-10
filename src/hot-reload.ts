const { app } = require('electron')
const chokidar = require('chokidar')
import gulp from "gulp"
import fs from 'fs'
const { spawn } = require('child_process')
const merge = require('merge2')
const ts = require("gulp-typescript")
const appPath = app.getAppPath()
const ignoredPaths = /node_modules|[/\\]\./

const paths = {
  resource: ["./src/render/**/*"],
}

gulp.task('copy-file', ()=>gulp.src(paths.resource).pipe(gulp.dest("./dist/render")))

gulp.task("compile-main", function () {
  const tsProject = ts.createProject("./tsconfig.json")
  const tsResult = tsProject.src().pipe(tsProject())

  return merge([
    tsResult.dts.pipe(gulp.dest('./dist/types')),
    tsResult.js.pipe(gulp.dest('./dist/'))
  ])
})
/**
 * Creates a callback for hard resets.
 *
 * @param {string} eXecutable path to electron executable
 * @param {string} hardResetMethod method to restart electron
 * @param {string[]} eArgv arguments passed to electron
 * @param {string[]} aArgv arguments passed to the application
 * @returns {function} handler to pass to chokidar
 */
const createMainReloadHandler = (eXecutable:string, hardResetMethod:any, eArgv: any, aArgv: any) =>
  () => {
    // app.relaunch()
    // Detaching child is useful when in Windows to let child
    // live after the parent is killed
    const args = (eArgv || [])
      .concat([appPath])
      .concat(aArgv || [])
    const child = spawn(eXecutable, args, {
      detached: true,
      stdio: 'inherit'
    })
    child.unref()
    // Kamikaze!

    // In cases where an app overrides the default closing or quiting actions
    // firing an `app.quit()` may not actually quit the app. In these cases
    // you can use `app.exit()` to gracefully close the app.
    if (hardResetMethod === 'exit') {
      app.exit()
    } else {
      app.quit()
    }
  }
export default function elecronReload (glob: any, options:any) {
  const eXecutable = options.electron
  
  if (!fs.existsSync(eXecutable)) {
    throw new Error('Provided electron executable cannot be found or is not exeecutable!')
  }

  const browserWindows: Electron.BrowserWindow[] = []
  const watcher = chokidar.watch(glob, Object.assign({ ignored: [ignoredPaths] }, options))

  // Callback function to be executed:
  // I) soft reset: reload browser windows
  const renderReloadHandler = () => browserWindows.forEach(bw => bw.webContents.reloadIgnoringCache())
  // II) hard reset: restart the whole electron process
  
  // Add each created BrowserWindow to list of maintained items
  app.on('browser-window-created', (e, bw) => {
    browserWindows.push(bw)

    // Remove closed windows from list of maintained items
    bw.on('closed', function () {
      const i = browserWindows.indexOf(bw) // Must use current index
      browserWindows.splice(i, 1)
    })
  })

  const mainReloadHandler = createMainReloadHandler(
    eXecutable,
    options.hardResetMethod,
    options.electronArgv,
    options.appArgv)


  watcher.on('change', (file: string)=>{
    if(file.match(/src\/render\//)){
      gulp.series('copy-file')(renderReloadHandler)
    }
    if(file.match(/src\/main\//)){
      gulp.series('compile-main')(mainReloadHandler)
    }
  })
}