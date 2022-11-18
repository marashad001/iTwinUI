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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFilesAndFolders = exports.getFileMatches = exports.implementLineMatchChanges = exports.getLineMatches = exports.getAllFilesAndFoldersJSON = void 0;
/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
const child_process_1 = require("child_process");
const fs = require("fs");
const dirTree = require("directory-tree");
// import fs from "fs";
// import dirTree from "directory-tree";
const getAllFilesAndFoldersJSON = (repoFolder) => {
    if (!repoFolder) {
        return null;
    }
    const tree = dirTree(repoFolder);
    return tree;
};
exports.getAllFilesAndFoldersJSON = getAllFilesAndFoldersJSON;
const readFile = (fileName) => {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, "utf8", (err, data) => {
            if (err) {
                console.error(err);
            }
            resolve(data);
        });
    });
};
const readFileGetLines = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const fileContents = yield readFile(fileName);
    return fileContents.split("\n");
});
const getLineMatches = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const matches = [];
    const rulesFileContents = yield readFile(`${__dirname}/rules.json`);
    const rules = JSON.parse(rulesFileContents);
    const fileLines = yield readFileGetLines(fileName);
    let lineMatches;
    for (const [lineIndex, line] of fileLines.entries()) {
        for (const rule of rules) {
            if (!rule.is_regex) {
                if (line.indexOf(rule.replace) !== -1) {
                    matches.push({
                        line_number: lineIndex + 1,
                        line: line,
                        replace: rule.replace,
                        with: rule.with,
                        type: rule.type,
                        description: rule.description,
                        changed: false,
                    });
                }
            }
            else {
                lineMatches = line.match(new RegExp(rule.replace, "g"));
                if (lineMatches == null) {
                    continue;
                }
                for (const lineMatch of lineMatches) {
                    matches.push({
                        line_number: lineIndex + 1,
                        line: line,
                        replace: lineMatch,
                        with: rule.with,
                        type: rule.type,
                        description: rule.description,
                        changed: false,
                    });
                }
            }
        }
    }
    const matchObject = {
        fileName: fileName,
        matchLines: matches,
    };
    return [matchObject, fileLines.length];
});
exports.getLineMatches = getLineMatches;
const implementLineMatchChange = (lines, lineMatch, shouldUndo) => {
    if ((!shouldUndo && lines[lineMatch.line_number - 1] !== lineMatch.line) ||
        (shouldUndo &&
            lines[lineMatch.line_number - 1] !==
                lineMatch.line.replace(lineMatch.replace, lineMatch.with))) {
        return {
            success: false,
            lines: lines,
            changed: shouldUndo,
        };
    }
    if (lineMatch.type !== "autoswap") {
        return {
            success: false,
            lines: lines,
            changed: shouldUndo,
        };
    }
    lines[lineMatch.line_number - 1] = lines[lineMatch.line_number - 1].replace(!shouldUndo ? lineMatch.replace : lineMatch.with, !shouldUndo ? lineMatch.with : lineMatch.replace);
    return {
        success: true,
        lines: lines,
        changed: !shouldUndo,
    };
};
const implementLineMatchChanges = ({ fileName, lineMatches, shouldUndo, }) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        const lines = yield readFileGetLines(fileName);
        const successes = [];
        const changedLines = [];
        for (let lineMatch of lineMatches) {
            const result = implementLineMatchChange(lines, lineMatch, shouldUndo);
            successes.push(result.success);
            changedLines.push(result.changed);
        }
        fs.writeFile(fileName, lines.join("\n"), (err, data) => {
            if (err) {
                console.error(err);
            }
        });
        resolve({
            successes,
            changedLines,
        });
    }));
});
exports.implementLineMatchChanges = implementLineMatchChanges;
const getFileMatches = (fileNames) => __awaiter(void 0, void 0, void 0, function* () {
    const fileMatches = [];
    let numFilesScanned = 0;
    let numLinesScanned = 0;
    for (const fileName of fileNames) {
        const stats = fs.statSync(fileName);
        if (!stats.isFile()) {
            continue;
        }
        const fileExtension = fileName.split(".").pop();
        // Skip image type files
        if (["png", "jpg", "gif", "PNG", undefined].includes(fileExtension)) {
            continue;
        }
        const [fileMatch, numLines] = yield (0, exports.getLineMatches)(fileName);
        numFilesScanned++;
        numLinesScanned += numLines;
        // Push only if at least one match is found in the file
        if (fileMatch.matchLines.length > 0) {
            fileMatches.push(fileMatch);
        }
    }
    return fileMatches;
});
exports.getFileMatches = getFileMatches;
const getAllFilesAndFolders = (repoFolder) => {
    return new Promise((resolve, reject) => {
        const command = `cd ${repoFolder} && git ls-files --full-name`;
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            const allFiles = stdout.split("\n").map((r) => `${repoFolder}/${r}`);
            resolve(allFiles);
        });
    });
};
exports.getAllFilesAndFolders = getAllFilesAndFolders;
exports.getAllFilesAndFolders = exports.getAllFilesAndFolders;
exports.getAllFilesAndFoldersJSON = exports.getAllFilesAndFoldersJSON;
exports.getFileMatches = exports.getFileMatches;
