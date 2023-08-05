const fetch=require("node-fetch")
require("dotenv").config()


exports.getLiveStreams=async (streamerArray)=>{
  let string;
  let url="https://api.twitch.tv/helix/streams?"
  for (let i of streamerArray){
    url=url+`user_login=${i}&`
  }
  let response = await fetch(
    url,
    {
      method: "GET",
      headers: {
        Authorization: process.env.TWITCH_AUTH,
        "Client-Id": process.env.TWITCH_CLIENT_ID,
      },
    }
  );
  response = await response.json();
  response = response.data;
  response=response.sort((a,b)=>a.user_name.localeCompare(b.user_name))
  if (response.length > 0) {
    string = "Canales favoritos en vivo:\n";
    for (let i of response) {
      string = string + `🔴 ${i.user_name} (twitch.tv/${i.user_name}) \n`;
    }
    string = string.slice(0, -1);
  } else string = "Ninguno de tus streamers favoritos está en vivo 🥺";
  return string;
}
