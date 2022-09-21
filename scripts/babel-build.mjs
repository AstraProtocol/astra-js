import "zx/globals";
import process from 'node:process';
import chalk from 'chalk';
import chokidar from 'chokidar';
import * as R from 'ramda';

import { Observable, debounceTime } from 'rxjs';
const sdkPackages = ['./packages/tx/src', './packages/wallet/src'];
const buildPackages = ['./packages/tx/lib', './packages/wallet/lib', './packages/dugtrio/src'];

const filesChange = (directoryPath, callback) => {
  const watcher = chokidar.watch(directoryPath);
  watcher.on('all', (event, path) => {
    callback({ event, path })
  });
  return () => watcher.close();
}

const createFileChangeObserver = (directoryPaths, callback) => {
  const directoryChangeHandler =  subscriber => (fileName) => filesChange(fileName, (eventData) => subscriber.next(eventData));
  const observer = new Observable(subscriber => {
    const watchersClose = R.map(directoryChangeHandler(subscriber), directoryPaths);
    return function unsubscribe(){
      R.map(fn => fn(), watchersClose);
    }
  });

  const subscription = observer.pipe(debounceTime(1000)).subscribe(callback);
  return () => subscription.unsubscribe();
}

const installNewPackage = async () => {
    await $`npx lerna run deloy:test --scope=@astra-sdk/dugtrio`;
    console.log(chalk.blue('Deloy script done!'))
}

(async () => {
  const unsubscribeSubscription = createFileChangeObserver(sdkPackages, async () => {
    await $`scripts/task babel`
    console.log(chalk.blue('Babel script done!'))
  });
  const unsubscribeBuildSubscription = createFileChangeObserver(buildPackages,installNewPackage);


  process.on('exit', (code) => {
    unsubscribeSubscription();
    unsubscribeBuildSubscription();
    console.log('Process exit event with code: ', code);
  });

  function handle() {
    process.exit();
  }

  process.on('SIGINT', handle);
})();

