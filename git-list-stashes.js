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

const workspaces = argv._.map(ws => path.resolve(ws));

if(workspaces.length < 1) {
    workspaces.push(process.cwd());
}

const messages = [];

workspaces.forEach(ws => {
    if(checkIsDirectory(ws)) {
        checkOneWorkspace(ws);
    } else {
        messages.push(`${ws} is not a directory!\n`);
    }
});

if(messages.length > 0) {
    console.warn(messages.join('\n'), '\n');
    process.exit(1);
} else {
    console.log('None found.');
}

function checkIsDirectory(directory) {
    try {
        const stats = fs.lstatSync(directory);
        return stats.isDirectory();
    } catch(e) {
        return false;
    }
}

function checkOneWorkspace(ws) {
    const repositories =
        Array.prototype.concat(
            glob.sync('*/.git/', {cwd: ws, absolute: true}).map(path.dirname),
            glob.sync('.git/', {cwd: ws, absolute: true}).map(path.dirname)
        );

    const foundMessage = repositories.length > 0
        ? `Found ${repositories.length} git repositories at ${ws}, checking for stashes:`
        : `No git repositories found at ${ws}`;

    console.log(foundMessage);

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
    console.log('git-list-stashes [/path/to/workspace] [...more paths] [...or path/to/repo] [options]');
    console.log();
    console.log('Options:');
    console.log('  -v, --version    print version');
    console.log('  -h, --help       print help');
}
