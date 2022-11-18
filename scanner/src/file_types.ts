/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
export type MatchLine = {
  line_number: number;
  line: string;
  replace: string;
  with: string;
  type: "autoswap" | "manual" | "suggestion";
  description?: string;
  changed: boolean;
};

export type MatchFile = {
  fileName: string;
  matchLines: MatchLine[];
};

export type MatchRule = {
  replace: string;
  with: string;
  is_regex: boolean;
  type: "autoswap" | "manual" | "suggestion";
  description: string;
};
