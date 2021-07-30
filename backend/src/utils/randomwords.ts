import wordlist from "../assets/wordlist.json";

export const getRandomWords = (count: number, seperator: string) => {
  const output = [];
  for (let i = 0; i < count; i++) {
    output.push(wordlist[(wordlist.length * Math.random()) | 0]);
  }
  return output.join(seperator);
};
