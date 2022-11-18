import express from "express";
import cors from "cors";
import {
  getAllFilesAndFolders,
  getAllFilesAndFoldersJSON,
  getFileMatches,
} from "./logic";
import ora from "ora";
import chalk from "chalk";

const app = express();
const port = 5000;

app.use(cors());

app.get("/", (req: any, res: any) => {
  res.status(200).send("Scanner running");
});

app.get("/all_files", async (req: any, res: any) => {
  const repoFolder: string = req.query.repoFolder as string;
  const result = await getAllFilesAndFolders(repoFolder);
  res.send(result);
});

app.get("/files", (req: any, res: any) => {
  const repoFolder = req.query.repoFolder;
  if (typeof repoFolder === "string") {
    const result = getAllFilesAndFoldersJSON(repoFolder);
    if (result == null) {
      res.status(500).send(`Error scanning provided folder: ${repoFolder}`);
    } else {
      res.send(result);
    }
  } else {
    res.status(422).send("Incorrect input");
  }
});

app.get("/matches", async (req: any, res: any) => {
  const repoFolder = req.query.repoFolder;
  if (typeof repoFolder === "string") {
    const result1 = await getAllFilesAndFolders(repoFolder);
    let result2;

    let success = true;

    if (result1 == null) {
      success = false;
    } else {
      result2 = await getFileMatches(result1);
      if (result2 == null) {
        success = false;
      }
    }

    if (success) {
      res.send(result2);
    } else {
      res.status(500).send(`Error scanning provided folder: ${repoFolder}`);
    }
  } else {
    res.status(422).send("Incorrect input");
  }
});

let spinner = ora().start("Starting scanner on port 5000").start();
app
  .listen(port, () => {
    spinner.succeed("Scanner started");
  })
  .on("error", (err) => {
    spinner.fail(chalk.bgRed(`Error starting scanner: ${err.message}`));
  });
