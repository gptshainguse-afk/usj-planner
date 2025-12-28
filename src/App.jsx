import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Map as MapIcon, Navigation, Sun, CloudRain, CheckCircle, Settings, Coffee, ShoppingBag, Ticket, Sparkles, AlertCircle, Key, Save, FolderOpen, Trash2, ArrowRight, CreditCard, PlusCircle, X, Globe, Umbrella, Baby, HeartPulse, Zap } from 'lucide-react';

// --- 全域設定 ---
const apiKey = ""; // 預覽環境會自動注入 Key

// --- 資料庫與常數定義 ---

const ZONES = {
  HOLLYWOOD: { id: 'hollywood', name: '好萊塢區', x: 50, y: 85, color: '#fca5a5' },
  NEW_YORK: { id: 'new_york', name: '紐約區', x: 65, y: 70, color: '#93c5fd' },
  MINION: { id: 'minion', name: '小小兵樂園', x: 80, y: 60, color: '#fde047' },
  JURASSIC: { id: 'jurassic', name: '侏儸紀公園', x: 70, y: 40, color: '#4ade80' },
  WATERWORLD: { id: 'waterworld', name: '水世界', x: 30, y: 40, color: '#67e8f9' },
  AMITY: { id: 'amity', name: '親善村 (大白鯊)', x: 45, y: 55, color: '#fdba74' },
  HARRY_POTTER: { id: 'harry_potter', name: '哈利波特魔法世界', x: 85, y: 20, color: '#1e293b', textColor: 'white' },
  NINTENDO: { id: 'nintendo', name: '超級任天堂世界', x: 50, y: 15, color: '#ef4444', textColor: 'white' },
  WONDERLAND: { id: 'wonderland', name: '環球奇境', x: 20, y: 60, color: '#f9a8d4' },
};

// 核心遊樂設施 (用於計算等待時間與快通邏輯)
const ATTRACTIONS = [
  { id: 'donkey_kong', name: '咚奇剛的瘋狂礦車', zone: 'NINTENDO', type: 'ride', outdoor: true, duration: 5, wait: { holiday: 180, weekend: 140, weekday: 120 }, thrill: 'high' },
  { id: 'mario_kart', name: '瑪利歐賽車：庫巴的挑戰書', zone: 'NINTENDO', type: 'ride', outdoor: false, duration: 5, wait: { holiday: 120, weekend: 90, weekday: 60 }, thrill: 'medium' },
  { id: 'yoshi', name: '耀西冒險', zone: 'NINTENDO', type: 'ride', outdoor: true, duration: 5, wait: { holiday: 110, weekend: 80, weekday: 60 }, thrill: 'low' },
  { id: 'harry_potter_journey', name: '哈利波特禁忌之旅', zone: 'HARRY_POTTER', type: 'ride', outdoor: false, duration: 5, wait: { holiday: 110, weekend: 80, weekday: 45 }, thrill: 'high_motion' },
  { id: 'hippogriff', name: '鷹馬的飛行', zone: 'HARRY_POTTER', type: 'ride', outdoor: true, duration: 2, wait: { holiday: 110, weekend: 80, weekday: 60 }, thrill: 'medium' },
  { id: 'flying_dinosaur', name: '飛天翼龍', zone: 'JURASSIC', type: 'ride', outdoor: true, duration: 3, wait: { holiday: 90, weekend: 50, weekday: 30 }, thrill: 'extreme' },
  { id: 'jurassic_park', name: '侏羅紀公園乘船遊', zone: 'JURASSIC', type: 'ride', outdoor: true, duration: 7, wait: { holiday: 60, weekend: 45, weekday: 30 }, thrill: 'medium_water' },
  { id: 'minion_mayhem', name: '小小兵瘋狂乘車遊', zone: 'MINION', type: 'ride', outdoor: false, duration: 18, wait: { holiday: 60, weekend: 45, weekday: 30 }, thrill: 'medium_motion' },
  { id: 'minion_ice', name: '冰凍雷射光乘船遊', zone: 'MINION', type: 'ride', outdoor: false, duration: 5, wait: { holiday: 30, weekend: 25, weekday: 10 }, thrill: 'low' },
  { id: 'hollywood_dream', name: '好萊塢美夢乘車遊', zone: 'HOLLYWOOD', type: 'ride', outdoor: true, duration: 3, wait: { holiday: 110, weekend: 80, weekday: 45 }, thrill: 'high' },
  { id: 'hollywood_backdrop', name: '好萊塢美夢乘車遊-逆轉世界', zone: 'HOLLYWOOD', type: 'ride', outdoor: true, duration: 3, wait: { holiday: 110, weekend: 80, weekday: 45 }, thrill: 'high' },
  { id: 'jaws', name: '大白鯊', zone: 'AMITY', type: 'ride', outdoor: true, duration: 7, wait: { holiday: 50, weekend: 30, weekday: 20 }, thrill: 'low' },
  { id: 'conan_4d', name: '名偵探柯南 4-D', zone: 'HOLLYWOOD', type: 'show', outdoor: false, duration: 30, wait: { holiday: 30, weekend: 30, weekday: 20 }, thrill: 'low' },
  { id: 'spy_family', name: 'SPY x FAMILY XR 乘車遊', zone: 'HOLLYWOOD', type: 'ride', outdoor: false, duration: 10, wait: { holiday: 120, weekend: 90, weekday: 60 }, thrill: 'high_vr' },
  { id: 'space_fantasy', name: '太空幻想列車', zone: 'HOLLYWOOD', type: 'ride', outdoor: false, duration: 10, wait: { holiday: 60, weekend: 45, weekday: 30 }, thrill: 'medium_spin' },
  { id: 'jujutsu_4d', name: '咒術迴戰 The Real 4-D', zone: 'HOLLYWOOD', type: 'show', outdoor: false, duration: 20, wait: { holiday: 50, weekend: 30, weekday: 20 }, thrill: 'low' },
  { id: 'waterworld_show', name: '水世界表演', zone: 'WATERWORLD', type: 'show', outdoor: true, duration: 20, wait: { holiday: 20, weekend: 20, weekday: 15 }, thrill: 'show' },
];

