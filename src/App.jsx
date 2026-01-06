import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, Clock, Map as MapIcon, Navigation, Sun, CloudRain, CheckCircle, Settings, Coffee, ShoppingBag, Ticket, Sparkles, AlertCircle, Key, Save, FolderOpen, Trash2, ArrowRight, CreditCard, PlusCircle, X, Globe, Umbrella, Baby, HeartPulse, Zap, Edit, RefreshCw, Plus, Locate, ZoomIn, ZoomOut, Maximize, Sliders, MapPin, Copy, RotateCcw, Image as ImageIcon } from 'lucide-react';

// --- 全域設定 ---
const apiKey = ""; // 預覽環境會自動注入 Key

// --- 地圖設定 ---
const FIXED_MAP_SRC = "/usj_map.jpg"; // 請確保 public 資料夾有此圖片

// --- 區域資料 (視覺座標 x,y) ---
const ZONES_DATA = [
  { id: 'hollywood', code: 'A', name: 'A 好萊塢區域', x: 15, y: 50, color: '#fca5a5' },
  { id: 'new_york', code: 'B', name: 'B 紐約區域', x: 30, y: 25, color: '#93c5fd' },
  { id: 'minion', code: 'C', name: 'C 小小兵樂園', x: 45.6, y: 8.1, color: '#fde047' },
  { id: 'san_francisco', code: 'D', name: 'D 舊金山區域', x: 49.2, y: 22.5, color: '#d1d5db' },
  { id: 'jurassic', code: 'E', name: 'E 侏儸紀公園', x: 85, y: 30, color: '#4ade80' },
  { id: 'waterworld', code: 'F', name: 'F 水世界', x: 84.7, y: 61.4, color: '#67e8f9' },
  { id: 'amity', code: 'G', name: 'G 親善村', x: 65, y: 45, color: '#fdba74' },
  { id: 'nintendo', code: 'H', name: 'H 任天堂世界', x: 81.6, y: 77.5, color: '#ef4444', textColor: 'white' },
  { id: 'harry_potter', code: 'I', name: 'I 哈利波特', x: 65.7, y: 80.9, color: '#1e293b', textColor: 'white' },
  { id: 'wonderland', code: 'J', name: 'J 環球奇境', x: 41.9, y: 67.5, color: '#f9a8d4' },
];
const ZONES_MAP = ZONES_DATA.reduce((acc, zone) => {
    acc[zone.id] = zone;
    return acc;
}, {});

// --- 錨點資料 (用於三角定位計算) ---
// 更新為您提供的 16 組高精度錨點
const DEFAULT_ANCHORS = [
  { id: 'anchor_01', name: '入口', x: 24.2, y: 78.5, lat: 34.66730086385208, lng: 135.4350585853792 },
  { id: 'anchor_02', name: '太空幻想旁', x: 23.7, y: 47.4, lat: 34.665266727921406, lng: 135.4346109858474 },
  { id: 'anchor_03', name: '好萊塢轉紐約', x: 23.6, y: 30.0, lat: 34.664195042648316, lng: 135.4343056319301 },
  { id: 'anchor_04', name: '小小兵樂園廣場', x: 45.7, y: 12.5, lat: 34.6632646957783, lng: 135.4324094445585 },
  { id: 'anchor_05', name: '小小兵樂園入口', x: 62.6, y: 19.1, lat: 34.66386257055521, lng: 135.43106999770296 },
  { id: 'anchor_06', name: '飛天翼龍入口前', x: 66.1, y: 26.9, lat: 34.66444899931696, lng: 135.43095087777766 },
  { id: 'anchor_07', name: '侏儸紀餐廳', x: 70.3, y: 36.0, lat: 34.665073679621884, lng: 135.43090798908992 },
  { id: 'anchor_08', name: '水世界入口', x: 80.6, y: 52.5, lat: 34.66603917611031, lng: 135.4302225451757 },
  { id: 'anchor_09', name: '任天堂路口', x: 76.4, y: 68.3, lat: 34.667336833546315, lng: 135.4308416286937 },
  { id: 'anchor_10', name: '咚奇剛入口', x: 78.2, y: 83.6, lat: 34.668240010945226, lng: 135.4303466139706 },
  { id: 'anchor_11', name: '哈利波特入口', x: 67.3, y: 71.1, lat: 34.667317501879914, lng: 135.43143739659962 },
  { id: 'anchor_12', name: '哈利波特走廊', x: 54.7, y: 57.8, lat: 34.66634540730469, lng: 135.43229697220065 },
  { id: 'anchor_13', name: '中央偏北', x: 52.7, y: 64.9, lat: 34.6667335823364, lng: lng: 135.43255724236624 },
  { id: 'anchor_14', name: '環球奇境史努比', x: 46.5, y: 77.9, lat: 34.66751084804232, lng: 135.43322936942505 },
  { id: 'anchor_15', name: '環球奇境 Hello Kitty', x: 35.6, y: 74.1, lat: 34.667089068114855, lng: 135.43399503171634 },
  { id: 'anchor_16', name: '中央湖泊左側', x: 38.2, y: 49.2, lat: 34.665601325237304, lng: 135.43343531408794 }
];


// --- 演算法：最小平方法求解仿射變換矩陣 ---
function solveLeastSquares(anchors) {
    const n = anchors.length;
    if (n < 3) return null; 

    let sumLat = 0, sumLng = 0, sumLat2 = 0, sumLng2 = 0, sumLatLng = 0;
    let sumX = 0, sumY = 0, sumXLat = 0, sumXLng = 0, sumYLat = 0, sumYLng = 0;

    for (const p of anchors) {
        if (p.lat == null || p.lng == null) continue;
        sumLat += p.lat;
        sumLng += p.lng;
        sumLat2 += p.lat * p.lat;
        sumLng2 += p.lng * p.lng;
        sumLatLng += p.lat * p.lng;

        sumX += p.x;
        sumY += p.y;
        sumXLat += p.x * p.lat;
        sumXLng += p.x * p.lng;
        sumYLat += p.y * p.lat;
        sumYLng += p.y * p.lng;
    }

    const a00 = sumLat2, a01 = sumLatLng, a02 = sumLat;
    const a10 = sumLatLng, a11 = sumLng2, a12 = sumLng;
    const a20 = sumLat, a21 = sumLng, a22 = n;

    const det = a00 * (a11 * a22 - a12 * a21) -
                a01 * (a10 * a22 - a12 * a20) +
                a02 * (a10 * a21 - a11 * a20);

    if (Math.abs(det) < 1e-12) return null;

    const invDet = 1 / det;
    const i00 = (a11 * a22 - a12 * a21) * invDet;
    const i01 = (a02 * a21 - a01 * a22) * invDet;
    const i02 = (a01 * a12 - a02 * a11) * invDet;
    const i10 = (a12 * a20 - a10 * a22) * invDet;
    const i11 = (a00 * a22 - a02 * a20) * invDet;
    const i12 = (a02 * a10 - a00 * a12) * invDet;
    const i20 = (a10 * a21 - a11 * a20) * invDet;
    const i21 = (a01 * a20 - a00 * a21) * invDet;
    const i22 = (a00 * a11 - a01 * a10) * invDet;

    const a = i00 * sumXLat + i01 * sumXLng + i02 * sumX;
    const b = i10 * sumXLat + i11 * sumXLng + i12 * sumX;
    const c = i20 * sumXLat + i21 * sumXLng + i22 * sumX;

    const d = i00 * sumYLat + i01 * sumYLng + i02 * sumY;
    const e = i10 * sumYLat + i11 * sumYLng + i12 * sumY;
    const f = i20 * sumYLat + i21 * sumYLng + i22 * sumY;

    return { a, b, c, d, e, f };
}

