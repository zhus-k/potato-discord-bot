import { Message } from "discord.js";

module.exports = [
  {
    name: "messageUpdate",
    async execute(msg: Message) {
      const { client } = msg;
      if (/twitter.com/.test(msg.content.trim())) {
        client.emit("onTwitterLinkUpdate", msg);
      }
    },
  },
];
