const promiedos = require("../promiedos/index.js");

exports.getMatchesByIdString = async (id) => {
  let response = await promiedos.getMatchesById(id);
  let string = `Proximos partidos de ${response.teamname}:`;
  let date;
  for (let i of response.matches) {
    date = i.day;
    if (date == "A Conf.") {
      date = " TBD ";
    }
    string = string + `\n${date} | ${i.hoa == "H" ? "L" : "V"} vs ${i.against}`;
  }
  return string;
};

exports.getMatchesString = async (today) => {
  let response;
  if (today) response = await promiedos.getMatchesToday();
  else response = await promiedos.getTomorrowMatches();
  let string = `⚽ Partidos de ${today ? "hoy" : "mañana"}:`;
  for (let i of response) {
    string = string + `\n${i.time} - ${i.localTeam} vs ${i.awayTeam}`;
  }
  if (response.length > 0) return string;
  else return `No hay hay partidos para el dia de ${today ? "hoy" : "mañana"}`;
};

exports.getLiveMatchesString = async () => {
  let response = await promiedos.getLiveMatches();
  let string = "⚽ Partidos en vivo:";
  for (let i of response) {
    string =
      string +
      `\n${i.localTeam} [${i.localScore}] - [${i.awayScore}] ${i.awayTeam}`;
  }
  if (response.length > 0) return string;
  else return "No hay partidos en vivo";
};

exports.getResultsString = async (today) => {
  let response;
  let string = `⚽ Resultados de ${today ? "hoy" : "ayer"}:`;
  if (today) response = await promiedos.getTodayResults();
  else response = await promiedos.getYesterdayResults();
  for (let i of response) {
    string =
      string +
      `\n${i.localTeam} [${i.localScore}] - [${i.awayScore}] ${i.awayTeam}`;
  }
  if (response.length > 0) return string;
  else return `Aún no hay resultados de ${today ? "hoy" : "ayer"}`;
};
