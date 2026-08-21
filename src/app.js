const GAME_SECONDS = 30;
const ACHIEVEMENT_KEY = "jiangxiCivilizedAchievementsV2";
const BEST_SCORE_KEY = "jiangxiCivilizedBest";
const FRESH_EXPERIENCE = /(?:^|[?&])fresh=1(?:&|$)/.test(window.location.search);

if (FRESH_EXPERIENCE) {
  try {
    localStorage.removeItem(ACHIEVEMENT_KEY);
    localStorage.removeItem(BEST_SCORE_KEY);
  } catch {
    // The game still starts clean when storage is unavailable.
  }
}

const SCENE_GROUPS = {
  watching: {
    label: "文明观赛",
    short: "观赛",
    icon: "赛",
    threshold: 2,
  },
  tourism: {
    label: "文明旅游",
    short: "旅游",
    icon: "游",
    threshold: 2,
  },
  traffic: {
    label: "文明交通",
    short: "交通",
    icon: "行",
    threshold: 2,
  },
  dining: {
    label: "文明餐桌",
    short: "餐桌",
    icon: "餐",
    threshold: 2,
  },
  practice: {
    label: "新时代文明实践",
    short: "实践",
    icon: "志",
    threshold: 1,
  },
};

const SCENE_ORDER = ["watching", "tourism", "traffic", "dining"];
const ROUTE_SIZE = SCENE_ORDER.length;

const HOSTS = {
  ganxiaowen: {
    name: "赣小文",
    avatar: "assets/ganxiaowen-front.webp",
    role: "点赞文明",
    intro: "我来带路，你来判断。发现文明行为就大胆点赞！",
  },
  poxiaoming: {
    name: "鄱小明",
    avatar: "assets/poxiaoming-front.webp",
    role: "提醒劝阻",
    intro: "遇到不文明行为，记得及时劝阻，守住文明底线。",
  },
};

function getSceneKey(item) {
  if (item.scene) {
    return item.scene;
  }
  if (item.category.includes("观赛")) {
    return "watching";
  }
  if (item.category.includes("交通") || item.category.includes("出行")) {
    return "traffic";
  }
  if (item.category.includes("餐桌")) {
    return "dining";
  }
  if (item.category.includes("旅游") || item.category.includes("文物") || item.category.includes("红色")) {
    return "tourism";
  }
  if (item.category.includes("文明实践")) {
    return "practice";
  }
  return null;
}

function getSceneMeta(itemOrKey) {
  const key = typeof itemOrKey === "string" ? itemOrKey : getSceneKey(itemOrKey);
  return SCENE_GROUPS[key] || SCENE_GROUPS.tourism;
}

