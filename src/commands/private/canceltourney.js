import { SlashCommandBuilder, PermissionFlagsBits, inlineCode } from "discord.js";
import { confirmRow } from "../../lib/components.js";
import { cancelActiveTourney, getActiveTourney } from "../../lib/database.js";

async function tryConfirm(message, interaction, tourney) {
  const filter = (i) => i.user.id === interaction.user.id;

  try {
    const confirmResponse = await message.awaitMessageComponent({
      filter,
      time: 30_000,
    });
    switch (confirmResponse.customId) {
      case "cancel":
        {
          await confirmResponse.update({
            components: [], // remove confirm row
          });
        }
        await interaction.channel.send(`❌ Canceled command.`);
        break;
      case "confirm": {
        cancelActiveTourney(tourney.id);

        const activeTourney = getActiveTourney() ?? null;
        if (activeTourney && activeTourney.id === tourney.id) {
          await interaction.channel.send(`❌ Tried to cancel tourney, but it still exists..`);
        } else if (activeTourney) {
          await interaction.channel.send(
            `❌ Tried to delete tourney, but still found another upcoming ${activeTourney.class} tourney starting at ${activeTourney.starts_at}. If this is the tourney you meant to cancel, something's gone wrong.`,
          );
        } else {
          await interaction.channel.send(
            `✅ Tourney canceled, and no other upcoming tourney found.`,
          );
          await message.delete();
          setTimeout(function () {
            throw new Error("force crashing to refresh job changes..");
          }, 5_000);
        }
        break;
      }
      default: {
        console.log(`ERROR: unexpected confirmResponse.customId '${confirmResponse.customId}'`);
        break;
      }
    }
  } catch (error) {
    console.log(error);
    console.log("/createtourney tryConfirm() error");

    await message.edit({
      content: `❌ Timed out after 30 seconds or ran into an error.. canceled command.`,
      components: [],
    });
  }
}

const command = new SlashCommandBuilder()
  .setName("canceltourney")
  .setDescription("cancel the most recent upcoming tourney")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

async function executeCommand(interaction) {
  await interaction.deferReply(); //thinking...

  const tourney = getActiveTourney() ?? null;
  if (!tourney) {
    await interaction.editReply("❌ No upcoming tourney found.");
    return;
  }

  const channel = await interaction.channel;
  await interaction.editReply({
    content: `Active tourney found with maps..
${tourney.class === "Soldier" ? `Diamond Map: ${inlineCode(tourney.diamond_map)}` : ``}
Platinum / Gold Map: ${inlineCode(tourney.plat_gold_map)}
Silver Map: ${inlineCode(tourney.silver_map)}
Bronze Map: ${inlineCode(tourney.bronze_map)}
Steel Map: ${inlineCode(tourney.steel_map)}
Wood Map: ${inlineCode(tourney.wood_map)}`,
  });

  const confirmMessage = await channel.send({
    content: `Really cancel this tourney?`,
    components: [confirmRow],
    withResponse: true,
  });

  try {
    tryConfirm(confirmMessage, interaction, tourney);
  } catch (error) {
    console.log(error);
    console.log("/canceltourney error");
  }
}

export default {
  data: command,
  execute: executeCommand,
};
