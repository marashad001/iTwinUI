/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { exec } from "child_process";
import { MatchLine, MatchRule } from "./file_types";
const fs = require("fs");
const dirTree = require("directory-tree");
import { DirectoryTree } from "directory-tree";

export const getAllFilesAndFoldersJSON = (repoFolder: string) => {
  if (!repoFolder) {
    return null;
  }
  const tree: DirectoryTree = dirTree(repoFolder);
  return tree;
};

const readFile = (fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, "utf8", (err: any, data: string) => {
      if (err) {
        console.error(err);
      }
      resolve(data);
    });
  });
};

const readFileGetLines = async (fileName: string) => {
  const fileContents = await readFile(fileName);
  return fileContents.split("\n");
};

export const getLineMatches = async (
  fileName: string
): Promise<
  [
    {
      fileName: string;
      matchLines: MatchLine[];
    },
    number
  ]
> => {
  const matches: MatchLine[] = [];
  const rulesFileContents = await readFile(`${__dirname}/rules.json`);
  const rules: MatchRule[] = JSON.parse(rulesFileContents);
  const fileLines = await readFileGetLines(fileName);

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
      } else {
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
};

const implementLineMatchChange = (
  lines: string[],
  lineMatch: MatchLine,
  shouldUndo: boolean
) => {
  if (
    (!shouldUndo && lines[lineMatch.line_number - 1] !== lineMatch.line) ||
    (shouldUndo &&
      lines[lineMatch.line_number - 1] !==
        lineMatch.line.replace(lineMatch.replace, lineMatch.with))
  ) {
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

  lines[lineMatch.line_number - 1] = lines[lineMatch.line_number - 1].replace(
    !shouldUndo ? lineMatch.replace : lineMatch.with,
    !shouldUndo ? lineMatch.with : lineMatch.replace
  );

  return {
    success: true,
    lines: lines,
    changed: !shouldUndo,
  };
};

export const implementLineMatchChanges = async ({
  fileName,
  lineMatches,
  shouldUndo,
}: {
  fileName: string;
  lineMatches: MatchLine[];
  shouldUndo: boolean;
}) => {
  return new Promise(async (resolve, reject) => {
    const lines = await readFileGetLines(fileName);
    const successes = [];
    const changedLines = [];

    for (let lineMatch of lineMatches) {
      const result = implementLineMatchChange(lines, lineMatch, shouldUndo);
      successes.push(result.success);
      changedLines.push(result.changed);
    }

    fs.writeFile(fileName, lines.join("\n"), (err: any, data: any) => {
      if (err) {
        console.error(err);
      }
    });

    resolve({
      successes,
      changedLines,
    });
  });
};

export const getFileMatches = async (fileNames: string[]) => {
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

    const [fileMatch, numLines] = await getLineMatches(fileName);
    numFilesScanned++;
    numLinesScanned += numLines;

    // Push only if at least one match is found in the file
    if (fileMatch.matchLines.length > 0) {
      fileMatches.push(fileMatch);
    }
  }

  return fileMatches;
};

export const getAllFilesAndFolders = (
  repoFolder: string
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const command = `cd ${repoFolder} && git ls-files --full-name`;
    exec(command, (error, stdout, stderr) => {
      const allFiles = stdout.split("\n").map((r) => `${repoFolder}/${r}`);
      resolve(allFiles);
    });
  });
};

exports.getAllFilesAndFolders = getAllFilesAndFolders;
exports.getAllFilesAndFoldersJSON = getAllFilesAndFoldersJSON;
exports.getFileMatches = getFileMatches;
