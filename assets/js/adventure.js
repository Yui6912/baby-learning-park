/* ===================================================================
   模块五：闯关冒险（综合闯关 + 星星奖励 + 成就徽章墙）
   =================================================================== */

const Adventure = {
  tab: 'levels',
  run: null,   // { lv, idx, correct, total }

  LEVELS: [
    { id:1,  name:'字母小径',  ico:'🔤', types:['letterUp','letterLow','letterWord'] },
    { id:2,  name:'数字小溪',  ico:'🔢', types:['count','calc'] },
    { id:3,  name:'古诗花田',  ico:'🌸', types:['poem','poem'] },
    { id:4,  name:'图形森林',  ico:'🔷', types:['pattern','match','odd'] },
    { id:5,  name:'智慧山谷',  ico:'🧠', types:['letterUp','letterWord','calc','count'] },
    { id:6,  name:'彩虹大桥',  ico:'🌈', types:['poem','pattern','letterLow','calc'] },
    { id:7,  name:'星星海湾',  ico:'⭐', types:['count','odd','sort','letterWord'] },
    { id:8,  name:'魔法城堡',  ico:'🏰', types:['calc','pattern','poem','match'] },
    { id:9,  name:'云端之城',  ico:'☁️', types:['letterUp','sort','calc','poem','odd'] },
    { id:10, name:'宝贝之巅',  ico:'👑', types:['calc','count','poem','pattern','letterWord','sort'] }
  ],

  /* ================= 题目生成器 ================= */
  genLetterUp() {
    const L = pick(LETTERS);
    const opts = shuffle([L.u].concat(shuffle(LETTERS.filter(x => x.u !== L.u)).slice(0, 3).map(x => x.u)));
    return { title:`小写字母 <b>${L.l}</b> 的大写是哪个？`, visual:`<span style="font-size:52px">${L.emoji}</span>`,
      options:opts, answer:opts.indexOf(L.u), speak:`小写字母 ${L.l} 的大写是哪个？`, optClass:'letter' };
  },
  genLetterLow() {
    const L = pick(LETTERS);
    const opts = shuffle([L.l].concat(shuffle(LETTERS.filter(x => x.l !== L.l)).slice(0, 3).map(x => x.l)));
    return { title:`大写字母 <b>${L.u}</b> 的小写是哪个？`, visual:`<span style="font-size:52px">${L.emoji}</span>`,
      options:opts, answer:opts.indexOf(L.l), speak:`大写字母 ${L.u} 的小写是哪个？`, optClass:'letter' };
  },
  genLetterWord() {
    const L = pick(LETTERS);
    const opts = shuffle([L.u].concat(shuffle(LETTERS.filter(x => x.u !== L.u)).slice(0, 3).map(x => x.u)));
    return { title:`${L.emoji} ${L.cn} 是哪个字母开头的？`, visual:`<span style="font-size:52px">${L.emoji}</span> <b style="font-size:22px">${L.word}</b>`,
      options:opts, answer:opts.indexOf(L.u), speak:`${L.word} 是哪个字母开头的？`, optClass:'letter' };
  },
  genCount() {
    const em = pick(Numbers.EMOJI_SETS);
    const n = randInt(1, 10);
    const opts = [n];
    while (opts.length < 4) {
      const d = n + randInt(-3, 3);
      if (d >= 1 && d <= 10 && opts.indexOf(d) === -1) opts.push(d);
    }
    const sh = shuffle(opts);
    return { title:'数一数，一共有几个？',
      visual: em.repeat(n).split('').map((c, i) => `<span style="animation:pop .4s ${i * 60}ms both">${em}</span>`).join(''),
      options: sh.map(String), answer: sh.indexOf(n), speak:'数一数，一共有几个？', optClass:'' };
  },
  genCalc() {
    const type = Math.random() < 0.55 ? '+' : '-';
    let a, b, ans;
    if (type === '+') { a = randInt(1, 8); b = randInt(1, 10 - a); ans = a + b; }
    else { a = randInt(2, 10); b = randInt(1, a); ans = a - b; }
    const opts = [ans];
    while (opts.length < 4) {
      const d = ans + randInt(-3, 3);
      if (d >= 0 && d <= 10 && opts.indexOf(d) === -1) opts.push(d);
    }
    const sh = shuffle(opts);
    return { title:`算一算：${a} ${type} ${b} = ?`, visual:`<b style="font-size:44px">${a} ${type} ${b} = ?</b>`,
      options: sh.map(String), answer: sh.indexOf(ans), speak:`${a} ${type === '+' ? '加' : '减'} ${b} 等于几？`, optClass:'' };
  },
  genPoem() {
    const p = pick(POEMS);
    const i = randInt(0, p.lines.length - 2);
    const ans = p.lines[i + 1].hz;
    const others = [];
    POEMS.forEach(q => q.lines.forEach(l => { if (l.hz !== ans && others.indexOf(l.hz) === -1) others.push(l.hz); }));
    const sh = shuffle([ans].concat(shuffle(others).slice(0, 3)));
    return { title:`《${p.title}》的下一句是什么？`,
      visual: `<div style="margin-bottom:6px">${rubyLine(p.lines[i])}</div><div style="font-size:26px;color:var(--pink-d)">?</div>`,
      options: sh, answer: sh.indexOf(ans), speak:`《${p.title}》的下一句是什么？`, optClass:'txt' };
  },
  genLogic(kind) {
    const q = kind === 'pattern' ? Logic.genPattern()
            : kind === 'match'   ? Logic.genMatch()
            : kind === 'sort'    ? Logic.genSort()
            : kind === 'odd'     ? Logic.genOdd()
            : Logic.genPatternNum();
    q.optClass = /数字/.test(q.title) ? '' : 'emoji';
    return q;
  },

  buildQuestion(level) {
    const t = pick(level.types);
    if (t === 'letterUp')  return this.genLetterUp();
    if (t === 'letterLow') return this.genLetterLow();
    if (t === 'letterWord')return this.genLetterWord();
    if (t === 'count')     return this.genCount();
    if (t === 'calc')      return this.genCalc();
    if (t === 'poem')      return this.genPoem();
    return this.genLogic(t);
  },

  /* ================= 渲染 ================= */
  render() {
    const seg = $('#advSeg');
    seg.style.display = this.tab === 'playing' ? 'none' : '';
    $$('#advSeg .seg-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.tab === this.tab);
      b.onclick = () => { Adventure.tab = b.dataset.tab; Adventure.render(); };
    });
    if (this.tab === 'playing') this.renderQuiz();
    else if (this.tab === 'badges') this.renderBadges();
    else this.renderLevels();
  },

  renderLevels() {
    const s = Store.state;
    const passed = Object.keys(s.levels).filter(k => s.levels[k].passed).length;
    $('#advBody').innerHTML = `
      <div class="panel">
        <div class="panel-head">
          <h3>🚀 选择关卡开始冒险</h3>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <span class="chip">🏁 已通关 <b>${passed}</b> / 10</span>
            <span class="chip">⭐ 我的星星 <b>${s.stars}</b></span>
          </div>
        </div>
        <div class="progress"><i style="width:${passed * 10}%"></i></div>
        <p style="font-size:13.5px;color:var(--ink-3);font-weight:700;margin-bottom:14px">
          每关 5 道题，答对 3 道以上就能通关，全对可以拿 3 颗星哦！
        </p>
        <div class="level-grid" id="levelGrid"></div>
      </div>`;

    const grid = $('#levelGrid');
    this.LEVELS.forEach(lv => {
      const rec = s.levels[lv.id] || { stars:0, passed:false, best:0 };
      const locked = lv.id > s.unlocked;
      const b = document.createElement('button');
      b.className = 'level-card lv-' + ((lv.id - 1) % 5 + 1) + (locked ? ' locked' : '');
      b.innerHTML = `
        <div class="lv-no">第 ${lv.id} 关</div>
        <div class="lv-ico">${lv.ico}</div>
        <div class="lv-name">${lv.name}</div>
        <div class="lv-stars">${UI.starRow(rec.stars, 3)}</div>
        ${locked ? '<div class="lv-lock">🔒</div>' : ''}`;
      b.onclick = () => {
        if (locked) { UI.toast('先通过前面的关卡才能解锁哦 🔒'); return; }
        this.start(lv.id);
      };
      grid.appendChild(b);
    });
  },

  renderBadges() {
    const s = Store.state;
    $('#advBody').innerHTML = `
      <div class="panel">
        <div class="panel-head">
          <h3>🏅 我的成就徽章墙</h3>
          <span class="chip">已获得 <b>${s.badges.length}</b> / ${BADGES.length}</span>
        </div>
        <div class="badge-grid" id="badgeWall"></div>
      </div>`;
    const wall = $('#badgeWall');
    BADGES.forEach(b => {
      const got = s.badges.indexOf(b.id) > -1;
      const el = document.createElement('div');
      el.className = 'badge ' + (got ? 'got' : 'lock');
      el.innerHTML = `<div class="bd-ico">${b.ico}</div><div class="bd-name">${b.name}</div><div class="bd-desc">${b.desc}</div>`;
      wall.appendChild(el);
    });
  },

  /* ================= 闯关进行中 ================= */
  start(lvId) {
    const lv = this.LEVELS.find(x => x.id === lvId);
    this.run = { lv, idx: 0, correct: 0, total: 5, q: null };
    this.tab = 'playing';
    this.render();
  },

  renderQuiz() {
    const r = this.run;
    if (!r) { this.tab = 'levels'; return this.render(); }
    r.q = this.buildQuestion(r.lv);
    const pct = (r.idx / r.total) * 100;

    $('#advBody').innerHTML = `
      <div class="panel">
        <div class="adv-top">
          <div>
            <div style="font-size:20px;font-weight:900">${r.lv.ico} 第 ${r.lv.id} 关 · ${r.lv.name}</div>
            <div style="font-size:13px;color:var(--ink-3);font-weight:700;margin-top:2px">答对 3 题以上即可通关</div>
          </div>
          <button class="btn btn-mini btn-ghost" id="advQuit">退出闯关</button>
        </div>
        <div class="adv-qbar">
          <span class="chip">📝 第 <b>${r.idx + 1}</b> / ${r.total} 题</span>
          <span class="chip">✅ 答对 <b id="advOk">${r.correct}</b></span>
          <span class="chip">⭐ ${Store.state.stars}</span>
        </div>
        <div class="adv-progress"><i style="width:${pct}%"></i></div>
        <div class="quiz-box" style="margin-top:16px">
          <p style="font-size:17px;font-weight:900;color:var(--ink-2)" id="advTitle"></p>
          <div class="quiz-emoji" id="advVisual"></div>
          <div class="opt-grid" id="advOpts"></div>
          <div class="quiz-tip" id="advTip"></div>
        </div>
      </div>`;

    $('#advQuit').onclick = () => {
      UI.modal('🤔', '要退出这一关吗？', '退出后这一关的进度不会保存哦', [
        { t:'继续闯关', c:'btn-green' },
        { t:'退出', c:'btn-ghost', fn: () => { Speech.stop(); Adventure.run = null; Adventure.tab = 'levels'; Adventure.render(); } }
      ]);
    };

    $('#advTitle').innerHTML = r.q.title;
    $('#advVisual').innerHTML = r.q.visual;
    Speech.speak(r.q.speak, { lang:/[A-Za-z]/.test(r.q.speak) && r.q.optClass === 'letter' ? 'en-US' : 'zh-CN', rate:0.78 });

    const optBox = $('#advOpts');
    renderOptions(optBox, r.q.options, r.q.answer, (right) => {
      if (r.q.optClass === 'txt') Array.from(optBox.children).forEach(c => c.classList.add('txt'));
      const tip = $('#advTip');
      if (right) {
        r.correct++;
        Store.addStars(1);
        if (tip) { tip.textContent = pick(['答对啦 +1⭐', '太棒了 +1⭐', '好厉害 +1⭐']); tip.style.color = 'var(--green-d)'; }
        $('#advOk').textContent = r.correct;
      } else {
        if (tip) { tip.textContent = '没关系，继续加油 💪'; tip.style.color = 'var(--pink-d)'; }
      }
      r.idx++;
      setTimeout(() => {
        if (r.idx >= r.total) this.finish();
        else this.renderQuiz();
      }, right ? 700 : 1200);
    }, { text: (ok) => ok ? '答对啦' : '再加油', lang:'zh-CN' });

    if (r.q.optClass === 'txt') Array.from(optBox.children).forEach(c => c.classList.add('txt'));
    if (r.q.optClass === 'letter') Array.from(optBox.children).forEach(c => c.style.fontSize = '30px');
  },

  finish() {
    const r = this.run;
    const c = r.correct;
    const stars = c >= 5 ? 3 : c >= 4 ? 2 : c >= 3 ? 1 : 0;
    const passed = c >= 3;
    const rec = Store.state.levels[r.lv.id] || { stars:0, passed:false, best:0 };
    rec.best = Math.max(rec.best || 0, c);
    rec.stars = Math.max(rec.stars || 0, stars);
    if (passed) rec.passed = true;
    Store.state.levels[r.lv.id] = rec;

    if (passed && r.lv.id === Store.state.unlocked && r.lv.id < 10) Store.state.unlocked = r.lv.id + 1;
    Store.save();

    let bonus = 0;
    if (passed) bonus += 5;
    if (stars === 3) bonus += 3;
    if (bonus) Store.addStars(bonus);
    Store.checkBadges();

    const next = this.LEVELS.find(x => x.id === r.lv.id + 1);
    const btns = [];
    if (passed && next) btns.push({ t:'下一关 ➡️', c:'btn-green', fn: () => { this.run = null; this.start(next.id); } });
    btns.push({ t:'再来一次', c:'btn-blue', fn: () => { this.run = null; this.start(r.lv.id); } });
    btns.push({ t:'返回地图', c:'btn-ghost', fn: () => { this.run = null; this.tab = 'levels'; this.render(); } });

    FX.cheer();
    setTimeout(() => {
      UI.modal(
        passed ? (stars === 3 ? '🏆' : '🎉') : '💪',
        passed ? (stars === 3 ? '完美通关！' : '通关成功！') : '差一点点～',
        `<div class="star-row">${UI.starRow(stars, 3)}</div>
         答对 <b>${c}</b> / ${r.total} 题${bonus ? `，额外奖励 <b>${bonus}</b> 颗星 ⭐` : ''}<br>
         ${passed ? (r.lv.id < 10 ? '解锁了新关卡，继续加油！' : '你已经登顶宝贝之巅啦！') : '答对 3 题就能通关，再试一次吧！'}`,
        btns
      );
    }, 480);
  }
};
