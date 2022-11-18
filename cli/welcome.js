import chalk from "chalk";
import clear from "clear";
import ora from "ora";
import gradient from "gradient-string";
import simpleGit from "simple-git";
import { fileURLToPath } from "url";
import { dirname } from "path";

const logo = `
   8888888888                     
  88        88        88 88888888                88            88    88  88     
 88     88   88             88                                 88    88  88                 
88    88      88      88    88 88     88      88 88 8888888    88    88  88       
88     88     88      88    88  88   88 88   88  88 88    88   88    88  88             
 88    88    88       88    88   88 88   88 88   88 88    88   88    88  88              
  88   88   88        88    88    88      88     88 88    88    888888   88                  
   8888888888                  
`;

const printHeader = () => {
  console.log(gradient("#f848f6", "#354fff")(logo));
  console.log(chalk.bold("iTwinUI Migration Tool"));
  console.log("∙ iTwinUI:         v0 > v1");
  console.log("∙ iTwinUI-react:   v1 > v2");
};

const runCli = async () => {
  clear();
  printHeader();
  console.log("");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  let spinner = ora("Checking for tool updates (recommended)").start();

  try {
    const git = simpleGit(__dirname);
    await git.pull();
    spinner.succeed("😎 You have the latest version of the tool");
  } catch (e) {
    spinner.fail(
      `Error running "git pull". Try running "git pull" manually (recommended)`
    );
  }
};

runCli();
