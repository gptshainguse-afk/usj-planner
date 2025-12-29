import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, Clock, Map as MapIcon, Navigation, Sun, CloudRain, CheckCircle, Settings, Coffee, ShoppingBag, Ticket, Sparkles, AlertCircle, Key, Save, FolderOpen, Trash2, ArrowRight, CreditCard, PlusCircle, X, Globe, Umbrella, Baby, HeartPulse, Zap, Edit, RefreshCw, Plus, Locate, Image as ImageIcon, Upload, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

// --- 全域設定 ---
const apiKey = ""; // 預覽環境會自動注入 Key

// --- 地圖定位與常數定義 ---

// 1. 地圖參數設定 (僅用於計算使用者 GPS 藍點)
const MAP_SETTINGS = {
    centerLat: 34.666800,
    centerLng: 135.433000,
    rotation: 285, 
    scaleX: 16000, 
    scaleY: 19000
};

// 2. 輔助函式：將真實 GPS 轉換為地圖上的 % 座標
const projectGpsToMap = (lat, lng) => {
    const { centerLat, centerLng, rotation, scaleX, scaleY } = MAP_SETTINGS;
    
    const dLat = lat - centerLat;
    const dLng = lng - centerLng;

    const rad = rotation * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const lngCorrection = 0.82; 
    const xRaw = dLng * lngCorrection;
    const yRaw = dLat;

    const xRotated = xRaw * cos - yRaw * sin;
    const yRotated = xRaw * sin + yRaw * cos;

    const xPercent = 50 + (xRotated * scaleX);
    const yPercent = 50 - (yRotated * scaleY);

    return { x: xPercent, y: yPercent };
};

// 3. 區域資料 (手動校正座標 x, y)
const ZONES_DATA = [
  // 左方
  { id: 'hollywood', code: 'A', name: 'A 好萊塢區域', x: 15, y: 50, lat: 34.663620, lng: 135.434522, color: '#fca5a5' },
  
  // 上方 (修正：往左下)
  { id: 'new_york', code: 'B', name: 'B 紐約區域', x: 30, y: 25, lat: 34.665500, lng: 135.436000, color: '#93c5fd' },
  // 上方 (修正：往左上)
  { id: 'minion', code: 'C', name: 'C 小小兵樂園', x: 47, y: 5, lat: 34.667471, lng: 135.435172, color: '#fde047' },
  
  // 中間 (修正：往上)
  { id: 'san_francisco', code: 'D', name: 'D 舊金山區域', x: 50, y: 30, lat: 34.666000, lng: 135.434000, color: '#d1d5db' },
  
  // 右方
  { id: 'jurassic', code: 'E', name: 'E 侏儸紀公園', x: 85, y: 30, lat: 34.668000, lng: 135.433000, color: '#4ade80' },
  // 右方 (修正：往5點鐘方向)
  { id: 'waterworld', code: 'F', name: 'F 水世界', x: 93, y: 58, lat: 34.668436, lng: 135.431870, color: '#67e8f9' },
  // 右方 (修正：往左下)
  { id: 'amity', code: 'G', name: 'G 親善村', x: 65, y: 48, lat: 34.666500, lng: 135.431000, color: '#fdba74' },
  
  // 下方 (修正：往右)
  { id: 'nintendo', code: 'H', name: 'H 任天堂世界', x: 88, y: 85, lat: 34.670000, lng: 135.432000, color: '#ef4444', textColor: 'white' },
  // 下方 (修正：往右)
  { id: 'harry_potter', code: 'I', name: 'I 哈利波特', x: 65, y: 85, lat: 34.665305, lng: 135.429082, color: '#1e293b', textColor: 'white' },
  // 下方 (修正：往2點鐘方向)
  { id: 'wonderland', code: 'J', name: 'J 環球奇境', x: 42, y: 73, lat: 34.663531, lng: 135.431924, color: '#f9a8d4' },
];

// 用於快速查找的 Map
const ZONES_MAP = ZONES_DATA.reduce((acc, zone) => {
    acc[zone.id] = zone;
    return acc;
}, {});

// 核心遊樂設施 (關聯 zone id)
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

