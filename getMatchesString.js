import {
  getMatchesById,
  getMatchesToday,
  getLiveMatches,
} from "../promiedos/index.js";

export async function getMatchesByIdString(id) {
  let response = await getMatchesById(id);
  let string = `Proximos partidos de ${response.teamname}:`;
  let date;
  for (let i of response.matches) {
    date = i.day;
    if (date == "A Conf.") {
      date = " TBD ";
    }
    string =
      string + `\n${date} | ${i.hoa == "H" ? "L" : "V"} vs ${i.against}`;
  }
  return string;
}

export async function getTodayMatchesString() {
  let response = await getMatchesToday();
  let string = `⚽ Partidos de hoy:`;
  for (let i of response) {
    string = string + `\n${i.time} - ${i.localTeam} vs ${i.awayTeam}`;
  }
  if (response.length > 0) return string;
  else return "No hay hay partidos para el dia de hoy";
}

export async function getLiveMatchesString() {
  let response = await getLiveMatches();
  let string = "⚽ Partidos en vivo:";
  for (let i of response) {
    string =
      string +
      `\n${i.time} | ${i.localTeam} [${i.localScore}] - [${i.awayScore}] ${i.awayTeam}`;
  }
  if (response.length > 0) return string;
  else return "No hay partidos en vivo";
}
