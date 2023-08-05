function getCommands(string) {
  string = string.replace("!", "");
  return string.split(" ");
}

module.exports = { getCommands };
