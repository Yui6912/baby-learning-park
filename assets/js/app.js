/* ===================================================================
   首页 / 导航绑定 / 启动
   =================================================================== */

const Home = {
  MODULES: [
    { v:'letters',   ico:'🔤', name:'字母乐园', desc:'26 个字母卡片，会说话；还能玩大小写配对', cls:'mc-pink' },
    { v:'poems',     ico:'🌸', name:'古诗花园', desc:'8 首经典古诗，带拼音，可整首朗读', cls:'mc-green' },
    { v:'numbers',   ico:'🔢', name:'数字王国', desc:'0-20 数字认知、加减法练习和数数游戏', cls:'mc-blue' },
    { v:'logic',     ico:'🧩', name:'逻辑挑战', desc:'找规律、图形配对、排排序、找不同', cls:'mc-yellow' },
    { v:'adventure', ico:'🚀', name:'闯关冒险', desc:'10 大关卡综合挑战，赢星星和徽章', cls:'mc-purple' },
    { v:'adventure', ico:'🏅', name:'徽章墙',   desc:'看看你已经收集了多少成就徽章', cls:'mc-orange', sub:'badges' }
  ],

  render() {
    const s = Store.state;

    /* 模块卡片 */
    $('#homeGrid').innerHTML = this.MODULES.map(m => `
      <button class="mod-card ${m.cls}" data-go="${m.v}" data-sub="${m.sub || ''}">
        <div class="mc-ico">${m.ico}</div>
        <div class="mc-name">${m.name}</div>
        <div class="mc-desc">${m.desc}</div>
        <div class="mc-go">去玩玩 ➡️</div>
      </button>`).join('');
    $$('#homeGrid .mod-card').forEach(b => {
      b.onclick = () => {
        if (b.dataset.sub === 'badges') { Adventure.tab = 'badges'; }
        go(b.dataset.go);
      };
    });

    /* 徽章条 */
    const wall = BADGES.map(b => {
      const got = s.badges.indexOf(b.id) > -1;
      return `<div class="badge ${got ? 'got' : 'lock'}">
        <div class="bd-ico">${b.ico}</div>
        <div class="bd-name">${b.name}</div>
        <div class="bd-desc">${got ? '已获得' : b.desc}</div>
      </div>`;
    }).join('');
    $('#homeBadges').innerHTML = wall || '<p>还没有徽章，快去闯关吧！</p>';

    /* 统计 */
    const passed = Object.values(s.levels).filter(l => l.passed).length;
    const stats = [
      { v: s.stars, l: '⭐ 总星星', c: 'var(--yellow-d)' },
      { v: s.letters.seen.length + '/26', l: '🔤 认识字母', c: 'var(--pink-d)' },
      { v: s.poems.learned.length + '/8', l: '🌸 学会古诗', c: 'var(--green-d)' },
      { v: s.numbers.seen.length + '/21', l: '🔢 认识数字', c: 'var(--blue-d)' },
      { v: passed + '/10', l: '🚀 通关数', c: 'var(--purple-d)' },
      { v: s.badges.length + '/' + BADGES.length, l: '🏅 徽章', c: 'var(--orange)' }
    ];
    $('#homeStats').innerHTML = stats.map(x =>
      `<div class="stat"><div class="sv" style="color:${x.c}">${x.v}</div><div class="sl">${x.l}</div></div>`
    ).join('');
  }
};

/* ---------------- 事件绑定 ---------------- */
function bindUI() {
  $$('.side-item').forEach(b => b.onclick = () => go(b.dataset.view));
  $$('.tab-item').forEach(b => b.onclick = () => go(b.dataset.view));
  $$('[data-goto]').forEach(b => b.onclick = () => go(b.dataset.goto));

  $('#menuBtn').onclick = () => $('#sidebar').classList.toggle('open');
  $('#modalMask').onclick = (e) => { if (e.target.id === 'modalMask') UI.closeModal(); };

  $('#btnReset').onclick = () => {
    UI.modal('⚠️', '要重新开始吗？', '所有的星星、徽章和闯关进度都会被清空哦', [
      { t:'再想想', c:'btn-green' },
      { t:'确定清空', c:'btn-pink', fn: () => {
        Store.reset();
        Letters.tab = 'cards'; Poems.tab = 'list'; Poems.cur = 0;
        Numbers.tab = 'know'; Logic.type = 'all'; Adventure.tab = 'levels'; Adventure.run = null;
        UI.refreshStars();
        go('home');
        UI.toast('已经重新开始啦，加油！');
      } }
    ]);
  };

  /* 离开页面时停止朗读 */
  window.addEventListener('beforeunload', () => Speech.stop());
  document.addEventListener('visibilitychange', () => { if (document.hidden) Speech.stop(); });
}

/* ---------------- 启动 ---------------- */
(function boot() {
  bindUI();
  UI.refreshStars();

  if (!Speech.ok) {
    setTimeout(() => UI.toast('提示：当前浏览器不支持语音朗读，其它功能不受影响'), 900);
  }

  /* 支持 #adventure 这样的直达链接 */
  const hash = (location.hash || '').replace('#', '');
  go(VIEWS[hash] ? hash : 'home');

  /* 首次访问的小提示 */
  if (!localStorage.getItem('baby_learn_visited')) {
    localStorage.setItem('baby_learn_visited', '1');
    setTimeout(() => UI.modal('🌈', '欢迎来到宝贝学习乐园！',
      '这里有字母、古诗、数字、逻辑和闯关五个乐园。<br>点一点就会说话，答对题目可以拿星星 ⭐ 和徽章 🏅 哦！',
      [{ t:'开始玩啦', c:'btn-pink' }]), 700);
  }
})();