// 完整設施清單 (151項)
const FACILITY_DATABASE = [
  {id:1,name:"1UP工廠™",desc:"有許多在別的地方買不到的周邊商品！可愛的玩具工場生產蘑菇王國所有的物品。",type:"shop"},
  {id:2,name:"4-D電影商品屋",desc:"想找期間限定的活動周邊商品，就在這裡！",type:"shop"},
  {id:3,name:"25週年「Discover U!!!」 日本環球影城",desc:"日本環球影城25週年活動。2026年3月4日～2027年3月30日。",type:"event"},
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
  {id:150,name:"Lombard’s Landing™",desc:"園區特有的餐廳。",type:"restaurant"},
  {id:151,name:"Monster Hunter Wilds餐廳",desc:"魔物獵人主題餐廳。",type:"restaurant"},
  // ... 其他設施會由 AI 根據上網搜尋與內建知識補足
];

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
  27: [{id:'mario_kart',t:true, note:'Play Twice'}, {id:'harry_potter_journey',t:true}, {id:'space_fantasy',t:false}, {id:'flying_dinosaur',t:false}],
  28: [{id:'mario_kart',t:true}, {id:'harry_potter_journey',t:true}, {id:'minion_mayhem',t:false}, {id:'jaws',t:false, choice:'or_jurassic'}]
};

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

