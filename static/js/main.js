const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQ3ZjA5ZDYwYjJmNTQ5Zjc4YzkzNDk5YTk1MWU3MWU3IiwiaCI6Im11cm11cjY0In0=";  // ← 実際のAPIキー

const map = L.map('map').setView([35.0, 135.0], 8);

L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors'
}).addTo(map);

map.on("moveend", loadSpringWater);
loadSpringWater();

document.getElementById("searchBox").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const query = this.value;
    if (!query) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          alert("場所が見つかりませんでした");
          return;
        }
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        map.setView([lat, lon], 12);
      });
  }
});