import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, Clock, Map as MapIcon, Navigation, Sun, CloudRain, CheckCircle, Settings, Coffee, ShoppingBag, Ticket, Sparkles, AlertCircle, Key, Save, FolderOpen, Trash2, ArrowRight, CreditCard, PlusCircle, X, Globe, Umbrella, Baby, HeartPulse, Zap, Edit, RefreshCw, Plus, Locate, ZoomIn, ZoomOut, Maximize, Sliders, MapPin, Copy, RotateCcw, Image as ImageIcon, Utensils, Info, List, ChevronDown, ChevronUp } from 'lucide-react';

// --- 全域設定 ---
const apiKey = ""; 

// --- 地圖設定 ---
const FIXED_MAP_SRC = "/usj_map.jpg"; 

// --- GPX 資料 (包含您提供的數據) ---
const GPX_RAW_DATA = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="USJ-OSM-Exporter" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="34.66621830" lon="135.43475690"><name>ビバリーヒルズ・ブランジェリー</name><desc>amenity=cafe | amenity=cafe</desc></wpt>
  <wpt lat="34.66468050" lon="135.43092130"><name>フォッシル・フュエルズ</name><desc>amenity=cafe | amenity=cafe</desc></wpt>
  <wpt lat="34.66410420" lon="135.43188930"><name>ワーフカフェ</name><desc>amenity=cafe | amenity=cafe</desc></wpt>
  <wpt lat="34.66715880" lon="135.43476070"><name>救護室</name><desc>amenity=doctors | amenity=doctors</desc></wpt>
  <wpt lat="34.66584120" lon="135.43197130"><name>ドリンクカート（ボードウォーク・スナック横）</name><desc>amenity=fast_food | amenity=fast_food</desc></wpt>
  <wpt lat="34.66580080" lon="135.43344370"><name>メルズ・ドライブイン</name><desc>amenity=fast_food | amenity=fast_food</desc></wpt>
  <wpt lat="34.66615640" lon="135.43207340"><name>アミティ・アイスクリーム</name><desc>amenity=ice_cream | amenity=ice_cream</desc></wpt>
  <wpt lat="34.66400800" lon="135.43287250"><name>SAIDO</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66593420" lon="135.43259490"><name>アズーラ・ディ・カプリ</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66572260" lon="135.43134430"><name>アミティ・ランディング・レストラン</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66785850" lon="135.43018480"><name>キノピオ・カフェ</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66374760" lon="135.43178670"><name>ザ・ドラゴンズ・パール</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66501550" lon="135.43447370"><name>スタジオ・スターズ・レストラン</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66659280" lon="135.43284560"><name>スヌーピー・バックロット・カフェ</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66508520" lon="135.43084530"><name>ディスカバリー・レストラン</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66412450" lon="135.43212470"><name>ハピネス・カフェ</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66584720" lon="135.43276240"><name>パークサイド・グリル</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66806030" lon="135.43009760"><name>ピットストップ・ポップコーン</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66437350" lon="135.43386750"><name>フィネガンズ・バー＆グリル</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66786170" lon="135.43129240"><name>ホッグズ・ヘッド・パブ</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66564390" lon="135.43183800"><name>ボードウォーク・スナック</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66816730" lon="135.43043960"><name>ヨッシー・スナック・アイランド</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66415180" lon="135.43297820"><name>ルイズ N.Y, ピザパーラー</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66535730" lon="135.42999940"><name>ロストワールド・レストラン</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66425260" lon="135.43142210"><name>ロンバーズ・ランディング</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66778870" lon="135.43117330"><name>三本の箒</name><desc>amenity=restaurant | amenity=restaurant</desc></wpt>
  <wpt lat="34.66613300" lon="135.43513500"><name>シネマ4-D シアター</name><desc>amenity=theatre | amenity=theatre</desc></wpt>
  <wpt lat="34.66571430" lon="135.43446010"><name>プレイング・ウィズおさるのジョージ</name><desc>amenity=theatre | amenity=theatre</desc></wpt>
  <wpt lat="34.66464170" lon="135.43495610"><name>マンハッタン・シアター</name><desc>amenity=theatre | amenity=theatre</desc></wpt>
  <wpt lat="34.66574830" lon="135.43320800"><name>メルズステージ</name><desc>amenity=theatre | amenity=theatre</desc></wpt>
  <wpt lat="34.66617370" lon="135.43310040"><name>ユニバーサル・モンスター・ライブ・ロックンロール・ショー</name><desc>amenity=theatre | amenity=theatre</desc></wpt>
  <wpt lat="34.66344730" lon="135.43053960"><name>ザ・フライング・ダイナソー</name><desc>attraction=roller_coaster | attraction=roller_coaster</desc></wpt>
  <wpt lat="34.66654590" lon="135.43392750"><name>ハリウッド・ドリーム・ザ・ライド</name><desc>attraction=roller_coaster | attraction=roller_coaster</desc></wpt>
  <wpt lat="34.66848720" lon="135.43209310"><name>フライト・オブ・ザ・ヒッポグリフ</name><desc>attraction=roller_coaster | attraction=roller_coaster</desc></wpt>
  <wpt lat="34.66783170" lon="135.43157810"><name>ふくろう便＆ふくろう小屋</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66580350" lon="135.43122480"><name>アミティ・アイランド・ギフト</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66623660" lon="135.43414710"><name>イッツ・ソー・フラッフィ！</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66809860" lon="135.43157290"><name>オリバンダーの店</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66660610" lon="135.43471620"><name>カリフォルニア・コンフェクショナリー</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66623000" lon="135.43455560"><name>キャラクターズ・フォーユー</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66784600" lon="135.43164580"><name>グラドラグス魔法ファッション店</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66595740" lon="135.43511670"><name>シネマ 4-D ストア</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66467180" lon="135.43039580"><name>ジュラシック・アウトフィッターズ</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66366670" lon="135.43232440"><name>スウィート・サレンダー</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66734700" lon="135.43570170"><name>スタジオギフト・イースト</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66733350" lon="135.43478640"><name>スタジオギフト・ウエスト</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66622660" lon="135.43398850"><name>スタジオスタイル</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66680940" lon="135.43218770"><name>スヌーピー・スタジオ・ストア</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66500950" lon="135.43489070"><name>スペース・ファンタジー・ステーション</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66724400" lon="135.43312640"><name>セサミストリート・キッズ・ストア</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66747570" lon="135.43124100"><name>ゾンコの「いたずら専門店」</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66779970" lon="135.43163830"><name>ダービシュ・アンド・バングス</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66759660" lon="135.43125270"><name>ハニーデュークス</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66707640" lon="135.43310500"><name>ハローキティのリボン・ブティック</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66600670" lon="135.43363040"><name>ハローキティ・デザイン・スタジオ</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66702630" lon="135.43531410"><name>バックロット・アクセサリー</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66691880" lon="135.43490120"><name>ビバリーヒルズ・ギフト</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66621990" lon="135.43441330"><name>ピーナッツ・コーナーストア</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66845180" lon="135.43075820"><name>ファンキーコングのフライ・アンド・バイ</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66339900" lon="135.43226000"><name>ファン・ストア</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66889680" lon="135.43182010"><name>フィルチの没収品店</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66611960" lon="135.43380400"><name>マリオ・カフェ&amp;ストア</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66817510" lon="135.43004330"><name>マリオ・モーターズ</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66354020" lon="135.43229810"><name>ミニオンズ・ポップ・ショップ</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66666130" lon="135.43528740"><name>ユニバーサル・スタジオ・ストア</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66406320" lon="135.43477310"><name>ユニバーサル・スタジオ・スーベニア</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66619990" lon="135.43340100"><name>ユニバーサル・スタジオ・セレクト</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66678550" lon="135.43488100"><name>ロデオドライブ・スーベニア</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66802120" lon="135.43157450"><name>ワイズエーカー魔法洋品店</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66790040" lon="135.43055090"><name>ワンナップ・ファクトリー</name><desc>shop=gift | shop=gift</desc></wpt>
  <wpt lat="34.66794450" lon="135.42980120"><name>とりかえせゴールデンキノコ！クッパJr. ファイナルバトル</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66750440" lon="135.43359050"><name>アビーのマジカル・ツリー</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66802940" lon="135.43345370"><name>アビーのマジカル・パーティ</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66719960" lon="135.43375280"><name>アーニーのラバーダッキー・レース</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66729920" lon="135.43373260"><name>ウォーターガーデン</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66676770" lon="135.42975160"><name>ウォーターワールド</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66721090" lon="135.43336250"><name>エルモのゴーゴー・スケートボード</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66820290" lon="135.43313620"><name>エルモのバブル・バブル</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66752660" lon="135.43323740"><name>エルモのリトル・ドライブ</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66757270" lon="135.43367090"><name>クッキーモンスター・スライド</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66816400" lon="135.43351540"><name>グローバーのコンストラクション・カンパニー</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66439670" lon="135.43062580"><name>ジュラシック・パーク・ザ・ライド</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66621500" lon="135.43169030"><name>ジョーズ</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66525750" lon="135.43558770"><name>スペース・ファンタジー・ザ・ライド</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66736280" lon="135.43403340"><name>セサミのビッグ・ドライブ</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66874480" lon="135.43064210"><name>ドンキーコング・カントリー</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66883750" lon="135.43163020"><name>ハリーポッター・アンド・ザ・フォービドゥン・ジャーニー</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66695730" lon="135.43293870"><name>ハローキティのカップケーキ・ドリーム</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66726830" lon="135.43267310"><name>ハローキティのリボン・コレクション</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66602680" lon="135.43189390"><name>ハンギング・シャーク</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66787500" lon="135.43342150"><name>バートとアーニーのワンダー・ザ・シー</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66744920" lon="135.43296280"><name>ビッグバードのビッグトップ・サーカス</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66791470" lon="135.43302450"><name>ビッグバードのビッグ・ネスト</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66413300" lon="135.43339000"><name>フォーティセカンド・ストリート・スタジオ ～グリーティング・ギャラリー～</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66676090" lon="135.43256320"><name>フライング・スヌーピー</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66872200" lon="135.43153060"><name>ホグワーツ・キャッスル・ウォーク</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66748300" lon="135.43141410"><name>ホグワーツ特急のフォト・オポチュニティ</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66805150" lon="135.42986960"><name>マリオカート ～クッパの挑戦状～</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66334040" lon="135.43264840"><name>ミニオン・ハチャメチャ・アイス</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66291780" lon="135.43234850"><name>ミニオン・ハチャメチャ・ライド</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66736210" lon="135.43355090"><name>モッピーのバルーン・トリップ</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66806470" lon="135.43304060"><name>モッピーのラッキー・ダンス・パーティ</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66795810" lon="135.43529650"><name>ユニバーサル・グローブ</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66799740" lon="135.43025720"><name>ヨッシー・アドベンチャー</name><desc>tourism=attraction | tourism=attraction</desc></wpt>
  <wpt lat="34.66709350" lon="135.43552890"><name>ゲストサービス</name><desc>tourism=information | tourism=information | information=yes</desc></wpt>
