import fs from "fs";

export default function () {
  try {
    let streamers = [];
    const data = fs.readFileSync("./streamers.dat", "utf-8");
    const lines = data.split(/\r?\n/);
    lines.forEach((line) => {
      streamers.push(line);
    });
    return streamers;
  } catch (error) {
    console.log(error);
  }
}