const projectWithMatrix = (lat, lng, matrix) => {
    if (!matrix) return { x: 50, y: 50 };
    const { a, b, c, d, e, f } = matrix;
    const x = a * lat + b * lng + c;
    const y = d * lat + e * lng + f;
    return { x, y };
};

// --- Helper: Get Point on Image Percent (Robust) ---
function getImageRelativePoint(e, imgEl) {
    const rect = imgEl.getBoundingClientRect();
  
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;
  
    // clamp：避免點到圖片外
    const cx = Math.min(Math.max(xPx, 0), rect.width);
    const cy = Math.min(Math.max(yPx, 0), rect.height);
  
    return {
      x: (cx / rect.width) * 100,
      y: (cy / rect.height) * 100,
      px: cx,
      py: cy
    };
}

// ... (Attractions and Facility Database)
const ATTRACTIONS = [
  { id: 'donkey_kong', name: '咚奇剛的瘋狂礦車', zone: 'nintendo', type: 'ride', wait: { holiday: 180, weekend: 140, weekday: 120 }, thrill: 'high' },
  { id: 'mario_kart', name: '瑪利歐賽車：庫巴的挑戰書', zone: 'nintendo', type: 'ride', wait: { holiday: 120, weekend: 90, weekday: 60 }, thrill: 'medium' },
  { id: 'yoshi', name: '耀西冒險', zone: 'nintendo', type: 'ride', wait: { holiday: 110, weekend: 80, weekday: 60 }, thrill: 'low' },
  { id: 'harry_potter_journey', name: '哈利波特禁忌之旅', zone: 'harry_potter', type: 'ride', wait: { holiday: 110, weekend: 80, weekday: 45 }, thrill: 'high_motion' },
  { id: 'hippogriff', name: '鷹馬的飛行', zone: 'harry_potter', type: 'ride', wait: { holiday: 110, weekend: 80, weekday: 60 }, thrill: 'medium' },
  { id: 'flying_dinosaur', name: '飛天翼龍', zone: 'jurassic', type: 'ride', wait: { holiday: 90, weekend: 50, weekday: 30 }, thrill: 'extreme' },
  { id: 'jurassic_park', name: '侏羅紀公園乘船遊', zone: 'jurassic', type: 'ride', wait: { holiday: 60, weekend: 45, weekday: 30 }, thrill: 'medium_water' },
  { id: 'minion_mayhem', name: '小小兵瘋狂乘車遊', zone: 'minion', type: 'ride', wait: { holiday: 60, weekend: 45, weekday: 30 }, thrill: 'medium_motion' },
  { id: 'minion_ice', name: '冰凍雷射光乘船遊', zone: 'minion', type: 'ride', wait: { holiday: 30, weekend: 25, weekday: 10 }, thrill: 'low' },
  { id: 'hollywood_dream', name: '好萊塢美夢乘車遊', zone: 'hollywood', type: 'ride', wait: { holiday: 110, weekend: 80, weekday: 45 }, thrill: 'high' },
  { id: 'hollywood_backdrop', name: '好萊塢美夢乘車遊-逆轉世界', zone: 'hollywood', type: 'ride', wait: { holiday: 110, weekend: 80, weekday: 45 }, thrill: 'high' },
  { id: 'jaws', name: '大白鯊', zone: 'amity', type: 'ride', wait: { holiday: 50, weekend: 30, weekday: 20 }, thrill: 'low' },
  { id: 'conan_4d', name: '名偵探柯南 4-D', zone: 'hollywood', type: 'show', wait: { holiday: 30, weekend: 30, weekday: 20 }, thrill: 'low' },
  { id: 'spy_family', name: 'SPY x FAMILY XR 乘車遊', zone: 'hollywood', type: 'ride', wait: { holiday: 120, weekend: 90, weekday: 60 }, thrill: 'high_vr' },
  { id: 'space_fantasy', name: '太空幻想列車', zone: 'hollywood', type: 'ride', wait: { holiday: 60, weekend: 45, weekday: 30 }, thrill: 'medium_spin' },
  { id: 'jujutsu_4d', name: '咒術迴戰 The Real 4-D', zone: 'hollywood', type: 'show', wait: { holiday: 50, weekend: 30, weekday: 20 }, thrill: 'low' },
  { id: 'waterworld_show', name: '水世界表演', zone: 'waterworld', type: 'show', wait: { holiday: 20, weekend: 20, weekday: 15 }, thrill: 'show' },
];

const FACILITY_DATABASE = [
  {id:1,name:"1UP工廠™",desc:"有許多在別的地方買不到的周邊商品！",type:"shop"},
  {id:12,name:"鷹馬的飛行™",desc:"適合全家人的雲霄飛車。",type:"ride"},
  {id:14,name:"三根掃帚™",desc:"活米村的老字號酒館。",type:"restaurant"},
  {id:16,name:"蜂蜜公爵™",desc:"糖果店。",type:"shop"},
  {id:22,name:"飛天翼龍",desc:"世界最長×世界最大高低差的最新型雲霄飛車。",type:"ride"},
  {id:23,name:"侏羅紀公園・乘船遊™",desc:"乘船探險。",type:"ride"},
  {id:27,name:"小小兵瘋狂乘車遊",desc:"進入格魯的實驗室。",type:"ride"},
  {id:34,name:"大白鯊™",desc:"乘船逃離食人鯊。",type:"ride"},
  {id:38,name:"好萊塢美夢・乘車遊",desc:"爽快雲霄飛車。",type:"ride"},
  {id:52,name:"哈利波特禁忌之旅™",desc:"世界No.1乘車遊。",type:"ride"},
  {id:54,name:"瑪利歐賽車～庫巴的挑戰書～™",desc:"瑪利歐賽車現實版。",type:"ride"},
  {id:55,name:"耀西冒險™",desc:"騎在耀西背上尋寶。",type:"ride"},
  {id:56,name:"咚奇剛的瘋狂礦車™",desc:"叢林奔馳。",type:"ride"},
  {id:58,name:"奇諾比奧咖啡店™",desc:"蘑菇王國餐廳。",type:"restaurant"},
  {id:62,name:"環球奇境",desc: "艾蒙、史努比、Hello Kitty的城鎮。", type: "area" },
  {id:74,name:"水世界™",desc:"特技表演秀。",type:"show"},
  {id:158,name:"鬼滅之刃 XR乘車遊",desc:"VR雲霄飛車。",type:"ride"},
];

