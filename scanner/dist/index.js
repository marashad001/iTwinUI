"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logic_1 = require("./logic");
// import chalk from "chalk";
// const logic = require("./logic");
// const ora = require("ora");
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const app = (0, express_1.default)();
const port = 5000;
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.status(200).send("Scanner running");
});
app.get("/all_files", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoFolder = req.query.repoFolder;
    const result = yield (0, logic_1.getAllFilesAndFolders)(repoFolder);
    res.send(result);
}));
app.get("/files", (req, res) => {
    const repoFolder = req.query.repoFolder;
    if (typeof repoFolder === "string") {
        const result = (0, logic_1.getAllFilesAndFoldersJSON)(repoFolder);
        if (result == null) {
            res.status(500).send(`Error scanning provided folder: ${repoFolder}`);
        }
        else {
            res.send(result);
        }
    }
    else {
        res.status(422).send("Incorrect input");
    }
});
app.get("/matches", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoFolder = req.query.repoFolder;
    if (typeof repoFolder === "string") {
        const result1 = yield (0, logic_1.getAllFilesAndFolders)(repoFolder);
        let result2;
        let success = true;
        if (result1 == null) {
            success = false;
        }
        else {
            result2 = yield (0, logic_1.getFileMatches)(result1);
            if (result2 == null) {
                success = false;
            }
        }
        if (success) {
            res.send(result2);
        }
        else {
            res.status(500).send(`Error scanning provided folder: ${repoFolder}`);
        }
    }
    else {
        res.status(422).send("Incorrect input");
    }
}));
let spinner = (0, ora_1.default)().start("Starting scanner on port 5000").start();
app
    .listen(port, () => {
    // console.log(`Scanner started`);
    spinner.succeed("Scanner started");
    // console.log("∙ Starting webapp");
    // spinner = ora("Starting webapp on port 3000").start();
    // exec("npx serve ../webapp", (error, stdout, stderr) => {
    //   console.log("ERR:", error, stdout, stderr);
    //   if (error) {
    //     spinner.fail(`Error starting webapp: ${chalk.red(stderr)}`);
    //   } else {
    //     spinner.succeed("Webapp started");
    //   }
    // });
})
    .on("error", (err) => {
    // console.log(chalk.red(`Error starting scanner: ${err.message}`));
    spinner.fail(chalk_1.default.bgRed(`Error starting scanner: ${err.message}`));
    // ora().start().fail(`Error starting scanner: ${err.name}`);
    // console.log("ERROR", err.name, err.message, err.stack);
    // if (err. .errn === "EADDRINUSE") {
    //   console.log("port busy");
    // } else {
    //   console.log(err);
    // }
});
