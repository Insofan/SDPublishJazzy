const core = require("@actions/core");
const github = require("@actions/github");
const shell = require("shelljs");

const context = github.context;
const repoName = context.repo.repo;

// User defined input
const configPath = core.getInput("config_path");
const jazzyVersion = core.getInput("jazzy_version");
const token = core.getInput("personal_access_token");

const remote = `https://${token}@github.com/${context.repo.owner}/${repoName}.git`;
const docRemote = `https://${token}@github.com/SDWebImage/sdwebimage.github.io.git`;
const docRepoName = "sdwebimage.github.io";

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

const mkdirs = () => {
  shell.exec(`mkdir ../${repoName}`);
  shell.exec(`mkdir ../${docRepoName}`);
};

const setGit = () => {
  //   config git
  shell.exec(`git config user.name ${context.actor}`);
  shell.exec(`git config user.email ${context.actor}@users.noreply.github.com`);
  shell.exec(`git clone ${docRemote} ../${docRepoName}`);
};

const execute = () => {
  mkdirs();
  setGit();

  shell.exec(installJazzy());
  ver = shell.exec("git tag -l --sort -version:refname | head -n 1");
  shell.exec(genJazzy(ver));

  // wait for del
  shell.exec(`cd ../${docRepoName}`);
  shell.exec("git checkout -b action origin/action");
  shell.exec(`cd ../${repoName}`);

  shell.exec(`rm -rf ../${docRepoName}/${repoName}`);
  shell.exec(`cp -r ../${repoName} ../${docRepoName}/.`);
  shell.exec(`cd ../${docRepoName}`);
  shell.exec("git add .");
  shell.exec(`git commit -m 'update: ${repoName} ${ver}'`);
  shell.exec(`git push`);
};

try {
  execute();
} catch (e) {
  core.setFailed(e.message);
}
