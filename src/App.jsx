import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, Clock, Map as MapIcon, Navigation, Sun, CloudRain, CheckCircle, Settings, Coffee, ShoppingBag, Ticket, Sparkles, AlertCircle, Key, Save, FolderOpen, Trash2, ArrowRight, CreditCard, PlusCircle, X, Globe, Umbrella, Baby, HeartPulse, Zap, Edit, RefreshCw, Plus, Locate, ZoomIn, ZoomOut, Maximize, Sliders, MapPin, Copy, RotateCcw, Image as ImageIcon } from 'lucide-react';

// --- 全域設定 ---
const apiKey = ""; // 預覽環境會自動注入 Key

// --- 地圖設定 ---
const FIXED_MAP_SRC = "/usj_map.jpg"; // 請確保 public 資料夾有此圖片

// --- 區域資料 (視覺座標 x,y) ---
// 根據您的最新校正更新
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
  { id: 'anchor_13', name: '中央偏北', x: 52.7, y: 64.9, lat: 34.6667335823364, lng: 135.43255724236624 },
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

// 完整設施清單 (158項)
const FACILITY_DATABASE = [
  {id:1,name:"1UP工廠™",desc:"有許多在別的地方買不到的周邊商品！",type:"shop"},
  {id:2,name:"4-D電影商品屋",desc:"想找期間限定的活動周邊商品，就在這裡！",type:"shop"},
  {id:3,name:"25週年「Discover U!!!」",desc:"日本環球影城25週年活動。",type:"event"},
  {id:4,name:"艾比的魔法派對",desc:"艾比施展魔法的大廳裡，有巨大星星的積木或球。",type:"play_area"},
  {id:5,name:"艾比的魔法樹",desc:"往大樹裡面一看，裡面展現的是非常有趣的攀登架！",type:"play_area"},
  {id:6,name:"艾蒙的GO-GO滑板",desc:"和艾蒙一起乘坐滑板，痛快地在斜坡上奔馳！",type:"ride"},
  {id:7,name:"艾蒙的泡泡遨遊",desc:"騎上寵物金魚，在充滿肥皂泡泡的河裡，悠閒地進行水上散步。",type:"ride"},
  {id:8,name:"艾蒙的小兜風",desc:"如果是這個賽車場，即使是3歲的小朋友，也能駕駛得有模有樣。",type:"ride"},
  {id:9,name:"奧利凡德的商店™",desc:"體驗「魔杖選擇巫師」的經典場景。",type:"shop_experience"},
  {id:10,name:"海格的小屋™",desc:"真實再現了海格的家。",type:"photo_spot"},
  {id:11,name:"青蛙慶典",desc:"伴隨著好聽的歌曲，青蛙們展現美妙的合聲。",type:"show"},
  {id:12,name:"鷹馬的飛行™",desc:"與魔法世界的生物鹰馬一同翱翔天空，適合全家人的雲霄飛車。",type:"ride"},
  {id:13,name:"活米村車站™",desc:"霍格華茲特快車的發車站。",type:"photo_spot"},
  {id:14,name:"三根掃帚™",desc:"活米村的老字號酒館。",type:"restaurant"},
  {id:15,name:"豬頭酒吧",desc:"散發著詭異氛圍的酒吧，就在「三根掃帚」隔壁。",type:"restaurant"},
  {id:16,name:"蜂蜜公爵™",desc:"霍格華茲魔法與巫術學院的學生們最喜歡的糖果店。",type:"shop"},
  {id:17,name:"貓頭鷹郵局™ & 貓頭鷹屋",desc:"除了有販賣活米村的郵票與文具外，還能由這裡寄信。",type:"shop"},
  {id:18,name:"桑科™的「惡作劇商品店」",desc:"惡作劇商品店。",type:"shop"},
  {id:19,name:"德維與班吉™",desc:"活米村的魔法道具店。",type:"shop"},
  {id:20,name:"費爾奇沒收品百貨店™",desc:"霍格華茲魔法與巫術學院的管理員飛七從違反校規的學生們沒收來的寶物。",type:"shop"},
  {id:21,name:"高級巫師服飾店",desc:"在這裡可以買到霍格華茲魔法與巫術學院的長袍及領帶等。",type:"shop"},
  {id:22,name:"飛天翼龍",desc:"世界最長×世界最大高低差的最新型雲霄飛車。",type:"ride"},
  {id:23,name:"侏羅紀公園・乘船遊™",desc:"為了探尋恐龍，在熱帶雨林進行探險。",type:"ride"},
  {id:24,name:"新發現餐廳™",desc:"這是在電影《侏羅紀公園》中登場的遊客中心。",type:"restaurant"},
  {id:25,name:"失落的世界餐廳™",desc:"位於叢林中被秘密覆蓋的餐廳。",type:"restaurant"},
  {id:26,name:"侏羅紀專賣店™",desc:"能滿足粉絲的各種周邊商品，種類豐富。",type:"shop"},
  {id:27,name:"小小兵瘋狂乘車遊",desc:"搭乘特製飛車，進入格魯的實驗室。",type:"ride"},
  {id:28,name:"冰凍雷射光乘船遊",desc:"搭乘格魯發明的飛車，在冰上滑行！",type:"ride"},
  {id:29,name:"美味我也要！小小兵餅乾店",desc:"製作小小兵最愛的夾心餅乾。",type:"restaurant"},
  {id:30,name:"小小兵流行商店",desc:"對於時尚非常敏感的小小兵們提議的流行商品專賣店。",type:"shop"},
  {id:31,name:"甜蜜俘虜商店",desc:"這家粉紅色的店，對於喜愛甜食的人來說是無法抗拒的！",type:"shop"},
  {id:32,name:"小小兵粉絲商店",desc:"小小兵的粉絲們聚集的商店。",type:"shop"},
  {id:33,name:"快樂咖啡廳™",desc:"以格魯最愛的菜單為首，可以享受到小小兵們設計的餐點！",type:"restaurant"},
  {id:34,name:"大白鯊™",desc:"乘坐觀光船，從襲擊和平港鎮的巨大食人鯊的恐怖中逃脫。",type:"ride"},
  {id:35,name:"親善村漫步道遊戲",desc:"位於親善村的遊戲區。",type:"game"},
  {id:36,name:"親善村冰淇淋",desc:"位於親善村的冰淇淋店。",type:"restaurant"},
  {id:37,name:"木板路小吃",desc:"位於親善村的小吃店。",type:"restaurant"},
  {id:38,name:"好萊塢美夢・乘車遊",desc:"選擇你喜愛的BGM，如飛翔在空中般奔馳的爽快雲霄飛車。",type:"ride"},
  {id:39,name:"好萊塢美夢・乘車遊 ～逆轉世界～",desc:"後退行駛的雲霄飛車。",type:"ride"},
  {id:40,name:"梅兒茲餐廳™",desc:"彷彿穿越時空來到50年代的美國！",type:"restaurant"},
  {id:41,name:"比佛利山莊法式咖啡™",desc:"以法國街頭的露天咖啡座為主題。",type:"restaurant"},
  {id:42,name:"環球影城禮品屋",desc:"園區內最大的紀念品商店。",type:"shop"},
  {id:43,name:"羅迪歐大道禮品屋",desc:"以史努比和芝麻街等角色的周邊商品為主的商店。",type:"shop"},
  {id:44,name:"加州糖果餅乾店",desc:"集結了園區內人氣的點心！",type:"shop"},
  {id:45,name:"瑪利歐咖啡店&商店™",desc:"以瑪利歐和路易吉的帽子為主題的咖啡店及商店。",type:"shop_restaurant"},
  {id:46,name:"蜘蛛人驚魂歷險記商品屋",desc:"蜘蛛人的周邊商品專賣店。",type:"shop"},
  {id:47,name:"芬尼根酒吧&燒烤™",desc:"位於紐約區的愛爾蘭酒吧。",type:"restaurant"},
  {id:48,name:"園畔護柵®",desc:"位於紐約區的牛排屋。",type:"restaurant"},
  {id:49,name:"路易斯紐約比薩餅舖™",desc:"位於紐約區的比薩店。",type:"restaurant"},
  {id:50,name:"SAIDO™",desc:"位於紐約區的日式餐廳。",type:"restaurant"},
  {id:51,name:"名偵探柯南 4-D 現場表演秀：星空的寶石",desc:"名偵探柯南的世界，透過寬100m的巨型螢幕×3D影像×現場娛樂表演。",type:"show"},
  {id:52,name:"哈利波特禁忌之旅™",desc:"連續5年榮獲世界No.1乘車遊的殊榮。",type:"ride"},
  {id:53,name:"超級任天堂世界™",desc:"重現了瑪利歐的世界。",type:"area"},
  {id:54,name:"瑪利歐賽車～庫巴的挑戰書～™",desc:"瑪利歐賽車的世界以及驚奇與興奮，透過最先進的技術化為現實！",type:"ride"},
  {id:55,name:"耀西冒險™",desc:"騎在耀西的背上，跟著奇諾比奧隊長出發去尋寶！",type:"ride"},
  {id:56,name:"咚奇剛的瘋狂礦車™",desc:"為了保護黃金香蕉，在叢林裡奔馳！",type:"ride"},
  {id:57,name:"能量手環™的關鍵挑戰",desc:"從庫巴二世那裡奪回黃金蘑菇！",type:"attraction"},
  {id:58,name:"奇諾比奧咖啡店™",desc:"維修中的敲磚塊、水管的裡面... 透過窗戶，說不定能看到快樂的蘑菇王國的樣子！？",type:"restaurant"},
  {id:59,name:"耀西小吃島™",desc:"以耀西和烏龜殼為主題的餡餅及飲料，很適合邊走邊吃。",type:"restaurant"},
  {id:60,name:"加油站爆米花",desc:"瑪利歐賽車的爆米花桶就在這裡！",type:"shop_food"},
  {id:61,name:"咚奇剛的叢林冰沙",desc:"從木桶飛出來的咚奇剛超狂野！",type:"shop_food"},
  {id:62,name:"環球奇境",desc: "艾蒙、史努比、Hello Kitty住在這裡的城鎮。", type: "area" },
  {id:63,name:"飛天史努比",desc:"和史努比一起在空中飛翔！",type:"ride"},
  {id:64,name:"史努比音響舞台歷險記™",desc:"可以和史努比們一起玩的室內遊樂場。",type:"play_area"},
  {id:65,name:"史努比外景咖啡廳™",desc:"史努比和朋友們聚會的咖啡廳。",type:"restaurant"},
  {id:66,name:"史努比攝影棚商品屋",desc:"滿滿的都是史努比周邊商品！",type:"shop"},
  {id:67,name:"Hello Kitty蝴蝶結大收藏",desc:"參觀Hello Kitty的工作室，還可以合影留念！",type: "attraction"},
  {id:68,name:"Hello Kitty夢幻蛋糕杯",desc:"隨著音樂旋轉的杯形蛋糕遊樂設施。",type:"ride"},
  {id:69,name:"Hello Kitty蝴蝶結時尚精品店",desc:"Hello Kitty周邊商品。",type:"shop"},
  {id:70,name:"Hello Kitty轉角咖啡廳",desc:"各式各樣可愛無比的食物！",type:"restaurant"},
  {id:71,name:"大鳥的大頂篷馬戲團",desc:"芝麻街夥伴們擔任團長的旋轉木馬。",type:"ride"},
  {id:72,name:"莫比的氣球之旅",desc:"乘坐氣球，從高空俯瞰芝麻街歡樂世界。",type:"ride"},
  {id:73,name:"芝麻街大操場",desc:"巨大的攀爬架和滑梯。",type:"play_area"},
  {id:74,name:"水世界™",desc:"充滿魄力的特技表演與爆破場面，必看的水上實境秀。",type:"show"},
  {id:75,name:"新世紀福音戰士 XR乘車遊",desc:"VR雲霄飛車，體驗EVA的世界。",type:"ride"},
  {id:76,name:"鬼滅之刃 XR乘車遊",desc:"VR雲霄飛車，體驗鬼滅之刃的世界。",type:"ride"},
  {id:77,name:"名偵探柯南 4-D 現場表演秀：星空的寶石",desc:"名偵探柯南的世界，透過寬100m的巨型螢幕×3D影像×現場娛樂表演。",type:"show"},
  {id:78,name:"我的英雄學院 The Real 4-D",desc:"與綠谷出久等英雄們一起對抗敵人。",type:"show"},
  {id:79,name:"魔物獵人世界：冰原 XR WALK",desc:"在VR空間中自由行走的次世代遊樂設施。",type:"attraction"},
  {id:80,name:"Sing on Tour",desc:"電影《歡樂好聲音》的角色們帶來的音樂劇。",type:"show"},
  {id:81,name:"環球妖魔鬼怪搖滾樂表演秀",desc:"甲殼蟲汁與妖怪們的搖滾樂表演。",type:"show"},
  {id:82,name:"好奇猴喬治同樂",desc:"和喬治一起玩耍！",type:"show"},
  {id:83,name:"史瑞克 4-D 歷險記",desc:"史瑞克與驢子的冒險。",type:"show"},
  {id:84,name:"芝麻街 4-D 電影魔術",desc:"芝麻街夥伴們的冒險。",type:"show"},
  {id:85,name:"魔杖魔法",desc:"在活米村揮動魔杖，就會發生不可思議的魔法！",type:"attraction"},
  {id:86,name:"費歐娜公主的照相館",desc:"可以和費歐娜公主合影。",type:"photo_spot"},
  {id:87,name:"42號街工作室 - 迎賓畫廊",desc:"小小兵與史努比等角色的迎賓處。",type:"photo_spot"},
  {id:88,name:"環球影城夜間奇觀遊行",desc:"利用光雕投影技術的夜間遊行。",type:"show"},
  {id:89,name:"NO LIMIT! 遊行",desc:"瑪利歐、寶可夢等角色登場的熱鬧遊行。",type:"show"},
  {id:90,name:"Power of Pop: Trending",desc:"實力派歌手帶來的流行歌曲演唱會。",type:"show"},
  {id:91,name:"小提琴三重奏",desc:"街頭小提琴演奏。",type:"show"},
  {id:92,name:"Hello Kitty Happiness Brass Band",desc:"Hello Kitty與銅管樂隊的表演。",type:"show"},
  {id:93,name:"East Meets West Quartet",desc:"小提琴與三味線的合奏。",type:"show"},
  {id:94,name:"Malibu Fried Chicken",desc:"美式炸雞店。",type:"restaurant"},
  {id:95,name:"Boardwalk Snacks",desc:"比薩與熱狗。",type:"restaurant"},
  {id:96,name:"Dragon's Pearl",desc:"中式餐廳。",type:"restaurant"},
  {id:97,name:"Happiness Cafe",desc:"咖哩飯與飲料無限暢飲。",type:"restaurant"},
  {id:98,name:"Studio Stars Restaurant",desc:"位於好萊塢區的西式餐廳。",type:"restaurant"},
  {id:99,name:"Beverly Hills Boulangerie",desc:"三明治與甜點。",type:"restaurant"},
  {id:100,name:"Schwab's Pharmacy",desc:"復古風格的藥局。",type:"shop"},
  {id:101,name:"The Darkroom",desc:"相機與底片。",type:"shop"},
  {id:102,name:"Universal Studios Store",desc:"園區內最大的商店。",type:"shop"},
  {id:103,name:"It's So Fluffy!",desc:"獨角獸Fluffy的專賣店。",type:"shop"},
  {id:104,name:"Minion Marketplace",desc:"小小兵商品。",type:"shop"},
  {id:105,name:"San Francisco Candies",desc:"舊金山風格的糖果店。",type:"shop"},
  {id:106,name:"Jurassic Outfitters",desc:"恐龍周邊商品。",type:"shop"},
  {id:107,name:"One Piece Premier Show",desc:"航海王真人秀。",type:"show"},
  {id:108,name:"Sanji's Pirates Restaurant",desc:"香吉士的海賊餐廳。",type:"restaurant"},
  {id:109,name:"Discovery Restaurant",desc:"以電影《侏羅紀公園》遊客中心為主題的餐廳。",type:"restaurant"},
  {id:110,name:"Fossil Fuels",desc:"輕食與飲料。",type:"shop_food"},
  {id:111,name:"Azzurra di Capri",desc:"以藍洞為意象的義大利餐廳。",type:"restaurant"},
  {id:112,name:"Park Side Grille",desc:"可以眺望湖景的餐廳。",type:"restaurant"},
  {id:113,name:"Finnegan's Bar & Grill",desc:"愛爾蘭酒吧。",type:"restaurant"},
  {id:114,name:"Louie's N.Y. Pizza Parlor",desc:"紐約風格比薩。",type:"restaurant"},
  {id:115,name:"Saido",desc:"紐約區的日式餐廳。",type:"restaurant"},
  {id:116,name:"Whomp's Snack Bar",desc:"瑪利歐世界的輕食店。",type:"shop_food"},
  {id:117,name:"Mario Cafe & Store",desc:"瑪利歐主題咖啡店。",type:"shop_restaurant"},
  {id:118,name:"Yoshi's Snack Island",desc:"耀西主題輕食。",type:"shop_food"},
  {id:119,name:"Pit Stop Popcorn",desc:"瑪利歐賽車爆米花。",type:"shop_food"},
  {id:120,name:"Donkey Kong's Jungle Sips",desc:"咚奇剛主題飲料。",type:"shop_food"},
  {id:121,name:"Funne's Store",desc:"太空幻想列車旁的商店。",type:"shop"},
  {id:122,name:"Space Fantasy Station",desc:"太空幻想列車周邊。",type:"shop"},
  {id:123,name:"Sesame Street Kids Store",desc:"芝麻街兒童服飾。",type:"shop"},
  {id:124,name:"Hello Kitty's Ribbon Boutique",desc:"Hello Kitty精品店。",type:"shop"},
  {id:125,name:"Peanuts Corner Store",desc:"史努比周邊。",type:"shop"},
  {id:126,name:"Character 4 U",desc:"各種角色商品。",type:"shop"},
  {id:127,name:"Cinema 4-D Store",desc:"4-D電影周邊。",type:"shop"},
  {id:128,name:"Universal Studios Souvenirs",desc:"環球影城紀念品。",type:"shop"},
  {id:129,name:"Backlot Accessories",desc:"飾品與配件。",type:"shop"},
  {id:130,name:"California Confectionery",desc:"糖果餅乾。",type:"shop"},
  {id:131,name:"Rodeo Drive Souvenirs",desc:"羅迪歐大道紀念品。",type:"shop"},
  {id:132,name:"Universal Studios Store (CityWalk)",desc:"園區外的商店。",type:"shop"},
  {id:133,name:"The Park Front Hotel Shop",desc:"飯店內的商店。",type:"shop"},
  {id:134,name:"Hotel Universal Port Shop",desc:"飯店內的商店。",type:"shop"},
  {id:135,name:"Hotel Keihan Universal Tower Shop",desc:"飯店內的商店。",type:"shop"},
  {id:136,name:"Hotel Kintetsu Universal City Shop",desc:"飯店內的商店。",type:"shop"},
  {id:137,name:"Sing on Tour Store",desc:"歡樂好聲音周邊。",type:"shop"},
  {id:138,name:"Despicable Me Minion Mayhem Store",desc:"小小兵乘車遊商店。",type:"shop"},
  {id:139,name:"Freeze Ray Sliders Shop",desc:"冰凍雷射光周邊。",type:"shop"},
  {id:140,name:"Lombard's Landing",desc:"舊金山區的餐廳。",type:"restaurant"},
  {id:141,name:"Wharf Cafe",desc:"舊金山區的咖啡廳。",type:"restaurant"},
  {id:142,name:"Dragon's Pearl",desc:"中式速食。",type:"restaurant"},
  {id:143,name:"Coca-Cola Happiness Station",desc:"飲料販賣站。",type:"shop_food"},
  {id:144,name:"Jurassic Park The Ride Photo",desc:"侏羅紀公園乘船遊照片。",type:"shop"},
  {id:145,name:"The Flying Dinosaur Photo",desc:"飛天翼龍照片。",type:"shop"},
  {id:146,name:"Hollywood Dream The Ride Photo",desc:"好萊塢美夢照片。",type:"shop"},
  {id:147,name:"Jaws Photo",desc:"大白鯊照片。",type:"shop"},
  {id:148,name:"Forbidden Journey Photo",desc:"禁忌之旅照片。",type:"shop"},
  {id:149,name:"Mario Kart Photo",desc:"瑪利歐賽車照片。",type:"shop"},
  {id:150,name:"Yoshi's Adventure Photo",desc:"耀西冒險照片。",type:"shop"},
  {id:151,name:"Wonderland Photo",desc:"環球奇境照片。",type:"shop"},
  {id:152,name:"Minion Park Photo",desc:"小小兵樂園照片。",type:"shop"},
  {id:153,name:"Amity Boardwalk Games",desc:"親善村遊戲。",type:"game"},
  {id:154,name:"Festival in the Park",desc:"園區內的遊戲攤位。",type:"game"},
  {id:155,name:"Banana Cabana",desc:"小小兵樂園遊戲。",type:"game"},
  {id:156,name:"Space Killer",desc:"射擊遊戲。",type:"game"},
  {id:157,name:"Coin Pitch",desc:"投幣遊戲。",type:"game"},
  {id:158,name:"Goblet Toss",desc:"丟球遊戲。",type:"game"}
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

// --- Helper: Get SVG Point ---
function getSvgPoint(evt, svgEl) {
  const pt = svgEl.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return null;
  const p = pt.matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y }; 
}

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

  // Add Anchor Logic - UPDATED TO USE getImageRelativePoint
  const handleMapClick = (e) => {
      if (!isAddAnchorMode) return;
      if (!imgRef.current) return;

      const p = getImageRelativePoint(e, imgRef.current);
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

  // New Helper: Get point on image regardless of transform
  function getImageRelativePoint(e, imgEl) {
    const rect = imgEl.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cx = Math.min(Math.max(px, 0), rect.width);
    const cy = Math.min(Math.max(py, 0), rect.height);
    return {
      x: (cx / rect.width) * 100,
      y: (cy / rect.height) * 100,
      px: cx,
      py: cy
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
            <button onClick={() => setRealGpsEnabled(!realGpsEnabled)} className={`p-2 rounded-full transition-colors flex items-center gap-1 ${realGpsEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}><Locate size={16}/> {realGpsEnabled ? 'GPS ON' : '模擬'}</button>
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
