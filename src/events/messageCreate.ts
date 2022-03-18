import { Message } from "discord.js";

module.exports = [
  {
    name: "messageCreate",
    async execute(msg: Message) {
      const { client } = msg;
      if (/twitter.com/.test(msg.content.trim())) {
        client.emit("onTwitterLinkPost", msg);
      }
    },
  },
];
