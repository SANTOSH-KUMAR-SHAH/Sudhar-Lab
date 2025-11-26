function getDayAndTime(date) {
  const d = new Date(date);
  const day = d.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
  const time = d
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .trim();

  return { day, time };
}

module.exports = getDayAndTime;
