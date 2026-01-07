import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, Clock, Map as MapIcon, Navigation, Sun, CloudRain, CheckCircle, Settings, Coffee, ShoppingBag, Ticket, Sparkles, AlertCircle, Key, Save, FolderOpen, Trash2, ArrowRight, CreditCard, PlusCircle, X, Globe, Umbrella, Baby, HeartPulse, Zap, Edit, RefreshCw, Plus, Locate, ZoomIn, ZoomOut, Maximize, Sliders, MapPin, Copy, RotateCcw, Image as ImageIcon, Utensils, Info, List, ChevronDown, ChevronUp } from 'lucide-react';

// --- 全域設定 ---
const apiKey = ""; 

// --- 地圖設定 ---
const FIXED_MAP_SRC = "/usj_map.jpg"; 

// --- GPX 資料 (保留新版地圖功能) ---
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
  <wpt lat="34.66614840" lon="135.42989260"><name>MOVIE PROP</name><desc>tourism=information | tourism=information | information=board</desc></wpt>
  <wpt lat="34.66424400" lon="135.43075000"><name>WAIT TIME 待ち時間</name><desc>tourism=information | tourism=information</desc></wpt>
  <wpt lat="34.66416260" lon="135.43072410"><name>WARNING 注意</name><desc>tourism=information | tourism=information</desc></wpt>
  <wpt lat="34.66438320" lon="135.43326500"><name>映画撮影セット『アニー』ハドソン通りの少女の家</name><desc>tourism=information | tourism=information</desc></wpt>
  <wpt lat="34.66458090" lon="135.43331190"><name>映画撮影セット『ウエストサイド物語』マリアのバルコニー</name><desc>tourism=information | tourism=information</desc></wpt>
  <wpt lat="34.66441680" lon="135.43337120"><name>映画撮影セット『スティング』ガレージ</name><desc>tourism=information | tourism=information</desc></wpt>
  <wpt lat="34.66437070" lon="135.43347640"><name>映画撮影セット『スティング』セイグラー倉庫</name><desc>tourism=information | tourism=information</desc></wpt>
  <wpt lat="34.66449630" lon="135.43337240"><name>映画撮影セット『スティング』マクネール パブサプライ</name><desc>tourism=information | tourism=information</desc></wpt>
  <wpt lat="34.66439410" lon="135.43338380"><name>映画撮影セット『スティング』電動モーター修理場</name><desc>tourism=information | tourism=information</desc></wpt>
  <wpt lat="34.66399790" lon="135.43279210"><name>映画撮影セット『ステイン アライブ』彩道</name><desc>tourism=information | tourism=information</desc></wpt>
  <wpt lat="34.66459890" lon="135.43332540"><name>映画撮影セット『ストリートファイター』樽・桶製造所</name><desc>tourism=information | tourism=information</desc></wpt>
  <wpt lat="34.66438570" lon="135.43324710"><name>映画撮影セット『マルタの鷹』スペイドのオフィス</name><desc>tourism=information | tourism=information</desc></wpt>
  <wpt lat="34.66431920" lon="135.43351910"><name>映画撮影セット『質屋』ナザーマン質屋</name><desc>tourism=information | tourism=information</desc></wpt>
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

// 2. 經緯度轉平面公尺座標
function llToLocalMeters(lat, lng, lat0, lng0) {
  const R = 6378137;
  const toRad = d => d * Math.PI / 180;
  const x = (toRad(lng - lng0)) * R * Math.cos(toRad(lat0));
  const y = (toRad(lat - lat0)) * R;
  return { x, y };
}

// 3. 加權最小平方法
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