</gpx>`;

// --- 繁體中文化對照表 ---
const NAME_TRANSLATION = {
    "ビバリーヒルズ・ブランジェリー": "比佛利山莊法式麵包咖啡店",
    "フォッシル・フュエルズ": "化石燃料小吃",
    "ワーフカフェ": "碼頭咖啡",
    "救護室": "急救站",
    "ドリンクカート（ボードウォーク・スナック横）": "飲料車 (Boardwalk Snack旁)",
    "メルズ・ドライブイン": "梅兒茲餐廳",
    "アミティ・アイスクリーム": "親善村冰淇淋",
    "SAIDO": "彩道 (日式餐廳)",
    "アズーラ・ディ・カプリ": "阿珠拉・提・卡普利",
    "アミティ・ランディング・レストラン": "親善村餐廳",
    "キノピオ・カフェ": "奇諾比奧咖啡店 (Kinopio Cafe)",
    "ザ・ドラゴンズ・パール": "龍之珍珠",
    "スタジオ・スターズ・レストラン": "影城巨星餐廳",
    "スヌーピー・バックロット・カフェ": "史努比外景咖啡廳",
    "ディスカバリー・レストラン": "發現餐廳",
    "ハピネス・カフェ": "快樂咖啡廳",
    "パークサイド・グリル": "公園燒烤",
    "ピットストップ・ポップコーン": "維修部爆米花",
    "フィネガンズ・バー＆グリル": "芬尼根酒吧 & 燒烤",
    "ホッグズ・ヘッド・パブ": "豬頭酒吧",
    "ボードウォーク・スナック": "海濱小吃",
    "ヨッシー・スナック・アイランド": "耀西小吃島",
    "ルイズ N.Y, ピザパーラー": "路易斯紐約披薩餅舖",
    "ロストワールド・レストラン": "失落的世界餐廳",
    "ロンバーズ・ランディング": "龍伯餐廳",
    "三本の箒": "三根掃帚",
    "シネマ4-D シアター": "4-D 電影院",
    "プレイング・ウィズおさるのジョージ": "和好奇猴喬治同樂",
    "マンハッタン・シアター": "曼哈頓劇院",
    "メルズステージ": "梅兒茲舞台",
    "ユニバーサル・モンスター・ライブ・ロックンロール・ショー": "環球妖魔鬼怪搖滾樂表演秀",
    "ザ・フライング・ダイナソー": "飛天翼龍",
    "ハリウッド・ドリーム・ザ・ライド": "好萊塢美夢・乘車遊",
    "フライト・オブ・ザ・ヒッポグリフ": "鷹馬的飛行",
    "ふくろう便＆ふくろう小屋": "貓頭鷹郵局 & 貓頭鷹屋",
    "アミティ・アイランド・ギフト": "親善村島嶼禮品店",
    "イッツ・ソー・フラッフィ！": "It's So Fluffy!",
    "オリバンダーの店": "奧利凡德的商店",
    "カリフォルニア・コンフェクショナリー": "加州糖果餅乾店",
    "キャラクターズ・フォーユー": "Characters For You",
    "グラドラグス魔法ファッション店": "格拉德拉格斯魔法時裝店",
    "シネマ 4-D ストア": "4-D 電影院商店",
    "ジュラシック・アウトフィッターズ": "侏羅紀裝備店",
    "スウィート・サレンダー": "甜蜜投降",
    "スタジオギフト・イースト": "影城東部禮品店",
    "スタジオギフト・ウエスト": "影城西部禮品店",
    "スタジオスタイル": "影城風格",
    "スヌーピー・スタジオ・ストア": "史努比攝影棚商店",
    "スペース・ファンタジー・ステーション": "太空幻想車站",
    "セサミストリート・キッズ・ストア": "芝麻街兒童商店",
    "ゾンコの「いたずら専門店」": "桑科的「惡作劇商店」",
    "ダービシュ・アンド・バングス": "德維斯和班斯樂器店",
    "ハニーデュークス": "蜂蜜公爵",
    "ハローキティのリボン・ブティック": "Hello Kitty 蝴蝶結精品店",
    "ハローキティ・デザイン・スタジオ": "Hello Kitty 設計工作室",
    "バックロット・アクセサリー": "外景飾品店",
    "ビバリーヒルズ・ギフト": "比佛利山莊禮品店",
    "ピーナッツ・コーナーストア": "史努比角落商店",
    "ファンキーコングのフライ・アンド・バイ": "Funky Kong's Fly & Buy",
    "ファン・ストア": "Fun Store",
    "フィルチの没収品店": "飛七的沒收品店",
    "マリオ・カフェ&ストア": "瑪利歐咖啡店 & 商店",
    "マリオ・モーターズ": "瑪利歐賽車商店",
    "ミニオンズ・ポップ・ショップ": "小小兵流行商店",
    "ユニバーサル・スタジオ・ストア": "環球影城商店",
    "ユニバーサル・スタジオ・スーベニア": "環球影城紀念品店",
    "ユニバーサル・スタジオ・セレクト": "環球影城精選店",
    "ロデオドライブ・スーベニア": "羅迪歐大道紀念品店",
    "ワイズエーカー魔法洋品店": "智者魔法用品店",
    "ワンナップ・ファクトリー": "1UP 工廠",
    "とりかえせゴールデンキノコ！クッパJr. ファイナルバトル": "奪回金色蘑菇！庫巴Jr.最終戰鬥",
    "アビーのマジカル・ツリー": "艾比的魔法樹",
    "アビーのマジカル・パーティ": "艾比的魔法派對",
    "アーニーのラバーダッキー・レース": "厄尼的橡皮鴨大賽",
    "ウォーターガーデン": "水花園",
    "ウォーターワールド": "水世界",
    "エルモのゴーゴー・スケートボード": "艾蒙的Go-Go滑板",
    "エルモのバブル・バブル": "艾蒙的泡泡遨遊",
    "エルモのリトル・ドライブ": "艾蒙的小兜風",
    "クッキーモンスター・スライド": "餅乾怪獸滑梯",
    "グローバーのコンストラクション・カンパニー": "葛羅弗的建築公司",
    "ジュラシック・パーク・ザ・ライド": "侏羅紀公園・乘船遊",
    "ジョーズ": "大白鯊",
    "スペース・ファンタジー・ザ・ライド": "太空幻想列車",
    "セサミのビッグ・ドライブ": "芝麻街大兜風",
    "ドンキーコング・カントリー": "咚奇剛國度",
    "ハリーポッター・アンド・ザ・フォービドゥン・ジャーニー": "哈利波特禁忌之旅",
    "ハローキティのカップケーキ・ドリーム": "Hello Kitty 夢幻蛋糕杯",
    "ハローキティのリボン・コレクション": "Hello Kitty 蝴蝶結大收藏",
    "ハンギング・シャーク": "吊掛鯊魚 (拍照點)",
    "バートとアーニーのワンダー・ザ・シー": "伯特和厄尼的奇幻大海",
    "ビッグバードのビッグトップ・サーカス": "大鳥的頂級馬戲團",
    "ビッグバードのビッグ・ネスト": "大鳥的大巢",
    "フォーティセカンド・ストリート・スタジオ ～グリーティング・ギャラリー～": "42號街工作室 ～迎賓藝廊～",
    "フライング・スヌーピー": "飛天史努比",
    "ホグワーツ・キャッスル・ウォーク": "霍格華茲城堡之旅",
    "ホグワーツ特急のフォト・オポチュニティ": "霍格華茲特快車拍照點",
    "マリオカート ～クッパの挑戦状～": "瑪利歐賽車～庫巴的挑戰書～",
    "ミニオン・ハチャメチャ・アイス": "小小兵冰凍雷射光乘車遊",
    "ミニオン・ハチャメチャ・ライド": "小小兵瘋狂乘車遊",
    "モッピーのバルーン・トリップ": "莫比的氣球之旅",
    "モッピーのラッキー・ダンス・パーティ": "莫比的幸運舞會",
    "ユニバーサル・グローブ": "環球地球儀",
    "ヨッシー・アドベンチャー": "耀西冒險",
    "ゲストサービス": "遊客服務中心",
    "コカ・コーラ": "可口可樂販賣機"
};

// --- 區域資料 ---
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


// --- 數學工具函式 ---

// 1. 計算兩點間距離 (公尺)
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// 2. 經緯度轉平面公尺座標 (Local Tangent Plane Approximation)
// lat0, lng0 為參考原點
function llToLocalMeters(lat, lng, lat0, lng0) {
  const R = 6378137; // WGS84 Earth Radius
  const toRad = d => d * Math.PI / 180;
  const x = (toRad(lng - lng0)) * R * Math.cos(toRad(lat0));
  const y = (toRad(lat - lat0)) * R;
  return { x, y };
}

// 3. 加權最小平方法 (Weighted Least Squares) 求解仿射矩陣
function solveWeightedLeastSquares(points) {
    let sumW = 0;
    let sumWX = 0, sumWY = 0;
    let sumWXX = 0, sumWXY = 0, sumWYY = 0;
    let sumWMapX = 0, sumWMapY = 0;
    let sumWXMapX = 0, sumWYMapX = 0;
    let sumWXMapY = 0, sumWYMapY = 0;

    for (const p of points) {
        const w = p.weight;
        sumW += w;
        sumWX += w * p.localX;
        sumWY += w * p.localY;
        sumWXX += w * p.localX * p.localX;
        sumWXY += w * p.localX * p.localY;
        sumWYY += w * p.localY * p.localY;
        
        sumWMapX += w * p.mapX;
        sumWMapY += w * p.mapY;
        sumWXMapX += w * p.localX * p.mapX;
        sumWYMapX += w * p.localY * p.mapX;
        sumWXMapY += w * p.localX * p.mapY;
        sumWYMapY += w * p.localY * p.mapY;
    }

    const det = sumWXX * (sumWYY * sumW - sumWY * sumWY) -
                sumWXY * (sumWXY * sumW - sumWY * sumWX) +
                sumWX  * (sumWXY * sumWY - sumWYY * sumWX);
    
    if (Math.abs(det) < 1e-12) return null; // Singular

    const invDet = 1 / det;

    const m00 = (sumWYY * sumW - sumWY * sumWY) * invDet;
    const m01 = (sumWX * sumWY - sumWXY * sumW) * invDet;
    const m02 = (sumWXY * sumWY - sumWYY * sumWX) * invDet;
    const m11 = (sumWXX * sumW - sumWX * sumWX) * invDet;
    const m12 = (sumWXY * sumWX - sumWXX * sumWY) * invDet;
    const m22 = (sumWXX * sumWYY - sumWXY * sumWXY) * invDet;

    const a = m00 * sumWXMapX + m01 * sumWYMapX + m02 * sumWMapX;
    const b = m01 * sumWXMapX + m11 * sumWYMapX + m12 * sumWMapX;
    const c = m02 * sumWXMapX + m12 * sumWYMapX + m22 * sumWMapX;

    const d = m00 * sumWXMapY + m01 * sumWYMapY + m02 * sumWMapY;
    const e = m01 * sumWXMapY + m11 * sumWYMapY + m12 * sumWMapY;
    const f = m02 * sumWXMapY + m12 * sumWYMapY + m22 * sumWMapY;

    return { a, b, c, d, e, f };
}

// 4. 新增：建立局部仿射矩陣 (只取最近N點)
function buildLocalAffineMatrix({
  userLat,
  userLng,
  anchors,
  N = 8,                 // 建議 6~10，先用 8
  useAccuracyWeight = true,
  useDistanceWeight = true
}) {
  const valid = anchors.filter(a => Number.isFinite(a.lat) && Number.isFinite(a.lng));
  if (valid.length < 3) return null;

  // 1) 取最近 N 個錨點
  const nearest = valid
    .map(a => ({ a, dist: haversineMeters(userLat, userLng, a.lat, a.lng) }))
    .sort((p, q) => p.dist - q.dist)
    .slice(0, Math.max(3, Math.min(N, valid.length)));

  // 2) 用「這批錨點的中心」當 local meters 原點（很重要：局部更穩）
  const centerLat = nearest.reduce((s, p) => s + p.a.lat, 0) / nearest.length;
  const centerLng = nearest.reduce((s, p) => s + p.a.lng, 0) / nearest.length;

  // 3) 組 weighted LS 點
  const points = nearest.map(({ a, dist }) => {
    const local = llToLocalMeters(a.lat, a.lng, centerLat, centerLng);

    // 如果你沒有存每個 anchor 的 accuracy，就先當 10m
    const acc = Number.isFinite(a.acc) ? a.acc : 10;

    let w = 1;

    if (useAccuracyWeight) {
      w *= 1 / Math.max(acc * acc, 1);           // 1/σ²
    }
    if (useDistanceWeight) {
      w *= 1 / Math.max(dist * dist, 25);        // 避免 dist->0 爆炸；5m^2=25
    }

    return {
      localX: local.x,
      localY: local.y,
      mapX: a.x,
      mapY: a.y,
      weight: w
    };
  });

  const matrix = solveWeightedLeastSquares(points);
  if (!matrix) return null;

  return { matrix, centerLat, centerLng, nearest }; // nearest 留著 debug 用
}

// 5. 新增：應用仿射矩陣
function applyAffine({ lat, lng, centerLat, centerLng, matrix }) {
  const local = llToLocalMeters(lat, lng, centerLat, centerLng);
  const { a, b, c, d, e, f } = matrix;
  const x = a * local.x + b * local.y + c;
  const y = d * local.x + e * local.y + f;
  return { x, y };
}


// ... (Attractions and Facility Database - 為了精簡程式碼，此處省略既有部分，保留原有功能所需的變數)
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
// ... Express Pass definitions omitted for brevity but assumed present
const EXPRESS_PASS_RAW = [ "1. 快速通關券8 - Minecart & Minion Mayhem Special", "2. 快速通關券8 - Minion & Minecart Special"]; // Simplified for this view

const getExpressPassContent = (passName) => {
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

// --- Helper: Get Point on Image Relative (Robust) ---
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

// --- Parse GPX Function ---
const parseGpxData = (xmlData) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    const wpts = xmlDoc.getElementsByTagName("wpt");
    const parsed = [];

    for (let i = 0; i < wpts.length; i++) {
        const wpt = wpts[i];
        const lat = parseFloat(wpt.getAttribute("lat"));
        const lon = parseFloat(wpt.getAttribute("lon"));
        const nameNode = wpt.getElementsByTagName("name")[0];
        const descNode = wpt.getElementsByTagName("desc")[0];
        
        const jpName = nameNode ? nameNode.textContent : "Unknown";
        const desc = descNode ? descNode.textContent : "";
        const zhName = NAME_TRANSLATION[jpName] || jpName; // Translate

        // Categorize based on desc tags
        let category = 'other';
        let subType = 'misc';
        
        if (desc.includes('attraction') || desc.includes('theatre')) {
             category = 'attraction';
             if(desc.includes('roller_coaster')) subType = 'coaster';
             else if(desc.includes('theatre')) subType = 'show';
             else subType = 'ride';
        } else if (desc.includes('restaurant') || desc.includes('cafe') || desc.includes('fast_food') || desc.includes('ice_cream')) {
             category = 'food';
        } else if (desc.includes('shop')) {
             category = 'shop';
        } else if (desc.includes('vending') || desc.includes('doctors') || desc.includes('information') || desc.includes('toilet')) {
             category = 'service';
        }

        parsed.push({
            id: `gpx_${i}`,
            lat,
            lng: lon,
            jpName,
            name: zhName,
            desc,
            category,
            subType
        });
    }
    return parsed;
};

// --- Main App Component ---

export default function USJPlannerApp() {
  const [currentView, setCurrentView] = useState('home'); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // GPS Permission State
  const [gpsPermission, setGpsPermission] = useState('unknown');

  const [userApiKey, setUserApiKey] = useState(() => {
    return localStorage.getItem('usj_api_key') || '';
  });

  const [savedPlans, setSavedPlans] = useState(() => []);

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

  const [formData, setFormData] = useState(defaultFormData);
  const [itinerary, setItinerary] = useState([]);
  
  // GPS States
  const [gpsRaw, setGpsRaw] = useState(null); 
  const [gpsXY, setGpsXY] = useState(null); 
  const [lastGpsFix, setLastGpsFix] = useState(null); 
  
  const [realGpsEnabled, setRealGpsEnabled] = useState(false);
  const [displayWeather, setDisplayWeather] = useState({ condition: 'sunny', temp: 15, text: '尚未取得天氣資訊' });
  
  // Anchor / Debug Mode
  const [anchors, setAnchors] = useState(() => {
      const saved = localStorage.getItem('usj_anchors');
      if (!saved) return DEFAULT_ANCHORS;
      const parsed = JSON.parse(saved);
      if (parsed.length < 5) return DEFAULT_ANCHORS;
      return parsed;
  });
  
  const [isAddAnchorMode, setIsAddAnchorMode] = useState(false);
  
  // Park center for geofencing
  const parkCenter = useMemo(() => {
      const lat = DEFAULT_ANCHORS.reduce((acc, a) => acc + a.lat, 0) / DEFAULT_ANCHORS.length;
      const lng = DEFAULT_ANCHORS.reduce((acc, a) => acc + a.lng, 0) / DEFAULT_ANCHORS.length;
      return { lat, lng };
  }, []);

  // --- POI Data & Map Logic ---
  const [rawPois, setRawPois] = useState([]);
  const [mappedPois, setMappedPois] = useState([]); // POIs with x, y calculated
  const [selectedCategory, setSelectedCategory] = useState(null); // 'attraction', 'food', 'shop', 'service'
  const [selectedPoiId, setSelectedPoiId] = useState(null); // Highlight specific POI
  const [isCategoryOpen, setIsCategoryOpen] = useState(false); // Mobile drawer for list

  // Initial GPX Parse
  useEffect(() => {
      const pois = parseGpxData(GPX_RAW_DATA);
      setRawPois(pois);
  }, []);

  // Calculate Affine Matrix & Map POIs
  // Note: static POIs still use global fit for stability
  const mapTransformLogic = useMemo(() => {
       const centerLat = parkCenter.lat;
       const centerLng = parkCenter.lng;
       
       const anchorsWithLocal = anchors.map(a => {
           const local = llToLocalMeters(a.lat, a.lng, centerLat, centerLng);
           return { ...a, localX: local.x, localY: local.y, mapX: a.x, mapY: a.y, weight: 1 };
       });

       const matrix = solveWeightedLeastSquares(anchorsWithLocal);
       return { matrix, centerLat, centerLng };
  }, [anchors, parkCenter]);

  // Update Mapped POIs whenever anchors change
  useEffect(() => {
      if (!mapTransformLogic.matrix || rawPois.length === 0) return;

      const { matrix, centerLat, centerLng } = mapTransformLogic;
      const { a, b, c, d, e, f } = matrix;

      const mapped = rawPois.map(poi => {
          const local = llToLocalMeters(poi.lat, poi.lng, centerLat, centerLng);
          const x = a * local.x + b * local.y + c;
          const y = d * local.x + e * local.y + f;

          // Determine Zone
          let closestZoneId = 'hollywood';
          let minDist = Infinity;
          ZONES_DATA.forEach(zone => {
               const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
               if (dist < minDist) {
                   minDist = dist;
                   closestZoneId = zone.id;
               }
          });

          return { ...poi, x, y, zoneId: closestZoneId };
      });
      setMappedPois(mapped);
  }, [rawPois, mapTransformLogic]);

  // --- End POI Logic ---

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Map Interaction State
  const mapContainerRef = useRef(null);
  const imgRef = useRef(null);
  const [viewState, setViewState] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Update Matrix when anchors change
  useEffect(() => {
      localStorage.setItem('usj_anchors', JSON.stringify(anchors));
  }, [anchors]);

  // --- Request GPS Permission ---
  const requestGpsPermission = () => {
      if (!navigator.geolocation) {
          alert('此瀏覽器不支援 GPS');
          return;
      }
      navigator.geolocation.getCurrentPosition(
          (pos) => {
              setGpsPermission('granted');
              setRealGpsEnabled(true);
          },
          (err) => {
              if (err.code === err.PERMISSION_DENIED) {
                  setGpsPermission('denied');
              }
              alert('GPS 請求失敗: ' + err.message);
          },
          { enableHighAccuracy: true }
      );
  };

  // --- GPS Tracking Logic (UPDATED TO LOCAL FIT) ---
  useEffect(() => {
    let watchId;
    if (realGpsEnabled && currentView === 'map') {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const acc = position.coords.accuracy;
                setLastGpsFix({ lat, lng, acc });
                setGpsRaw({ lat, lng, acc });

                // 使用 Local Affine Matrix 邏輯
                const localFit = buildLocalAffineMatrix({
                    userLat: lat,
                    userLng: lng,
                    anchors, // 使用當前最新的錨點列表
                    N: 8,
                    useAccuracyWeight: true,
                    useDistanceWeight: true
                });

                if (!localFit) return;

                const { matrix, centerLat, centerLng } = localFit;
                const projected = applyAffine({ lat, lng, centerLat, centerLng, matrix });
                
                // Clamp
                const cx = Math.min(Math.max(projected.x, 0), 100);
                const cy = Math.min(Math.max(projected.y, 0), 100);
                
                setGpsXY({ x: cx, y: cy });
            },
            (error) => console.error(error),
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
        );
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [realGpsEnabled, currentView, anchors]); // Updated dependencies

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
  
  const resetAnchors = () => {
      if(window.confirm("確定要重置所有校正點嗎？")) {
          setAnchors(DEFAULT_ANCHORS);
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
          alert(`校正點已新增！`);
      }
  };

  // --- Render Helpers for POI List ---
  const renderPoiList = () => {
      if (!selectedCategory) return null;
      
      const filtered = mappedPois.filter(p => p.category === selectedCategory);
      // Group by Zone
      const grouped = {};
      ZONES_DATA.forEach(z => grouped[z.id] = []);
      filtered.forEach(p => {
          if (grouped[p.zoneId]) grouped[p.zoneId].push(p);
      });

      return (
          <div className="bg-white border-t rounded-t-xl shadow-2xl max-h-[50vh] overflow-y-auto flex flex-col pointer-events-auto">
             <div className="p-3 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     {selectedCategory === 'attraction' && <Ticket size={18} className="text-purple-600"/>}
                     {selectedCategory === 'food' && <Utensils size={18} className="text-orange-600"/>}
                     {selectedCategory === 'shop' && <ShoppingBag size={18} className="text-blue-600"/>}
                     {selectedCategory === 'service' && <Info size={18} className="text-green-600"/>}
                     設施列表
                 </h3>
                 <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-gray-100 rounded"><X size={20}/></button>
             </div>
             <div className="p-2 space-y-4 pb-20">
                 {ZONES_DATA.map(zone => {
                     const items = grouped[zone.id];
                     if (!items || items.length === 0) return null;
                     return (
                         <div key={zone.id}>
                             <div className="bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 rounded mb-2 sticky top-0">{zone.name}</div>
                             <div className="grid grid-cols-1 gap-1">
                                 {items.map(poi => (
                                     <button 
                                        key={poi.id}
                                        onClick={() => {
                                            setSelectedPoiId(poi.id);
                                            // Center map on this item (Simple logic)
                                            // Ideally we animate viewState, here we just mark it
                                        }}
                                        className={`text-left p-2 rounded hover:bg-blue-50 text-sm flex justify-between items-center ${selectedPoiId === poi.id ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                     >
                                         <span className="truncate pr-2">{poi.name}</span>
                                         {selectedPoiId === poi.id && <CheckCircle size={14} className="text-blue-600 shrink-0"/>}
                                     </button>
                                 ))}
                             </div>
                         </div>
                     );
                 })}
             </div>
          </div>
      );
  };

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
        
        <button onClick={() => setCurrentView('map')} className="w-full py-4 rounded-xl font-bold shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-center items-center gap-2">進入地圖模式</button>
      </div>
    </div>
  );

  const renderMap = () => (
    <div className="h-full flex flex-col bg-gray-100 relative overflow-hidden">
      {/* Top Filter Bar */}
      <div className="bg-white p-2 shadow-sm z-20 flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 text-sm"><MapIcon size={16}/> 園區導航</h2>
            <div className="flex gap-2">
                <button onClick={() => { if (gpsPermission === 'denied') alert('GPS blocked'); else requestGpsPermission(); }} className={`p-1.5 rounded-full text-xs flex items-center gap-1 ${realGpsEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    <Locate size={14}/> {realGpsEnabled ? 'GPS ON' : 'GPS'}
                </button>
            </div>
        </div>
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button onClick={() => setSelectedCategory(selectedCategory === 'attraction' ? null : 'attraction')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${selectedCategory === 'attraction' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-white border-gray-300 text-gray-600'}`}>
                <Ticket size={14}/> 遊樂設施
            </button>
            <button onClick={() => setSelectedCategory(selectedCategory === 'food' ? null : 'food')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${selectedCategory === 'food' ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-white border-gray-300 text-gray-600'}`}>
                <Utensils size={14}/> 餐飲美食
            </button>
            <button onClick={() => setSelectedCategory(selectedCategory === 'shop' ? null : 'shop')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${selectedCategory === 'shop' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-600'}`}>
                <ShoppingBag size={14}/> 購物商店
            </button>
            <button onClick={() => setSelectedCategory(selectedCategory === 'service' ? null : 'service')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${selectedCategory === 'service' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-300 text-gray-600'}`}>
                <Info size={14}/> 服務設施
            </button>
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
                transformOrigin: '0 0', 
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                display: 'inline-block' 
            }}
        >
            {/* Content Wrapper - Image + SVG */}
            <div className="relative shadow-2xl bg-white inline-block">
                <img 
                    ref={imgRef}
                    src={FIXED_MAP_SRC} 
                    alt="USJ Map" 
                    className="block select-none"
                    draggable={false}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://www.usj.co.jp/web/d_common/img/usj-map-guide-studio-thumb.jpg";
                    }}
                />

                {/* Interactive Overlay Layer */}
                <svg viewBox="0 0 100 100" className={`absolute inset-0 w-full h-full ${isAddAnchorMode ? 'cursor-crosshair' : 'pointer-events-none'}`} onClick={handleMapClick}>
                    {/* Zones (Background Labels) */}
                    {ZONES_DATA.map(zone => (
                        <g key={zone.id} opacity="0.4">
                            <text x={zone.x} y={zone.y} textAnchor="middle" dy="0.3em" fontSize="4" fill={zone.color} fontWeight="bold" opacity="0.3">{zone.code}</text>
                        </g>
                    ))}
                    
                    {/* Selected POI Marker */}
                    {selectedPoiId && (() => {
                        const poi = mappedPois.find(p => p.id === selectedPoiId);
                        if(poi) return (
                            <g transform={`translate(${poi.x}, ${poi.y})`}>
                                <circle r="3" fill="#22c55e" opacity="0.3" className="animate-ping" />
                                <path d="M0,0 L-2,-5 A2,2 0 1,1 2,-5 L0,0 Z" fill="#22c55e" stroke="white" strokeWidth="0.2" transform="scale(0.8) translate(0, -1)"/>
                            </g>
                        );
                    })()}

                    {/* Anchors Debug */}
                    {isAddAnchorMode && anchors.map(a => (
                        <g key={a.id}>
                            <circle cx={a.x} cy={a.y} r="1" fill="red" />
                            <text x={a.x+2} y={a.y} fontSize="2" fill="red">{a.name}</text>
                        </g>
                    ))}

                    {/* User GPS */}
                    {gpsXY && (
                        <g transform={`translate(${gpsXY.x}, ${gpsXY.y})`}>
                            <circle r="4" fill="#3b82f6" opacity="0.8" className="animate-ping" />
                            <circle r="2" fill="#3b82f6" stroke="white" strokeWidth="0.5" />
                        </g>
                    )}
                </svg>
            </div>
        </div>
        
        {/* Map Controls */}
        <div className="absolute top-20 right-4 flex flex-col gap-2 pointer-events-auto">
            <button onClick={() => handleZoom(1)} className="p-2 bg-white rounded shadow text-gray-600 hover:text-blue-600"><ZoomIn size={20}/></button>
            <button onClick={() => handleZoom(-1)} className="p-2 bg-white rounded shadow text-gray-600 hover:text-blue-600"><ZoomOut size={20}/></button>
            <button onClick={handleResetMap} className="p-2 bg-white rounded shadow text-gray-600 hover:text-blue-600"><Maximize size={20}/></button>
        </div>

        {/* Anchor Controls */}
        <div className="absolute bottom-32 right-4 pointer-events-auto flex flex-col gap-2">
             <button onClick={() => setIsAddAnchorMode(!isAddAnchorMode)} className={`p-3 rounded-full shadow-lg transition-colors ${isAddAnchorMode ? 'bg-red-500 text-white' : 'bg-white text-gray-600'}`}>
                <MapPin size={24}/>
            </button>
            <button onClick={resetAnchors} className="p-3 bg-white rounded-full shadow-lg text-gray-600"><RotateCcw size={24}/></button>
        </div>
      </div>
      
      {/* List Drawer (Bottom Sheet) */}
      <div className={`fixed bottom-[56px] left-0 right-0 z-30 transition-transform transform ${selectedCategory ? 'translate-y-0' : 'translate-y-full'}`}>
          {renderPoiList()}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen bg-gray-50 overflow-y-auto font-sans text-gray-800 relative">
      {currentView === 'home' && renderHome()}
      {currentView === 'map' && renderMap()}
      
      <EditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        item={editingItem}
        onSave={handleSaveItem}
      />

      <div className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-200 flex justify-around py-3 text-xs text-gray-500 z-50">
          <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-blue-600' : ''}`}>
              <Settings size={20}/> 設定
          </button>
          <button onClick={() => setCurrentView('map')} className={`flex flex-col items-center gap-1 ${currentView === 'map' ? 'text-blue-600' : ''}`}>
              <MapIcon size={20}/> 地圖
          </button>
      </div>
    </div>
  );
}
