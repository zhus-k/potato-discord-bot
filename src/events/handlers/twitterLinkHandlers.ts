import { Message } from "discord.js";

module.exports = [
  {
    name: "onTwitterLinkPost",
    async execute(msg: Message) {
      // console.log("2: ", msg);
      msg.suppressEmbeds(true);
      const first = msg.content.split(' ')?.[0];
      console.log(first);
    },
  },
  {
    name: "onTwitterLinkUpdate",
    async execute(msg: Message) {
      // console.log("3: ", msg);
    },
  },
];
