#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const childProcess = require('child_process');
const glob = require('glob');

const argv = require('minimist')(process.argv.slice(2));

const packageJson = require('./package.json');

if(argv.v || argv.version) {
    console.log(packageJson.name, packageJson.version);
    process.exit(0);
}

if(argv.h || argv.help) {
    printHelp();
    process.exit(0);
}

if(argv._.length < 1) {
    console.warn('Must give a path!');
    process.exit(1);
}

const messages = [];

argv._.forEach(dir => {
    if(checkIsDirectory(dir)) {
        checkOneWorkspace(dir);
    } else {
        messages.push(`${dir} is not a directory!\n`);
    }
});

if(messages.length > 0) {
    console.warn(messages.join('\n'));
    process.exit(1);
}

function checkIsDirectory(directory) {
    try {
        const stats = fs.lstatSync(directory);
        return stats.isDirectory();
    } catch(e) {
        return false;
    }
}

function checkOneWorkspace(dir) {
    const repositories = glob.sync('*/.git', {cwd: dir, absolute: true}).map(path.dirname);


    const foundMessage = `Found ${repositories.length} git repositories at ${dir}, checking for stashes:`;
    messages.push(foundMessage);

    repositories.forEach(repo => {
        const stashList = childProcess.execFileSync('git', ['stash', 'list'], {cwd: repo})
            .toString()
            .trim()
            .split(/[\r\n]+/)
            .filter(s => {
                return s.length > 0;
            });

        if(stashList.length > 0) {
            messages.push('', `  ${repo}`);
            stashList.forEach(stash => {
                messages.push(`    ${stash}`);
            });
        }
    });
}

function printHelp() {
    console.log('git-list-stashes /path/to/workspace [...more paths] [options]');
    console.log();
    console.log('Options:');
    console.log('  -v, --version    print version');
    console.log('  -h, --help       print help');
}
