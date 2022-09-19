import "zx/globals";
import process from 'node:process';
import chokidar from 'chokidar';
import * as R from 'ramda';

import { Observable, filter, buffer, debounceTime, map, mergeAll } from 'rxjs';
const sdkRootDir = './packages';
const ignores = ['astra-wallet-sdk', 'dugtrio'];

const filesChange = (directoryPath, callback) => {
  const watcher = chokidar.watch(path.resolve(directoryPath, 'src'), { ignoreInitial: true });
  watcher.on('all', (event, path) => {
    callback({ event, path })
  });
  return () => watcher.close();
}

const createPackagesChangeObserver = (directoryPaths, callback) => {
  const directoryChangeHandler = subscriber => (fileName) => filesChange(fileName, (eventData) => subscriber.next({ ...eventData, package: fileName }));
  const observer = new Observable(subscriber => {
    const watchersClose = R.map(directoryChangeHandler(subscriber), directoryPaths);
    return function unsubscribe(){
      R.map(fn => fn(), watchersClose);
    }
  });
  const isNotNodeModules = R.compose(R.not,R.includes('node_modules'), R.prop('path'));
  const subscription = observer.pipe(filter(isNotNodeModules))
  const debounceSub = observer.pipe(debounceTime(2000));
  const bufferCheck = subscription.pipe(buffer(debounceSub))
    .pipe(map(R.compose(R.pluck('package'),R.uniqBy(R.prop('package')))))
    .pipe(mergeAll())
    .subscribe(callback);
  return () => bufferCheck .unsubscribe();
}


const ENV = {
  PROJECT_DIR: process.cwd(),
  SDK_ROOT_DIR: sdkRootDir,
}
const stringifyEnv = R.compose(
  R.join(' '),
  R.values,
  R.mapObjIndexed((value, key) => `export ${key}=${value};`)
)

const getDirPaths = R.compose(
  R.map(({ dirent, dirPath }) => path.resolve(dirPath, dirent.name)),
  R.filter(direntWrapper => direntWrapper.dirent.isDirectory()),
  dirPath => R.map((dirent) => ({ dirent, dirPath }), fs.readdirSync(dirPath, { withFileTypes: true })),
);

const isHasFile =  name => R.compose(
  Boolean,
  R.find(R.whereEq({ name })),
  R.filter(dirent => !dirent.isDirectory()),
  dirPath => fs.readdirSync(dirPath, { withFileTypes: true }),
);

$.prefix += stringifyEnv(ENV);

const babelBuild = (packageName) => $`$PROJECT_DIR/node_modules/.bin/babel --config-file $PROJECT_DIR/.babelrc.js --verbose --relative ${packageName}/src/ -d ../lib`;


const tscBuild = async (packageName) => {
  try {
    await $`npx tsc -p ${packageName}/tsconfig.json`;
    console.log("[TSC] Successfully build" + packageName);
  } catch (e) {
  }
}
const buildPackage = async (packagePath) => {
  const packageJson = fs.readJsonSync(path.resolve(packagePath, 'package.json'));
  const isTsBuild = isHasFile ('tsconfig.json')(packagePath);
  const isBabelBuild = R.whereEq({ buildTool: 'babel' }, packageJson);
  if(isTsBuild) {
    await tscBuild(packagePath);
  } else if(isBabelBuild){
    await babelBuild(packagePath);
  }
}
const runner = async () => {
  const _packagesList  = getDirPaths(path.resolve(ENV.PROJECT_DIR, ENV.SDK_ROOT_DIR));
  const packagesList = R.differenceWith((a, b) => R.includes(b, a), _packagesList, ignores)
  await Promise.all(R.map(buildPackage, packagesList));
  const unsubscribe = createPackagesChangeObserver(packagesList, buildPackage)
  return  unsubscribe;
}
export default runner;

