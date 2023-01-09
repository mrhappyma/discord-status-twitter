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
import { TwitterApi } from "twitter-api-v2";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.GuildPresences, GatewayIntentBits.Guilds],
});
const prisma = new PrismaClient();
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

client.on("presenceUpdate", async (oldPresence, newPresence) => {
  console.log("it was triggerd at least");
  if (newPresence.user?.id != "606526727753170969") return;
  if (!newPresence.activities[0]) return
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

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId == "no") {
      interaction.update({ components: [] });
      prisma.alreadySent.delete({
        where: {
          status: interaction.message.embeds[0].description ?? undefined,
        },
      });
    }
    if (interaction.customId == "yes") {
      let tweet = await twitterClient.v2.tweet(
        //@ts-ignore
        interaction.message.embeds[0].description
      );
      let actionRow =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("View tweet")
            .setStyle(ButtonStyle.Link)
            .setURL("https://twitter.com/user____exe/status/" + tweet.data.id)
        );
      let embed = EmbedBuilder.from(interaction.message.embeds[0]).setTitle(
        "Tweeted!"
      );
      interaction.update({ components: [actionRow], embeds: [embed] });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