const SCENARIOS = [
  {
    category: "文明旅游",
    place: "滕王阁",
    visual: "landmark",
    image: "assets/scenes/01-tengwang-queue.webp",
    choreo: "girl-guide",
    symbol: "阁",
    host: "ganxiaowen",
    answer: "civilized",
    title: "排队登楼，不插队抢位",
    body: "游客按指引排队登楼，把通道留给大家安全通行。",
    tip: "名楼前守秩序，风景会更从容。",
  },
  {
    category: "文明旅游",
    place: "滕王阁",
    visual: "landmark-danger",
    image: "assets/scenes/02-tengwang-rail-selfie.webp",
    choreo: "boy-warn",
    symbol: "栏",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "探出护栏拍照打卡",
    body: "为了拍到刺激角度，把身体探到景区护栏外。",
    tip: "好照片不该用安全冒险来换。",
  },
  {
    category: "文物保护",
    place: "绳金塔",
    visual: "tower",
    image: "assets/scenes/03-shengjin-guide.webp",
    choreo: "girl-guide",
    symbol: "塔",
    host: "ganxiaowen",
    answer: "civilized",
    title: "按导览线参观古塔",
    body: "跟着现场导览慢行，不触摸、不攀爬文物设施。",
    tip: "尊重文物，就是把城市记忆留给更多人。",
  },
  {
    category: "文物保护",
    place: "绳金塔",
    visual: "tower-danger",
    image: "assets/scenes/04-shengjin-graffiti.webp",
    choreo: "boy-stop",
    symbol: "刻",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "在古迹墙面写字留名",
    body: "觉得来过就要留痕，于是在墙面或设施上涂写。",
    tip: "留下脚步和照片，不留下伤痕。",
  },
  {
    category: "红色场馆",
    place: "八一起义纪念馆",
    visual: "memorial",
    image: "assets/scenes/05-memorial-quiet.webp",
    choreo: "girl-guide",
    symbol: "红",
    host: "ganxiaowen",
    answer: "civilized",
    title: "参观时轻声慢行",
    body: "在展厅里降低音量，认真观看展陈内容。",
    tip: "红色场馆里的安静，是另一种敬意。",
  },
  {
    category: "红色场馆",
    place: "井冈山",
    visual: "mountain-danger",
    image: "assets/scenes/06-jinggangshan-running.webp",
    choreo: "boy-warn",
    symbol: "闹",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "在纪念地嬉闹追跑",
    body: "把庄重参观场所当成游乐空间，大声打闹。",
    tip: "红色故事值得认真听，也值得认真守护。",
  },
  {
    category: "文明观赛",
    place: "赣超",
    visual: "stadium",
    image: "assets/scenes/07-ganchao-cheer.webp",
    choreo: "girl-cheer",
    symbol: "足",
    host: "ganxiaowen",
    answer: "civilized",
    title: "为双方球员理性加油",
    body: "看到精彩配合就鼓掌，不攻击裁判和客队球迷。",
    tip: "主场越热烈，越要有风度。",
  },
  {
    category: "文明观赛",
    place: "赣超",
    visual: "stadium-danger",
    image: "assets/scenes/08-ganchao-throw-bottle.webp",
    choreo: "boy-stop",
    symbol: "抛",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "向场内投掷水瓶杂物",
    body: "因为不满判罚，把瓶子扔向球场。",
    tip: "情绪可以呐喊，底线不能越过。",
  },
  {
    category: "文明观赛",
    place: "赣羽超",
    visual: "arena",
    image: "assets/scenes/09-badminton-quiet.webp",
    choreo: "girl-guide",
    symbol: "羽",
    host: "ganxiaowen",
    answer: "civilized",
    title: "发球时保持安静",
    body: "比赛关键分时收起喧哗，把专注留给运动员。",
    tip: "会安静，也会喝彩，才是懂球观众。",
  },
  {
    category: "文明观赛",
    place: "赣羽超",
    visual: "arena-danger",
    image: "assets/scenes/10-badminton-flash.webp",
    choreo: "boy-warn",
    symbol: "闪",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "近距离开闪光灯拍摄",
    body: "为了拍清画面，对着运动员频繁开闪光灯。",
    tip: "记录精彩，也要不打扰比赛。",
  },
  {
    category: "文明观赛",
    place: "体育场看台",
    visual: "stadium-clean",
    image: "assets/scenes/11-stadium-clean-trash.webp",
    choreo: "girl-cheer",
    symbol: "净",
    host: "ganxiaowen",
    answer: "civilized",
    title: "离场前带走垃圾",
    body: "把饮料杯、包装袋整理好，投进分类垃圾桶。",
    tip: "把掌声留下，把垃圾带走。",
  },
  {
    category: "文明观赛",
    place: "体育场看台",
    visual: "stadium-danger",
    image: "assets/scenes/12-stadium-crowd-push.webp",
    choreo: "boy-stop",
    symbol: "挤",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "散场时推挤抢行",
    body: "比赛结束急着离开，推搡前方观众。",
    tip: "散场不散文明，越拥挤越要有序。",
  },
  {
    category: "文明出行",
    place: "鹭鹭行",
    visual: "transit",
    image: "assets/scenes/13-luluxing-parking.webp",
    choreo: "girl-guide",
    symbol: "骑",
    host: "ganxiaowen",
    answer: "civilized",
    title: "骑行后停入指定区域",
    body: "还车时把车辆摆正，不占盲道和消防通道。",
    tip: "共享出行，方便自己也方便别人。",
  },
  {
    category: "文明出行",
    place: "鹭鹭行",
    visual: "transit-danger",
    image: "assets/scenes/14-luluxing-wrong-way.webp",
    choreo: "boy-warn",
    symbol: "逆",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "图方便逆行穿梭",
    body: "骑行时为了少绕路，逆向进入机动车道。",
    tip: "近路不能拿安全来换。",
  },
  {
    category: "文明交通",
    place: "地铁站口",
    visual: "metro",
    image: "assets/scenes/15-metro-let-exit.webp",
    choreo: "girl-guide",
    symbol: "让",
    host: "ganxiaowen",
    answer: "civilized",
    title: "先下后上，有序进站",
    body: "等乘客下车后再上车，不堵在车门口。",
    tip: "一个让字，能让城市运行更顺。",
  },
  {
    category: "文明交通",
    place: "公交站台",
    visual: "metro-danger",
    image: "assets/scenes/16-bus-cut-line.webp",
    choreo: "boy-stop",
    symbol: "抢",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "绕过队伍抢先上车",
    body: "看到车来了就从旁边挤到最前面。",
    tip: "排队是最直观的文明名片。",
  },
  {
    category: "文明餐桌",
    place: "南昌拌粉店",
    visual: "dining",
    image: "assets/scenes/17-noodle-no-waste.webp",
    choreo: "girl-cheer",
    symbol: "粉",
    host: "ganxiaowen",
    answer: "civilized",
    title: "按需点餐不浪费",
    body: "早餐点适合自己的分量，吃不完主动打包。",
    tip: "江西味道很香，节约也很亮眼。",
  },
  {
    category: "文明餐桌",
    place: "瓦罐汤店",
    visual: "dining-danger",
    image: "assets/scenes/18-soup-wasteful-table.webp",
    choreo: "boy-warn",
    symbol: "汤",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "为了排场点满一桌",
    body: "明知道吃不完，仍然铺张点单讲面子。",
    tip: "体面不是浪费，节约更见风度。",
  },
  {
    category: "文明旅游",
    place: "庐山步道",
    visual: "mountain",
    image: "assets/scenes/19-lushan-path.webp",
    choreo: "girl-guide",
    symbol: "山",
    host: "ganxiaowen",
    answer: "civilized",
    title: "沿步道游览不踩踏植被",
    body: "拍照时站在安全区域，不跳进草地取景。",
    tip: "山水有灵，文明脚步要轻。",
  },
  {
    category: "文明旅游",
    place: "景德镇街区",
    visual: "heritage-danger",
    image: "assets/scenes/20-jingdezhen-litter-cup.webp",
    choreo: "boy-stop",
    symbol: "瓷",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "随手乱丢饮料杯",
    body: "逛完文创街区，把空杯子放在路边花坛。",
    tip: "城市颜值，常常就差这一步。",
  },
  {
    category: "网络文明",
    place: "江西文旅热点",
    visual: "network",
    image: "assets/scenes/21-online-source-check.webp",
    choreo: "girl-guide",
    symbol: "核",
    host: "ganxiaowen",
    answer: "civilized",
    title: "转发前先核实来源",
    body: "看到热门攻略或活动消息，先看官方渠道再分享。",
    tip: "慢一点核实，少一次误传。",
  },
  {
    category: "网络文明",
    place: "赛事评论区",
    visual: "network-danger",
    image: "assets/scenes/22-online-hostile-comment.webp",
    choreo: "boy-warn",
    symbol: "评",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "用地域攻击带节奏",
    body: "因为支持不同队伍，就在评论区辱骂对方。",
    tip: "热爱主队，也要尊重对手。",
  },
  {
    category: "文明实践",
    place: "新时代文明实践站",
    visual: "practice",
    image: "assets/scenes/23-volunteer-service.webp",
    choreo: "girl-cheer",
    symbol: "志",
    host: "ganxiaowen",
    answer: "civilized",
    title: "参加社区志愿服务",
    body: "和邻里一起清理楼道，维护公共环境。",
    tip: "文明实践，贵在身边有人行动。",
  },
  {
    category: "移风易俗",
    place: "乡村喜事",
    visual: "village-danger",
    image: "assets/scenes/24-rural-wedding-lavish.webp",
    choreo: "boy-warn",
    symbol: "礼",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "婚宴盲目攀比讲排场",
    body: "为了面子大操大办，让家人背上压力。",
    tip: "新风尚里，真心比排场更珍贵。",
  },
];

