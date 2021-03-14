// import { map } from "@bothaven/common";
import { npcs } from "@bothaven/common";
import { Command } from "discord-akairo";
import { TextChannel } from "discord.js";
import { GuildChannel } from "discord.js";
import { Message } from "discord.js";
import { stringify } from "node:querystring";
import { stables } from "../../client";

export enum Cities {
    "ALDOURMIL",
    "ELESRITH",
    "STRAASHIRE"
}
export type CityKeys = keyof typeof Cities;

class City {
    name: CityKeys;
    passages: CityKeys[]
    constructor(options: {name: CityKeys, passages: CityKeys[]}){
        const {name, passages} = options;
        this.name = name;
        this.passages = passages;
    }
}
class MapOfAlbion {
    cities: Map<CityKeys, City>;
    constructor(cities: City[]){
        this.cities = new Map<CityKeys, City>()
        cities.forEach((c) => this.cities.set(c.name, c));
    }
}
const elesrith = new City({name: "ELESRITH", passages: ["ALDOURMIL"]})
const aldourmil = new City({name: "ALDOURMIL", passages: ["ELESRITH"]})
const straashire = new City({name: "STRAASHIRE", passages: ["ELESRITH"]});
const map = new MapOfAlbion([elesrith, aldourmil, straashire]);

export default class Stables extends Command {
    constructor(){
        super("stables", {
            aliases: ["stables"],
            category: "utility",
            channel: "guild",
        })
    }

    *args(message: Message){
        const channel: GuildChannel = yield {type: "channel", prompt: { start: "channel"}};
        
        const category = channel.parent?.name;
        if(stables.has(category?.toUpperCase() as CityKeys)) return message.reply(`${channel} already exists.`);
        const city = map.cities.get(category?.toUpperCase() as CityKeys);
        if(!city) return message.reply("bad channel");

        return {city, channel};        
    }

    exec(message: Message, args: {city: City, channel: TextChannel} | undefined){
        if(!args) return;
        const {city, channel} = args;
        const fields = city.passages.map((e, i) => ({name: (i + 1),value: e.toLocaleLowerCase()}))

        console.log("hi")
        channel.send(new npcs.bots.Killgarah().think({description: "test"}).addFields(fields))
            .then((sentMessage) => {
                const channel = sentMessage.channel as GuildChannel;
                stables.set(channel.parent?.name.toUpperCase() as CityKeys, sentMessage);

                /* COLLECTOR */
                //TODO refactor to function to use upon start for existing stables
                const collector = sentMessage.createReactionCollector(() => true, {time: 3e5,max: 1})
                collector.on("collect", (r, u) => {
                    r.users.remove(u);
                })
            })
    }
}