import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, PermissionsAndroid, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Config from 'react-native-config';
import Geolocation from '@react-native-community/geolocation';

const kakaoJsKey = Config.KAKAO_JS_KEY;

const GuesthouseMap = () => {
  const webViewRef = useRef(null);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('위치 권한 거부됨');
          return;
        }
      }
      Geolocation.getCurrentPosition(
        position => {
          console.log('RN 위치', position.coords);
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          console.log('RN 위치 에러', error);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    };
    requestPermission();
  }, []);

  const rawHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Kakao Map with RN</title>
      <style>
        html, body, #map {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }
        .price-overlay {
          background-color: #FF5A5F;
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
          white-space: nowrap;
          text-align: center;
        }
      </style>
      <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=__KAKAO_JS_KEY__"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        function handleMessage(e) {
          try {
            var data = JSON.parse(e.data);
            var lat = data.lat;
            var lng = data.lng;
            console.log("WebView 좌표 수신", lat, lng);

            var container = document.getElementById('map');
            var options = {
              center: new kakao.maps.LatLng(lat, lng),
              level: 3
            };

            var map = new kakao.maps.Map(container, options);

            var content = '<div class="price-overlay">₩10,000</div>';
            var position = new kakao.maps.LatLng(lat, lng);

            var customOverlay = new kakao.maps.CustomOverlay({
              position: position,
              content: content,
              yAnchor: 1
            });
            customOverlay.setMap(map);
          } catch (error) {
            console.log("handleMessage error", error);
          }
        }

        document.addEventListener("message", handleMessage);
        window.addEventListener("message", handleMessage);
      </script>
    </body>
    </html>
  `;

  const html = rawHtml.replace('__KAKAO_JS_KEY__', kakaoJsKey);

  // RN → WebView 좌표 전달
  useEffect(() => {
    if (coords && webViewRef.current) {
      console.log('좌표 WebView에 전달', coords);
      webViewRef.current.postMessage(JSON.stringify(coords));
    }
  }, [coords]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        style={styles.webview}
        onMessage={(e) => {
          console.log('[WebView log]', e.nativeEvent.data);
        }}
      />
    </View>
  );
};

export default GuesthouseMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
