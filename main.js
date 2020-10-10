const core = require("@actions/core")
const github = require("@actions/github")
const shell = require("shelljs")
const yaml = require("js-yaml")
const fs = require("fs")

const context = github.context

const branch = "docs"

// User defined input
const jazzyVersion = core.getInput("version")
const configFilePath = core.getInput("config")
const jazzyArgs = core.getInput("args")
const token = core.getInput("personal_access_token")

const remote = `https://${token}@github.com/${context.repo.owner}/${context.repo.repo}.git`


const installJazzy = () => {
    let str = "sudo gem install jazzy"

    if (jazzyVersion) {
        str += `-v ${jazzyVersion}`
    }
    return str
}

const execute = () => {
    shell.exec(installJazzy())
}

try {
    execute()
}catch (e){
    core.setFailed(e.message)
}