const EXTRA_SCENARIOS = [
  {
    scene: "watching",
    category: "文明观赛",
    place: "体育场看台",
    visual: "stadium",
    image: "assets/scenes/25-sports-clear-aisle.webp",
    choreo: "girl-cheer",
    symbol: "赛",
    host: "ganxiaowen",
    answer: "civilized",
    title: "鼓掌喝彩不堵通道",
    body: "看到精彩瞬间在座位上文明喝彩，把安全通道留出来。",
    tip: "热情可以很满，通道也要畅通。",
  },
  {
    scene: "watching",
    category: "文明观赛",
    place: "体育馆看台",
    visual: "arena-danger",
    image: "assets/scenes/26-sports-block-aisle.webp",
    choreo: "boy-warn",
    symbol: "挡",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "站在通道长时间拍摄",
    body: "为了录视频一直站在过道，挡住别人通行和观赛。",
    tip: "记录精彩，也不能挡住他人的视线和通道。",
  },
  {
    scene: "traffic",
    category: "文明交通",
    place: "城市路口",
    visual: "metro",
    image: "assets/scenes/27-traffic-crosswalk.webp",
    choreo: "girl-guide",
    symbol: "灯",
    host: "ganxiaowen",
    answer: "civilized",
    title: "绿灯亮起再过马路",
    body: "行人在斑马线前等待，绿灯亮后有序通过。",
    tip: "等一等红灯，是对安全最直接的守护。",
  },
  {
    scene: "traffic",
    category: "文明交通",
    place: "城市路口",
    visual: "metro-danger",
    image: "assets/scenes/28-traffic-red-light.webp",
    choreo: "boy-stop",
    symbol: "闯",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "骑电动车闯红灯",
    body: "别人都在等灯，自己却图快冲过路口。",
    tip: "快一秒不值得，安全才是回家的近路。",
  },
  {
    scene: "traffic",
    category: "文明交通",
    place: "公交车厢",
    visual: "metro",
    image: "assets/scenes/30-traffic-bus-seat.webp",
    choreo: "girl-guide",
    symbol: "让",
    host: "ganxiaowen",
    answer: "civilized",
    title: "主动礼让优先座",
    body: "看到有需要的乘客，主动起身让座。",
    tip: "一次让座，能让城市多一点温度。",
  },
  {
    scene: "dining",
    category: "文明餐桌",
    place: "江西餐馆",
    visual: "dining",
    image: "assets/scenes/31-dining-clean-plate.webp",
    choreo: "girl-cheer",
    symbol: "盘",
    host: "ganxiaowen",
    answer: "civilized",
    title: "吃多少点多少，做到光盘",
    body: "用餐后桌面整洁，盘中基本不剩饭菜。",
    tip: "光盘不是小事，是看得见的节约。",
  },
  {
    scene: "dining",
    category: "文明餐桌",
    place: "江西餐馆",
    visual: "dining",
    image: "assets/scenes/32-dining-serving-chopsticks.webp",
    choreo: "girl-guide",
    symbol: "筷",
    host: "ganxiaowen",
    answer: "civilized",
    title: "夹菜使用公筷公勺",
    body: "多人围桌用餐时，用公筷公勺给自己分菜。",
    tip: "一双公筷，让关心更卫生。",
  },
  {
    scene: "dining",
    category: "文明餐桌",
    place: "江西餐馆",
    visual: "dining",
    image: "assets/scenes/33-dining-takeaway.webp",
    choreo: "girl-cheer",
    symbol: "包",
    host: "ganxiaowen",
    answer: "civilized",
    title: "剩菜主动打包带走",
    body: "饭后把还能食用的菜品打包，减少浪费。",
    tip: "打包不丢面子，节约更有面子。",
  },
  {
    scene: "dining",
    category: "文明餐桌",
    place: "江西餐馆",
    visual: "dining-danger",
    image: "assets/scenes/34-dining-noisy-mess.webp",
    choreo: "boy-warn",
    symbol: "吵",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "高声喧哗弄乱桌面",
    body: "用餐时大声吵闹、纸巾乱丢，影响旁桌客人。",
    tip: "热闹不等于吵闹，餐桌也要有分寸。",
  },
  {
    scene: "dining",
    category: "文明餐桌",
    place: "宴席餐桌",
    visual: "dining-danger",
    image: "assets/scenes/35-dining-overorder.webp",
    choreo: "boy-stop",
    symbol: "费",
    host: "poxiaoming",
    answer: "uncivilized",
    title: "为了排场点满一桌",
    body: "人数不多却点了过量菜品，最后大量剩下。",
    tip: "体面不是浪费，节约更见风度。",
  },
];

