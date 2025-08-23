import { divisionRoleIds } from "../lib/guild-ids.js";
import { getPlayer, createPlayer, updatePlayerDivision } from "../lib/database.js";

async function memberJoin(member) {
  let player = getPlayer(member.id);
  if (player) {
    const roles = member.guild.roles.cache;
    if (player.soldier_division) {
      const soldierRole = roles.get(divisionRoleIds.get(`${player.soldier_division} Soldier`));
      await member.roles.add(soldierRole);
    }
    if (player.demo_division) {
      const demoRole = roles.get(divisionRoleIds.get(`${player.demo_division} Demo`));
      await member.roles.add(demoRole);
    }
  } else {
    // TODO: temporary measure when expecting an influx of members
    player = createPlayer(member.id, member.displayName);

    let division = {
      class: "Soldier",
      name: "Wood",
    };
    updatePlayerDivision(member.id, division);
    division.class = "Demo";
    updatePlayerDivision(member.id, division);

    const roles = member.guild.roles.cache;

    const soldierRole = roles.get(divisionRoleIds.get(`Wood Soldier`));
    await member.roles.add(soldierRole);
    const demoRole = roles.get(divisionRoleIds.get(`Wood Demo`));
    await member.roles.add(demoRole);
  }
}

export { memberJoin };
