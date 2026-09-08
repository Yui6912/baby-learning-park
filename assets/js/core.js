/* ===================================================================
   核心层：状态存储(localStorage) / 语音 / UI 工具 / 导航 / 特效
   =================================================================== */

/* ---------------- 小工具 ---------------- */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

/* ---------------- 本地存储 ---------------- */
const SKEY = 'baby_learn_park_v1';

const DEFAULT_STATE = {
  stars: 0,
  badges: [],
  letters: { seen: [], matchWins: 0 },
  poems:   { learned: [] },
  numbers: { countCorrect: 0, mathCorrect: 0, seen: [] },
  logic:   { correct: 0, played: 0 },
  levels:  {},                 // { 1:{stars:3,passed:true,best:5} }
  unlocked: 1,                 // 已解锁的最高关卡
  createdAt: Date.now()
};

const Store = {
  state: null,
  load() {
    try {
      const raw = localStorage.getItem(SKEY);
      this.state = raw ? Object.assign({}, DEFAULT_STATE, JSON.parse(raw)) : JSON.parse(JSON.stringify(DEFAULT_STATE));
      // 补齐嵌套字段，兼容旧版本
      const d = JSON.parse(JSON.stringify(DEFAULT_STATE));
      for (const k in d) {
        if (this.state[k] === undefined) this.state[k] = d[k];
        else if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) {
          this.state[k] = Object.assign({}, d[k], this.state[k]);
        }
      }
    } catch (e) {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    return this.state;
  },
  save() {
    try { localStorage.setItem(SKEY, JSON.stringify(this.state)); } catch (e) {}
  },
  reset() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  },
  /* 加星星 */
  addStars(n, ev) {
    this.state.stars += n;
    this.save();
    UI.refreshStars();
    if (ev) FX.stars(ev, Math.min(n, 6));
    return this.state.stars;
  },
  /* 解锁徽章 */
  hasBadge(id) { return this.state.badges.indexOf(id) > -1; },
  awardBadge(id) {
    if (this.hasBadge(id)) return false;
    this.state.badges.push(id);
    this.save();
    const b = BADGES.find(x => x.id === id);
    if (b) setTimeout(() => UI.modal('🏅', '获得新徽章！', `恭喜你解锁「${b.name}」徽章`, [{ t:'太好啦', c:'btn-yellow' }]), 420);
    return true;
  },
  /* 每次数据变化后检查所有徽章条件 */
  checkBadges() {
    const s = this.state;
    const got = [];
    if (s.letters.seen.length >= 26) got.push('abc_master');
    if (s.letters.matchWins >= 3)    got.push('match_king');
    if (s.poems.learned.length >= 5) got.push('poet');
    if (s.poems.learned.length >= 8) got.push('poet_pro');
    if (s.numbers.countCorrect >= 15) got.push('counter');
    if (s.numbers.mathCorrect >= 20) got.push('math_wiz');
    if (s.logic.correct >= 15)        got.push('detective');
    if (s.stars >= 50)                got.push('star_50');
    if (s.stars >= 150)               got.push('star_150');
    const passed = Object.keys(s.levels).filter(k => s.levels[k].passed);
    if (passed.indexOf('1') > -1) got.push('first_step');
    if (Object.values(s.levels).some(l => l.best === 5)) got.push('perfect');
    if (passed.length >= 10) got.push('all_clear');
    got.forEach(id => this.awardBadge(id));
  }
};