// 4. 建立局部仿射矩陣 (只取最近N點)
function buildLocalAffineMatrix({
  userLat,
  userLng,
  anchors,
  N = 8,
  useAccuracyWeight = true,
  useDistanceWeight = true
}) {
  const valid = anchors.filter(a => Number.isFinite(a.lat) && Number.isFinite(a.lng));
  if (valid.length < 3) return null;

  const nearest = valid
    .map(a => ({ a, dist: haversineMeters(userLat, userLng, a.lat, a.lng) }))
    .sort((p, q) => p.dist - q.dist)
    .slice(0, Math.max(3, Math.min(N, valid.length)));

  const centerLat = nearest.reduce((s, p) => s + p.a.lat, 0) / nearest.length;
  const centerLng = nearest.reduce((s, p) => s + p.a.lng, 0) / nearest.length;

  const points = nearest.map(({ a, dist }) => {
    const local = llToLocalMeters(a.lat, a.lng, centerLat, centerLng);
    const acc = Number.isFinite(a.acc) ? a.acc : 10;
    let w = 1;
    if (useAccuracyWeight) w *= 1 / Math.max(acc * acc, 1);
    if (useDistanceWeight) w *= 1 / Math.max(dist * dist, 25);

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

  return { matrix, centerLat, centerLng, nearest };
}

// 5. 應用仿射矩陣
function applyAffine({ lat, lng, centerLat, centerLng, matrix }) {
  const local = llToLocalMeters(lat, lng, centerLat, centerLng);
  const { a, b, c, d, e, f } = matrix;
  const x = a * local.x + b * local.y + c;
  const y = d * local.x + e * local.y + f;
  return { x, y };
}


// --- 景點與設施資料庫 (恢復完整資料以供行程規劃使用) ---
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

// --- Helper: Get Point on Image Relative (Robust) ---
function getImageRelativePoint(e, imgEl) {
    const rect = imgEl.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;
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

// --- Format Time Helper ---
const formatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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
  const [gpsXY, setGpsXY] = useState(null); 
  const [lastGpsFix, setLastGpsFix] = useState(null); 
  
  const [realGpsEnabled, setRealGpsEnabled] = useState(false);
  const [displayWeather, setDisplayWeather] = useState({ condition: 'sunny', temp: 15, text: '尚未取得天氣資訊' });
  const [mapImage, setMapImage] = useState(null); // 確保定義了 mapImage

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
  const [mappedPois, setMappedPois] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPoiId, setSelectedPoiId] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Map Interaction State
  const mapContainerRef = useRef(null);
  const imgRef = useRef(null);
  const [viewState, setViewState] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // --- Effects & Logic ---

  // 1. 初始 GPX 解析
  useEffect(() => {
      const pois = parseGpxData(GPX_RAW_DATA);
      setRawPois(pois);
  }, []);

  // 2. 計算全域仿射矩陣 (用於靜態 POI 的預設顯示)
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

  // 3. 當錨點改變時，更新所有 POI 在地圖上的座標
  useEffect(() => {
      if (!mapTransformLogic.matrix || rawPois.length === 0) return;

      const { matrix, centerLat, centerLng } = mapTransformLogic;
      const { a, b, c, d, e, f } = matrix;

      const mapped = rawPois.map(poi => {
          const local = llToLocalMeters(poi.lat, poi.lng, centerLat, centerLng);
          const x = a * local.x + b * local.y + c;
          const y = d * local.x + e * local.y + f;

          // 簡單判定所屬區域 (Nearest Zone)
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

  // 4. 持久化儲存
  useEffect(() => { localStorage.setItem('usj_api_key', userApiKey); }, [userApiKey]);
  useEffect(() => { localStorage.setItem('usj_form_data', JSON.stringify(formData)); }, [formData]);
  useEffect(() => { localStorage.setItem('usj_saved_plans', JSON.stringify(savedPlans)); }, [savedPlans]);
  useEffect(() => { localStorage.setItem('usj_anchors', JSON.stringify(anchors)); }, [anchors]);

  // 5. 載入地圖
  useEffect(() => {
      setMapImage(FIXED_MAP_SRC);
  }, []);

  // 6. GPS 權限檢查
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(result => {
          setGpsPermission(result.state);
          result.onchange = () => setGpsPermission(result.state);
        })
        .catch(() => setGpsPermission('prompt'));
    } else {
        setGpsPermission('prompt');
    }
  }, []);

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
              if (err.code === err.PERMISSION_DENIED) setGpsPermission('denied');
              alert('GPS 請求失敗: ' + err.message);
          },
          { enableHighAccuracy: true }
      );
  };

  // --- 7. GPS 追蹤邏輯 (使用局部加權矩陣 Local Affine) ---
  useEffect(() => {
    let watchId;
    if (realGpsEnabled && currentView === 'map') {
        if (!navigator.geolocation) {
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

                // 核心：建立局部矩陣
                const localFit = buildLocalAffineMatrix({
                  userLat: lat,
                  userLng: lng,
                  anchors,
                  N: 8,
                  useAccuracyWeight: true,
                  useDistanceWeight: true
                });

                if (!localFit) return;

                const { matrix, centerLat, centerLng } = localFit;
                const projected = applyAffine({ lat, lng, centerLat, centerLng, matrix });
                
                const cx = Math.min(Math.max(projected.x, 0), 100);
                const cy = Math.min(Math.max(projected.y, 0), 100);
                
                setGpsXY({ x: cx, y: cy });
            },
            (error) => {
                console.error("GPS Error:", error);
                if (error.code === error.PERMISSION_DENIED) {
                    setGpsPermission('denied');
                    setRealGpsEnabled(false);
                }
            },
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
        );
    }
    return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [realGpsEnabled, currentView, anchors]);

  // --- Handlers (CRUD & Form) ---
  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const addExpressPass = () => setFormData(prev => ({ ...prev, expressPasses: [...prev.expressPasses, { id: Date.now(), name: '', times: {} }] }));
  const removeExpressPass = (id) => setFormData(prev => ({ ...prev, expressPasses: prev.expressPasses.filter(p => p.id !== id) }));
  const updateExpressPassName = (id, newName) => setFormData(prev => ({ ...prev, expressPasses: prev.expressPasses.map(p => p.id === id ? { ...p, name: newName, times: {} } : p) }));
  const updateExpressPassTime = (passId, attractionId, time) => setFormData(prev => ({ ...prev, expressPasses: prev.expressPasses.map(p => p.id === passId ? { ...p, times: { ...p.times, [attractionId]: time } } : p) }));

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
      if(window.confirm("確定要重置所有校正點嗎？")) setAnchors(DEFAULT_ANCHORS);
  };

  // --- AI Logic (Gemini API Integration) ---
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

  // --- Map Interaction Handlers ---
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

  // --- Render Functions ---

  const renderPoiList = () => {
      if (!selectedCategory) return null;
      
      const filtered = mappedPois.filter(p => p.category === selectedCategory);
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
                                            // 可考慮點擊後平移地圖至該點 (此處僅標記)
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
        {/* API Key */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
           <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><Key size={16} /> Gemini API Key</label>
           <input type="password" value={userApiKey} onChange={(e) => setUserApiKey(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>
        {/* Date */}
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

        {/* Express Pass */}
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

  const renderSavedPlans = () => (
      <div className="p-4 space-y-4">
          <h2 className="font-bold text-lg mb-4">我的行程</h2>
          {savedPlans.length === 0 ? <div className="text-center text-gray-400">尚無儲存的行程</div> : savedPlans.map(plan => (
              <div key={plan.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center" onClick={() => loadPlan(plan)}>
                  <div>
                      <div className="font-bold">{plan.name}</div>
                      <div className="text-xs text-gray-500">{plan.timestamp}</div>
                  </div>
                  <div className="flex gap-2">
                      <button className="text-blue-600 p-2"><ArrowRight size={20}/></button>
                      <button onClick={(e) => { e.stopPropagation(); deletePlan(plan.id); }} className="text-red-600 p-2"><Trash2 size={20}/></button>
                  </div>
              </div>
          ))}
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
                <button onClick={() => setCurrentView('plan')} className="text-blue-600 text-sm font-bold">列表</button>
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
