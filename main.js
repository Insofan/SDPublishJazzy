const core = require("@actions/core");
const github = require("@actions/github");
const shell = require("shelljs");
// const yaml = require("js-yaml");
// const fs = require("fs");

const context = github.context;
const repoName = ontext.repo.repo;

// const branch = "docs";

// User defined input
const configPath = core.getInput("config_path");
const jazzyVersion = core.getInput("jazzy_version");
const token = core.getInput("personal_access_token");

const remote = `https://${token}@github.com/${context.repo.owner}/${repoName}.git`;

const installJazzy = () => {
  let str = "sudo gem install jazzy";

  if (jazzyVersion) {
    str += `-v ${jazzyVersion}`;
  }
  return str;
};

const genJazzy = (ver) => {
  if (configPath) {
    return `jazzy --config .jazzy.yaml --module-version ${ver} --ouutput ../${repoName}`;
  }
  return "jazzy";
};

const execute = () => {
  let docRepoName = "sdwebimage.github.io"
  shell.exec(`mkdir ../${repoName}`);
  shell.exec(`mkdir ../${docRepoName}`)

  shell.exec(installJazzy());
  ver = shell.exec("git tag -l --sort -version:refname | head -n 1");
  shell.exec(genJazzy(ver));

//   config git
    shell.exec(`git config user.name ${context.actor}`)
    shell.exec(`git config user.email ${context.actor}@users.noreply.github.com`)
    shell.exec(`git clone git@github.com:SDWebImage/sdwebimage.github.io.git ../${docRepoName}`)

// wait for del
    shell.exec("git checkout -b action origin/action")

    shell.exec(`rm -rf ../${docRepoName}/${repoName}`)
    shell.exec(`cp ../${repoName} ../${docRepoName}/.`)
    shell.exec(`cd ../${docRepoName}`)
    shell.exec("git add .")
    shell.exec(`git commit -m 'update: ${repoName} ${ver}'`)
    shell.exec(`git push --force origin master:action`)

};

try {
  execute();
} catch (e) {
  core.setFailed(e.message);
}
