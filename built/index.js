"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class botClient extends discord_js_1.Client {
}
const client = new botClient({
    intents: [discord_js_1.GatewayIntentBits.GuildPresences, discord_js_1.GatewayIntentBits.Guilds],
});
exports.prisma = new client_1.PrismaClient();
client.on("presenceUpdate", async (oldPresence, newPresence) => {
    console.log("it was triggerd at least");
    if (newPresence.user?.id != "606526727753170969")
        return;
    if (newPresence.activities[0].type != discord_js_1.ActivityType.Custom)
        return;
    if (!newPresence.activities[0].state)
        return;
    console.log("got past checks");
    let existing = await exports.prisma.alreadySent.findUnique({
        where: {
            status: newPresence.activities[0].state,
        },
    });
    if (existing)
        return;
    console.log("doesnt already exist");
    await exports.prisma.alreadySent.create({
        data: {
            status: newPresence.activities[0].state,
        },
    });
    let dmChannel = await newPresence.user.createDM();
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle("Tweet new status?")
        .setDescription(newPresence.activities[0].state)
        .setColor("#00acee");
    const actionRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("no")
        .setLabel("no")
        .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
        .setCustomId("yes")
        .setLabel("Tweet It!")
        .setStyle(discord_js_1.ButtonStyle.Primary));
    await dmChannel.send({
        embeds: [embed],
        components: [actionRow],
    });
    console.log("sent!");
});
client.on("ready", () => {
    console.log("client is ready!");
});
client.login(process.env.DISCORD_TOKEN);