const EXPRESS_PASS_DEFINITIONS = {
  1:  [{id:'mario_kart',t:true}, {id:'yoshi',t:true}, {id:'donkey_kong',t:true}, {id:'minion_mayhem',t:true}, {id:'hippogriff',t:true}, {id:'flying_dinosaur',t:false, choice:'or_minion'}, {id:'conan_4d',t:true}, {id:'jurassic_park',t:false}],
  2:  [{id:'mario_kart',t:true}, {id:'yoshi',t:true}, {id:'donkey_kong',t:true}, {id:'harry_potter_journey',t:true}, {id:'hippogriff',t:true}, {id:'minion_mayhem',t:true}, {id:'flying_dinosaur',t:false, choice:'or_minion'}, {id:'jaws',t:false, choice:'or_jurassic'}],
  3:  [{id:'mario_kart',t:true}, {id:'yoshi',t:true}, {id:'donkey_kong',t:true}, {id:'minion_mayhem',t:true}, {id:'hippogriff',t:true}, {id:'flying_dinosaur',t:false, choice:'or_minion'}, {id:'jaws',t:false, choice:'or_jurassic'}],
  4:  [{id:'mario_kart',t:true}, {id:'yoshi',t:true}, {id:'donkey_kong',t:true}, {id:'harry_potter_journey',t:true}, {id:'hippogriff',t:true}, {id:'flying_dinosaur',t:false, choice:'or_minion'}, {id:'jaws',t:false, choice:'or_jurassic'}],
  5:  [{id:'mario_kart',t:true}, {id:'donkey_kong',t:true}, {id:'flying_dinosaur',t:false}, {id:'jaws',t:false}, {id:'jurassic_park',t:false}],
  6:  [{id:'mario_kart',t:true}, {id:'yoshi',t:true}, {id:'flying_dinosaur',t:false}, {id:'minion_mayhem',t:false}, {id:'hollywood_dream',t:false}],
  7:  [{id:'mario_kart',t:true}, {id:'jurassic_park',t:false}, {id:'minion_mayhem',t:false}, {id:'jaws',t:false}, {id:'minion_mayhem',t:true, note:'Ride 2 (The Real)'}],
  8:  [{id:'mario_kart',t:true}, {id:'donkey_kong',t:true}, {id:'harry_potter_journey',t:true}, {id:'minion_mayhem',t:true}, {id:'flying_dinosaur',t:false}],
  9:  [{id:'mario_kart',t:true}, {id:'harry_potter_journey',t:true}, {id:'minion_mayhem',t:true}, {id:'minion_mayhem',t:false}, {id:'jaws',t:false, choice:'or_jurassic'}],
  10: [{id:'mario_kart',t:true}, {id:'donkey_kong',t:true}, {id:'harry_potter_journey',t:true}, {id:'jaws',t:false, choice:'or_jurassic'}],
  11: [{id:'mario_kart',t:true}, {id:'donkey_kong',t:true}, {id:'harry_potter_journey',t:true, choice:'or_flying_dinosaur'}, {id:'jaws',t:false, choice:'or_jurassic'}],
  12: [{id:'yoshi',t:true}, {id:'donkey_kong',t:true}, {id:'minion_mayhem',t:false}, {id:'jaws',t:false, choice:'or_jurassic'}],
  13: [{id:'mario_kart',t:true}, {id:'donkey_kong',t:true}, {id:'flying_dinosaur',t:false}, {id:'jaws',t:false, choice:'or_jurassic'}],
  14: [{id:'mario_kart',t:true}, {id:'donkey_kong',t:true}, {id:'harry_potter_journey',t:true}, {id:'flying_dinosaur',t:false, choice:'or_jaws'}],
  15: [{id:'mario_kart',t:true}, {id:'harry_potter_journey',t:true}, {id:'spy_family',t:true}, {id:'hollywood_dream',t:false, choice:'or_flying_dinosaur'}],
  16: [{id:'mario_kart',t:true}, {id:'harry_potter_journey',t:true}, {id:'hollywood_dream',t:false, choice:'or_flying_dinosaur'}, {id:'jaws',t:false, choice:'or_jurassic'}],
  17: [{id:'harry_potter_journey',t:true}, {id:'spy_family',t:true}, {id:'flying_dinosaur',t:false}, {id:'hollywood_dream',t:false}],
  18: [{id:'harry_potter_journey',t:true}, {id:'hollywood_backdrop',t:true}, {id:'hollywood_dream',t:false, choice:'or_flying_dinosaur'}, {id:'jaws',t:false, choice:'or_jurassic'}],
  19: [{id:'mario_kart',t:true}, {id:'harry_potter_journey',t:true}, {id:'hollywood_backdrop',t:true}, {id:'hollywood_dream',t:false, choice:'or_jaws'}],
  20: [{id:'harry_potter_journey',t:true}, {id:'spy_family',t:true}, {id:'jaws',t:false}, {id:'jurassic_park',t:false}],
  21: [{id:'harry_potter_journey',t:true}, {id:'hippogriff',t:true}, {id:'hollywood_backdrop',t:true}, {id:'flying_dinosaur',t:false}],
  22: [{id:'harry_potter_journey',t:true}, {id:'hippogriff',t:true}, {id:'hollywood_dream',t:false}, {id:'flying_dinosaur',t:false}],
  23: [{id:'harry_potter_journey',t:true}, {id:'hippogriff',t:true}, {id:'flying_dinosaur',t:false}, {id:'jaws',t:false, choice:'or_jurassic'}],
  24: [{id:'mario_kart',t:true}, {id:'harry_potter_journey',t:true}, {id:'space_fantasy',t:false}, {id:'flying_dinosaur',t:false}],
  25: [{id:'harry_potter_journey',t:true}, {id:'hippogriff',t:true}, {id:'jujutsu_4d',t:true}, {id:'flying_dinosaur',t:false}],
  26: [{id:'harry_potter_journey',t:true}, {id:'hippogriff',t:true}, {id:'flying_dinosaur',t:false, choice:'or_space'}, {id:'jaws',t:false, choice:'or_jurassic'}],
  27: [{id:'mario_kart',t:true}, {id:'harry_potter_journey',t:true}, {id:'space_fantasy',t:false}, {id:'flying_dinosaur',t:false}],
  28: [{id:'mario_kart',t:true}, {id:'harry_potter_journey',t:true}, {id:'minion_mayhem',t:false}, {id:'jaws',t:false, choice:'or_jurassic'}]
};

