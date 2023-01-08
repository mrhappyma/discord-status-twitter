import { PrismaClient } from "@prisma/client";
import {
  ActionRowBuilder,
  ActivityType,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  MessageActionRowComponentBuilder,
} from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.GuildPresences, GatewayIntentBits.Guilds],
});
const prisma = new PrismaClient();

client.on("presenceUpdate", async (oldPresence, newPresence) => {
  console.log("it was triggerd at least");
  if (newPresence.user?.id != "606526727753170969") return;
  if (newPresence.activities[0].type != ActivityType.Custom) return;
  if (!newPresence.activities[0].state) return;
  console.log("got past checks");
  let existing = await prisma.alreadySent.findUnique({
    where: {
      status: newPresence.activities[0].state,
    },
  });
  if (existing) return;
  console.log("doesnt already exist");
  await prisma.alreadySent.create({
    data: {
      status: newPresence.activities[0].state,
    },
  });
  let dmChannel = await newPresence.user.createDM();
  const embed = new EmbedBuilder()
    .setTitle("Tweet new status?")
    .setDescription(newPresence.activities[0].state)
    .setColor("#00acee");
  const actionRow =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("no")
        .setLabel("no")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("yes")
        .setLabel("Tweet It!")
        .setStyle(ButtonStyle.Primary)
    );
  await dmChannel.send({
    embeds: [embed],
    components: [actionRow],
  });
  console.log("sent!");
});

client.on("ready", () => {
  console.log("client is ready!");
});

client.on("interactionCreate", (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId == "no") {
      interaction.message.delete();
    }
    if (interaction.customId == "yes") {
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