const ASSET_VERSION = "20260820b";
const QUESTION_BANK = [...SCENARIOS, ...EXTRA_SCENARIOS]
  .filter((item) => getSceneKey(item))
  .map((item) => ({ ...item, image: `${item.image}?v=${ASSET_VERSION}` }));

const screens = {
  start: document.getElementById("startScreen"),
  game: document.getElementById("gameScreen"),
  result: document.getElementById("resultScreen"),
};

const els = {
  startBtn: document.getElementById("startBtn"),
  quitBtn: document.getElementById("quitBtn"),
  againBtn: document.getElementById("againBtn"),
  homeBtn: document.getElementById("homeBtn"),
  soundBtn: document.getElementById("soundBtn"),
  notice: document.getElementById("notice"),
  coverScenes: document.getElementById("coverScenes"),
  timerText: document.getElementById("timerText"),
  timerProgress: document.getElementById("timerProgress"),
  scoreText: document.getElementById("scoreText"),
  comboText: document.getElementById("comboText"),
  categoryText: document.getElementById("categoryText"),
  placeText: document.getElementById("placeText"),
  challengeWindow: document.querySelector(".challenge-window"),
  roundText: document.getElementById("roundText"),
  progressText: document.getElementById("progressText"),
  sceneVisual: document.getElementById("sceneVisual"),
  sceneImage: document.getElementById("sceneImage"),
  sceneSymbol: document.getElementById("sceneSymbol"),
  scenarioTitle: document.getElementById("scenarioTitle"),
  scenarioBody: document.getElementById("scenarioBody"),
  playStage: document.querySelector(".play-stage"),
  coachName: document.getElementById("coachName"),
  guideText: document.getElementById("guideText"),
  guideBubble: document.getElementById("guideBubble"),
  girlCoach: document.getElementById("girlCoach"),
  boyCoach: document.getElementById("boyCoach"),
  feedback: document.getElementById("feedback"),
  civilizedBtn: document.getElementById("civilizedBtn"),
  uncivilizedBtn: document.getElementById("uncivilizedBtn"),
  routeDots: document.getElementById("routeDots"),
  rankText: document.getElementById("rankText"),
  rankDesc: document.getElementById("rankDesc"),
  finalScoreText: document.getElementById("finalScoreText"),
  shareScoreText: document.getElementById("shareScoreText"),
  accuracyText: document.getElementById("accuracyText"),
  bestComboText: document.getElementById("bestComboText"),
  bestScoreText: document.getElementById("bestScoreText"),
  litPlaces: document.getElementById("litPlaces"),
};

const audio = {
  coverBgm: new Audio("./assets/audio/cover-loop.mp3?v=20260820a"),
  gameBgm: new Audio("./assets/audio/game-loop.mp3?v=20260820a"),
  correct: new Audio("./assets/audio/correct.wav"),
  wrong: new Audio("./assets/audio/wrong.wav"),
  start: new Audio("./assets/audio/start.wav"),
  finish: new Audio("./assets/audio/finish.wav"),
};