const EXPRESS_PASS_RAW = [
  "1. 快速通關券8 - Minecart & Minion Mayhem Special",
  "2. 快速通關券8 - Minion & Minecart Special",
  "3. 快速通關券7 - Minecart & Minion Mayhem",
  "4. 快速通關券7 - Minecart & Selection",
  "5. 快速通關券5 - Minecart & JAWS Special",
  "6. 快速通關券5 - Adventure Special",
  "7. 快速通關券5 - Race & Minion Mayhem Special",
  "8. 快速通關券5 - Race & Minecart Special",
  "9. 快速通關券5 - Race & Minion Special",
  "10. 快速通關券4 - Minecart & Fun",
  "11. 快速通關券4 - Minecart & JAWS",
  "12. 快速通關券4 - Minecart & Jurassic Park",
  "13. 快速通關券4 - Minecart & Flying Dinosaur",
  "14. 快速通關券4 - Race & Minecart",
  "15. 快速通關券4 - XR Ride & Race",
  "16. 快速通關券4 - Race & Thrills",
  "17. 快速通關券4 - XR Ride & The Flying Dinosaur",
  "18. 快速通關券4 - Backdrop & Choice",
  "19. 快速通關券4 - Thrills & Selection",
  "20. 快速通關券4 - XR Ride & Jurassic Park",
  "21. 快速通關券4 - 逆轉世界",
  "22. 快速通關券4 - Minecart & Hollywood Dream",
  "23. 快速通關券4 - Flying Dinosaur & JAWS",
  "24. 快速通關券4 - Space Fantasy & Race",
  "25. 快速通關券4 - Flying Dinosaur & 4-D",
  "26. 快速通關券4 - Flying Dinosaur & Jurassic Park",
  "27. 快速通關券4 - One More Race & Ride Selection",
  "28. 快速通關券4 - Race & JAWS"
];

const getExpressPassContent = (passName) => {
  if (!passName) return [];
  const indexStr = passName.split('.')[0];
  const index = parseInt(indexStr);
  const definition = EXPRESS_PASS_DEFINITIONS[index];
  if (definition) {
    return definition.map(item => ({
      id: item.id,
      timed: item.t,
      choice: item.choice,
      note: item.note
    }));
  }
  return [{ id: 'mario_kart', timed: true }];
};

