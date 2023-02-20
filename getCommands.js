export default (string) => {
  let i = 0;
  while (string[i] != " "&&i<string.length) {
    i++;
  }
  return [string.slice(1,i),string.slice(i+1)]
};
