import { useEffect, useState } from "react";

export const usePrayerTimes = () => {
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pakai koordinat default langsung, tidak perlu minta geolocation
    fetch(
      "https://api.aladhan.com/v1/timings?latitude=-6.6&longitude=106.8&method=11",
    )
      .then((res) => res.json())
      .then((data) => {
        const timings = data.data.timings;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const prayerList = [
          { name: "Subuh", time: timings.Fajr },
          { name: "Dzuhur", time: timings.Dhuhr },
          { name: "Ashar", time: timings.Asr },
          { name: "Maghrib", time: timings.Maghrib },
          { name: "Isya", time: timings.Isha },
        ];

        const active =
          prayerList.find((p) => {
            const [h, m] = p.time.split(":");
            return currentMinutes < parseInt(h) * 60 + parseInt(m);
          }) || prayerList[0];

        setCurrentPrayer(active);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // fetch sekali saja

  return { currentPrayer, loading };
};
