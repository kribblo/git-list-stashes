# git-list-stashes

Finds and lists open git stashes in many git repositories.

If you have one or a few workspaces with several git repositories, and you (or maybe your IDE) make git stashes that are forgotten, this tool will list them for you.

## Usage

    git-list-stashes /path/to/workspace [...more paths] [options]
    
If there are any stashes found or other problems, the script exits with code 1 + writes a report to STDERR, so it can for instance be used in a script for automated checks.  
    
### Options

    -v, --version    print version
    -h, --help       print help

## Install

    npm install -g git-list-stashes

Needs [node](https://nodejs.org/) installed and also the `git` binary somewhere on the `PATH`.