for (const track of [audio.coverBgm, audio.gameBgm]) {
  track.loop = true;
  track.playsInline = true;
  track.setAttribute("playsinline", "");
  track.setAttribute("webkit-playsinline", "");
}
audio.coverBgm.preload = "auto";
audio.gameBgm.preload = "none";
audio.coverBgm.autoplay = true;
for (const clip of [audio.correct, audio.wrong, audio.start, audio.finish]) {
  clip.preload = "none";
}
audio.coverBgm.volume = 0.32;
audio.gameBgm.volume = 0.3;
audio.correct.volume = 0.66;
audio.wrong.volume = 0.82;
audio.start.volume = 0.74;
audio.finish.volume = 0.62;

const state = {
  screen: "start",
  deck: [],
  preparedDeck: [],
  current: null,
  round: 0,
  score: 0,
  combo: 0,
  bestCombo: 0,
  correct: 0,
  answered: 0,
  sceneStats: {},
  unlockedScenes: new Set(),
  deadline: 0,
  timerId: null,
  locked: false,
  muted: false,
  starting: false,
};

const imagePromises = new Map();
const decodedImages = new Set();

function preloadImage(src, priority = "auto") {
  if (!src) {
    return Promise.resolve();
  }
  if (imagePromises.has(src)) {
    return imagePromises.get(src);
  }

  const promise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = priority;
    image.onload = () => {
      const decoded = typeof image.decode === "function" ? image.decode().catch(() => {}) : Promise.resolve();
      decoded.then(() => {
        decodedImages.add(src);
        resolve();
      }, () => {
        decodedImages.add(src);
        resolve();
      });
    };
    image.onerror = () => resolve();
    image.src = src;
  });

  imagePromises.set(src, promise);
  return promise;
}

function warmScenarioImages(items, count = items.length) {
  const urls = [...new Set(items.slice(0, count).map((item) => item?.image).filter(Boolean))];
  return Promise.all(urls.map((src) => preloadImage(src, "low").catch(() => {})));
}

function prepareNextDeck() {
  state.preparedDeck = buildBalancedDeck();
  const [firstItem, ...remainingItems] = state.preparedDeck;
  preloadImage(firstItem?.image, "high").then(() => {
    warmScenarioImages(remainingItems, 1);
  });
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function coreAchievementCount() {
  return SCENE_ORDER.filter((key) => state.unlockedScenes.has(key)).length;
}

function buildBalancedDeck() {
  const buckets = Object.fromEntries(
    SCENE_ORDER.map((key) => [key, shuffle(QUESTION_BANK.filter((item) => getSceneKey(item) === key))]),
  );
  const practiceItems = shuffle(QUESTION_BANK.filter((item) => getSceneKey(item) === "practice"));
  const deck = [];
  let cycle = 0;

  while (SCENE_ORDER.some((key) => buckets[key].length > 0)) {
    const order = cycle === 0 ? shuffle(SCENE_ORDER) : shuffle(SCENE_ORDER);
    order.forEach((key) => {
      const item = buckets[key].shift();
      if (item) {
        deck.push(item);
      }
    });
    if (cycle === 0 && practiceItems.length) {
      deck.push(practiceItems.shift());
    }
    cycle += 1;
  }

  deck.push(...practiceItems);

  return deck;
}

function createSceneStats() {
  return Object.fromEntries(Object.keys(SCENE_GROUPS).map((key) => [key, { correct: 0, answered: 0 }]));
}

function loadAchievements() {
  try {
    const saved = JSON.parse(localStorage.getItem(ACHIEVEMENT_KEY) || "[]");
    return new Set(saved.filter((key) => SCENE_GROUPS[key]));
  } catch {
    return new Set();
  }
}

function saveAchievements() {
  try {
    localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify([...state.unlockedScenes]));
  } catch {
    // Some embedded or privacy-mode browsers disable persistent storage.
  }
}

function playAudio(name, restart = true) {
  if (state.muted || !audio[name]) {
    return;
  }
  const clip = audio[name];
  if (restart) {
    try {
      clip.currentTime = 0;
    } catch {
      // Some mobile browsers reject seeking until their first successful play.
    }
  }
  clip.play().catch(() => {
    // A user gesture starts audio on mobile; failed autoplay stays silent.
  });
}

function pauseBgm() {
  audio.coverBgm.pause();
  audio.gameBgm.pause();
}

function playBgm(name, restart = false) {
  if (state.muted || !audio[name]) {
    return Promise.resolve();
  }
  const track = audio[name];
  const otherTrack = name === "coverBgm" ? audio.gameBgm : audio.coverBgm;
  otherTrack.pause();
  if (restart) {
    try {
      track.currentTime = 0;
    } catch {
      // The first user gesture will unlock seeking on restrictive browsers.
    }
  }
  return track.play();
}

function playCoverMusic() {
  if (state.muted || state.screen !== "start") {
    return;
  }
  playBgm("coverBgm").then(() => {
    els.soundBtn.classList.remove("needs-gesture");
  }).catch(() => {
    // Mobile browsers require one touch before audible playback.
    els.soundBtn.classList.add("needs-gesture");
  });
}

const audioUnlockEvents = ["pointerup", "touchend", "click", "keydown"];

function removeAudioUnlockListeners() {
  audioUnlockEvents.forEach((eventName) => {
    window.removeEventListener(eventName, unlockAudioFromGesture, true);
  });
}

