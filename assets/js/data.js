/* ===================================================================
   数据层：26 字母 + 8 首幼儿古诗（逐字拼音）
   =================================================================== */

/* ---------- 26 个英文字母 ---------- */
const LETTERS = [
  { u:'A', l:'a', word:'Apple',      cn:'苹果',   emoji:'🍎', color:'pink'   },
  { u:'B', l:'b', word:'Banana',     cn:'香蕉',   emoji:'🍌', color:'yellow' },
  { u:'C', l:'c', word:'Cat',        cn:'小猫',   emoji:'🐱', color:'orange' },
  { u:'D', l:'d', word:'Dog',        cn:'小狗',   emoji:'🐶', color:'blue'   },
  { u:'E', l:'e', word:'Elephant',   cn:'大象',   emoji:'🐘', color:'purple' },
  { u:'F', l:'f', word:'Fish',       cn:'小鱼',   emoji:'🐟', color:'blue'   },
  { u:'G', l:'g', word:'Grape',      cn:'葡萄',   emoji:'🍇', color:'purple' },
  { u:'H', l:'h', word:'Hat',        cn:'帽子',   emoji:'🎩', color:'green'  },
  { u:'I', l:'i', word:'Ice cream',  cn:'冰淇淋', emoji:'🍦', color:'pink'   },
  { u:'J', l:'j', word:'Juice',      cn:'果汁',   emoji:'🧃', color:'orange' },
  { u:'K', l:'k', word:'Kite',       cn:'风筝',   emoji:'🪁', color:'blue'   },
  { u:'L', l:'l', word:'Lion',       cn:'狮子',   emoji:'🦁', color:'yellow' },
  { u:'M', l:'m', word:'Moon',       cn:'月亮',   emoji:'🌙', color:'purple' },
  { u:'N', l:'n', word:'Nose',       cn:'鼻子',   emoji:'👃', color:'pink'   },
  { u:'O', l:'o', word:'Orange',     cn:'橙子',   emoji:'🍊', color:'orange' },
  { u:'P', l:'p', word:'Panda',      cn:'熊猫',   emoji:'🐼', color:'green'  },
  { u:'Q', l:'q', word:'Queen',      cn:'女王',   emoji:'👑', color:'yellow' },
  { u:'R', l:'r', word:'Rabbit',     cn:'兔子',   emoji:'🐰', color:'pink'   },
  { u:'S', l:'s', word:'Sun',        cn:'太阳',   emoji:'☀️', color:'yellow' },
  { u:'T', l:'t', word:'Tiger',      cn:'老虎',   emoji:'🐯', color:'orange' },
  { u:'U', l:'u', word:'Umbrella',   cn:'雨伞',   emoji:'☂️', color:'blue'   },
  { u:'V', l:'v', word:'Violin',     cn:'小提琴', emoji:'🎻', color:'purple' },
  { u:'W', l:'w', word:'Watermelon', cn:'西瓜',   emoji:'🍉', color:'green'  },
  { u:'X', l:'x', word:'Xylophone',  cn:'木琴',   emoji:'🎼', color:'blue'   },
  { u:'Y', l:'y', word:'Yo-yo',      cn:'悠悠球', emoji:'🪀', color:'pink'   },
  { u:'Z', l:'z', word:'Zebra',      cn:'斑马',   emoji:'🦓', color:'purple' }
];

