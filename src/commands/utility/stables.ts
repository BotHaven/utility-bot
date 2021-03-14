// import { map } from "@bothaven/common";
import { npcs } from "@bothaven/common";
import { City, CityKeys, mapOfAlbion } from "@the-land-of-albion/common";
import { Command } from "discord-akairo";
import { GuildEmoji, TextChannel } from "discord.js";
import { Client } from "discord.js";
import { RoleResolvable } from "discord.js";
import { EmbedFieldData } from "discord.js";
import { GuildChannel } from "discord.js";
import { Message } from "discord.js";
import { stringify } from "node:querystring";
import { stables } from "../../client";


export default class Stables extends Command {
    constructor(){
        super("stables", {
            editable: true,
            aliases: ["stables"],
            category: "utility",
            channel: "guild",
        })
    }

    *args(message: Message){
        const channel: GuildChannel = yield {type: "channel", prompt: { start: "channel"}};
        return {channel};        
    }

    exec(message: Message, args: {channel: TextChannel}){
        const {channel} = args;
        const cities = Array.from(mapOfAlbion.cities.values());
        interface CustomEmbedData {
            name: GuildEmoji | undefined,
            value: string,
            emoji: string;
            city: City;
        }
        const fields: CustomEmbedData[]  = cities.map((c) => ({name: getEmojiByName(this.client, c.emojiName), emoji: c.emojiName, value: `> ${c.name.toLocaleLowerCase()}`, city: c}))

        channel.send(new npcs.bots.Killgarah().think({description: "> Do you wish to travel somewhere?\n**Let me know by reacting to this message**"})
        .addFields(fields)
        )
            .then(async (sentMessage) => {
                const channel = sentMessage.channel as GuildChannel;
                let promises: any[]= []

                fields.forEach((field) => promises.push(sentMessage.react(getEmojiByName(this.client, field.emoji) as GuildEmoji)));
                await Promise.all(promises);

                new npcs.bots.Emerus().speak(message, {title: "Message created.", description: `**Feel free to take a look.**\n>${channel}`}); 
            })
    }
}

// Helpers
function getEmojiByName(client: Client, name: string){
    return client.emojis.cache.find((e) => e.name.toLocaleLowerCase() === name.toLocaleLowerCase());
}