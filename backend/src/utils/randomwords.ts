import fs from "fs";
import path from "path";

const wordlist: string[] = [];

fs.readFile(path.join(__dirname, "..", "assets", "wordlist.txt"), "utf-8", (err, data) => {
  wordlist.push(...data.split("\n"));
});

export const getRandomWords = (count: number, seperator: string) => {
  const output = [];
  for (let i = 0; i < count; i++) {
    output.push(wordlist[(wordlist.length * Math.random()) | 0]);
  }
  return output.join(seperator);
};
