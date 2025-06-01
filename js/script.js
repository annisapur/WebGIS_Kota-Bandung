// --- Basemap ---
const basemapOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
});
const osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
});
const baseMapGoogle = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: 'Map by <a href="https://maps.google.com/">Google</a>',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
const baseMapGoogleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: 'Map by <a href="https://maps.google.com/">Google</a>',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

// --- Inisialisasi Map ---
const homeCoords = [-6.91194, 107.60972]; // Koordinat Bandung
const homeZoom = 13;
const map = L.map('map', {
    center: homeCoords,
    zoom: homeZoom,
    layers: [basemapOSM]
});

// --- Layer Data ---
const jembatanPT = new L.LayerGroup();
$.getJSON("./asset/data-spasial/jembatan_pt.geojson", function (data) {
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 5,
                fillColor: "#9dfc03",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }
    }).addTo(jembatanPT);
});

const adminKelurahanAR = new L.LayerGroup();
$.getJSON("./asset/data-spasial/admin_kelurahan_ln.geojson", function (data) {
    L.geoJSON(data, {
        style: {
            color: "black",
            weight: 2,
            opacity: 1,
            dashArray: '3,3,20,3,20,3,20,3,20,3,20',
            lineJoin: 'round'
        }
    }).addTo(adminKelurahanAR);
});

const landcover = new L.LayerGroup();
$.getJSON("./asset/data-spasial/landcover_ar.geojson", function (data) {
    L.geoJSON(data, {
        style: function(feature) {
            switch (feature.properties.REMARK) {
                case 'Danau/Situ': 
                case 'Empang': 
                case 'Sungai':
                    return {fillColor:"#97DBF2", fillOpacity: 0.8, weight: 0.5, color: "#4065EB"};
                case 'Hutan Rimba': 
                    return {fillColor:"#38A800", fillOpacity: 0.8, color: "#38A800"};
                case 'Perkebunan/Kebun': 
                    return {fillColor:"#E9FFBE", fillOpacity: 0.8, color: "#E9FFBE"};
                case 'Permukiman dan Tempat Kegiatan': 
                    return {fillColor:"#FFBEBE", fillOpacity: 0.8, weight: 0.5, color: "#FB0101"};
                case 'Sawah': 
                    return {fillColor:"#01FBBB", fillOpacity: 0.8, weight: 0.5, color: "#4065EB"};
                case 'Semak Belukar': 
                    return {fillColor:"#FDFDFD", fillOpacity: 0.8, weight: 0.5, color: "#00A52F"};
                case 'Tanah Kosong/Gundul': 
                    return {fillColor:"#FDFDFD", fillOpacity: 0.8, weight: 0.5, color: "#000000"};
                case 'Tegalan/Ladang': 
                    return {fillColor:"#EDFF85", fillOpacity: 0.8, color: "#EDFF85"};
                case 'Vegetasi Non Budidaya Lainnya': 
                    return {fillColor:"#000000", fillOpacity: 0.8, weight: 0.5, color: "#000000"};
                default:
                    return {fillColor: "#FFFFFF", fillOpacity: 0.5, weight: 0.5, color: "#000000"};
            }
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup('<b>Tutupan Lahan: </b>' + feature.properties.REMARK);
        }
    }).addTo(landcover);
});

// --- Layer Control ---
const baseMaps = {
    "OpenStreetMap": basemapOSM,
    "OSM Humanitarian": osmHOT,
    "Google Map": baseMapGoogle,
    "Google Satellite": baseMapGoogleSatellite
};
const overlayMaps = {
    "Jembatan": jembatanPT,
    "Batas Administrasi": adminKelurahanAR,
    "Tutupan Lahan": landcover
};
L.control.layers(baseMaps, overlayMaps).addTo(map);

// --- Fitur Full Screen ---
// Pastikan sudah memuat plugin Leaflet.fullscreen JS & CSS
L.control.fullscreen({
    position: 'topleft',
    title: {
        'false': 'View Fullscreen',
        'true': 'Exit Fullscreen'
    }
}).addTo(map); // [2][8]

