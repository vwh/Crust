// utils/stdlib.ts | Reads all files from the stdlib folder and combines them into one string

import { promises as fs } from "node:fs";
import * as path from "node:path";

export async function readCrustFilesFromStdlib(): Promise<string> {
  const folderPath = path.join(__dirname, "..", "stdlib");

  let files: string[];
  try {
    files = await fs.readdir(folderPath);
  } catch (error) {
    console.error(`Error reading directory ${folderPath}:`, error);
    throw error;
  }

  const crustFiles = files.filter((file) => file.endsWith(".crust"));

  const fileContents = await Promise.all(
    crustFiles.map(async (file) => {
      const filePath = path.join(folderPath, file);
      try {
        return await fs.readFile(filePath, "utf8");
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return "";
      }
    })
  );

  return fileContents.join("");
}
