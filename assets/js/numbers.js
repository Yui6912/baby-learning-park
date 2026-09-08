/* ===================================================================
   模块三：数字王国（0-20 认知 / 10 以内加减法 / 数数游戏）
   =================================================================== */

const Numbers = {
  tab: 'know',
  calc: { round: 0, right: 0, streak: 0 },
  count: { round: 0, right: 0 },

  render() {
    $$('#numbersSeg .seg-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.tab === this.tab);
      b.onclick = () => { Speech.stop(); Numbers.tab = b.dataset.tab; Numbers.render(); };
    });
    if (this.tab === 'know') this.renderKnow();
    else if (this.tab === 'calc') this.renderCalc();
    else this.renderCount();
  },

  /* ---------- 0-20 数字认知 ---------- */
  renderKnow() {
    const seen = Store.state.numbers.seen;
    $('#numbersBody').innerHTML = `
      <div class="panel">
        <div class="panel-head">
          <h3>🔢 点一点数字，一起数一数</h3>
          <button class="btn btn-mini btn-blue" id="btnCountAll">🎵 从 0 数到 20</button>
        </div>
        <div class="num-grid" id="numGrid"></div>
      </div>`;

    const grid = $('#numGrid');
    for (let n = 0; n <= 20; n++) {
      const c = document.createElement('button');
      c.className = 'num-card';
      c.style.borderColor = seen.indexOf(n) > -1 ? 'var(--green)' : 'var(--line)';
      const color = ['var(--pink)','var(--blue)','var(--orange)','var(--green)','var(--purple)'][n % 5];
      const dark  = ['var(--pink-d)','var(--blue-d)','var(--orange)','var(--green-d)','var(--purple-d)'][n % 5];
      c.innerHTML = `
        <div class="nc-num" style="color:${dark}">${n}</div>
        <div class="nc-cn">${NUM_CN[n]}</div>
        <div class="nc-dots">${'<i style="background:' + color + '"></i>'.repeat(Math.min(n, 10))}</div>
        ${n > 10 ? '<div class="nc-cn" style="font-size:10px;color:var(--ink-3)">' + (n - 10) + ' + 10</div>' : ''}`;
      c.onclick = (ev) => {
        speakSeq([NUM_CN[n], String(n)], {
          lang: 'zh-CN', rate: 0.72, gap: 260,
          onEnd: () => Speech.speak(String(n), { lang:'en-US', rate:0.7 })
        });
        c.style.borderColor = 'var(--green)';
        if (Store.state.numbers.seen.indexOf(n) === -1) {
          Store.state.numbers.seen.push(n);
          Store.save();
          Store.addStars(1, ev);
          UI.toast(`认识数字 ${n}（${NUM_CN[n]}）！+1 ⭐`);
        }
      };
      grid.appendChild(c);
    }

    $('#btnCountAll').onclick = () => {
      speakSeq(NUM_CN.slice(0, 11).map(x => x), { rate: 0.6, gap: 380, onEnd: () =>
        speakSeq(NUM_CN.slice(11), { rate: 0.6, gap: 380 }) });
      UI.toast('一起数：零、一、二…… 🎵');
    };
  },

  /* ---------- 10 以内加减法 ---------- */
  renderCalc() {
    const s = this.calc;
    $('#numbersBody').innerHTML = `
      <div class="quiz-box">
        <div class="quiz-meta">
          <span class="chip">✅ 答对 <b id="cRight">${s.right}</b> 题</span>
          <span class="chip">🔥 连对 <b id="cStreak">${s.streak}</b></span>
          <span class="chip">🏅 累计 <b>${Store.state.numbers.mathCorrect}</b></span>
        </div>
        <p style="font-size:15px;font-weight:800;color:var(--ink-2);margin-top:6px">算一算，选出正确的答案</p>
        <div class="quiz-q" id="cQ">1 + 1 = ?</div>
        <div class="opt-grid" id="cOpts"></div>
        <div class="quiz-tip" id="cTip"></div>
      </div>`;
    this.newCalc();
  },

  newCalc() {
    const type = Math.random() < 0.55 ? '+' : '-';
    let a, b, ans;
    if (type === '+') {
      a = randInt(1, 8); b = randInt(1, 10 - a); ans = a + b;
    } else {
      a = randInt(2, 10); b = randInt(1, a); ans = a - b;
    }
    const q = `${a} ${type} ${b} = ?`;
    const el = $('#cQ');
    if (!el) return;
    el.textContent = q;

    const opts = [ans];
    while (opts.length < 4) {
      const d = ans + randInt(-3, 3);
      if (d >= 0 && d <= 10 && opts.indexOf(d) === -1) opts.push(d);
    }
    const shuffled = shuffle(opts);
    const correct = shuffled.indexOf(ans);

    Speech.speak(`${a} ${type === '+' ? '加' : '减'} ${b} 等于几`, { lang:'zh-CN', rate:0.78 });

    renderOptions($('#cOpts'), shuffled, correct, (right) => {
      const tip = $('#cTip');
      if (right) {
        this.calc.right++; this.calc.streak++;
        Store.state.numbers.mathCorrect++;
        Store.save();
        Store.addStars(1);
        Store.checkBadges();
        if (tip) { tip.textContent = pick(['答对啦！你真棒 🎉', '太厉害了！👏', '完全正确！🌟']); tip.style.color = 'var(--green-d)'; }
        $('#cRight').textContent = this.calc.right;
        $('#cStreak').textContent = this.calc.streak;
        if (this.calc.streak > 0 && this.calc.streak % 5 === 0) {
          Store.addStars(2);
          UI.toast(`连对 ${this.calc.streak} 题！额外奖励 2 ⭐`);
        }
      } else {
        this.calc.streak = 0;
        if (tip) { tip.textContent = `正确答案是 ${ans}，再试一次吧 💪`; tip.style.color = 'var(--pink-d)'; }
        $('#cStreak').textContent = 0;
      }
      setTimeout(() => this.newCalc(), right ? 700 : 1200);
    }, { text: (r) => r ? '答对啦' : `答案是${ans}`, lang:'zh-CN' });
  },

  /* ---------- 数数游戏 ---------- */
  EMOJI_SETS: ['🍎','🍓','🐻','🌈','⭐','🐟','🍌','🎈','🐣','🌻'],

  renderCount() {
    const s = this.count;
    $('#numbersBody').innerHTML = `
      <div class="quiz-box">
        <div class="quiz-meta">
          <span class="chip">✅ 答对 <b id="nRight">${s.right}</b> 次</span>
          <span class="chip">🏅 累计 <b>${Store.state.numbers.countCorrect}</b></span>
        </div>
        <p style="font-size:16px;font-weight:900;color:var(--ink-2);margin-top:6px">数一数，一共有几个？</p>
        <div class="quiz-emoji" id="nEmoji"></div>
        <div class="opt-grid" id="nOpts"></div>
        <div class="quiz-tip" id="nTip"></div>
      </div>`;
    this.newCount();
  },

  newCount() {
    const em = pick(this.EMOJI_SETS);
    const n = randInt(1, 10);
    const box = $('#nEmoji');
    if (!box) return;
    box.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const sp = document.createElement('span');
      sp.textContent = em;
      sp.style.animation = `pop .4s ${i * 70}ms both`;
      box.appendChild(sp);
    }
    const opts = [n];
    while (opts.length < 4) {
      const d = n + randInt(-3, 3);
      if (d >= 1 && d <= 10 && opts.indexOf(d) === -1) opts.push(d);
    }
    const shuffled = shuffle(opts);
    const correct = shuffled.indexOf(n);

    renderOptions($('#nOpts'), shuffled, correct, (right) => {
      const tip = $('#nTip');
      if (right) {
        this.count.right++;
        Store.state.numbers.countCorrect++;
        Store.save();
        Store.addStars(1);
        Store.checkBadges();
        if (tip) { tip.textContent = `对啦！一共 ${n} 个 ${em} 🎉`; tip.style.color = 'var(--green-d)'; }
        $('#nRight').textContent = this.count.right;
      } else {
        if (tip) { tip.textContent = `再数数看，一共是 ${n} 个 💪`; tip.style.color = 'var(--pink-d)'; }
      }
      setTimeout(() => this.newCount(), right ? 800 : 1300);
    }, { text: (r) => r ? `一共${n}个` : `是${n}个`, lang:'zh-CN' });
  }
};
