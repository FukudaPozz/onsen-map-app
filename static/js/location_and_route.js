/* 変数定義 */
let currentLocationMarker = null;   // 現在地マーカー
let watchId = null;                 // 現在地追跡用のID
let isTracking = false;             // 追跡中フラグ
let routeLine = null;               // ルートライン

/* 
 * 現在地の表示処理
*/
function showCurrentLocation() {
    // ブラウザがgeolocationAPIをサポートしているか確認
    // navigator は ブラウザが提供するグローバルオブジェクト
    if (!navigator.geolocation) {
        alert("位置情報が取得できません");
        return;
    }

    // 現在地を取得してマーカーを表示する
    // ブラウザの現在地取得API利用して現在地を取得する(getCurrentPosition)
    navigator.geolocation.getCurrentPosition(position => {
        
        const lat = position.coords.latitude;   // 緯度
        const lon = position.coords.longitude;  // 経度
        // すでにあるマーカーを削除
        if (currentLocationMarker) {
            map.removeLayer(currentLocationMarker);
        }
        
        // 現在地マーカーを作成して地図に追加
        // L.markerはLeaflet.jsの地図上にピンを指す関数addTo(map)で実際に地図に追加している
        currentLocationMarker = L.marker([lat, lon], {
            // 現在地アイコンを指定
            icon: L.icon({
                iconUrl: '/static/img/my-location.png',
                iconSize: [32, 40],
                iconAnchor: [16, 16]
            })
        }).addTo(map)   
        .bindPopup("現在地")            // ポップアップをピンにくっつける関数
        .openPopup();                   // ポップアップを表示する関数
        map.setView([lat, lon], 14);    // 地図の中心を移動させる関数（座標は現在地を指定している）
    }, error => {
        alert("位置情報の取得に失敗しました");
        console.error(error);
    });
}

/*
 *　現在地の追跡を開始・停止する関数
 *  追跡中はボタンのテキストを「🛑追跡停止」に変更し、追跡を停止すると「📍現在地」に戻す
 */
function toggleTracking() {
    // トグルボタン取得
    const btn = document.getElementById("trackingBtn");
    // 追跡中の場合
    if (isTracking) {
        // リアルタイムに現在地を取得していた “監視モード” を終了する
        navigator.geolocation.clearWatch(watchId);
        watchId = null;                 // 監視IDをクリア
        isTracking = false;             // 追跡中フラグをfalseにする
        btn.textContent = "📍現在地";   // ボタンテキストを変更
    } else {
        // 追跡中でない場合は追跡を開始する
        // ブラウザがgeolocationAPIをサポートしているか確認
        if (!navigator.geolocation) {
            alert("位置情報が取得できません");
            return;
        }

        // watchPosition：ユーザーの位置を継続的に監視して、変化があったら通知してくれる関数
        // 上記に対して一度だけユーザーの位置を取得するのが getCurrentPosition
        watchId = navigator.geolocation.watchPosition(position => {
            const lat = position.coords.latitude;   // 緯度
            const lon = position.coords.longitude;  // 経度

            // 現在地マーカーが既に存在する場合は位置を更新
            if (currentLocationMarker) {
                // マーカーの位置を更新
                currentLocationMarker.setLatLng([lat, lon]);
            } else {
                // マーカーが存在しない場合は新規作成
                currentLocationMarker = L.marker([lat, lon], {
                    // 現在地アイコンを指定
                    icon: L.icon({
                        iconUrl: '/static/img/my-location.png',
                        iconSize: [32, 42],
                        iconAnchor: [16, 16]
                    })
                }).addTo(map)           // 地図に追加
                .bindPopup("現在地")    // ポップアップをピンにくっつける
                .openPopup();           // ポップアップを表示する
            }
            // 地図の中心を現在地に移動
            map.setView([lat, lon], 14);
        }, error => {
            console.error("追跡エラー:", error);
            alert("位置の追跡に失敗しました");
        }, {
            // 位置情報の取得オプション設定
            enableHighAccuracy: true,   // 高精度な位置情報を要求
            maximumAge: 10000,          // 位置情報のキャッシュを10秒間有効にする
            timeout: 10000              // 位置情報の取得タイムアウトを10秒に設定
        });

        isTracking = true;              // 追跡中フラグをtrueにする
        btn.textContent = "🛑 追跡停止";// ボタンの表示変更
    }
}

/**
 * 現在地から水源までのルートを表示する関数
 */
function drawRouteToSpringWater(springWater) {

    // ブラウザがgeolocationAPIをサポートしているか確認
    if (!navigator.geolocation) {
        alert("位置情報が取得できません");
        return;
    }

    // 現在地の取得
    navigator.geolocation.getCurrentPosition(position => {
        // 現在地の座標を取得
        const lat = position.coords.latitude;   // 緯度
        const lon = position.coords.longitude;  // 経度
        const start = `${lon},${lat}`;

        // 水源の座標を取得
        const end = `${springWater.lon},${springWater.lat}`;    // 水源の座標
        const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${start}&end=${end}`;
        
        // openrouteserviceのAPIを使ってルート検索
        fetch(url)
        .then(res => res.json())    // resをjsonに変換  
        .then(data => { 
            // ルートの座標を取得して地図に表示
            const coords = data.features[0].geometry.coordinates.map(root => [root[1], root[0]]);
            if (routeLine) {
                map.removeLayer(routeLine);
            }
            routeLine = L.polyline(coords, { color: 'blue', weight: 5 }).addTo(map);
            map.fitBounds(routeLine.getBounds());
        })
        .catch(err => {
            console.error("ルート取得失敗:", err);
            alert("ルートが取得できませんでした");
        });
    }, error => {
        alert("現在地の取得に失敗しました");
        console.error(error);
    });
}