/* ---------------- 语音（Web Speech API） ---------------- */
const Speech = {
  ok: 'speechSynthesis' in window,
  voices: [],
  ready: false,
  init() {
    if (!this.ok) return;
    const load = () => {
      this.voices = window.speechSynthesis.getVoices() || [];
      if (this.voices.length) this.ready = true;
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  },
  pickVoice(lang) {
    if (!this.voices.length) return null;
    const pre = lang.slice(0, 2).toLowerCase();
    const list = this.voices.filter(v => (v.lang || '').toLowerCase().replace('_', '-').startsWith(pre));
    return list.find(v => /female|婷婷|Tingting|Mei-Jia|Ting|Xiaoxiao|Yaoyao|Huihui|Samantha|Karen/i.test(v.name))
        || list[0] || null;
  },
  speak(text, opt) {
    opt = opt || {};
    if (!this.ok) { UI.toast('这个浏览器还不支持朗读哦'); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = opt.lang || 'zh-CN';
      u.rate = opt.rate != null ? opt.rate : (u.lang.startsWith('en') ? 0.75 : 0.85);
      u.pitch = opt.pitch != null ? opt.pitch : 1.15;
      u.volume = 1;
      const v = this.pickVoice(u.lang);
      if (v) u.voice = v;
      if (opt.onend) u.onend = opt.onend;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  },
  stop() { if (this.ok) window.speechSynthesis.cancel(); }
};

/* ---------------- 特效 ---------------- */
const FX = {
  stars(ev, n) {
    const layer = $('#fxLayer');
    const x = ev && ev.clientX ? ev.clientX : window.innerWidth / 2;
    const y = ev && ev.clientY ? ev.clientY : window.innerHeight / 2;
    for (let i = 0; i < (n || 5); i++) {
      const s = document.createElement('div');
      s.className = 'fx-star';
      s.textContent = pick(['⭐', '🌟', '✨', '💫']);
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--dx', randInt(-110, 110) + 'px');
      s.style.setProperty('--dy', randInt(-150, -40) + 'px');
      s.style.setProperty('--rot', randInt(-180, 180) + 'deg');
      s.style.animationDelay = (i * 70) + 'ms';
      layer.appendChild(s);
      setTimeout(() => s.remove(), 1300);
    }
  },
  big(emoji) {
    const layer = $('#fxLayer');
    const d = document.createElement('div');
    d.className = 'fx-big';
    d.textContent = emoji;
    layer.appendChild(d);
    setTimeout(() => d.remove(), 1100);
  },
  cheer() { FX.big(pick(['🎉', '👏', '🏆', '🎈'])); }
};

/* ---------------- UI 通用 ---------------- */
const UI = {
  toastTimer: null,
  toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  },
  modal(emoji, title, text, btns) {
    $('#modalEmoji').textContent = emoji;
    $('#modalTitle').textContent = title;
    $('#modalText').innerHTML = text || '';
    const box = $('#modalBtns');
    box.innerHTML = '';
    (btns || [{ t:'好的', c:'btn-pink' }]).forEach((b, i) => {
      const el = document.createElement('button');
      el.className = 'btn ' + (b.c || 'btn-pink');
      el.textContent = b.t;
      el.onclick = () => { UI.closeModal(); if (b.fn) b.fn(); };
      box.appendChild(el);
    });
    $('#modalMask').classList.add('show');
  },
  closeModal() { $('#modalMask').classList.remove('show'); },
  refreshStars() {
    const n = Store.state.stars;
    $('#starCount').textContent = n;
    const s = $('#sideStarNum');
    if (s) s.textContent = n;
  },
  starRow(n, total) {
    let out = '';
    for (let i = 0; i < total; i++) out += i < n ? '⭐' : '☆';
    return out;
  }
};

/* ---------------- 导航 ---------------- */
const VIEWS = {
  home:      { title:'宝贝学习乐园', render: () => Home.render() },
  letters:   { title:'🔤 字母乐园',   render: () => Letters.render() },
  poems:     { title:'🌸 古诗花园',   render: () => Poems.render() },
  numbers:   { title:'🔢 数字王国',   render: () => Numbers.render() },
  logic:     { title:'🧩 逻辑挑战',   render: () => Logic.render() },
  adventure: { title:'🚀 闯关冒险',   render: () => Adventure.render() }
};
let CURRENT_VIEW = 'home';

function go(view) {
  if (!VIEWS[view]) return;
  Speech.stop();
  CURRENT_VIEW = view;
  $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + view));
  $$('.side-item').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  $$('.tab-item').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  $('#topbarTitle').textContent = VIEWS[view].title;
  $('#sidebar').classList.remove('open');
  VIEWS[view].render();
  window.scrollTo({ top:0, behavior:'smooth' });
  try { location.hash = view; } catch (e) {}
}

/* 选项按钮：渲染 + 判定（通用） */
function renderOptions(container, options, correctIndex, onFinish, speakOpt) {
  container.innerHTML = '';
  let done = false;
  options.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.textContent = o;
    b.onclick = (ev) => {
      if (done) return;
      done = true;
      const right = i === correctIndex;
      b.classList.add(right ? 'ok' : 'bad');
      if (!right) {
        const c = container.children[correctIndex];
        if (c) c.classList.add('ok');
      }
      if (speakOpt && speakOpt.text) Speech.speak(speakOpt.text(right), speakOpt.opt);
      if (right) { FX.stars(ev, 4); FX.big('🎉'); } else { FX.big('💪'); }
      setTimeout(() => onFinish(right, i), right ? 620 : 1000);
    };
    container.appendChild(b);
  });
}

/* 注音古诗的一行 HTML：标点只显示不注音，拼音只数汉字 */
function rubyLine(line) {
  const CJK = /[\u3400-\u9FFF]/;
  let pi = 0;
  let out = '';
  Array.from(line.hz).forEach(c => {
    if (CJK.test(c)) {
      out += `<ruby><span class="hz">${esc(c)}</span><rt>${esc(line.py[pi++] || '')}</rt></ruby>`;
    } else {
      out += esc(c);
    }
  });
  return out;
}

/* 启动 */
Store.load();
Speech.init();
