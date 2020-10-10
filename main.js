const core = require("@actions/core");
const toolkit = require("actions-toolkit");
const shell = require("shelljs");
const yaml = require("js-yaml");
const fs = require("fs");

const context = toolkit.context;

const branch = "docs";

// User defined input
const configPath = core.getInput("config_path");
const jazzyVersion = core.getInput("jazzy_version");
const token = core.getInput("personal_access_token");

const remote = `https://${token}@github.com/${context.repo.owner}/${context.repo.repo}.git`;

const installJazzy = () => {
  let str = "sudo gem install jazzy";

  if (jazzyVersion) {
    str += `-v ${jazzyVersion}`;
  }
  return str;
};

const genJazzy = (ver) => {
  if (configPath) {
    return `jazzy --config .jazzy.yaml --module-version ${ver}`;
  }
  return "jazzy";
};

const execute = () => {
  shell.exec(installJazzy());
  ver = shell.exec("git tag -l --sort -version:refname | head -n 1");
  shell.exec(genJazzy(ver));
};

try {
  execute();
} catch (e) {
  core.setFailed(e.message);
}
