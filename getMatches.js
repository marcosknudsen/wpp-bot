import matches from "../promiedos/index.js"

export async function getMatches(id){
    let response=await matches(id);
    let string=`Proximos partidos de ${response.teamname}:\n`;
    let fecha;
    let date;
    for (let i of response.matches){
        date=i.day
        if (date=="A Conf."){
            date=" TBD "
        }
        fecha=parseInt(i.matchN)
        string=string+(`${date} | ${i.hoa=="H"?"L":"V"} vs ${i.against}\n`)
    }
    return string;
}