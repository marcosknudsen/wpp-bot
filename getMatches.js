import matches from "../promiedos/index.js"

export async function getMatches(id){
    let response=await matches(id);
    let string='Proximos partidos:\n';
    let fecha;
    let date;
    for (let i of response){
        date=i.dia
        if (date=="A Conf."){
            date=" TBD "
        }
        fecha=parseInt(i.fecha)
        string=string+(`${date} | ${i.lov} vs ${i.rival}\n`)
    }
    return string;
}