// 完整設施清單 (部分範例，供 AI 參考)
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
  const [gpsLocation, setGpsLocation] = useState({ x: 50, y: 95 });
  const [realGpsEnabled, setRealGpsEnabled] = useState(false);
  const [displayWeather, setDisplayWeather] = useState({ condition: 'sunny', temp: 15, text: '尚未取得天氣資訊' });
  const [mapImage, setMapImage] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Hidden file input ref
  const fileInputRef = useRef(null);

  // --- Map Interaction State ---
  const mapContainerRef = useRef(null);
  const [viewState, setViewState] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    localStorage.setItem('usj_api_key', userApiKey);
  }, [userApiKey]);

  useEffect(() => {
    localStorage.setItem('usj_form_data', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('usj_saved_plans', JSON.stringify(savedPlans));
  }, [savedPlans]);

  useEffect(() => {
      const savedMap = localStorage.getItem('usj_map_image');
      if (savedMap) setMapImage(savedMap);
  }, []);

  const handleMapUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result;
              setMapImage(base64String);
              localStorage.setItem('usj_map_image', base64String);
          };
          reader.readAsDataURL(file);
      }
  };

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
                const { x, y } = projectGpsToMap(lat, lng);
                
                setGpsLocation({ 
                    x: Math.min(Math.max(x, -10), 110), 
                    y: Math.min(Math.max(y, -10), 110) 
                });
            },
            (error) => {
                console.error("GPS Error:", error);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
    }
    return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [realGpsEnabled, currentView]);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  
  const addExpressPass = () => {
      setFormData(prev => ({
          ...prev,
          expressPasses: [
              ...prev.expressPasses,
              { id: Date.now(), name: '', times: {} }
          ]
      }));
  };

  const removeExpressPass = (id) => {
      setFormData(prev => ({
          ...prev,
          expressPasses: prev.expressPasses.filter(p => p.id !== id)
      }));
  };

  const updateExpressPassName = (id, newName) => {
      setFormData(prev => ({
          ...prev,
          expressPasses: prev.expressPasses.map(p => 
              p.id === id ? { ...p, name: newName, times: {} } : p
          )
      }));
  };

  const updateExpressPassTime = (passId, attractionId, time) => {
      setFormData(prev => ({
          ...prev,
          expressPasses: prev.expressPasses.map(p => {
              if (p.id === passId) {
                  return {
                      ...p,
                      times: { ...p.times, [attractionId]: time }
                  };
              }
              return p;
          })
      }));
  };

  const handleEditItem = (item) => {
      setEditingItem(item);
      setIsEditModalOpen(true);
  };

  const handleAddItem = () => {
      setEditingItem(null); 
      setIsEditModalOpen(true);
  };

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
    const newPlan = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      name: `${formData.date} - ${formData.hasExpress ? '有快通' : '無快通'}行程`,
      formData: formData,
      itinerary: itinerary,
      weather: displayWeather
    };
    setSavedPlans(prev => [newPlan, ...prev]);
    alert('行程已儲存到「我的行程」！');
  };

  const loadPlan = (plan) => {
    setFormData(plan.formData);
    let items = Array.isArray(plan.itinerary) ? plan.itinerary : (plan.itineraryMap?.sunny || []);
    setItinerary(items);
    setDisplayWeather(plan.weather || { condition: 'sunny', temp: 15 });
    setCurrentView('plan');
  };

  const deletePlan = (id) => {
    if (window.confirm('確定要刪除這個行程嗎？')) {
      setSavedPlans(prev => prev.filter(p => p.id !== id));
    }
  };

  const callGeminiAPI = async () => {
    const activeKey = userApiKey || apiKey;
    if (!activeKey) {
        setErrorMsg("請輸入 Gemini API Key 或確認環境變數");
        return;
    }

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
        const officialScheduleUrl = "https://www.usj.co.jp/web/zh/tw/attractions/show-and-attraction-schedule";

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
                officialScheduleUrl: officialScheduleUrl
            }
        };

        const systemPrompt = `
          你是一位環球影城 (USJ) 的行程規劃專家。
          
          任務：
          1. 搜尋 ${formData.date} 的精確天氣與營業資訊。
          2. 根據天氣預報（例如：若下雨，避開戶外設施）、人流預測與使用者偏好，產生**唯一最佳**的行程表。
          
          核心規劃邏輯 - 依據使用者取向 (${formData.preferenceMode})：
          1. 不怕暈要刺激 (thrill): 優先安排飛天翼龍、好萊塢美夢、禁忌之旅。
          2. 怕暈別太刺激 (gentle): 絕對避免禁忌之旅、太空幻想。優先安排大白鯊、耀西、表演。
          3. 親子路線 (family): 優先安排環球奇境、小小兵、遊行。

          資料檢索與解析 (非常重要)：
          1. 營業時間 (OPERATING HOURS):
             - 使用 "Google Search" 從 ${forecastUrl} 搜尋 ${formData.date} 的資料。
             - 找出 '開園時間' (例如 19:00 閉園)。行程絕對不能超過此閉園時間。
          2. 天氣預報 (WEATHER):
             - 搜尋當日天氣。若有雨，戶外雲霄飛車 (飛天翼龍、好萊塢美夢) 必須安排在無雨時段或標註風險。
          3. 開園時間 (OPENING TIME):
             - 找出 '予想開園時間' (Expected Opening Time) 作為行程開始時間。
          4. 設施運休 (SUSPENSIONS):
             - 搜尋該日期 '休止' 設施並排除。

          行程規劃規則：
          1. 開園衝刺 (Morning Dash): 第一項設施排隊預估 < 20分 (咚奇剛除外)。
          2. 購物規劃: 如果 \`planShopping\` 為 true，安排專門購物時段。
          3. 填補空檔: 使用 \`facilityDatabase\` 中的餐廳、商店來豐富行程。
          4. 快速通關 & JCB: 絕對遵守 \`fixedTime\`。

          輸出格式：
          - 繁體中文。
          - 嚴格 JSON 格式：
          {
            "weatherSummary": "例如：晴時多雲，氣溫 15度",
            "itinerary": [
                { "start": "HH:MM", "end": "HH:MM", "name": "...", "type": "ride", "zoneId": "...", "wait": 20, "duration": 5, "description": "..." }
            ]
          }
          - 不要使用 markdown code blocks。
        `;

        const userPrompt = `請根據以下資料規劃行程：${JSON.stringify(contextData)}。
        使用者的取向是：${formData.preferenceMode}。
        請務必先搜尋 ${formData.date} 的官方營業時間、天氣與運休設施。
        JSON回應必須包含 weatherSummary 和 itinerary。`;

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

    } catch (err) {
        console.error(err);
        setErrorMsg("AI 生成失敗，請檢查 API Key 或稍後再試。\n" + err.message);
    } finally {
        setIsGenerating(false);
    }
  };

  const formatTime = (minutes) => {
    if (typeof minutes !== 'number') return minutes;
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleZoom = (direction) => {
      setViewState(prev => ({
          ...prev,
          scale: Math.min(Math.max(prev.scale + (direction * 0.5), 1), 5) 
      }));
  };

  const handleResetMap = () => {
      setViewState({ scale: 1, x: 0, y: 0 });
  };

  const onMouseDown = (e) => {
      setIsDragging(true);
      setStartPan({ x: e.clientX - viewState.x, y: e.clientY - viewState.y });
  };

  const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      setViewState(prev => ({
          ...prev,
          x: e.clientX - startPan.x,
          y: e.clientY - startPan.y
      }));
  };

  const onMouseUp = () => {
      setIsDragging(false);
  };

  const onTouchStart = (e) => {
      if (e.touches.length === 1) {
          setIsDragging(true);
          setStartPan({ x: e.touches[0].clientX - viewState.x, y: e.touches[0].clientY - viewState.y });
      }
  };

  const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      setViewState(prev => ({
          ...prev,
          x: e.touches[0].clientX - startPan.x,
          y: e.touches[0].clientY - startPan.y
      }));
  };

  const onTouchEnd = () => {
      setIsDragging(false);
  };

  const renderHome = () => (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white p-6 rounded-b-3xl shadow-lg relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 text-yellow-300 opacity-50" size={48} />
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">USJ AI 路線規劃 <span className="text-xs bg-yellow-400 text-blue-800 px-2 py-0.5 rounded-full">Gemini</span></h1>
        <p className="opacity-90 text-sm">輸入您的需求，AI 為您客製化最佳攻略</p>
      </div>

      <div className="px-4 space-y-4">
        {/* API Key */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
           <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
             <Key size={16} /> Gemini API Key (選填)
           </label>
           <input 
             type="password" 
             placeholder="若無環境變數，請輸入您的 Key (自動儲存)"
             value={userApiKey}
             onChange={(e) => setUserApiKey(e.target.value)}
             className="w-full p-2 border rounded-lg text-sm bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none"
           />
           <div className="mt-2 flex items-start gap-2 text-[10px] text-blue-700 bg-blue-50 p-2 rounded">
             <Globe size={12} className="mt-0.5"/>
             <p>已啟用 Google Search Grounding：AI 將自動搜尋當日官方時間表與人數預測網站。</p>
           </div>
        </div>

        {/* Date */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={18} /> 入園日期
          </label>
          <input 
            type="date" 
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Preference Mode */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <HeartPulse size={18} /> 設施安排取向
            </label>
            <div className="grid grid-cols-1 gap-2">
                <button
                    onClick={() => handleInputChange('preferenceMode', 'thrill')}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        formData.preferenceMode === 'thrill' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.preferenceMode === 'thrill' ? 'border-red-500' : 'border-gray-300'}`}>
                        {formData.preferenceMode === 'thrill' && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold flex items-center gap-2"><Zap size={14}/> 不怕暈要刺激 (Thrill)</div>
                        <div className="text-[10px] opacity-70">飛天翼龍、好萊塢美夢、禁忌之旅優先</div>
                    </div>
                </button>

                <button
                    onClick={() => handleInputChange('preferenceMode', 'gentle')}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        formData.preferenceMode === 'gentle' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.preferenceMode === 'gentle' ? 'border-green-500' : 'border-gray-300'}`}>
                        {formData.preferenceMode === 'gentle' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold flex items-center gap-2"><Coffee size={14}/> 怕暈別太刺激 (Gentle)</div>
                        <div className="text-[10px] opacity-70">避開旋轉/3D暈，享受表演與氣氛</div>
                    </div>
                </button>

                <button
                    onClick={() => handleInputChange('preferenceMode', 'family')}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        formData.preferenceMode === 'family' 
                        ? 'border-orange-500 bg-orange-50 text-orange-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.preferenceMode === 'family' ? 'border-orange-500' : 'border-gray-300'}`}>
                        {formData.preferenceMode === 'family' && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold flex items-center gap-2"><Baby size={14}/> 親子路線 (Family)</div>
                        <div className="text-[10px] opacity-70">環球奇境、小小兵、遊行優先</div>
                    </div>
                </button>
            </div>
        </div>

        {/* Express Pass Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock size={18} /> 快速通關券 (Express Pass)
            </span>
            <input 
              type="checkbox" 
              checked={formData.hasExpress}
              onChange={(e) => handleInputChange('hasExpress', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          
          {formData.hasExpress && (
            <div className="mt-3 space-y-4 animate-fade-in">
              {formData.expressPasses.map((pass, index) => (
                  <div key={pass.id} className="p-3 border rounded-lg bg-gray-50 relative group">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                              第 {index + 1} 張快通
                          </span>
                          <button 
                            onClick={() => removeExpressPass(pass.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="刪除此張快通"
                          >
                              <Trash2 size={16}/>
                          </button>
                      </div>

                      <select 
                        value={pass.name}
                        onChange={(e) => updateExpressPassName(pass.id, e.target.value)}
                        className="w-full p-2 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 mb-3"
                      >
                        <option value="">-- 請選擇快通版本 --</option>
                        {EXPRESS_PASS_RAW.map((p, idx) => (
                          <option key={idx} value={p}>{p.split('-')[1] || p}</option>
                        ))}
                      </select>

                      {/* Time Inputs for this pass */}
                      {pass.name && (
                        <div className="pl-2 border-l-2 border-blue-200 space-y-2">
                          {getExpressPassContent(pass.name).filter(i => i.timed).map(item => {
                            const attr = ATTRACTIONS.find(a => a.id === item.id);
                            return (
                              <div key={item.id} className="flex items-center justify-between">
                                <span className="text-xs text-gray-700 font-medium">
                                  {attr?.name}
                                  {item.choice && <span className="text-blue-500 ml-1">*</span>}
                                </span>
                                <input 
                                  type="time"
                                  value={pass.times[item.id] || ''}
                                  onChange={(e) => updateExpressPassTime(pass.id, item.id, e.target.value)}
                                  className="text-xs p-1.5 border rounded bg-white focus:ring-2 focus:ring-blue-200 outline-none w-24"
                                />
                              </div>
                            );
                          })}
                          {getExpressPassContent(pass.name).filter(i => i.timed).length === 0 && (
                              <p className="text-[10px] text-gray-500 italic">此票券無須指定場次</p>
                          )}
                        </div>
                      )}
                  </div>
              ))}

              <button 
                onClick={addExpressPass}
                className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
              >
                <PlusCircle size={16}/> 新增另一張快速通關券
              </button>
            </div>
          )}
        </div>

        {/* Other Options */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
           {!formData.hasExpress && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">任天堂整理券預計時段</label>
              <select 
                value={formData.nintendoEntryTime}
                onChange={(e) => handleInputChange('nintendoEntryTime', e.target.value)}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="morning">早上 (09:00 - 12:00)</option>
                <option value="afternoon">下午 (13:00 - 16:00)</option>
                <option value="evening">晚上 (17:00 後)</option>
              </select>
            </div>
          )}
           
           <div className="border-t pt-2 mt-2">
              <label className="flex items-center gap-2 mb-2">
                 <input type="checkbox" checked={formData.hasJCB} onChange={(e) => handleInputChange('hasJCB', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                 <span className="text-sm font-medium text-gray-700 flex items-center gap-1"><CreditCard size={16}/> 持有 JCB 極致卡 (飛天翼龍 VIP)</span>
              </label>
              
              {formData.hasJCB && (
                  <div className="bg-blue-50 p-3 rounded-lg ml-6 space-y-2 animate-fade-in border border-blue-100">
                      <p className="text-xs text-blue-800 leading-relaxed">
                          <span className="font-bold">✨ VIP 禮遇內容：</span><br/>
                          1. VIP 室休息 20 分鐘<br/>
                          2. 飛天翼龍快速通關 (免排隊)<br/>
                          3. 每次最多 4 名
                      </p>
                      <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-bold text-gray-700">預約時間：</span>
                          <input 
                              type="time"
                              value={formData.jcbTime || ''}
                              onChange={(e) => handleInputChange('jcbTime', e.target.value)}
                              className="text-xs p-1.5 border rounded bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                      </div>
                  </div>
              )}
           </div>

           <label className="flex items-center gap-2">
             <input type="checkbox" checked={formData.planShopping} onChange={(e) => handleInputChange('planShopping', e.target.checked)} />
             <span className="text-sm">特地規劃購物行程 (若無則塞滿設施)</span>
           </label>

           <label className="flex items-center gap-2">
             <input type="checkbox" checked={formData.needsTaxRefund} onChange={(e) => handleInputChange('needsTaxRefund', e.target.checked)} />
             <span className="text-sm">需要退稅 (預留 1 小時)</span>
          </label>
          <label className="flex items-center gap-2">
             <input type="checkbox" checked={formData.needsFood} onChange={(e) => handleInputChange('needsFood', e.target.checked)} />
             <span className="text-sm">包含餐廳推薦</span>
          </label>
          <div className="pt-2 border-t mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">特別要求</label>
            <textarea 
              value={formData.specialRequest}
              onChange={(e) => handleInputChange('specialRequest', e.target.value)}
              placeholder="例如：我不喜歡太刺激的設施、想看遊行..."
              className="w-full p-2 text-sm border rounded-lg h-20"
            />
          </div>
        </div>

        {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16}/> {errorMsg}
            </div>
        )}

        <button 
          onClick={callGeminiAPI}
          disabled={isGenerating}
          className={`w-full py-4 rounded-xl font-bold shadow-lg text-white transition-all flex justify-center items-center gap-2 ${
              isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 active:scale-95'
          }`}
        >
          {isGenerating ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                AI 正在規劃...
              </>
          ) : (
              <>
                <Sparkles size={20}/> 開始 AI 智能規劃
              </>
          )}
        </button>
      </div>
    </div>
  );

  const renderItinerary = () => {
    return (
    <div className="pb-24">
      <div className="bg-white sticky top-0 z-10 shadow-sm p-4 flex justify-between items-center">
        <h2 className="font-bold text-lg flex items-center gap-2"><Sparkles size={18} className="text-yellow-500"/> 專屬攻略</h2>
        <div className="flex gap-2">
            <button onClick={callGeminiAPI} className="p-2 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition-colors" title="更新天氣/情報">
                <RefreshCw size={20}/>
            </button>
            <button onClick={saveCurrentPlan} className="p-2 bg-green-100 rounded-full text-green-600 hover:bg-green-200 transition-colors" title="儲存行程">
                <Save size={20}/>
            </button>
            <button onClick={() => setCurrentView('map')} className="p-2 bg-gray-100 rounded-full text-blue-600"><MapIcon size={20}/></button>
            <button onClick={() => setCurrentView('home')} className="p-2 bg-gray-100 rounded-full text-gray-600"><Settings size={20}/></button>
        </div>
      </div>

      <div className="px-4 py-2 text-center text-xs text-gray-500 bg-blue-50 border-b border-blue-100 mb-4 flex items-center justify-center gap-2">
          {displayWeather.condition === 'rainy' ? <Umbrella size={14}/> : <Sun size={14}/>}
          {displayWeather.text}
      </div>

      <div className="px-4 relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {itinerary.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
                尚未有行程，請點擊「重新預測」或新增項目。
            </div>
        ) : (
            itinerary.map((item, index) => (
            <div key={index} className="flex gap-4 mb-6 relative animate-slide-in group" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="w-12 flex-shrink-0 flex flex-col items-center z-10">
                <div className={`w-3 h-3 rounded-full mb-1 ${
                    item.type === 'express' ? 'bg-yellow-400 ring-4 ring-yellow-100' : 
                    item.type === 'vip' ? 'bg-purple-500 ring-4 ring-purple-100' :
                    'bg-blue-500 ring-4 ring-blue-100'
                }`}></div>
                <span className="text-xs font-bold text-gray-500">{formatTime(item.start)}</span>
                </div>

                <div className={`flex-1 p-3 rounded-xl shadow-sm border-l-4 relative cursor-pointer hover:shadow-md transition-shadow ${
                    item.type === 'express' ? 'bg-yellow-50 border-yellow-400' : 
                    item.type === 'vip' ? 'bg-purple-50 border-purple-400' :
                    item.type === 'food' ? 'bg-orange-50 border-orange-400' :
                    item.type === 'move_wait' ? 'bg-gray-50 border-gray-300' :
                    'bg-white border-blue-500'
                }`} onClick={() => handleEditItem(item)}>
                    
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                        <div className="flex gap-2">
                            {item.zone && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 whitespace-nowrap">
                                    {item.zone.name}
                                </span>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item); }} className="text-gray-400 hover:text-red-500">
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 flex flex-col gap-1">
                        {item.wait > 0 && <span className="flex items-center gap-1"><Clock size={12}/> 預估等待 {item.wait}分</span>}
                        <span className="text-gray-400">{item.description}</span>
                        {item.type === 'express' && <span className="text-yellow-700 font-bold">✨ 快速通關</span>}
                        {item.type === 'vip' && <span className="text-purple-700 font-bold">💎 JCB VIP 禮遇</span>}
                    </div>
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit size={14} className="text-gray-400"/>
                    </div>
                </div>
            </div>
            ))
        )}
        
        <button 
            onClick={handleAddItem}
            className="w-full py-3 mt-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
            <Plus size={20}/> 新增自訂行程
        </button>
      </div>
    </div>
  )};

  const renderSavedPlans = () => (
    <div className="pb-20 h-full bg-gray-50">
        <div className="bg-white p-4 shadow-sm z-10 flex justify-between items-center sticky top-0">
            <h2 className="font-bold flex items-center gap-2"><FolderOpen size={20}/> 我的行程 ({savedPlans.length})</h2>
            <button onClick={() => setCurrentView('home')} className="text-blue-600 text-sm font-bold">建立新行程</button>
        </div>

        <div className="p-4 space-y-4">
            {savedPlans.length === 0 ? (
                <div className="text-center text-gray-400 py-10 flex flex-col items-center gap-2">
                    <FolderOpen size={40} className="opacity-20"/>
                    <p>目前沒有儲存的行程</p>
                    <button onClick={() => setCurrentView('home')} className="text-blue-500 underline text-sm">去規劃一個吧！</button>
                </div>
            ) : (
                savedPlans.map(plan => (
                    <div key={plan.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-800">{plan.name}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={12}/> {plan.formData.date}</p>
                            </div>
                            <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">{plan.timestamp}</span>
                        </div>
                        
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded flex flex-wrap gap-2">
                            {plan.formData.hasExpress ? 
                                <span className="text-yellow-600 bg-yellow-50 px-1 rounded border border-yellow-100">含 {plan.formData.expressPasses?.length || 1} 張快通</span> : 
                                <span className="text-gray-500">一般門票</span>
                            }
                            <span className="flex items-center gap-1">
                                {plan.formData.preferenceMode === 'gentle' ? <Coffee size={10}/> : 
                                 plan.formData.preferenceMode === 'family' ? <Baby size={10}/> : <Zap size={10}/>}
                                {plan.formData.preferenceMode === 'gentle' ? '怕暈' : 
                                 plan.formData.preferenceMode === 'family' ? '親子' : '刺激'}
                            </span>
                        </div>

                        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-50">
                            <button 
                                onClick={() => loadPlan(plan)}
                                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                                <ArrowRight size={16}/> 載入此行程
                            </button>
                            <button 
                                onClick={() => deletePlan(plan.id)}
                                className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 active:scale-95 transition-transform"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );

  const renderMap = () => (
    <div className="h-full flex flex-col bg-gray-100">
       <div className="bg-white p-4 shadow-sm z-10 flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2"><MapIcon size={20}/> 園區導航</h2>
        <div className="flex gap-2">
            <button 
                onClick={() => setRealGpsEnabled(!realGpsEnabled)}
                className={`p-2 rounded-full transition-colors flex items-center gap-1 ${realGpsEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
                <Locate size={16}/> {realGpsEnabled ? 'GPS 開啟' : '模擬定位'}
            </button>
            <button onClick={() => setCurrentView('plan')} className="text-blue-600 text-sm font-bold">返回列表</button>
        </div>
      </div>

      <div 
        className="flex-1 overflow-hidden relative bg-[#e0f2fe] flex items-center justify-center"
        ref={mapContainerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Transform Layer */}
        <div 
            style={{ 
                transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})`,
                transformOrigin: 'center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                display: 'inline-block' 
            }}
        >
            {/* Content Wrapper - Image + SVG */}
            <div className="relative shadow-2xl bg-white">
                {mapImage ? (
                    <img 
                        src={mapImage} 
                        alt="Uploaded Map" 
                        style={{ display: 'block', maxWidth: 'none', maxHeight: 'none' }}
                        draggable={false}
                    />
                ) : (
                    <div className="w-80 h-80 flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                        <MapIcon size={48} className="mb-2 opacity-20"/>
                        <p className="text-xs">請點擊右下角上傳地圖圖片</p>
                    </div>
                )}

                {/* Interactive Overlay Layer */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Zones */}
                    {ZONES_DATA.map(zone => {
                        // 區域使用手動設定的視覺座標
                        return (
                            <g key={zone.id} className="pointer-events-auto cursor-pointer" onClick={() => alert(zone.name)}>
                                <circle cx={zone.x} cy={zone.y} r="8" fill={zone.color} opacity="0.6" />
                                <text x={zone.x} y={zone.y} textAnchor="middle" dy="0.3em" fontSize="3" fill="black" fontWeight="bold" stroke="white" strokeWidth="0.1">
                                    {zone.name.substring(0, 4)} 
                                </text>
                                <text x={zone.x} y={zone.y} dy="-0.8em" textAnchor="middle" fontSize="3" fill="blue" fontWeight="bold">
                                    {zone.code} 
                                </text>
                            </g>
                        );
                    })}

                    {/* Attractions */}
                    {ATTRACTIONS.map(attr => {
                        const z = ZONES_MAP[attr.zone];
                        if (!z) return null;
                        
                        // 設施跟隨區域座標 + 隨機偏移
                        const offsetX = (Math.random() - 0.5) * 5;
                        const offsetY = (Math.random() - 0.5) * 5;
                        return (
                            <circle key={attr.id} cx={z.x + offsetX} cy={z.y + offsetY} r="1.5" fill="#fff" stroke="#333" strokeWidth="0.5" />
                        );
                    })}

                    {/* User GPS (Calculated) */}
                    <g transform={`translate(${gpsLocation.x}, ${gpsLocation.y})`}>
                        <circle r="4" fill="#3b82f6" opacity="0.3" className="animate-ping" />
                        <circle r="2" fill="#3b82f6" stroke="white" strokeWidth="0.5" />
                    </g>
                </svg>
            </div>
        </div>
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto">
            <button onClick={() => handleZoom(1)} className="p-2 bg-white rounded shadow text-gray-600 hover:text-blue-600">
                <ZoomIn size={20}/>
            </button>
            <button onClick={() => handleZoom(-1)} className="p-2 bg-white rounded shadow text-gray-600 hover:text-blue-600">
                <ZoomOut size={20}/>
            </button>
            <button onClick={handleResetMap} className="p-2 bg-white rounded shadow text-gray-600 hover:text-blue-600">
                <Maximize size={20}/>
            </button>
        </div>

        {/* Upload Button */}
        <div className="absolute bottom-20 right-4 pointer-events-auto">
            <button 
                onClick={() => fileInputRef.current.click()}
                className="p-3 bg-white rounded-full shadow-lg text-gray-600 hover:text-blue-600 transition-colors"
                title="上傳地圖圖片"
            >
                <ImageIcon size={24}/>
            </button>
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleMapUpload}
                accept="image/*"
                className="hidden"
            />
        </div>
        
        {/* Simulated GPS Controls (Only show if Real GPS is OFF) */}
        {!realGpsEnabled && (
            <div className="absolute bottom-6 right-4 bg-white p-2 rounded-lg shadow-lg pointer-events-auto">
                <button className="p-2 bg-blue-100 rounded-full text-blue-600 mb-2 block" onClick={() => {
                    const fakeLat = 34.666800 + (Math.random() - 0.5) * 0.005;
                    const fakeLng = 135.433000 + (Math.random() - 0.5) * 0.005;
                    const { x, y } = projectGpsToMap(fakeLat, fakeLng);
                    setGpsLocation({ x, y });
                }}>
                    <Navigation size={20} />
                </button>
                <span className="text-[10px] text-gray-500 block text-center">模擬移動</span>
            </div>
        )}

        {/* Map Calibration Notice */}
        <div className="absolute top-2 left-2 right-14 bg-white/90 p-2 rounded text-[10px] text-gray-500 shadow-sm pointer-events-none">
            地圖模式：目前 GPS 校正旋轉 285 度。請上傳對應的 USJ 完整地圖。
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
      
      <EditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        item={editingItem}
        onSave={handleSaveItem}
      />

      <div className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-200 flex justify-around py-3 text-xs text-gray-500 z-50">
          <button onClick={() => setCurrentView('plan')} className={`flex flex-col items-center gap-1 ${currentView === 'plan' ? 'text-blue-600' : ''}`}>
              <Clock size={20}/> 行程
          </button>
          <button onClick={() => setCurrentView('map')} className={`flex flex-col items-center gap-1 ${currentView === 'map' ? 'text-blue-600' : ''}`}>
              <MapIcon size={20}/> 地圖
          </button>
          <button onClick={() => setCurrentView('saved')} className={`flex flex-col items-center gap-1 ${currentView === 'saved' ? 'text-blue-600' : ''}`}>
              <FolderOpen size={20}/> 我的行程
          </button>
      </div>
    </div>
  );
}