// --- 組件開始 ---

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
  
  const [itineraryMap, setItineraryMap] = useState({
      sunny: [],
      rain_am: [],
      rain_pm: [],
      rain_all: []
  });
  
  const [activeWeatherTab, setActiveWeatherTab] = useState('sunny');
  const [gpsLocation, setGpsLocation] = useState({ x: 50, y: 95 });
  const [displayWeather, setDisplayWeather] = useState({ condition: 'sunny', temp: 15 });

  useEffect(() => {
    localStorage.setItem('usj_api_key', userApiKey);
  }, [userApiKey]);

  useEffect(() => {
    localStorage.setItem('usj_form_data', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('usj_saved_plans', JSON.stringify(savedPlans));
  }, [savedPlans]);

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

  const saveCurrentPlan = () => {
    if (Object.keys(itineraryMap).length === 0) return;
    const newPlan = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      name: `${formData.date} - ${formData.hasExpress ? '有快通' : '無快通'}行程`,
      formData: formData,
      itineraryMap: itineraryMap, 
      weather: displayWeather
    };
    setSavedPlans(prev => [newPlan, ...prev]);
    alert('行程已儲存到「我的行程」！');
  };

  const loadPlan = (plan) => {
    setFormData(plan.formData);
    if (Array.isArray(plan.itinerary)) {
        setItineraryMap({
            sunny: plan.itinerary,
            rain_am: [],
            rain_pm: [],
            rain_all: []
        });
    } else {
        setItineraryMap(plan.itineraryMap || { sunny: [], rain_am: [], rain_pm: [], rain_all: [] });
    }
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
        const officialScheduleUrl = "[https://www.usj.co.jp/web/zh/tw/attractions/show-and-attraction-schedule](https://www.usj.co.jp/web/zh/tw/attractions/show-and-attraction-schedule)";

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
          
          任務：產生 4 種不同的行程表，分別對應以下天氣狀況：
          1. sunny: 整日無雨
          2. rain_am: 上午有雨
          3. rain_pm: 下午有雨
          4. rain_all: 整日有雨

          **核心規劃邏輯 - 依據使用者取向 (${formData.preferenceMode})**：
          1. **不怕暈要刺激 (thrill)**: 優先安排飛天翼龍、好萊塢美夢、禁忌之旅。
          2. **怕暈別太刺激 (gentle)**: 絕對避免禁忌之旅、太空幻想。優先安排大白鯊、耀西、表演。
          3. **親子路線 (family)**: 優先安排環球奇境、小小兵、遊行。

          資料檢索與解析 (非常重要)：
          1. **營業時間 (OPERATING HOURS)**:
             - 使用 "Google Search" 從 ${forecastUrl} 搜尋 ${formData.date} 的資料。
             - 找出 '開園時間'。後者 (例如 19:00) 是絕對閉園時間，行程不能超過此時間。
          2. **開園時間 (OPENING TIME)**:
             - 找出 '予想開園時間' (Expected Opening Time) 作為行程開始時間。
          3. **設施運休 (SUSPENSIONS)**:
             - 搜尋該日期是否有 '休止' (Suspended) 的設施，必須在行程中排除。

          行程規劃規則：
          1. **開園衝刺 (Morning Dash)**: 第一項設施排隊預估 < 20分 (咚奇剛除外)。
          2. **購物規劃**: 如果 \`planShopping\` 為 true，安排專門購物時段。
          3. **填補空檔**: 使用 \`facilityDatabase\` 中的餐廳、商店來豐富行程。
          4. **快速通關 & JCB**: 絕對遵守 \`fixedTime\`。

          輸出格式：
          - 繁體中文。
          - 嚴格 JSON 物件，包含四個鍵值：\`sunny\`, \`rain_am\`, \`rain_pm\`, \`rain_all\`。
          - 不要使用 markdown code blocks。
        `;

        const userPrompt = `請根據以下資料規劃行程：${JSON.stringify(contextData)}。
        使用者的取向是：${formData.preferenceMode}。
        請務必先搜尋 ${formData.date} 的官方營業時間與運休設施。
        JSON回應必須包含四個key: sunny, rain_am, rain_pm, rain_all。`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${activeKey}`, {
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

        // 增強：移除 Markdown 標記，確保 JSON 解析成功
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
                    zone: ZONES[item.zoneId] || null
                };
            });
        };

        // 增強：鍵值容錯處理 (防止 AI 回傳大寫或中文 Key)
        setItineraryMap({
            sunny: processItinerary(resultObj.sunny || resultObj.Sunny || resultObj['整日無雨']),
            rain_am: processItinerary(resultObj.rain_am || resultObj.Rain_am || resultObj['上午有雨']),
            rain_pm: processItinerary(resultObj.rain_pm || resultObj.Rain_pm || resultObj['下午有雨']),
            rain_all: processItinerary(resultObj.rain_all || resultObj.Rain_all || resultObj['整日有雨']),
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

        {/* Preference Mode (NEW) */}
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
                AI 正在規劃 4 種天氣備案...
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
    const currentItinerary = itineraryMap[activeWeatherTab] || [];

    const weatherTabs = [
        { id: 'sunny', label: '整日無雨', icon: <Sun size={14} className="text-orange-500"/> },
        { id: 'rain_am', label: '上午有雨', icon: <CloudRain size={14} className="text-blue-400"/> },
        { id: 'rain_pm', label: '下午有雨', icon: <CloudRain size={14} className="text-blue-600"/> },
        { id: 'rain_all', label: '整日有雨', icon: <Umbrella size={14} className="text-purple-500"/> },
    ];

    return (
    <div className="pb-20">
      <div className="bg-white sticky top-0 z-10 shadow-sm p-4 flex justify-between items-center">
        <h2 className="font-bold text-lg flex items-center gap-2"><Sparkles size={18} className="text-yellow-500"/> AI 推薦行程</h2>
        <div className="flex gap-2">
            <button onClick={saveCurrentPlan} className="p-2 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition-colors" title="儲存行程">
                <Save size={20}/>
            </button>
            <button onClick={() => setCurrentView('map')} className="p-2 bg-gray-100 rounded-full text-blue-600"><MapIcon size={20}/></button>
            <button onClick={() => setCurrentView('home')} className="p-2 bg-gray-100 rounded-full text-gray-600"><Settings size={20}/></button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2 bg-gray-50 flex gap-2 overflow-x-auto">
          {weatherTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveWeatherTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    activeWeatherTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                  {tab.icon} {tab.label}
              </button>
          ))}
      </div>

      <div className="px-4 py-2 text-center text-xs text-gray-500 bg-yellow-50 border-b border-yellow-100 mb-4">
          此為 <b>{weatherTabs.find(t => t.id === activeWeatherTab).label}</b> 情況下的建議路線
      </div>

      <div className="px-4 relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {currentItinerary.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
                AI 未能生成此天氣條件下的行程，請重試。<br/>
                (請確認 API Key 是否正確，或稍後再試)
            </div>
        ) : (
            currentItinerary.map((item, index) => (
            <div key={index} className="flex gap-4 mb-6 relative animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="w-12 flex-shrink-0 flex flex-col items-center z-10">
                <div className={`w-3 h-3 rounded-full mb-1 ${
                    item.type === 'express' ? 'bg-yellow-400 ring-4 ring-yellow-100' : 
                    item.type === 'vip' ? 'bg-purple-500 ring-4 ring-purple-100' :
                    'bg-blue-500 ring-4 ring-blue-100'
                }`}></div>
                <span className="text-xs font-bold text-gray-500">{formatTime(item.start)}</span>
                </div>

                <div className={`flex-1 p-3 rounded-xl shadow-sm border-l-4 ${
                    item.type === 'express' ? 'bg-yellow-50 border-yellow-400' : 
                    item.type === 'vip' ? 'bg-purple-50 border-purple-400' :
                    item.type === 'food' ? 'bg-orange-50 border-orange-400' :
                    item.type === 'move_wait' ? 'bg-gray-50 border-gray-300' :
                    'bg-white border-blue-500'
                }`}>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                    {item.zone && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 whitespace-nowrap">
                            {item.zone.name}
                        </span>
                    )}
                </div>
                
                <div className="mt-2 text-xs text-gray-500 flex flex-col gap-1">
                    {item.wait > 0 && <span className="flex items-center gap-1"><Clock size={12}/> 預估等待 {item.wait}分</span>}
                    <span className="text-gray-400">{item.description}</span>
                    {item.type === 'express' && <span className="text-yellow-700 font-bold">✨ 快速通關</span>}
                    {item.type === 'vip' && <span className="text-purple-700 font-bold">💎 JCB VIP 禮遇</span>}
                </div>
                </div>
            </div>
            ))
        )}
        
        <div className="text-center text-xs text-gray-400 mt-8 mb-4">
            已加入儲存功能，請點擊上方儲存按鈕保存行程
        </div>
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
        <button onClick={() => setCurrentView('plan')} className="text-blue-600 text-sm font-bold">返回列表</button>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#e0f2fe]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {Object.values(ZONES).map(zone => (
                <g key={zone.id}>
                    <circle cx={zone.x} cy={zone.y} r="12" fill={zone.color} opacity="0.8" />
                    <text x={zone.x} y={zone.y} textAnchor="middle" dy="0.3em" fontSize="3" fill={zone.textColor || '#333'} fontWeight="bold">
                        {zone.name.substring(0, 4)}
                    </text>
                </g>
            ))}
            {ATTRACTIONS.map(attr => {
                const z = ZONES[attr.zone];
                const offsetX = (Math.random() - 0.5) * 10;
                const offsetY = (Math.random() - 0.5) * 10;
                return <circle key={attr.id} cx={z.x + offsetX} cy={z.y + offsetY} r="1.5" fill="#fff" stroke="#333" strokeWidth="0.5" />;
            })}
            <g transform={`translate(${gpsLocation.x}, ${gpsLocation.y})`}>
                <circle r="3" fill="#3b82f6" className="animate-pulse" />
                <circle r="1" fill="white" />
            </g>
        </svg>
        
        <div className="absolute bottom-6 right-4 bg-white p-2 rounded-lg shadow-lg">
            <button className="p-2 bg-blue-100 rounded-full text-blue-600 mb-2 block" onClick={() => setGpsLocation({ x: Math.random()*80+10, y: Math.random()*80+10 })}>
                <Navigation size={20} />
            </button>
            <span className="text-[10px] text-gray-500 block text-center">模擬定位</span>
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
