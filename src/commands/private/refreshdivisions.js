import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { updateAllPlayerDivisions } from "../../lib/database.js";
import { confirmRow } from "../../lib/components.js";

export default {
  data: new SlashCommandBuilder()
    .setName("refreshdivisions")
    .setDescription("refresh divisions for every player")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const response = await interaction.reply({
      content: `This command updates the divisions of every player according to their discord roles. Are you sure?`,
      components: [confirmRow],
      withResponse: true,
    });

    try {
      const filter = (i) => i.user.id === interaction.user.id;
      const confirmResponse = await response.resource.message.awaitMessageComponent({
        filter,
        time: 30_000,
      });
      if (confirmResponse.customId === "confirm") {
        const numUpdated = updateAllPlayerDivisions(await interaction.guild.members.fetch());
        console.log(numUpdated);
        await interaction.editReply({
          content: `✅ Updated divisions for ${numUpdated} roles.`,
          components: [],
        });
      } else if (confirmResponse.customId === "cancel") {
        await interaction.editReply({
          content: `❌ Canceled command.`,
          components: [],
        });
      }
    } catch (error) {
      console.log(error);
      await interaction.editReply({
        content: `❌ Timed out after 30 seconds or ran into an error.. canceled command.`,
        components: [],
      });
    }
  },
};
