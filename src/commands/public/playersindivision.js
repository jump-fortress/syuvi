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
          { name: "Diamodn", value: "Diamond"},
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

    if (division.name === "Diamond" && division.class === "Demo") {
       await interaction.editReply(`❌ Diamond Demo is not a valid role.`);
     } else {
    const playersInDivision = getPlayersInDivision(division);

    const embed = new EmbedBuilder()
      .setColor("A69ED7")
      .setAuthor({ name: `${division.name} ${division.class}` })
      .setDescription(
        playersInDivision
          ? inlineCode(playersInDivision.map((player) => player.display_name).join(", "))
          : "\u200b",
      );

    interaction.editReply({ embeds: [embed] });
     }
  },
};
