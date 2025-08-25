function formatSteamURL(steam_id32) {
  const Y = parseInt(steam_id32.charAt(steam_id32.indexOf(":") + 1));
  const W = parseInt(steam_id32.substring(steam_id32.lastIndexOf(":") + 1)) * 2 + Y;
  const steam_url = `https://steamcommunity.com/profiles/[U:1:${W}]`;
  return steam_url;
}

function getTourneyMap(tourney, division) {
  switch (division) {
    case "Platinum":
    case "Gold":
      return tourney.plat_gold_map;
    case "Silver":
      return tourney.silver_map;
    case "Bronze":
      return tourney.bronze_map;
    case "Steel":
      return tourney.steel_map;
    case "Wood":
      return tourney.wood_map;
    default:
      console.log(`getTourneyMap() error: couldn't find a tourney map..`);
  }
}

// time = SS.sss
function formatTime(time, verified = true) {
  let minutes = Math.floor(time / 60);
  let seconds = Math.floor(time) - minutes * 60;
  let centiseconds = Math.round((time % 1).toFixed(3) * 100);

  if (centiseconds === 100) {
    centiseconds = 0;
    seconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
  }

  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}${verified ? "" : " ❔"}`;
  return formattedTime;
}

function getTimeSectionsArray(time) {
  const partRegex = /\d{1,2}/g;
  return time.match(partRegex);
}

function isValidTime(time) {
  const validRegex = /^((\d{0,2}):)?(\d{2}).(\d{2})$/g;
  return validRegex.test(time);
}

function getDivisionNames(tourneyClass) {
  const divisions = ["Platinum", "Gold", "Silver", "Bronze", "Steel", "Wood", "No Division"];

  // if (tourneyClass === "Soldier") {
  //divisions.push("Wood");
  // }

  //divisions.push("No Division");

  // i know
  if (tourneyClass) {
    return divisions;
  } else {
    return divisions;
  }
}

export {
  formatSteamURL,
  getTourneyMap,
  formatTime,
  getDivisionNames,
  getTimeSectionsArray,
  isValidTime,
};
