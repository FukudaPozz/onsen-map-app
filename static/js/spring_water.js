// 飲用可の湧水を表示するアイコン
const iconDrinkable = L.icon({ 
    iconUrl: '/static/img/cup-water.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32] });

// 飲用不可の湧水を表示するアイコン
const iconNotDrinkable = L.icon({ 
    iconUrl: '/static/img/waterdrop.png', 
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32] });

let markers = new Map();

// 湧水情報の取得と表示
function loadSpringWater() {
  // 地図の現在の表示範囲を取得
  const bounds = map.getBounds();
  // 表示範囲の南西と北東の座標を取得して、bboxパラメータを作成
  const bbox = [
    bounds.getSouth(), bounds.getWest(),
    bounds.getNorth(), bounds.getEast()
  ].join(",");
  
  fetch(`/api/spring_water?bbox=${bbox}`)
    .then(res => res.json())
    .then(data => {
      const newKeys = new Set();
      
      data.forEach(springWater => {
        const key = `${springWater.lat},${springWater.lon}`;
        newKeys.add(key);

        if (!markers.has(key)) {
          const icon = (springWater.drinkable === "yes") ? iconDrinkable : iconNotDrinkable;
          const marker = L.marker([springWater.lat, springWater.lon], { icon })
              .addTo(map)
              .bindPopup(`
                <div class="popup-content">
                  <h3>${springWater.name}</h3>
                  <p>${springWater.description || "詳細情報なし"}</p>
                  <p><strong>${springWater.drinkable === "yes" ? "🥤 飲用可" : "🚫 飲用不可"}</strong></p>
                  <button onclick='drawRouteToSpringWater(${JSON.stringify(springWater)})'>ここまでの経路</button>
                </div>
            `);
          markers.set(key, marker);
        }
      });

      // 不要になったマーカーを削除
      for (let [key, marker] of markers.entries()) {
        if (!newKeys.has(key)) {
          map.removeLayer(marker);
          markers.delete(key);
        }
      }
    });
}
