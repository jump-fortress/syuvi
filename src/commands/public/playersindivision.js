import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, inlineCode } from "discord.js";
import { getPlayersInDivision } from "../../lib/database.js";

export default {
  data: new SlashCommandBuilder()
    .setName("playersindivision")
    .setDescription("view all players in a division")
    .setDefaultMemberPermissions(PermissionFlagsBits.CreatePrivateThreads)
    .addStringOption((option) =>
      option
        .setName("class")
        .setDescription("division class")
        .setRequired(true)
        .addChoices({ name: "Soldier", value: "Soldier" }, { name: "Demo", value: "Demo" }),
    )
    .addStringOption((option) =>
      option
        .setName("division")
        .setDescription("division name")
        .setRequired(true)
        .addChoices(
          { name: "Diamond", value: "Diamond" },
          { name: "Platinum", value: "Platinum" },
          { name: "Gold", value: "Gold" },
          { name: "Silver", value: "Silver" },
          { name: "Bronze", value: "Bronze" },
          { name: "Steel", value: "Steel" },
          { name: "Wood", value: "Wood" },
        ),
    ),
  async execute(interaction) {
    await interaction.deferReply(); //thinking...
    const divisionClass = interaction.options.getString("class");
    const divisionName = interaction.options.getString("division");
    const division = {
      class: divisionClass,
      name: divisionName,
    };

    const playersInDivision = getPlayersInDivision(division);

    // split players to account for 4096 character message limit
    let playersInDivisionSplit = [];
    const playersPerEmbed = 200;
    for (let i = 0; i < playersInDivision.length; i += playersPerEmbed) {
      playersInDivisionSplit.push(playersInDivision.slice(i, i + playersPerEmbed));
    }

    for (let i = 0; i < playersInDivisionSplit.length; i++) {
      const embed = new EmbedBuilder()
        .setColor("A69ED7")
        .setAuthor({ name: `${division.name} ${division.class}` })
        .setDescription(
          playersInDivisionSplit[i]
            ? inlineCode(playersInDivisionSplit[i].map((player) => player.display_name).join(", "))
            : "\u200b",
        );

      if (i === 0) {
        interaction.editReply({ embeds: [embed] });
      } else {
        interaction.followUp({ embeds: [embed] });
      }
    }
  },
};
