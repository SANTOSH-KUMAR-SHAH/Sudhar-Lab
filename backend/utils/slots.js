function generateDailySlots(startHour = 9, endHour = 19, durationMins = 60) {
  const slots = [];
  let current = startHour * 60;
  const end = endHour * 60;

  while (current + durationMins <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += durationMins;
  }
  return slots;
}

function makeSlotDate(dateYmd, hhmm) {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  const d = new Date(dateYmd + "T00:00:00");
  d.setHours(h, m, 0, 0);
  return d;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

module.exports = {
  generateDailySlots,
  makeSlotDate,
  rangesOverlap,
};