function unlockAudioFromGesture(event) {
  if (state.muted) {
    return;
  }
  if (event?.target instanceof Element && event.target.closest("#soundBtn")) {
    return;
  }
  const trackName = state.screen === "game" ? "gameBgm" : "coverBgm";
  playBgm(trackName).then(() => {
    els.soundBtn.classList.remove("needs-gesture");
    removeAudioUnlockListeners();
  }).catch(() => {});
}

function unlockWechatAudio() {
  const bridge = window.WeixinJSBridge;
  if (bridge?.invoke) {
    bridge.invoke("getNetworkType", {}, () => {
      playCoverMusic();
    });
    return;
  }
  playCoverMusic();
}

function renderCoverScenes() {
  const unlocked = loadAchievements();
  if (!els.coverScenes) {
    return;
  }
  els.coverScenes.querySelectorAll(".cover-scene").forEach((card) => {
    const isLit = unlocked.has(card.dataset.scene);
    card.classList.toggle("is-lit", isLit);
    card.classList.toggle("is-locked", !isLit);
  });
}

function showScreen(name) {
  state.screen = name;
  Object.entries(screens).forEach(([key, screen]) => {
    screen.hidden = key !== name;
  });
}

function resetState() {
  state.deck = state.preparedDeck.length ? [...state.preparedDeck] : buildBalancedDeck();
  state.preparedDeck = [];
  state.current = null;
  state.round = 0;
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.correct = 0;
  state.answered = 0;
  state.sceneStats = createSceneStats();
  state.unlockedScenes = loadAchievements();
  state.deadline = 0;
  state.locked = false;
}

async function startGame() {
  if (state.starting) {
    return;
  }
  state.starting = true;
  resetState();
  els.startBtn.disabled = true;
  els.againBtn.disabled = true;
  els.startBtn.classList.add("is-loading");
  els.startBtn.setAttribute("aria-busy", "true");
  playAudio("start");
  audio.gameBgm.preload = "auto";
  playBgm("gameBgm", true).catch(() => {
    // The start button is a user gesture, but older embedded browsers may still reject playback.
  });

  const firstImage = state.deck[0]?.image;
  await Promise.race([
    preloadImage(firstImage, "high"),
    new Promise((resolve) => window.setTimeout(resolve, 4500)),
  ]);

  for (const clip of [audio.correct, audio.wrong, audio.finish]) {
    clip.preload = "auto";
    clip.load();
  }

  state.deadline = Date.now() + GAME_SECONDS * 1000;
  showScreen("game");
  renderRouteDots();
  updateHud();
  nextScenario();
  clearInterval(state.timerId);
  state.timerId = window.setInterval(updateTimer, 100);
  updateTimer();
  state.starting = false;
  els.startBtn.disabled = false;
  els.againBtn.disabled = false;
  els.startBtn.classList.remove("is-loading");
  els.startBtn.removeAttribute("aria-busy");
}

function finishGame() {
  clearInterval(state.timerId);
  state.timerId = null;
  state.locked = false;
  setButtonsDisabled(false);
  updateResults();
  pauseBgm();
  playAudio("finish");
  renderCoverScenes();
  showScreen("result");
  prepareNextDeck();
}

function returnHome() {
  clearInterval(state.timerId);
  state.timerId = null;
  hideFeedback();
  renderCoverScenes();
  showScreen("start");
  playCoverMusic();
  if (!state.preparedDeck.length) {
    prepareNextDeck();
  }
}

function nextScenario() {
  if (state.deck.length === 0) {
    state.deck = buildBalancedDeck();
  }
  state.round += 1;
  state.current = state.deck.shift();
  renderScenario();
  warmScenarioImages(state.deck, 4);
  hideFeedback();
  setButtonsDisabled(false);
  state.locked = false;
}

function setCoach(hostKey, message, mood = "", choreo = "") {
  const host = HOSTS[hostKey] || HOSTS.poxiaoming;
  els.coachName.textContent = `${host.name} · ${host.role}`;
  els.guideText.textContent = message;
  els.guideBubble.className = `guide-bubble ${mood}`.trim();
  els.playStage.className = `play-stage ${choreo ? `choreo-${choreo}` : ""}`.trim();
  els.girlCoach.classList.toggle("is-active", hostKey === "ganxiaowen");
  els.boyCoach.classList.toggle("is-active", hostKey === "poxiaoming");
  els.girlCoach.classList.toggle("is-cheering", mood === "correct");
  els.boyCoach.classList.toggle("is-alert", mood === "wrong");
}

