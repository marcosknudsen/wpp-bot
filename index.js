import { Client } from "whatsapp-web.js";
import QRCode from "qrcode";
import * as dotenv from "dotenv";
import getLiveStreams from "./getStreamInfo.js";
import { isOn, turnOff, turnOn } from "./hueApi.js";
import { getMatches } from "./getMatches.js";

dotenv.config();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const client = new Client();

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
  if (msg.body == "!from") {
    switch (msg.from.substring(0, msg.from.length - 5)) {
      case process.env.KANU_NUMBER:
        client.sendMessage(msg.from, "KANU!");
        break;
      default:
        client.sendMessage(msg.from, "Im Sorry, Who are you?");
    }
  } else if (msg.body == "!streams") {
    client.sendMessage(
      msg.from,
      await getLiveStreams([
        "luquitarodriguez",
        "davooxeneize",
        "lacobraaa",
        "benitosdr",
        "caninarg",
        "gastonedul",
      ])
    );
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
    if (isNaN(team)) client.sendMessage(msg.from, "Error: Compruebe haber insertado el team id correctamente (!matches {id})");
    else client.sendMessage(msg.from, await getMatches(team));
  }
});

client.initialize();