// --- Fitur Home (Reset View) ---
const homeControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.backgroundColor = 'white';
        container.style.width = '30px';
        container.style.height = '30px';
        container.style.cursor = 'pointer';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.title = 'Kembali ke Home';
        container.innerHTML = '🏠';
        container.onclick = function() {
            map.setView(homeCoords, homeZoom);
        };
        L.DomEvent.disableClickPropagation(container);
        return container;
    }
});
map.addControl(new homeControl());

// --- Fitur My Location ---
// Pastikan sudah memuat plugin Leaflet.Locate JS & CSS
L.control.locate({
    position: 'topleft',
    flyTo: true,
    strings: {
        title: "Lokasi Saya"
    },
    locateOptions: {
        enableHighAccuracy: true
    }
}).addTo(map);

// Legenda
let legend = L.control({ position: "topright" });

legend.onAdd = function () {
    let div = L.DomUtil.create("div", "legend");
    div.style.backgroundColor = "white";
    div.style.padding = "10px";
    div.style.border = "2px solid #ccc";
    div.style.borderRadius = "5px";
    div.style.boxShadow = "0 0 15px rgba(0,0,0,0.2)";
    div.style.fontFamily = "Arial, sans-serif";
    div.style.lineHeight = "1.4";
    div.style.minWidth = "150px";

    div.innerHTML =
        // Judul Legenda
        '<p style="font-size: 18px; font-weight: bold; margin-bottom: 10px; margin-top: 0;">Legenda</p>' +

        // Infrastruktur
        '<p style="font-size: 14px; font-weight: bold; margin-bottom: 5px; margin-top: 10px;">Infrastruktur</p>' +
        '<div style="display: flex; align-items: center; margin-bottom: 5px;">' +
            '<svg width="30" height="20" style="flex-shrink:0;">' +
                '<circle cx="15" cy="10" r="6" fill="#9dfc03" stroke="black" stroke-width="1"/>' +
            '</svg>' +
            '<span style="margin-left: 8px;">Jembatan</span>' +
        '</div>' +

        // Batas Administrasi
        '<p style="font-size: 14px; font-weight: bold; margin-bottom: 5px; margin-top: 15px;">Batas Administrasi</p>' +
        '<div style="display: flex; align-items: center; margin-bottom: 5px;">' +
            '<svg width="30" height="20" style="flex-shrink:0;">' +
                '<line x1="0" y1="10" x2="30" y2="10" stroke="black" stroke-width="2" stroke-dasharray="10 1 1 1 1 1 1 1 1 1"/>' +
            '</svg>' +
            '<span style="margin-left: 8px;">Batas Desa/Kelurahan</span>' +
        '</div>' +

        // Tutupan Lahan
        '<p style="font-size: 14px; font-weight: bold; margin-bottom: 5px; margin-top: 15px;">Tutupan Lahan</p>' +

        // Fungsi untuk membuat kotak warna dengan label
        createColorBox("#97DBF2", "Danau/Situ") +
        createColorBox("#97DBF2", "Empang") +
        createColorBox("#38A800", "Hutan Rimba") +
        createColorBox("#E9FFBE", "Perkebunan/Kebun") +
        createColorBox("#FFBEBE", "Permukiman dan Tempat Kegiatan") +
        createColorBox("#01FBBB", "Sawah") +
        createColorBox("#FDFDFD", "Semak Belukar") +
        createColorBox("#97DBF2", "Sungai") +
        createColorBox("#FDFDFD", "Tanah Kosong/Gundul") +
        createColorBox("#EDFF85", "Tegalan/Ladang") +
        createColorBox("#000000", "Vegetasi Non Budidaya Lainnya");

    return div;
};

// Fungsi pembantu membuat kotak warna dengan label
function createColorBox(color, label) {
    return `
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 18px; height: 18px; background-color: ${color}; border: 1px solid #000;"></div>
            <span style="margin-left: 8px;">${label}</span>
        </div>
    `;
}

legend.addTo(map);

