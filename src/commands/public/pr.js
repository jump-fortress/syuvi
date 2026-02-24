import {
  SlashCommandBuilder,
  EmbedBuilder,
  userMention,
  hyperlink,
  TimestampStyles,
  time as formatDiscordTime,
} from "discord.js";
import { getPlayer, createPlayer } from "../../lib/database.js";
import { getPlayerEmbed } from "../../lib/components.js";
import { formatTime } from "../../lib/shared-functions.js";

async function noTempusID(interaction, player) {
  if (!player.tempus_id) {
    await interaction.editReply({
      content: `Couldn't check your pr, as you're missing a Tempus ID.`,
      embeds: [getPlayerEmbed(interaction.user, player)],
    });
  }
}

async function getTempusTime(player, map, sel_class) {
  const response = await (
    await fetch(
      `https://tempus2.xyz/api/v0/maps/name/${map}/zones/typeindex/map/1/records/player/${player.tempus_id}/${sel_class}`,
    )
  ).json();
  return response;
}

function getVerifiedEmbed(user, time, tempusPRId, sel_class, map, date) {
  const embed = new EmbedBuilder().setColor("A69ED7").setThumbnail(user.avatarURL())
    .setDescription(`Tempus | (${sel_class}) ${userMention(user.id)} has a ${time}
on ${map} set ${formatDiscordTime(date, TimestampStyles.RelativeTime)}

${hyperlink("run details on Tempus", `https://tempus2.xyz/records/${tempusPRId}`)}`);
  return embed;
}

export default {
  data: new SlashCommandBuilder()
    .setName("pr")
    .setDescription("view your pr for a map")
    .addStringOption((option) =>
      option
        .setName("class")
        .setDescription("class name")
        .setRequired(true)
        .addChoices({ name: "Soldier", value: "Soldier" }, { name: "Demo", value: "Demo" }),
    )
    .addStringOption((option) =>
      option.setName("map").setDescription("full map name").setRequired(false),
    ),
  async execute(interaction) {
    await interaction.deferReply(); //thinking...
    const sel_class = interaction.options.getString("class");
    const map = interaction.options.getString("map");

    const member = interaction.member;
    const player = getPlayer(member.id) ?? createPlayer(member.id, member.displayName);

    if (!player.tempus_id) {
      noTempusID(interaction, player);
    }

    const response = await getTempusTime(player, map, sel_class === "Soldier" ? 3 : 4);
    console.log(response);
    const tempusTime = {
      id: response?.result.id,
      date: new Date(parseInt(response?.result.date * 1000)),
      time: response?.result.duration,
    };
    // no tempus PR, or tempus API down
    if (!tempusTime.id || !tempusTime.date || !tempusTime.time) {
      await interaction.editReply({
        content: `Couldn't find a Tempus PR. Check that the full map name is correct.`,
        embeds: [],
      });
    }
    // verified
    else if (tempusTime.date) {
      const embed = getVerifiedEmbed(
        interaction.user,
        formatTime(tempusTime.time),
        tempusTime.id,
        sel_class,
        map,
        tempusTime.date,
      );
      await interaction.editReply({ embeds: [embed] });
    }
    // todo fail message
    // unverified
  },
};