function renderScenario() {
  const item = state.current;
  const sceneKey = getSceneKey(item);
  const sceneMeta = getSceneMeta(sceneKey);
  els.categoryText.textContent = sceneMeta.label;
  els.placeText.textContent = item.place;
  els.challengeWindow.dataset.place = item.place;
  els.roundText.textContent = `第 ${state.round} 题`;
  els.progressText.textContent = `文明印记 ${coreAchievementCount()}/${ROUTE_SIZE}`;
  els.sceneSymbol.textContent = item.symbol;
  els.scenarioTitle.textContent = item.title;
  els.scenarioBody.textContent = item.body;
  els.sceneVisual.className = `scene-art ${item.visual}${decodedImages.has(item.image) ? "" : " is-loading"}`;
  els.sceneImage.fetchPriority = "high";
  els.sceneImage.src = item.image;
  els.sceneImage.alt = `${item.place}：${item.title}`;
  els.sceneVisual.setAttribute("aria-label", `${item.place}：${item.title}`);
  els.playStage.style.background = `linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 249, 225, 0.08) 42%, rgba(30, 24, 13, 0.34)), url("${item.image}") center / cover no-repeat`;
  preloadImage(item.image).then(() => {
    if (state.current === item) {
      els.sceneVisual.classList.remove("is-loading");
    }
  });
  const coachPrefix = sceneKey === "practice" ? "这是一场文明实践，" : `这里是${item.place}，`;
  setCoach(item.host, `${coachPrefix}看清行为再做选择。`, "", item.choreo);
  updateRouteDots();
}

function setButtonsDisabled(disabled) {
  els.civilizedBtn.disabled = disabled;
  els.uncivilizedBtn.disabled = disabled;
}

function answer(choice) {
  if (state.locked || state.screen !== "game") {
    return;
  }

  state.locked = true;
  setButtonsDisabled(true);

  const item = state.current;
  const sceneKey = getSceneKey(item);
  const sceneMeta = getSceneMeta(sceneKey);
  const isCorrect = choice === item.answer;
  state.answered += 1;
  state.sceneStats[sceneKey].answered += 1;

  if (isCorrect) {
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.correct += 1;
    state.sceneStats[sceneKey].correct += 1;
    if (state.sceneStats[sceneKey].correct >= sceneMeta.threshold) {
      state.unlockedScenes.add(sceneKey);
      saveAchievements();
    }
    const comboBonus = Math.min(100, Math.max(0, state.combo - 1) * 20);
    const gained = 100 + comboBonus;
    state.score += gained;
    playAudio("correct");
    showFeedback("correct", `判断正确 +${gained}`, item.tip);
    setCoach("ganxiaowen", `答对啦！${item.tip}`, "correct", "girl-cheer");
  } else {
    state.combo = 0;
    const rightText = item.answer === "civilized" ? "点赞文明" : "劝阻不文明";
    playAudio("wrong");
    showFeedback("wrong", `这题应选「${rightText}」`, item.tip);
    setCoach("poxiaoming", `提醒一下：${item.tip}`, "wrong", "boy-stop");
  }

  updateHud();
  updateRouteDots();

  window.setTimeout(() => {
    if (state.screen !== "game") {
      return;
    }
    if (remainingMs() <= 0) {
      finishGame();
      return;
    }
    nextScenario();
  }, 860);
}

function remainingMs() {
  return Math.max(0, state.deadline - Date.now());
}

function updateTimer() {
  const ms = remainingMs();
  const seconds = Math.ceil(ms / 1000);
  const pct = ms / (GAME_SECONDS * 1000);
  els.timerText.textContent = seconds.toString().padStart(2, "0");
  els.timerProgress.style.strokeDashoffset = String(119.38 * (1 - pct));

  if (ms <= 0) {
    finishGame();
  }
}

function updateHud() {
  els.scoreText.textContent = state.score;
  els.comboText.textContent = state.combo.toString().padStart(2, "0");
  if (els.progressText) {
    els.progressText.textContent = `文明印记 ${coreAchievementCount()}/${ROUTE_SIZE}`;
  }
}

function renderRouteDots() {
  els.routeDots.innerHTML = SCENE_ORDER.map(
    (key) => {
      const meta = SCENE_GROUPS[key];
      return `
      <span class="scene-lamp" data-scene="${key}">
        <i aria-hidden="true">${meta.icon}</i>
        <em>${meta.short} 0/${meta.threshold}</em>
      </span>
    `;
    },
  ).join("");
  updateRouteDots();
}

function updateRouteDots() {
  els.routeDots.querySelectorAll(".scene-lamp").forEach((dot) => {
    const key = dot.dataset.scene;
    const meta = SCENE_GROUPS[key];
    const stat = state.sceneStats[key] || { correct: 0 };
    const isLit = state.unlockedScenes.has(key);
    const isActive = state.current && getSceneKey(state.current) === key;
    dot.querySelector("em").textContent = isLit
      ? `${meta.short} 已点亮`
      : `${meta.short} ${Math.min(stat.correct, meta.threshold)}/${meta.threshold}`;
    dot.classList.toggle("is-lit", isLit);
    dot.classList.toggle("is-active", isActive);
  });
}

function showFeedback(type, title, body) {
  els.feedback.hidden = false;
  els.feedback.className = `feedback-toast ${type}`;
  els.feedback.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
}

function hideFeedback() {
  els.feedback.hidden = true;
  els.feedback.textContent = "";
}

function showNotice(message) {
  els.notice.hidden = false;
  els.notice.textContent = message;
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => {
    els.notice.hidden = true;
  }, 1800);
}

