/* ===================================================================
   模块四：逻辑挑战（找规律 / 图形配对 / 排排序 / 找不同）
   =================================================================== */

const Logic = {
  type: 'all',          // all | pattern | match | sort | odd
  q: null,
  played: 0,
  right: 0,

  /* ---------- 题库生成器 ---------- */
  SETS: {
    animals: ['🐶','🐱','🐰','🐼','🦊','🐯','🦁','🐸','🐵','🐨'],
    fruits:  ['🍎','🍌','🍇','🍉','🍓','🍊','🍑','🍐','🥝','🍒'],
    shapes:  ['🔴','🔵','🟡','🟢','🟣','🟠'],
    signs:   ['⭐','❤️','🌙','☀️','❄️','🌈']
  },

  genPattern() {
    const set = pick([this.SETS.shapes, this.SETS.animals, this.SETS.fruits]);
    const kinds = ['AB', 'ABB', 'AAB', 'ABC'];
    const kind = pick(kinds);
    const [a, b, c] = shuffle(set).slice(0, 3);
    let seq, ans;
    if (kind === 'AB')       { seq = [a,b,a,b,a]; ans = b; }
    else if (kind === 'ABB') { seq = [a,b,b,a,b]; ans = b; }
    else if (kind === 'AAB') { seq = [a,a,b,a,a]; ans = b; }
    else                     { seq = [a,b,c,a,b]; ans = c; }
    const pool = shuffle(set.filter(x => x !== a)).slice(0, 3);
    if (pool.indexOf(ans) === -1) pool[0] = ans;
    const opts = shuffle(pool);
    return {
      title: '找规律：接下来是哪一个？',
      visual: seq.join(' ') + ' <b style="color:var(--pink-d)">?</b>',
      options: opts,
      answer: opts.indexOf(ans),
      speak: '找规律，接下来是哪一个呢？'
    };
  },

  genPatternNum() {
    const step = pick([1, 1, 2, 5]);
    const start = step === 5 ? 0 : randInt(1, 3);
    const seq = [start, start + step, start + step * 2];
    const ans = start + step * 3;
    if (ans > 20) return this.genPattern();
    const pool = [ans];
    while (pool.length < 4) {
      const d = ans + pick([-2, -1, 1, 2, step]);
      if (d >= 0 && d <= 20 && pool.indexOf(d) === -1) pool.push(d);
    }
    const opts = shuffle(pool.slice(0, 4));
    return {
      title: '找规律：下一个数字是几？',
      visual: seq.map(n => `<b style="font-size:34px">${n}</b>`).join(' , ') + ' , <b style="color:var(--pink-d)">?</b>',
      options: opts.map(String),
      answer: opts.indexOf(ans),
      speak: '找规律，下一个数字是几呢？'
    };
  },

  genMatch() {
    const set = pick([this.SETS.animals, this.SETS.fruits, this.SETS.shapes]);
    const target = pick(set);
    const others = shuffle(set.filter(x => x !== target)).slice(0, 3);
    const opts = shuffle(others.concat([target]));
    return {
      title: '图形配对：哪一个和上面的一样？',
      visual: `<span style="font-size:52px">${target}</span>`,
      options: opts,
      answer: opts.indexOf(target),
      speak: '哪一个和上面的一样呢？'
    };
  },

  genSort() {
    const groups = [
      { name: '最大', list: ['🐜','🐔','🐶','🐘'], ans: '🐘' },
      { name: '最大', list: ['🍓','🍎','🍐','🍉'], ans: '🍉' },
      { name: '最小', list: ['🐘','🐶','🐔','🐜'], ans: '🐜' },
      { name: '最小', list: ['🍉','🍐','🍎','🍓'], ans: '🍓' },
      { name: '最长', list: ['🐍','🐈','🐇','🐁'], ans: '🐍' },
      { name: '最高', list: ['🌱','🌿','🌳','🌵'], ans: '🌳' }
    ];
    const g = pick(groups);
    const opts = shuffle(g.list.slice());
    return {
      title: `排排序：哪一个${g.name}？`,
      visual: g.list.map(x => `<span style="font-size:38px">${x}</span>`).join(' '),
      options: opts,
      answer: opts.indexOf(g.ans),
      speak: `哪一个${g.name}呢？`
    };
  },

  genOdd() {
    const set = pick([this.SETS.animals, this.SETS.fruits, this.SETS.shapes, this.SETS.signs]);
    const [same, diff] = shuffle(set).slice(0, 2);
    const visual = shuffle([same, same, same, diff]);
    const opts = shuffle([same, diff].concat(shuffle(set.filter(x => x !== same && x !== diff)).slice(0, 2)));
    return {
      title: '找不同：哪一个和其它不一样？',
      visual: visual.map(x => `<span style="font-size:38px">${x}</span>`).join(' '),
      options: opts,
      answer: opts.indexOf(diff),
      speak: '哪一个和其它不一样呢？'
    };
  },

  build() {
    let q;
    if (this.type === 'pattern')      q = Math.random() < 0.5 ? this.genPattern() : this.genPatternNum();
    else if (this.type === 'match')   q = this.genMatch();
    else if (this.type === 'sort')    q = this.genSort();
    else if (this.type === 'odd')     q = this.genOdd();
    else {
      q = pick([this.genPattern.bind(this), this.genPatternNum.bind(this), this.genMatch.bind(this), this.genSort.bind(this), this.genOdd.bind(this)])();
    }
    // 保证答案一定在选项中
    const opts = q.options.slice(0, 4);
    if (opts.length < 3) opts.push('❓');
    q.options = opts;
    return q;
  },

  /* ---------- 渲染 ---------- */
  render() {
    const types = [
      ['all', '🎲 随机'], ['pattern', '🔍 找规律'],
      ['match', '🔗 图形配对'], ['sort', '📏 排排序'], ['odd', '👀 找不同']
    ];
    $('#logicBody').innerHTML = `
      <div class="panel">
        <div class="panel-head">
          <h3>🧩 动动小脑筋</h3>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <span class="chip">✅ 答对 <b id="lRight">${Store.state.logic.correct}</b></span>
            <span class="chip">🎯 本轮 <b id="lPlayed">${this.played}</b> 题</span>
          </div>
        </div>
        <div class="seg" style="margin-bottom:16px">
          ${types.map(([k, t]) => `<button class="seg-btn ${this.type === k ? 'is-active' : ''}" data-type="${k}">${t}</button>`).join('')}
        </div>
        <div class="quiz-box">
          <p style="font-size:17px;font-weight:900;color:var(--ink-2)" id="lTitle"></p>
          <div class="quiz-emoji" id="lVisual"></div>
          <div class="opt-grid" id="lOpts"></div>
          <div class="quiz-tip" id="lTip"></div>
          <div style="margin-top:12px"><button class="btn btn-ghost" id="lNext">跳过这题 ➡️</button></div>
        </div>
      </div>`;

    $$('#logicBody .seg-btn').forEach(b => {
      b.onclick = () => { this.type = b.dataset.type; this.render(); };
    });
    $('#lNext').onclick = () => { Speech.stop(); this.next(); };

    if (!this.q) this.next();
    else this.paint();
  },

  next() {
    this.q = this.build();
    this.paint();
    const tip = $('#lTip');
    if (tip) tip.textContent = '';
  },

  paint() {
    const q = this.q;
    const t = $('#lTitle'), v = $('#lVisual');
    if (!t || !v) return;
    t.textContent = q.title;
    v.innerHTML = q.visual;
    Speech.speak(q.speak, { lang:'zh-CN', rate:0.8 });

    renderOptions($('#lOpts'), q.options, q.answer, (right) => {
      this.played++;
      const tip = $('#lTip');
      const p = $('#lPlayed');
      if (p) p.textContent = this.played;
      if (right) {
        this.right++;
        Store.state.logic.correct++;
        Store.state.logic.played++;
        Store.save();
        Store.addStars(1);
        Store.checkBadges();
        if (tip) { tip.textContent = pick(['答对啦，好聪明！🎉', '你真棒！👏', '完全正确！🌟', '小侦探就是你！🕵️']); tip.style.color = 'var(--green-d)'; }
        $('#lRight').textContent = Store.state.logic.correct;
      } else {
        Store.state.logic.played++;
        Store.save();
        if (tip) { tip.textContent = '再想一想，你可以的 💪'; tip.style.color = 'var(--pink-d)'; }
      }
      setTimeout(() => this.next(), right ? 800 : 1300);
    }, { text: (r) => r ? '答对啦，真棒' : '再试一次', lang:'zh-CN' });
  }
};
