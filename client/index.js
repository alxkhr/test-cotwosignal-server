async function render() {
  const canvas = document.getElementById('canvas');
  const canvasContext = canvas.getContext('2d');
  const response = await fetch('/signals');
  if (response.ok) {
    const signals = await response.json();
    signals.sort((a, b) => (a.timestamp > b.timestamp ? 1 : b.timestamp > a.timestamp ? -1 : 0));
    const weeks = {};
    signals.forEach((s) => {
      const date = new Date(s.timestamp);
      const [yearNo, weekNo] = getWeekNumber(date);
      const weekNumber = `${yearNo}-${weekNo.toString().padStart(2, '0')}`;
      if (weeks[weekNumber]) {
        weeks[weekNumber].push({ ...s, date });
      } else {
        weeks[weekNumber] = [{ ...s, date }];
      }
    });
    canvas.width = window.innerWidth;
    canvas.height = Object.values(weeks).length * 100;
    Object.entries(weeks).forEach(([weekNumber, weekSignals], index) => {
      canvasContext.beginPath();
      const baseY = 100 * (index + 1);
      canvasContext.moveTo(0, baseY);
      weekSignals.forEach((s) => {
        const posX =
          (window.innerWidth / 7) * ((s.date.getUTCDay() || 7) - 1) +
          (window.innerWidth / 168) * s.date.getUTCHours() +
          (window.innerWidth / 10080) * s.date.getUTCMinutes();
        canvasContext.lineTo(posX, baseY - s.good);
      });
      canvasContext.stroke();
    });
  }
}

function getWeekNumber(incD) {
  // Copy date so don't modify original
  const d = new Date(Date.UTC(incD.getFullYear(), incD.getMonth(), incD.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  // Return array of year and week number
  return [d.getUTCFullYear(), weekNo];
}

render();