/* ---------- 8 首经典幼儿古诗 ---------- */
const POEMS = [
  {
    id:'jingyesi', emoji:'🌕', title:'静夜思', author:'唐 · 李白',
    lines:[
      { hz:'床前明月光', py:['chuáng','qián','míng','yuè','guāng'] },
      { hz:'疑是地上霜', py:['yí','shì','dì','shàng','shuāng'] },
      { hz:'举头望明月', py:['jǔ','tóu','wàng','míng','yuè'] },
      { hz:'低头思故乡', py:['dī','tóu','sī','gù','xiāng'] }
    ],
    mean:'床前洒满明亮的月光，好像地上结了霜。抬头看着天上的月亮，低下头就想起了家乡。'
  },
  {
    id:'yonge', emoji:'🦢', title:'咏鹅', author:'唐 · 骆宾王',
    lines:[
      { hz:'鹅，鹅，鹅', py:['é','é','é'] },
      { hz:'曲项向天歌', py:['qū','xiàng','xiàng','tiān','gē'] },
      { hz:'白毛浮绿水', py:['bái','máo','fú','lǜ','shuǐ'] },
      { hz:'红掌拨清波', py:['hóng','zhǎng','bō','qīng','bō'] }
    ],
    mean:'大白鹅弯着脖子对着天空唱歌。雪白的羽毛浮在绿水上，红红的脚掌拨动清清的水波。'
  },
  {
    id:'chunxiao', emoji:'🌸', title:'春晓', author:'唐 · 孟浩然',
    lines:[
      { hz:'春眠不觉晓', py:['chūn','mián','bù','jué','xiǎo'] },
      { hz:'处处闻啼鸟', py:['chù','chù','wén','tí','niǎo'] },
      { hz:'夜来风雨声', py:['yè','lái','fēng','yǔ','shēng'] },
      { hz:'花落知多少', py:['huā','luò','zhī','duō','shǎo'] }
    ],
    mean:'春天睡觉真香，天亮了都不知道，到处都能听见小鸟叫。昨夜刮风又下雨，不知道吹落了多少花。'
  },
  {
    id:'minnong', emoji:'🌾', title:'悯农', author:'唐 · 李绅',
    lines:[
      { hz:'锄禾日当午', py:['chú','hé','rì','dāng','wǔ'] },
      { hz:'汗滴禾下土', py:['hàn','dī','hé','xià','tǔ'] },
      { hz:'谁知盘中餐', py:['shuí','zhī','pán','zhōng','cān'] },
      { hz:'粒粒皆辛苦', py:['lì','lì','jiē','xīn','kǔ'] }
    ],
    mean:'中午最热的时候农民还在锄地，汗水一滴滴落进土里。谁知道碗里的饭，每一粒都很辛苦呀。'
  },
  {
    id:'dengguanquelou', emoji:'🏯', title:'登鹳雀楼', author:'唐 · 王之涣',
    lines:[
      { hz:'白日依山尽', py:['bái','rì','yī','shān','jìn'] },
      { hz:'黄河入海流', py:['huáng','hé','rù','hǎi','liú'] },
      { hz:'欲穷千里目', py:['yù','qióng','qiān','lǐ','mù'] },
      { hz:'更上一层楼', py:['gèng','shàng','yī','céng','lóu'] }
    ],
    mean:'太阳靠着山慢慢落下去，黄河向着大海流。想要看到更远的风景，就要再上一层楼。'
  },
  {
    id:'jiangxue', emoji:'❄️', title:'江雪', author:'唐 · 柳宗元',
    lines:[
      { hz:'千山鸟飞绝', py:['qiān','shān','niǎo','fēi','jué'] },
      { hz:'万径人踪灭', py:['wàn','jìng','rén','zōng','miè'] },
      { hz:'孤舟蓑笠翁', py:['gū','zhōu','suō','lì','wēng'] },
      { hz:'独钓寒江雪', py:['dú','diào','hán','jiāng','xuě'] }
    ],
    mean:'所有的山上都看不见鸟，所有的小路上都没有人。只有一条小船上，一位老爷爷在下雪的江上钓鱼。'
  },
  {
    id:'chishang', emoji:'🪷', title:'池上', author:'唐 · 白居易',
    lines:[
      { hz:'小娃撑小艇', py:['xiǎo','wá','chēng','xiǎo','tǐng'] },
      { hz:'偷采白莲回', py:['tōu','cǎi','bái','lián','huí'] },
      { hz:'不解藏踪迹', py:['bù','jiě','cáng','zōng','jì'] },
      { hz:'浮萍一道开', py:['fú','píng','yī','dào','kāi'] }
    ],
    mean:'小孩子撑着小船，偷偷采了白莲花回来。他不懂得藏起痕迹，水面的浮萍被划开了一条路。'
  },
  {
    id:'xiaochi', emoji:'🪺', title:'小池', author:'宋 · 杨万里',
    lines:[
      { hz:'泉眼无声惜细流', py:['quán','yǎn','wú','shēng','xī','xì','liú'] },
      { hz:'树阴照水爱晴柔', py:['shù','yīn','zhào','shuǐ','ài','qíng','róu'] },
      { hz:'小荷才露尖尖角', py:['xiǎo','hé','cái','lù','jiān','jiān','jiǎo'] },
      { hz:'早有蜻蜓立上头', py:['zǎo','yǒu','qīng','tíng','lì','shàng','tóu'] }
    ],
    mean:'泉水悄悄地流出来，树影倒映在水面上。小荷叶刚刚露出一个小尖角，就已经有蜻蜓落在上面啦。'
  }
];

/* ---------- 0-20 数字中文读法 ---------- */
const NUM_CN = ['零','一','二','三','四','五','六','七','八','九','十',
                '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十'];
const NUM_CN_UPPER = ['〇','一','二','三','四','五','六','七','八','九','十',
                '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十'];

/* ---------- 成就徽章 ---------- */
const BADGES = [
  { id:'first_step', ico:'🌱', name:'初出茅庐', desc:'通过第 1 关' },
  { id:'abc_master', ico:'🔤', name:'字母小达人', desc:'认识全部 26 个字母' },
  { id:'match_king', ico:'🎯', name:'配对小能手', desc:'完成 3 次字母配对' },
  { id:'poet',        ico:'📖', name:'小小诗人',   desc:'学会 5 首古诗' },
  { id:'poet_pro',    ico:'🏮', name:'诗词小状元', desc:'学会全部 8 首古诗' },
  { id:'counter',     ico:'🔢', name:'数数小专家', desc:'数数游戏答对 15 次' },
  { id:'math_wiz',    ico:'🧮', name:'算术小天才', desc:'加减法答对 20 题' },
  { id:'detective',   ico:'🕵️', name:'逻辑小侦探', desc:'逻辑题答对 15 题' },
  { id:'star_50',     ico:'⭐', name:'星星收藏家', desc:'累计获得 50 颗星' },
  { id:'star_150',    ico:'🌟', name:'星光闪耀',   desc:'累计获得 150 颗星' },
  { id:'perfect',     ico:'💯', name:'满分王者',   desc:'某一关全部答对' },
  { id:'all_clear',   ico:'👑', name:'全能宝贝',   desc:'通关全部 10 个关卡' }
];
