import wpp from "whatsapp-web.js";
import QRCode from "qrcode";
import * as dotenv from "dotenv";
import storage from "node-persist";
import getLiveStreams from "./getStreamInfo.js";
import { isOn, turnOff, turnOn } from "../HUE/hue.js";
import {
  getLiveMatchesString,
  getMatchesByIdString,
  getMatchesString,
  getResultsString,
} from "./getMatchesString.js";
import getImage from "../ia-image-generator/getImage.js";
import getCommands from "./getCommands.js";
import { saveEvent } from "../events/index.js";

dotenv.config();

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
    let [command, ...arg] = getCommands(msg.body);
    try {
      switch (command.toLowerCase()) {
        case "streams":
          client.sendMessage(msg.from, await getLiveStreams(streamers));
          break;
        case "ison":
          if (isAdmin(msg.from)) {
            let light = parseInt(arg);
            if (!isNaN(light))
              client.sendMessage(
                msg.from,
                (await isOn(light)) ? "Encendidas" : "Apagadas"
              );
          }
          break;
        case "turnon":
          if (isAdmin(msg.from)) {
            let light = parseInt(arg);
            if (!isNaN(light)) turnOn(light);
          }
          break;
        case "turnoff":
          if (isAdmin(msg.from)) {
            let light = parseInt(arg);
            if (!isNaN(light)) turnOff(light);
          }
          break;
        case "aldosivi":
          client.sendMessage(
            msg.from,
            "🦈 " + (await getMatchesByIdString(22))
          );
          break;
        case "matches":
          let team = parseInt(arg);
          if (isNaN(team))
            client.sendMessage(
              msg.from,
              "Error: Compruebe haber insertado el team id correctamente (!matches {id})"
            );
          else client.sendMessage(msg.from, await getMatchesByIdString(team));
          break;
        case "login":
          if (arg == process.env.PASSWORD && !isAdmin(msg.from)) {
            client.sendMessage(msg.from, "Sucessfully loged");
            admins.push(msg.from);
            await storage.set("admins", admins);
          }
          break;
        case "image":
          if (isAdmin(msg.from)) {
            const mMedia = await wpp.MessageMedia.fromUrl(await getImage(arg));
            client.sendMessage(msg.from, mMedia);
          }
          break;
        case "help":
          client.sendMessage(
            msg.from,
            "🤖 Comandos:\n-!streams\n-!aldosivi\n-!matches {team id} (ex: !matches 5)\n-!todaymatches\n-!tomorrowmatches\n-!todayresults\n-!yesterdayresults\n-!image {description}(ex: !image messi)\n-!login password"
          );
          break;
        case "addstreamer":
          if (
            !streamers
              .map((x) => x.toUpperCase())
              .includes(arg.toUpperCase()) &&
            isAdmin(msg.from)
          ) {
            streamers.push(arg);
            storage.set("streamers", streamers);
          }
          break;
        case "removestreamer":
          if (isAdmin(msg.from)) {
            var index = streamers
              .map((x) => x.toUpperCase())
              .indexOf(arg.toUpperCase());
            if (index !== -1) {
              streamers.splice(index, 1);
            }
            storage.set("streamers", streamers);
          }
          break;
        case "todaymatches":
          client.sendMessage(msg.from, await getMatchesString(true));
          break;
        case "tomorrowmatches":
          client.sendMessage(msg.from, await getMatchesString(false));
          break;
        case "chelsea":
          client.sendMessage(
            msg.from,
            "🔵 " + (await getMatchesByIdString(531))
          );
          break;
        case "livematches":
          client.sendMessage(msg.from, await getLiveMatchesString());
          break;
        case "todayresults":
          client.sendMessage(msg.from, await getResultsString(true));
          break;
        case "yesterdayresults":
          client.sendMessage(msg.from, await getResultsString(false));
          break;
        case "setevent":
          let timeToEvent = saveEvent(arg[1], arg[2], arg[3], arg[4], arg[5]);
          setTimeout(() => client.sendMessage(msg.from, arg[0].replaceAll("_"," ")), timeToEvent);
          break;
        case "helpdate":
          client.sendMessage(msg.from,"!setEvent {mensaje usando _ sin espacios} {hora} {minuto} {dia} {mes} {año}")
          break;
        default:
          console.log("ERROR");
          client.sendMessage(
            msg.from,
            `Error: No se ha encontrado el comando "!${command}"`
          );
          break;
      }
    } catch (err) {
      console.log(err);
    }
  }
});

client.initialize();

function isAdmin(user) {
  return admins.includes(user);
}
