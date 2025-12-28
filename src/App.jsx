import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Map as MapIcon, Navigation, Sun, CloudRain, CheckCircle, Settings, Coffee, ShoppingBag, Ticket, Sparkles, AlertCircle, Key, Save, FolderOpen, Trash2, ArrowRight, CreditCard, PlusCircle, X, Globe } from 'lucide-react';

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

const ATTRACTIONS = [
  { id: 'donkey_kong', name: '咚奇剛的瘋狂礦車', zone: 'NINTENDO', type: 'ride', outdoor: true, duration: 5, wait: { holiday: 180, weekend: 140, weekday: 120 } },
  { id: 'mario_kart', name: '瑪利歐賽車：庫巴的挑戰書', zone: 'NINTENDO', type: 'ride', outdoor: false, duration: 5, wait: { holiday: 120, weekend: 90, weekday: 60 } },
  { id: 'yoshi', name: '耀西冒險', zone: 'NINTENDO', type: 'ride', outdoor: true, duration: 5, wait: { holiday: 110, weekend: 80, weekday: 60 } },
  { id: 'harry_potter_journey', name: '哈利波特禁忌之旅', zone: 'HARRY_POTTER', type: 'ride', outdoor: false, duration: 5, wait: { holiday: 110, weekend: 80, weekday: 45 } },
  { id: 'hippogriff', name: '鷹馬的飛行', zone: 'HARRY_POTTER', type: 'ride', outdoor: true, duration: 2, wait: { holiday: 110, weekend: 80, weekday: 60 } },
  { id: 'flying_dinosaur', name: '飛天翼龍', zone: 'JURASSIC', type: 'ride', outdoor: true, duration: 3, wait: { holiday: 90, weekend: 50, weekday: 30 } },
  { id: 'jurassic_park', name: '侏羅紀公園乘船遊', zone: 'JURASSIC', type: 'ride', outdoor: true, duration: 7, wait: { holiday: 60, weekend: 45, weekday: 30 } },
  { id: 'minion_mayhem', name: '小小兵瘋狂乘車遊', zone: 'MINION', type: 'ride', outdoor: false, duration: 18, wait: { holiday: 60, weekend: 45, weekday: 30 } },
  { id: 'minion_ice', name: '冰凍雷射光乘船遊', zone: 'MINION', type: 'ride', outdoor: false, duration: 5, wait: { holiday: 30, weekend: 25, weekday: 10 } },
  { id: 'hollywood_dream', name: '好萊塢美夢乘車遊', zone: 'HOLLYWOOD', type: 'ride', outdoor: true, duration: 3, wait: { holiday: 110, weekend: 80, weekday: 45 } },
  { id: 'hollywood_backdrop', name: '好萊塢美夢乘車遊-逆轉世界', zone: 'HOLLYWOOD', type: 'ride', outdoor: true, duration: 3, wait: { holiday: 110, weekend: 80, weekday: 45 } },
  { id: 'jaws', name: '大白鯊', zone: 'AMITY', type: 'ride', outdoor: true, duration: 7, wait: { holiday: 50, weekend: 30, weekday: 20 } },
  { id: 'conan_4d', name: '名偵探柯南 4-D', zone: 'HOLLYWOOD', type: 'show', outdoor: false, duration: 30, wait: { holiday: 30, weekend: 30, weekday: 20 } },
  { id: 'spy_family', name: 'SPY x FAMILY XR 乘車遊', zone: 'HOLLYWOOD', type: 'ride', outdoor: false, duration: 10, wait: { holiday: 120, weekend: 90, weekday: 60 } },
  { id: 'space_fantasy', name: '太空幻想列車', zone: 'HOLLYWOOD', type: 'ride', outdoor: false, duration: 10, wait: { holiday: 60, weekend: 45, weekday: 30 } },
  { id: 'jujutsu_4d', name: '咒術迴戰 The Real 4-D', zone: 'HOLLYWOOD', type: 'show', outdoor: false, duration: 20, wait: { holiday: 50, weekend: 30, weekday: 20 } },
  { id: 'waterworld_show', name: '水世界表演', zone: 'WATERWORLD', type: 'show', outdoor: true, duration: 20, wait: { holiday: 20, weekend: 20, weekday: 15 } },
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
                 }]
             };
        }
        return parsed;
      }
      return defaultFormData;
    } catch (e) {
      return defaultFormData;
    }
  });
  
  const [itinerary, setItinerary] = useState([]);
  const [weather, setWeather] = useState({ condition: 'sunny', temp: 15 });
  const [gpsLocation, setGpsLocation] = useState({ x: 50, y: 95 });

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
    const conditions = ['sunny', 'cloudy', 'rainy'];
    const randomCond = conditions[Math.floor(Math.random() * conditions.length)];
    setWeather({
      condition: randomCond,
      temp: Math.floor(Math.random() * 10) + 10
    });
  }, [formData.date]);

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
    if (itinerary.length === 0) return;
    const newPlan = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      name: `${formData.date} - ${formData.hasExpress ? '有快通' : '無快通'}行程`,
      formData: formData,
      itinerary: itinerary,
      weather: weather
    };
    setSavedPlans(prev => [newPlan, ...prev]);
    alert('行程已儲存到「我的行程」！');
  };

  const loadPlan = (plan) => {
    setFormData(plan.formData);
    setItinerary(plan.itinerary);
    setWeather(plan.weather || { condition: 'sunny', temp: 15 });
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

        // 動態生成預測網站 URL
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1; // 1-12
        const forecastUrl = `https://usjreal.asumirai.info/monthly/usj-forecast-${year}-${month}.html`;
        const officialScheduleUrl = "https://www.usj.co.jp/web/zh/tw/attractions/show-and-attraction-schedule";

        // 整合多張快通券資料
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
            weather: weather,
            ticketDuration: formData.duration,
            expressPasses: allExpressPassDetails.length > 0 ? allExpressPassDetails : "None",
            preferences: {
                nintendoEntry: formData.nintendoEntryTime,
                hasJCB: formData.hasJCB,
                jcbReservationTime: formData.jcbTime, 
                needsTaxRefund: formData.needsTaxRefund,
                needsFood: formData.needsFood,
                endTime: formData.endTime, // This is the user preference, but AI needs to check official closing time
                special: formData.specialRequest
            },
            attractions: ATTRACTIONS.map(a => ({
                id: a.id,
                name: a.name,
                zone: a.zone,
                type: a.type,
                wait: a.wait[dayType],
                duration: a.duration,
                outdoor: a.outdoor
            })),
            dataSources: {
                crowdForecastUrl: forecastUrl,
                officialScheduleUrl: officialScheduleUrl
            }
        };

        const systemPrompt = `
          You are an expert USJ (Universal Studios Japan) itinerary planner.
          
          TASK: Create a strict JSON schedule that minimizes waiting and walking distance.

          MANDATORY DATA RETRIEVAL & PARSING FROM SEARCH RESULTS (CRITICAL):
          1. **OPERATING HOURS (開園時間)**:
             - Use "Google Search" to access ${forecastUrl} and find the specific row for ${formData.date}.
             - Look for the '開園時間' column which has a format like "9:00 〜 19:00".
             - **EXTRACT CLOSING TIME**: The second part (e.g., 19:00) is the STRICT PARK CLOSING TIME.
             - **CONSTRAINT**: The itinerary MUST end by this Closing Time. If user's input ${formData.endTime} is later than the found closing time (e.g., 19:00), YOU MUST USE THE FOUND CLOSING TIME (19:00).
          
          2. **OPENING TIME (予想開園時間)**:
             - Look for the '予想開園時間' (Expected Opening Time) column (e.g., "8時15分").
             - **START TIME**: Use this "Expected Opening Time" as the start of the itinerary. If not explicitly found, assume the park opens 30-60 mins before the "Official Open Time" (e.g., if official is 9:00, assume 8:30 start).
          
          3. **SUSPENSIONS**:
             - Look for "Suspended" (休止) text in the forecast table for that date. Exclude these attractions.
          
          CRITICAL RULES FOR MULTIPLE EXPRESS PASSES:
          1. Treat ALL 'fixedTime' entries as absolute constraints. 
          2. For non-timed items in ANY pass, schedule them to use Express (wait=0) at optimal times.
          3. If an item has a 'choiceGroup', choose ONE option per occurrence.
          
          CRITICAL RULES FOR JCB:
          1. IF 'preferences.hasJCB' is true AND 'jcbReservationTime' is set:
             - Schedule "JCB Lounge & Flying Dinosaur VIP" at 'jcbReservationTime'.
             - This replaces ONE standard/express ride of Flying Dinosaur.
          
          Output strict JSON array only. No markdown.
          
          Output JSON Schema:
          [
            {
              "start": "HH:MM",
              "end": "HH:MM", 
              "name": "Activity Name",
              "type": "ride" | "food" | "express" | "show" | "move_wait" | "misc" | "vip",
              "zoneId": "HOLLYWOOD" | "NINTENDO" etc.,
              "wait": number,
              "duration": number,
              "description": "Short note (e.g., 'Using Pass 1', 'Park Closes at 19:00 based on forecast')"
            }
          ]
        `;

        const userPrompt = `Plan an itinerary based on this data: ${JSON.stringify(contextData)}. 
        IMPORTANT: Search specifically for the '開園時間' text (e.g. '9:00 〜 19:00') for ${formData.date} on the forecast site. 
        If it says 19:00 close, DO NOT schedule anything past 19:00. 
        Also look for '予想開園時間' (e.g. 8:15) and start the plan then.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                tools: [{ google_search: {} }], // 啟用搜尋工具
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) throw new Error("API Request Failed");
        
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) throw new Error("No data generated");

        const schedule = JSON.parse(generatedText);
        
        const parsedItinerary = schedule.map(item => {
            const [sh, sm] = item.start.split(':').map(Number);
            const startMins = sh * 60 + sm;
            return {
                ...item,
                start: startMins,
                zone: ZONES[item.zoneId] || null
            };
        });

        setItinerary(parsedItinerary);
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

  const renderItinerary = () => (
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

      <div className="p-4 bg-blue-50 m-4 rounded-xl flex items-center justify-between border border-blue-100">
        <div className="flex items-center gap-3">
            {weather.condition === 'sunny' ? <Sun className="text-orange-500" /> : <CloudRain className="text-blue-500" />}
            <div>
                <p className="font-bold text-gray-800">{formData.date}</p>
                <p className="text-xs text-gray-600">預測氣溫 {weather.temp}°C</p>
            </div>
        </div>
      </div>

      <div className="px-4 relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {itinerary.map((item, index) => (
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
        ))}
        
        <div className="text-center text-xs text-gray-400 mt-8 mb-4">
            已加入儲存功能，請點擊上方儲存按鈕保存行程
        </div>
      </div>
    </div>
  );

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
                            <span>{plan.itinerary.length} 個行程項目</span>
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
