var path = require('path'),
    karmaDir = path.join(process.cwd(), 'node_modules/karma'),
    core_watcher = require(path.join(karmaDir, 'lib/watcher'));
    core_isUrlAbsolute = require(path.join(karmaDir, 'lib/helper')).isUrlAbsolute,
    core_createPatternObject = require(path.join(karmaDir, 'lib/config')).createPatternObject;

function initSets(emitter, config, fileList, executor, logger, launcher, injector, webServer, socketServer, done) {
    var log = logger.create('Karma-Sets'),
        singleRun = config.singleRun,
        basePath = config.basePath,
        sets = config.sets || {},
        setKeys = typeof(config.set) === 'string' ? [ config.set ] : Object.keys(sets),
        setKeysIdx, set, setIdx,
        browserCount = 0, runIdx = 0, runAllPass = true, runTitle;

    // Process set's file patterns.
    for(setKeysIdx = 0; setKeysIdx < setKeys.length; setKeysIdx++) {
        set = sets[setKeys[setKeysIdx]];

        for(setIdx = 0; setIdx < set.length; setIdx++) {
            set[setIdx] = core_createPatternObject(set[setIdx]);

            if (basePath && set[setIdx].pattern && !core_isUrlAbsolute(set[setIdx].pattern)) {
                set[setIdx].pattern = path.resolve(basePath, set[setIdx].pattern);
            }
        }
    }

    function runComplete(browsers, results) {
        if(results) {
          runAllPass = runAllPass && (results.exitCode === 0);
        }

        if(runIdx < setKeys.length) {
            var key = runTitle = setKeys[runIdx++],
                newFiles = config.files.concat(sets[key]),
                filePromise = fileList.reload(newFiles, config.exclude);

            // Setup autoWatch like features for single sets.
            if(typeof(config.set) === 'string') {
                filePromise.then(function() {
                    // Swap config.files to hack in watch.
                    var origFiles = config.files;
                    config.files = newFiles;

                    injector.invoke(core_watcher.watch);

                    config.files = origFiles;
                });

                emitter.on('file_list_modified', function() {
                    log.info('List of files has changed, trying to execute');
                    executor.schedule();
                });
            }

            executor.schedule();
        } else {
            // Remove all disconnect events to prevent reconnect attempts
            var sockets = socketServer.sockets.sockets;
            Object.getOwnPropertyNames(sockets).forEach(function(key) {
                if (key !== 'length') {
                    sockets[key].removeAllListeners('disconnect');
                }            
            });

            // Trigger closing all browsers
            emitter.emitAsync('exit').then(function() {
                // shutdown the server...
                // Don't bother waiting, will only work 1% of the time.
                webServer.close();
                webServer.removeAllListeners();

                // shutdown socket.io flash transport, if defined
                if (socketServer.flashPolicyServer) {
                    socketServer.flashPolicyServer.close();
                }

                done(runAllPass ? 0 : 1);
            });
        }
    }

    // Only do something if sets are defined
    if(setKeys.length) {
        // Prevent karma dieing after first set.
        config.singleRun = false;

        // Disable watch since we will be rolling through multiple sets.
        // This will also cripple normal karma flow and allow set's to control the full test flow.
        config.autoWatch = false;

        emitter.on('run_complete', runComplete);
        emitter.on('run_start', function() {
            if(runTitle) {
              log.info('Running Set:', runTitle);
            }
        });
        emitter.on('browser_register', function(browser) {
          // Got to mark it as captured before we can check allCaptured.
          if (browser.id) {
            launcher.markCaptured(browser.id);
          }

          // This will be the first set to kick off the tests.
          if(launcher.areAllCaptured()) {
            runComplete();
          }
        });
    }
}

initSets.$inject = ['emitter', 'config', 'fileList', 'executor', 'logger', 'launcher', 'injector', 'webServer', 'socketServer', 'done'];

// PUBLISH DI MODULE
module.exports = {
    'framework:sets': ['factory', initSets]
};