// --- Edit Modal ---
const EditModal = ({ isOpen, onClose, item, onSave }) => {
    const [name, setName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState(0);
    const [note, setNote] = useState('');

    useEffect(() => {
        if (item) {
            setName(item.name || '');
            const h = Math.floor(item.start / 60);
            const m = item.start % 60;
            setStartTime(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`);
            setDuration(item.duration || 30);
            setNote(item.description || '');
        } else {
            setStartTime('12:00');
            setDuration(30);
            setName('');
            setNote('');
        }
    }, [item, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        const [h, m] = startTime.split(':').map(Number);
        const startMins = h * 60 + m;
        onSave({
            ...item,
            name,
            start: startMins,
            duration: parseInt(duration),
            end: startMins + parseInt(duration),
            description: note,
            type: item?.type || 'misc' 
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-4 space-y-4 shadow-2xl">
                <h3 className="font-bold text-lg">{item ? '編輯行程' : '新增行程'}</h3>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">名稱</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" placeholder="例如：逛商店、休息"/>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">開始時間</label>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border p-2 rounded"/>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">持續時間 (分)</label>
                        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border p-2 rounded"/>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">備註</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full border p-2 rounded h-20 text-sm"/>
                </div>
                <div className="flex gap-2 pt-2">
                    <button onClick={onClose} className="flex-1 py-2 bg-gray-200 rounded-lg text-sm font-bold">取消</button>
                    <button onClick={handleSave} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">儲存</button>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function USJPlannerApp() {
  const [currentView, setCurrentView] = useState('home'); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // GPS Permission State: 'prompt', 'granted', 'denied', 'unsupported'
  const [gpsPermission, setGpsPermission] = useState('prompt');

  const [userApiKey, setUserApiKey] = useState(() => {
    return localStorage.getItem('usj_api_key') || '';
  });

  const [savedPlans, setSavedPlans] = useState(() => {
    try {
      const saved = localStorage.getItem('usj_saved_plans');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const defaultFormData = {
    date: new Date().toISOString().split('T')[0],
    duration: '1',
    hasExpress: false,
    expressPasses: [{ id: Date.now(), name: '', times: {} }], 
    nintendoEntryTime: 'morning',
    hasJCB: false,
    jcbTime: '', 
    endTime: '21:00',
    needsFood: true,
    planShopping: false,
    preferenceMode: 'thrill',
    specialRequest: '',
    needsTaxRefund: false,
  };

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('usj_form_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.expressPasses) {
             return {
                 ...parsed,
                 expressPasses: [{ 
                     id: Date.now(), 
                     name: parsed.selectedExpressPass || '', 
                     times: parsed.expressTimes || {} 
                 }],
                 planShopping: false,
                 preferenceMode: 'thrill'
             };
        }
        return { ...defaultFormData, ...parsed }; 
      }
      return defaultFormData;
    } catch (e) {
      return defaultFormData;
    }
  });
  
  const [itinerary, setItinerary] = useState([]);
  
  // GPS States
  const [gpsRaw, setGpsRaw] = useState(null); 
  const [gpsXY, setGpsXY] = useState({ x: 50, y: 95 }); 
  const [lastGpsFix, setLastGpsFix] = useState(null); 
  
  const [realGpsEnabled, setRealGpsEnabled] = useState(false);
  const [displayWeather, setDisplayWeather] = useState({ condition: 'sunny', temp: 15, text: '尚未取得天氣資訊' });
  const [mapImage, setMapImage] = useState(null);

  // Anchor / Debug Mode
  const [anchors, setAnchors] = useState(() => {
      const saved = localStorage.getItem('usj_anchors');
      return saved ? JSON.parse(saved) : DEFAULT_ANCHORS;
  });
  const [isAddAnchorMode, setIsAddAnchorMode] = useState(false);
  const [affineMatrix, setAffineMatrix] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Map Interaction State
  const mapContainerRef = useRef(null);
  const svgRef = useRef(null);
  const imgRef = useRef(null);
  const [viewState, setViewState] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Jitter prevention
  const attractionOffsets = useMemo(() => {
      const offsets = {};
      ATTRACTIONS.forEach(attr => {
          offsets[attr.id] = {
              ox: (Math.random() - 0.5) * 5,
              oy: (Math.random() - 0.5) * 5
          };
      });
      return offsets;
  }, []);

  // Check GPS Permission on Mount
  useEffect(() => {
    if (!navigator.permissions || !navigator.permissions.query) {
      setGpsPermission('unsupported');
      return;
    }
    
    navigator.permissions.query({ name: 'geolocation' })
      .then(result => {
        setGpsPermission(result.state);
        result.onchange = () => {
          setGpsPermission(result.state);
        };
      })
      .catch(() => {
        setGpsPermission('unsupported'); // Fallback for browsers that don't support query
      });
  }, []);

  // Update Matrix when anchors change
  useEffect(() => {
      localStorage.setItem('usj_anchors', JSON.stringify(anchors));
      const matrix = solveLeastSquares(anchors);
      setAffineMatrix(matrix);
  }, [anchors]);

  // Persist State
  useEffect(() => { localStorage.setItem('usj_api_key', userApiKey); }, [userApiKey]);
  useEffect(() => { localStorage.setItem('usj_form_data', JSON.stringify(formData)); }, [formData]);
  useEffect(() => { localStorage.setItem('usj_saved_plans', JSON.stringify(savedPlans)); }, [savedPlans]);

  // GPS Tracking Logic
  useEffect(() => {
    let watchId;
    if (realGpsEnabled && currentView === 'map') {
        if (!navigator.geolocation) {
            alert("您的瀏覽器不支援地理定位");
            setRealGpsEnabled(false);
            return;
        }
        
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const acc = position.coords.accuracy;
                
                setLastGpsFix({ lat, lng, acc });
                setGpsRaw({ lat, lng, acc });

                // Use calculated matrix or fallback
                const matrix = affineMatrix || solveLeastSquares(DEFAULT_ANCHORS);
                const { x, y } = projectWithMatrix(lat, lng, matrix);
                
                // Clamp
                const cx = Math.min(Math.max(x, 0), 100);
                const cy = Math.min(Math.max(y, 0), 100);

                setGpsXY({ x: cx, y: cy });
            },
            (error) => {
                console.error("GPS Error:", error);
                if (error.code === error.PERMISSION_DENIED) {
                    setGpsPermission('denied');
                    setRealGpsEnabled(false);
                }
            },
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );
    }
    return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [realGpsEnabled, currentView, affineMatrix]);

  // Handlers
  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const addExpressPass = () => setFormData(prev => ({ ...prev, expressPasses: [...prev.expressPasses, { id: Date.now(), name: '', times: {} }] }));
  const removeExpressPass = (id) => setFormData(prev => ({ ...prev, expressPasses: prev.expressPasses.filter(p => p.id !== id) }));
  const updateExpressPassName = (id, newName) => setFormData(prev => ({ ...prev, expressPasses: prev.expressPasses.map(p => p.id === id ? { ...p, name: newName, times: {} } : p) }));
  const updateExpressPassTime = (passId, attractionId, time) => setFormData(prev => ({ ...prev, expressPasses: prev.expressPasses.map(p => p.id === passId ? { ...p, times: { ...p.times, [attractionId]: time } } : p) }));

  // CRUD
  const handleEditItem = (item) => { setEditingItem(item); setIsEditModalOpen(true); };
  const handleAddItem = () => { setEditingItem(null); setIsEditModalOpen(true); };
  const handleSaveItem = (newItem) => {
      let newItinerary;
      if (editingItem) {
          newItinerary = itinerary.map(i => i === editingItem ? newItem : i);
      } else {
          newItinerary = [...itinerary, newItem];
      }
      newItinerary.sort((a, b) => a.start - b.start);
      setItinerary(newItinerary);
  };
  const handleDeleteItem = (itemToDelete) => {
      if(window.confirm('確定要刪除此項目嗎？')) {
          setItinerary(prev => prev.filter(i => i !== itemToDelete));
      }
  };
  const saveCurrentPlan = () => {
    if (itinerary.length === 0) return;
    const newPlan = { id: Date.now(), timestamp: new Date().toLocaleString(), name: `${formData.date}行程`, formData, itinerary, weather: displayWeather };
    setSavedPlans(prev => [newPlan, ...prev]);
    alert('行程已儲存！');
  };
  const loadPlan = (plan) => {
    setFormData(plan.formData);
    setItinerary(Array.isArray(plan.itinerary) ? plan.itinerary : (plan.itineraryMap?.sunny || []));
    setDisplayWeather(plan.weather || { condition: 'sunny', temp: 15 });
    setCurrentView('plan');
  };
  const deletePlan = (id) => {
    if (window.confirm('確定要刪除?')) setSavedPlans(prev => prev.filter(p => p.id !== id));
  };
  const resetAnchors = () => {
      if(window.confirm("確定要重置所有校正點嗎？")) {
          setAnchors(DEFAULT_ANCHORS);
      }
  };

  // AI Logic
  const callGeminiAPI = async () => {
      const activeKey = userApiKey || apiKey;
      if (!activeKey) { setErrorMsg("請輸入 API Key"); return; }
      setIsGenerating(true);
      setErrorMsg('');
      try {
        const selectedDate = new Date(formData.date);
        const dayOfWeek = selectedDate.getDay();
        let dayType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'weekday';
        if (formData.date.endsWith('12-25') || formData.date.endsWith('12-31')) dayType = 'holiday';
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1; 
        const forecastUrl = `https://usjreal.asumirai.info/monthly/usj-forecast-${year}-${month}.html`;

        let allExpressPassDetails = [];
        if (formData.hasExpress && formData.expressPasses.length > 0) {
            allExpressPassDetails = formData.expressPasses.map((pass, index) => {
                if (!pass.name) return null;
                return {
                    passId: index + 1, 
                    name: pass.name,
                    content: getExpressPassContent(pass.name).map(item => ({
                        id: item.id,
                        name: ATTRACTIONS.find(a => a.id === item.id)?.name || item.id,
                        isFixedTime: item.timed,
                        fixedTime: item.timed ? pass.times[item.id] : null,
                        choiceGroup: item.choice 
                    }))
                };
            }).filter(Boolean); 
        }

        const contextData = {
            date: formData.date,
            dayType: dayType,
            ticketDuration: formData.duration,
            expressPasses: allExpressPassDetails.length > 0 ? allExpressPassDetails : "None",
            preferences: {
                nintendoEntry: formData.nintendoEntryTime,
                hasJCB: formData.hasJCB,
                jcbReservationTime: formData.jcbTime, 
                needsTaxRefund: formData.needsTaxRefund,
                needsFood: formData.needsFood,
                planShopping: formData.planShopping, 
                preferenceMode: formData.preferenceMode, 
                endTime: formData.endTime, 
                special: formData.specialRequest
            },
            attractions: ATTRACTIONS.map(a => ({
                id: a.id,
                name: a.name,
                zone: a.zone,
                type: a.type,
                wait: a.wait[dayType],
                duration: a.duration,
                outdoor: a.outdoor,
                thrillLevel: a.thrill 
            })),
            facilityDatabase: FACILITY_DATABASE, 
            dataSources: {
                crowdForecastUrl: forecastUrl,
                officialScheduleUrl: "https://www.usj.co.jp/web/zh/tw/attractions/show-and-attraction-schedule"
            }
        };

        const systemPrompt = `
          你是一位環球影城 (USJ) 的行程規劃專家。
          任務：
          1. 搜尋 ${formData.date} 的精確天氣與營業資訊。
          2. 根據天氣預報、人流預測與使用者偏好，產生**唯一最佳**的行程表。
          
          核心規劃邏輯 (${formData.preferenceMode})：
          1. thrill: 優先飛天翼龍、好萊塢美夢。
          2. gentle: 避開暈眩設施。
          3. family: 優先環球奇境、小小兵。

          資料檢索：
          1. 營業時間：從 ${forecastUrl} 找出開閉園時間。
          2. 天氣：搜尋當日天氣，雨天避開戶外。
          3. 運休：排除休止設施。

          格式：JSON
          {
            "weatherSummary": "...",
            "itinerary": [
                { "start": "HH:MM", "end": "HH:MM", "name": "...", "type": "ride", "zoneId": "...", "wait": 20, "duration": 5, "description": "..." }
            ]
          }
        `;

        const userPrompt = `請根據以下資料規劃行程：${JSON.stringify(contextData)}。JSON回應必須包含 weatherSummary 和 itinerary。`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${activeKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                tools: [{ google_search: {} }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) throw new Error("API Request Failed");
        const data = await response.json();
        let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generatedText) throw new Error("No data generated");
        generatedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
        const resultObj = JSON.parse(generatedText);
        
        const processItinerary = (list) => {
            if (!list || !Array.isArray(list)) return [];
            return list.map(item => {
                const [sh, sm] = item.start.split(':').map(Number);
                const startMins = sh * 60 + sm;
                return {
                    ...item,
                    start: startMins,
                    zone: ZONES_MAP[item.zoneId] || null 
                };
            });
        };

        setItinerary(processItinerary(resultObj.itinerary));
        setDisplayWeather({
            condition: resultObj.weatherSummary?.includes('雨') ? 'rainy' : 'sunny',
            text: resultObj.weatherSummary || '天氣資訊已更新'
        });
        setCurrentView('plan');
      } catch (e) { 
          console.error(e);
          setErrorMsg(e.message);
          setIsGenerating(false); 
      } finally {
          setIsGenerating(false);
      }
  };

  // Map Interaction Handlers
  const handleZoom = (direction) => setViewState(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale + (direction * 0.5), 1), 5) }));
  const handleResetMap = () => setViewState({ scale: 1, x: 0, y: 0 });
  const onMouseDown = (e) => { setIsDragging(true); setStartPan({ x: e.clientX - viewState.x, y: e.clientY - viewState.y }); };
  const onMouseMove = (e) => { if (!isDragging) return; e.preventDefault(); setViewState(prev => ({ ...prev, x: e.clientX - startPan.x, y: e.clientY - startPan.y })); };
  const onMouseUp = () => setIsDragging(false);
  const onTouchStart = (e) => { if (e.touches.length === 1) { setIsDragging(true); setStartPan({ x: e.touches[0].clientX - viewState.x, y: e.touches[0].clientY - viewState.y }); } };
  const onTouchMove = (e) => { if (!isDragging || e.touches.length !== 1) return; setViewState(prev => ({ ...prev, x: e.touches[0].clientX - startPan.x, y: e.touches[0].clientY - startPan.y })); };
  const onTouchEnd = () => setIsDragging(false);

  // Add Anchor Logic
  const handleMapClick = (e) => {
      if (!isAddAnchorMode) return;
      if (!imgRef.current) return;

      const p = getPointOnImagePercent(e, imgRef.current);
      if (!p) return;

      const currentGps = lastGpsFix || gpsRaw;
      const name = prompt("請輸入此校正點名稱：");
      if (name) {
          setAnchors(prev => [...prev, { 
              id: Date.now(), 
              name, 
              x: parseFloat(p.x.toFixed(2)), 
              y: parseFloat(p.y.toFixed(2)), 
              lat: currentGps ? currentGps.lat : null, 
              lng: currentGps ? currentGps.lng : null
          }]);
          setIsAddAnchorMode(false);
          alert(`校正點已新增！(x:${p.x.toFixed(1)}, y:${p.y.toFixed(1)})`);
      }
  };
  
  // GPS Permission Request Handler
  const requestGpsPermission = () => {
    if (!navigator.geolocation) {
        alert('此瀏覽器不支援 GPS');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            // User allowed GPS
            setGpsPermission('granted');
            console.log('GPS OK', pos.coords);
            setRealGpsEnabled(true);
        },
        (err) => {
            if (err.code === err.PERMISSION_DENIED) {
                setGpsPermission('denied');
            }
        },
        { enableHighAccuracy: true }
    );
  };

  // Helper: Get Point on Image Percent (Robust)
  function getPointOnImagePercent(e, imgEl) {
    const rect = imgEl.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cx = Math.min(Math.max(px, 0), r.width);
    const cy = Math.min(Math.max(py, 0), r.height);
    return {
      x: (cx / rect.width) * 100,
      y: (cy / rect.height) * 100
    };
  }

  // Load map image from local storage (or use default)
  useEffect(() => {
      const savedMap = localStorage.getItem('usj_map_image');
      if (savedMap) setMapImage(savedMap);
  }, []);

  const renderHome = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white p-6 rounded-b-3xl shadow-lg relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 text-yellow-300 opacity-50" size={48} />
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">USJ AI 路線規劃 <span className="text-xs bg-yellow-400 text-blue-800 px-2 py-0.5 rounded-full">Gemini</span></h1>
        <p className="opacity-90 text-sm">輸入您的需求，AI 為您客製化最佳攻略</p>
      </div>
      <div className="px-4 space-y-4">
        {/* Same Home UI */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
           <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><Key size={16} /> Gemini API Key</label>
           <input type="password" value={userApiKey} onChange={(e) => setUserApiKey(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Calendar size={18} /> 入園日期</label>
          <input type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} className="w-full p-2 border rounded-lg"/>
        </div>
        
        {/* Preference Mode */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><HeartPulse size={18} /> 設施安排取向</label>
            <div className="grid grid-cols-1 gap-2">
                <button onClick={() => handleInputChange('preferenceMode', 'thrill')} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${formData.preferenceMode === 'thrill' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="text-left"><div className="text-sm font-bold flex items-center gap-2"><Zap size={14}/> 不怕暈要刺激 (Thrill)</div></div>
                </button>
                <button onClick={() => handleInputChange('preferenceMode', 'gentle')} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${formData.preferenceMode === 'gentle' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="text-left"><div className="text-sm font-bold flex items-center gap-2"><Coffee size={14}/> 怕暈別太刺激 (Gentle)</div></div>
                </button>
                <button onClick={() => handleInputChange('preferenceMode', 'family')} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${formData.preferenceMode === 'family' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="text-left"><div className="text-sm font-bold flex items-center gap-2"><Baby size={14}/> 親子路線 (Family)</div></div>
                </button>
            </div>
        </div>

        {/* Express Pass Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2"><Clock size={18} /> 快速通關券</span>
            <input type="checkbox" checked={formData.hasExpress} onChange={(e) => handleInputChange('hasExpress', e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"/>
          </label>
          {formData.hasExpress && (
            <div className="mt-3 space-y-4 animate-fade-in">
              {formData.expressPasses.map((pass, index) => (
                  <div key={pass.id} className="p-3 border rounded-lg bg-gray-50 relative group">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">第 {index + 1} 張快通</span>
                          <button onClick={() => removeExpressPass(pass.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                      </div>
                      <select value={pass.name} onChange={(e) => updateExpressPassName(pass.id, e.target.value)} className="w-full p-2 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 mb-3">
                        <option value="">-- 請選擇快通版本 --</option>
                        {EXPRESS_PASS_RAW.map((p, idx) => (<option key={idx} value={p}>{p.split('-')[1] || p}</option>))}
                      </select>
                      {pass.name && (
                        <div className="pl-2 border-l-2 border-blue-200 space-y-2">
                          {getExpressPassContent(pass.name).filter(i => i.timed).map(item => {
                            const attr = ATTRACTIONS.find(a => a.id === item.id);
                            return (
                              <div key={item.id} className="flex items-center justify-between">
                                <span className="text-xs text-gray-700 font-medium">{attr?.name}{item.choice && '*'}</span>
                                <input type="time" value={pass.times[item.id] || ''} onChange={(e) => updateExpressPassTime(pass.id, item.id, e.target.value)} className="text-xs p-1.5 border rounded bg-white w-24"/>
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </div>
              ))}
              <button onClick={addExpressPass} className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-50"><PlusCircle size={16}/> 新增</button>
            </div>
          )}
        </div>

        {/* Other Options */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
           {!formData.hasExpress && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">任天堂整理券時段</label>
              <select value={formData.nintendoEntryTime} onChange={(e) => handleInputChange('nintendoEntryTime', e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                <option value="morning">早上 (09:00 - 12:00)</option>
                <option value="afternoon">下午 (13:00 - 16:00)</option>
                <option value="evening">晚上 (17:00 後)</option>
              </select>
            </div>
          )}
           <div className="border-t pt-2 mt-2">
              <label className="flex items-center gap-2 mb-2">
                 <input type="checkbox" checked={formData.hasJCB} onChange={(e) => handleInputChange('hasJCB', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                 <span className="text-sm font-medium text-gray-700 flex items-center gap-1"><CreditCard size={16}/> 持有 JCB 極致卡</span>
              </label>
              {formData.hasJCB && (
                  <div className="bg-blue-50 p-3 rounded-lg ml-6 space-y-2 animate-fade-in border border-blue-100">
                      <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-bold text-gray-700">預約時間：</span>
                          <input type="time" value={formData.jcbTime || ''} onChange={(e) => handleInputChange('jcbTime', e.target.value)} className="text-xs p-1.5 border rounded bg-white w-24"/>
                      </div>
                  </div>
              )}
           </div>
           <label className="flex items-center gap-2"><input type="checkbox" checked={formData.planShopping} onChange={(e) => handleInputChange('planShopping', e.target.checked)} /><span className="text-sm">特地規劃購物行程</span></label>
           <label className="flex items-center gap-2"><input type="checkbox" checked={formData.needsTaxRefund} onChange={(e) => handleInputChange('needsTaxRefund', e.target.checked)} /><span className="text-sm">需要退稅</span></label>
           <label className="flex items-center gap-2"><input type="checkbox" checked={formData.needsFood} onChange={(e) => handleInputChange('needsFood', e.target.checked)} /><span className="text-sm">包含餐廳推薦</span></label>
           <div className="pt-2 border-t mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">特別要求</label>
            <textarea value={formData.specialRequest} onChange={(e) => handleInputChange('specialRequest', e.target.value)} placeholder="例如：想看遊行..." className="w-full p-2 text-sm border rounded-lg h-20"/>
          </div>
        </div>

        {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2"><AlertCircle size={16}/> {errorMsg}</div>}

        <button onClick={callGeminiAPI} disabled={isGenerating} className={`w-full py-4 rounded-xl font-bold shadow-lg text-white transition-all flex justify-center items-center gap-2 ${isGenerating ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>{isGenerating ? '規劃中...' : '開始 AI 智能規劃'}</button>
      </div>
    </div>
  );

  const renderItinerary = () => (
      <div className="pb-24">
         <div className="bg-white sticky top-0 z-10 shadow-sm p-4 flex justify-between items-center">
             <h2 className="font-bold text-lg flex items-center gap-2"><Sparkles size={18} className="text-yellow-500"/> 專屬攻略</h2>
             <div className="flex gap-2">
                 <button onClick={callGeminiAPI} className="p-2 bg-blue-100 rounded-full text-blue-600"><RefreshCw size={20}/></button>
                 <button onClick={saveCurrentPlan} className="p-2 bg-green-100 rounded-full text-green-600"><Save size={20}/></button>
                 <button onClick={() => setCurrentView('map')} className="p-2 bg-gray-100 rounded-full text-blue-600"><MapIcon size={20}/></button>
                 <button onClick={() => setCurrentView('home')} className="p-2 bg-gray-100 rounded-full text-gray-600"><Settings size={20}/></button>
             </div>
         </div>
         <div className="px-4 py-2 text-center text-xs text-gray-500 bg-blue-50 border-b border-blue-100 mb-4 flex items-center justify-center gap-2">
             {displayWeather.condition === 'rainy' ? <Umbrella size={14}/> : <Sun size={14}/>} {displayWeather.text}
         </div>
         <div className="px-4 relative">
             <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
             {itinerary.length === 0 ? <div className="text-center py-10 text-gray-400 text-sm">尚未有行程</div> : itinerary.map((item, idx) => (
                 <div key={idx} className="flex gap-4 mb-6 relative group" onClick={() => handleEditItem(item)}>
                     <div className="w-12 flex-shrink-0 flex flex-col items-center z-10">
                         <div className={`w-3 h-3 rounded-full mb-1 ${item.type === 'express' ? 'bg-yellow-400' : 'bg-blue-500'}`}></div>
                         <span className="text-xs font-bold text-gray-500">{formatTime(item.start)}</span>
                     </div>
                     <div className="flex-1 p-3 rounded-xl shadow-sm border-l-4 bg-white border-blue-500 relative cursor-pointer">
                         <div className="flex justify-between items-start">
                             <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                             <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item); }} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                         </div>
                         <div className="mt-2 text-xs text-gray-500">{item.description}</div>
                     </div>
                 </div>
             ))}
             <button onClick={handleAddItem} className="w-full py-3 mt-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold flex items-center justify-center gap-2"><Plus size={20}/> 新增自訂行程</button>
         </div>
      </div>
  );

  const renderSavedPlans = () => <div className="p-4">我的行程功能（已實作）</div>;

  const renderMap = () => (
    <div className="h-full flex flex-col bg-gray-100">
       <div className="bg-white p-4 shadow-sm z-10 flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2"><MapIcon size={20}/> 園區導航</h2>
        <div className="flex gap-2">
            <button 
                onClick={() => {
                  if (gpsPermission === 'denied') {
                    alert('GPS 已被封鎖，請至瀏覽器設定中開啟定位權限');
                    return;
                  }
                  requestGpsPermission();
                }}
                className={`p-2 rounded-full transition-colors flex items-center gap-1 ${realGpsEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
                <Locate size={16}/> {realGpsEnabled ? 'GPS 開啟' : '啟用 GPS'}
            </button>
            <button onClick={() => setCurrentView('plan')} className="text-blue-600 text-sm font-bold">列表</button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative bg-[#e0f2fe] flex items-center justify-center" ref={mapContainerRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div style={{ transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})`, transformOrigin: '0 0', transition: isDragging ? 'none' : 'transform 0.1s ease-out', display: 'inline-block' }}>
            <div className="relative shadow-2xl bg-white inline-block">
                <img ref={imgRef} src={FIXED_MAP_SRC} alt="USJ Map" className="block select-none" draggable={false}/>
                <svg ref={svgRef} viewBox="0 0 100 100" className={`absolute inset-0 w-full h-full ${isAddAnchorMode ? 'cursor-crosshair' : 'pointer-events-none'}`} onClick={handleMapClick}>
                    {isAddAnchorMode && anchors.map(a => (<g key={a.id}><circle cx={a.x} cy={a.y} r="1" fill="red" /></g>))}
                    {ZONES_DATA.map(zone => (
                        <g key={zone.id} className="pointer-events-auto cursor-pointer" onClick={() => !isAddAnchorMode && alert(zone.name)}>
                            <circle cx={zone.x} cy={zone.y} r="6" fill={zone.color} opacity="0.6" />
                            <text x={zone.x} y={zone.y} textAnchor="middle" dy="0.3em" fontSize="3" fill="black" fontWeight="bold">{zone.code}</text>
                        </g>
                    ))}
                    <g transform={`translate(${gpsXY.x}, ${gpsXY.y})`}>
                        <circle r="4" fill="#3b82f6" opacity="0.8" className="animate-ping" />
                        <circle r="2" fill="#3b82f6" stroke="white" strokeWidth="0.5" />
                    </g>
                </svg>
            </div>
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto">
            <button onClick={() => handleZoom(1)} className="p-2 bg-white rounded shadow"><ZoomIn size={20}/></button>
            <button onClick={() => handleZoom(-1)} className="p-2 bg-white rounded shadow"><ZoomOut size={20}/></button>
        </div>
        <div className="absolute bottom-20 right-4 pointer-events-auto flex flex-col gap-2">
             <button onClick={() => setIsAddAnchorMode(!isAddAnchorMode)} className={`p-3 rounded-full shadow-lg transition-colors ${isAddAnchorMode ? 'bg-red-500 text-white' : 'bg-white text-gray-600'}`}><MapPin size={24}/></button>
             <button onClick={resetAnchors} className="p-3 bg-white rounded-full shadow-lg text-gray-600"><RotateCcw size={24}/></button>
        </div>
        {!realGpsEnabled && (
            <div className="absolute bottom-6 right-4 bg-white p-2 rounded-lg shadow-lg pointer-events-auto">
                <button className="p-2 bg-blue-100 rounded-full text-blue-600 mb-2 block" onClick={() => { const c = ZONES_MAP['hollywood']; setGpsXY({ x: c.x, y: c.y }); }}><Navigation size={20} /></button>
                <span className="text-[10px] text-gray-500 block text-center">模擬移動</span>
            </div>
        )}
        <div className="absolute top-2 left-2 right-14 bg-white/90 p-2 rounded text-[10px] text-gray-500 shadow-sm pointer-events-none">
            {isAddAnchorMode ? '🔴 點擊地圖新增校正點 (需開啟 GPS)' : '地圖模式：三角定位自動校正'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen bg-gray-50 overflow-y-auto font-sans text-gray-800 relative">
      {currentView === 'home' && renderHome()}
      {currentView === 'plan' && renderItinerary()}
      {currentView === 'map' && renderMap()}
      {currentView === 'saved' && renderSavedPlans()}
      <EditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} item={editingItem} onSave={handleSaveItem} />
      <div className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-200 flex justify-around py-3 text-xs text-gray-500 z-50">
          <button onClick={() => setCurrentView('plan')} className={`flex flex-col items-center gap-1 ${currentView === 'plan' ? 'text-blue-600' : ''}`}><Clock size={20}/> 行程</button>
          <button onClick={() => setCurrentView('map')} className={`flex flex-col items-center gap-1 ${currentView === 'map' ? 'text-blue-600' : ''}`}><MapIcon size={20}/> 地圖</button>
          <button onClick={() => setCurrentView('saved')} className={`flex flex-col items-center gap-1 ${currentView === 'saved' ? 'text-blue-600' : ''}`}><FolderOpen size={20}/> 我的行程</button>
      </div>
    </div>
  );
}
