import {
  getMatchesById,
  getMatchesToday,
  getLiveMatches,
  getTodayResults,
  getYesterdayResults,
  getTomorrowMatches
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

export async function getMatchesString(today) {
  let response 
  if (today)
    response=await getMatchesToday();
  else
    response=await getTomorrowMatches()
  let string = `⚽ Partidos de ${today?"hoy":"mañana"}:`;
  for (let i of response) {
    string = string + `\n${i.time} - ${i.localTeam} vs ${i.awayTeam}`;
  }
  if (response.length > 0) return string;
  else return `No hay hay partidos para el dia de ${today?"hoy":"mañana"}`;
}

export async function getLiveMatchesString() {
  let response = await getLiveMatches();
  let string = "⚽ Partidos en vivo:";
  for (let i of response) {
    string =
      string +
      `\n${i.localTeam} [${i.localScore}] - [${i.awayScore}] ${i.awayTeam}`;
  }
  if (response.length > 0) return string;
  else return "No hay partidos en vivo";
}

export async function getResultsString(today){
  let response
  let string=`⚽ Resultados de ${today?"hoy":"ayer"}:`
  if (today)
    response=await getTodayResults();
  else
    response=await getYesterdayResults()
  for (let i of response){
    string=string+`\n${i.localTeam} [${i.localScore}] - [${i.awayScore}] ${i.awayTeam}`
  }
  if (response.length>0)return string
  else return `Aún no hay resultados de ${today?"hoy":"ayer"}`
}
