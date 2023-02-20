import wpp from "whatsapp-web.js";
import QRCode from "qrcode";
import * as dotenv from "dotenv";
import storage from "node-persist";
import getLiveStreams from "./getStreamInfo.js";
import { isOn, turnOff, turnOn } from "./hueApi.js";
import { getMatches } from "./getMatches.js";
import getImage from "../ia-image-generator/getImage.js";
import getCommands from "./getCommands.js";

dotenv.config();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const client = new wpp.Client();
let admins;
let streamers;
await storage.init();

client.on("qr", (qr) => {
  QRCode.toString(qr, { type: "terminal", small: true }, function (err, url) {
    console.log(url);
  });
});

client.on("ready", async () => {
  console.log("Client is ready!");
  admins = await storage.getItem("admins");
  streamers = await storage.getItem("streamers");
});

client.on("message", async (msg) => {
  if (msg.body[0] == "!") {
    let [command, arg] = getCommands(msg.body);
    if (command == "streams") {
      client.sendMessage(msg.from, await getLiveStreams(streamers));
    } else if (command == "isOn" && admins.includes(msg.from)) {
      let light = parseInt(arg);
      if (!isNaN(light))
        client.sendMessage(
          msg.from,
          (await isOn(light)) ? "Encendidas" : "Apagadas"
        );
    } else if (command == "turnOn" && admins.includes(msg.from)) {
      let light = parseInt(arg);
      if (!isNaN(light)) turnOn(light);
    } else if (command == "turnOff" && admins.includes(msg.from)) {
      let light = parseInt(arg);
      if (!isNaN(light)) turnOff(light);
    } else if (command == "aldosivi") {
      client.sendMessage(msg.from, await getMatches(22));
    } else if (command == "matches") {
      let team = parseInt(arg);
      if (isNaN(team))
        client.sendMessage(
          msg.from,
          "Error: Compruebe haber insertado el team id correctamente (!matches {id})"
        );
      else client.sendMessage(msg.from, await getMatches(team));
    } else if (command == "login") {
      if (arg == process.env.PASSWORD && !admins.includes(msg.from)) {
        client.sendMessage(msg.from, "Sucessfully loged");
        admins.push(msg.from);
        await storage.set("admins", admins);
      }
    } else if (command == "image") {
      const mMedia = await wpp.MessageMedia.fromUrl(await getImage(arg));
      client.sendMessage(msg.from, mMedia);
    } else if (command == "help") {
      client.sendMessage(
        msg.from,
        "🤖 Comandos:\n-!streams\n-!aldosivi\n-!matches {team id} (ex:!matches 5)\n-!image {description}(ex:!image messi)\n-!login password"
      );
    }
  }
});

client.initialize();
