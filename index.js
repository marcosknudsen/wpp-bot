import wpp from "whatsapp-web.js";
import QRCode from "qrcode";
import * as dotenv from "dotenv";
import getLiveStreams from "./getStreamInfo.js";
import { isOn, turnOff, turnOn } from "./hueApi.js";
import { getMatches } from "./getMatches.js";
import getStreamers from "./refreshStreamers.js";
import getImage from "../ia-image-generator/getImage.js"

dotenv.config();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const client = new wpp.Client();

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  QRCode.toString(qr, { type: "terminal", small: true }, function (err, url) {
    console.log(url);
  });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  if (msg.body == "!streams") {
    client.sendMessage(msg.from, await getLiveStreams(getStreamers()));
  } else if (
    msg.body.startsWith("!isOn") &&
    msg.from.startsWith(process.env.KANU_NUMBER)
  ) {
    let light = parseInt(msg.body.replace("!isOn ", ""));
    if (!isNaN(light))
      client.sendMessage(
        msg.from,
        (await isOn(light)) ? "Encendidas" : "Apagadas"
      );
  } else if (
    msg.body.startsWith("!turnOn") &&
    msg.from.startsWith(process.env.KANU_NUMBER)
  ) {
    let light = parseInt(msg.body.replace("!turnOn ", ""));
    if (!isNaN(light)) turnOn(light);
  } else if (
    msg.body.startsWith("!turnOff") &&
    msg.from.startsWith(process.env.KANU_NUMBER)
  ) {
    let light = parseInt(msg.body.replace("!turnOff ", ""));
    if (!isNaN(light)) turnOff(light);
  } else if (msg.body.startsWith("!aldosivi")) {
    client.sendMessage(msg.from, await getMatches(22));
  } else if (msg.body.startsWith("!matches")) {
    let team = parseInt(msg.body.replace("!matches ", ""));
    if (isNaN(team))
      client.sendMessage(
        msg.from,
        "Error: Compruebe haber insertado el team id correctamente (!matches {id})"
      );
    else client.sendMessage(msg.from, await getMatches(team));
  }
  else if(msg.body.startsWith("!image ")){
    let request=msg.body.replace("!image ","")
    const mMedia=await wpp.MessageMedia.fromUrl(await getImage(request))
    client.sendMessage(msg.from,mMedia)
  }
  else if (msg.body.startsWith("!help")){
    client.sendMessage(msg.from,"🤖 Comandos:\n-!streams\n-!aldosivi\n-!matches {team id}\n-!image {description}")
  }
});

client.initialize();