function getRank(score, accuracy) {
  if (score >= 2200 && accuracy >= 82) {
    return ["赣鄱文明领跑者", "你把江西现场的文明细节抓得又快又准。"];
  }
  if (score >= 1500 && accuracy >= 70) {
    return ["文明答题达人", "赣小文和鄱小明已经记住你的高光表现。"];
  }
  if (score >= 800) {
    return ["文明实践搭子", "继续答题，下一局把更多江西场景点亮。"];
  }
  return ["文明新芽", "再来一局，跟着 IP 一起把文明选择练得更熟。"];
}

function updateResults() {
  const accuracy = state.answered === 0 ? 0 : Math.round((state.correct / state.answered) * 100);
  const [rank] = getRank(state.score, accuracy);
  let storedBest = 0;
  try {
    storedBest = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
  } catch {
    // Keep the current score when storage is unavailable.
  }
  const best = Math.max(storedBest, state.score);
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(best));
  } catch {
    // The result page still works without persistence.
  }

  els.rankText.textContent = rank;
  els.rankDesc.textContent = "继续答题，下一局把更多江西场景点亮。";
  els.finalScoreText.textContent = state.score;
  els.shareScoreText.textContent = state.score;
  els.accuracyText.textContent = `${accuracy}%`;
  els.bestComboText.textContent = state.bestCombo.toString().padStart(2, "0");
  els.bestScoreText.textContent = `历史最佳：${best}`;
  renderLitPlaces();
}

function syncAppViewport() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${Math.round(viewportHeight)}px`);
}

function renderLitPlaces() {
  els.litPlaces.innerHTML = SCENE_ORDER.map((key) => {
    const meta = SCENE_GROUPS[key];
    const stat = state.sceneStats[key] || { correct: 0 };
    const isLit = state.unlockedScenes.has(key);
    return `<span class="${isLit ? "is-lit" : "is-locked"}">${meta.label} ${isLit ? "已点亮" : `${Math.min(stat.correct, meta.threshold)}/${meta.threshold}`}</span>`;
  }).join("");
}

function toggleSound() {
  const activeTrack = state.screen === "game" ? audio.gameBgm : audio.coverBgm;
  if (!state.muted && state.screen !== "result" && activeTrack.paused) {
    playBgm(state.screen === "game" ? "gameBgm" : "coverBgm").then(() => {
      els.soundBtn.classList.remove("needs-gesture", "is-muted");
      removeAudioUnlockListeners();
    }).catch(() => {});
    els.soundBtn.setAttribute("aria-pressed", "true");
    showNotice("音乐已开启");
    return;
  }
  state.muted = !state.muted;
  els.soundBtn.classList.toggle("is-muted", state.muted);
  els.soundBtn.setAttribute("aria-pressed", String(!state.muted));
  if (state.muted) {
    pauseBgm();
  } else if (state.screen === "game") {
    playBgm("gameBgm").catch(() => {});
  } else if (state.screen === "start") {
    playCoverMusic();
  } else {
    pauseBgm();
  }
  showNotice(state.muted ? "已切换为静音" : "音乐已开启");
}

els.startBtn.addEventListener("click", startGame);
els.quitBtn.addEventListener("click", returnHome);
els.homeBtn.addEventListener("click", returnHome);
els.againBtn.addEventListener("click", startGame);
els.civilizedBtn.addEventListener("click", () => answer("civilized"));
els.uncivilizedBtn.addEventListener("click", () => answer("uncivilized"));
els.soundBtn.addEventListener("click", toggleSound);

audioUnlockEvents.forEach((eventName) => {
  window.addEventListener(eventName, unlockAudioFromGesture, { capture: true, passive: true });
});
document.addEventListener("WeixinJSBridgeReady", unlockWechatAudio, { once: true });
if (window.WeixinJSBridge) {
  unlockWechatAudio();
}
window.addEventListener("resize", syncAppViewport, { passive: true });
window.visualViewport?.addEventListener("resize", syncAppViewport, { passive: true });
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    if (state.screen === "start") {
      playCoverMusic();
    } else if (state.screen === "game") {
      playBgm("gameBgm").catch(() => {});
    }
  }
});

window.addEventListener("keydown", (event) => {
  if (state.screen !== "game") {
    return;
  }
  if (event.key === "ArrowLeft") {
    answer("civilized");
  }
  if (event.key === "ArrowRight") {
    answer("uncivilized");
  }
});

window.civilizedQuizGame = {
  startGame,
  finishGame,
  answer,
  getState: () => ({
    ...state,
    deck: [...state.deck],
    unlockedScenes: [...state.unlockedScenes],
    sceneStats: JSON.parse(JSON.stringify(state.sceneStats)),
    questionCount: QUESTION_BANK.length,
  }),
  getAudioState: () => ({
    muted: state.muted,
    coverPaused: audio.coverBgm.paused,
    coverCurrentTime: audio.coverBgm.currentTime,
    gamePaused: audio.gameBgm.paused,
    gameCurrentTime: audio.gameBgm.currentTime,
  }),
};
window.civilizedFlashGame = window.civilizedQuizGame;

syncAppViewport();
renderCoverScenes();
playCoverMusic();
prepareNextDeck();
