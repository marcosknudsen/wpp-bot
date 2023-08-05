function getMessage(string) {
  string = string.replace("!", "");
  if (
    string.indexOf("(") != -1 &&
    string.indexOf(")") != -1 &&
    string.indexOf("(") < string.indexOf(")")
  ) {
    message = string.slice(string.indexOf("("), string.indexOf(")") + 1);
    string = string.replace(message, "");
    string = string.split(" ");
    string[1] = message.replaceAll("(", "").replaceAll(")", "");
    return string;
  } else {
    return string.split(" ");
  }
}

module.exports = { getMessage };
