/* ===================================================================
   模块一：字母乐园（26 字母卡片发音 + 大小写配对游戏）
   =================================================================== */

const Letters = {
  tab: 'cards',

  render() {
    const body = $('#lettersBody');
    $$('#lettersSeg .seg-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.tab === this.tab);
      b.onclick = () => { Speech.stop(); Letters.tab = b.dataset.tab; Letters.render(); };
    });
    if (this.tab === 'cards') this.renderCards(body);
    else this.renderMatch(body);
  },

  /* ---------- 字母卡片 ---------- */
  renderCards(body) {
    const seen = Store.state.letters.seen;
    body.innerHTML = `
      <div class="panel">
        <div class="panel-head">
          <h3>🔤 点一点字母卡片，听它说话</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-mini btn-yellow" id="btnABC">🎵 唱一遍 ABC</button>
            <button class="btn btn-mini btn-ghost" id="btnBigSmall">切换 A a / Aa</button>
          </div>
        </div>
        <p style="font-size:13.5px;color:var(--ink-3);font-weight:700;margin-bottom:14px">
          已经认识 <b style="color:var(--pink-d)">${seen.length}</b> / 26 个字母，每认识一个新的字母可以得到 1 颗星 ⭐
        </p>
        <div class="letter-grid" id="letterGrid"></div>
      </div>`;

    const showBoth = Letters.both !== false;
    Letters.both = showBoth;

    const grid = $('#letterGrid');
    LETTERS.forEach(L => {
      const c = document.createElement('button');
      c.className = 'letter-card';
      c.style.borderColor = seen.indexOf(L.u) > -1 ? 'var(--green)' : 'var(--line)';
      c.innerHTML = `
        <div class="lc-char" style="color:var(--${L.color}-d)">${showBoth ? L.u + L.l : L.u}</div>
        <div class="lc-emoji">${L.emoji}</div>
        <div class="lc-word">${L.word}</div>
        <div class="lc-cn">${L.cn}</div>`;
      c.onclick = (ev) => {
        Speech.speak(L.u + '. ' + L.u + ' for ' + L.word, { lang:'en-US', rate:0.72 });
        c.classList.add('playing');
        setTimeout(() => c.classList.remove('playing'), 520);
        c.style.borderColor = 'var(--green)';
        if (Store.state.letters.seen.indexOf(L.u) === -1) {
          Store.state.letters.seen.push(L.u);
          Store.save();
          Store.addStars(1, ev);
          UI.toast(`认识了字母 ${L.u}！+1 ⭐`);
          Store.checkBadges();
          const counter = grid.parentElement.querySelector('b');
          if (counter) counter.textContent = Store.state.letters.seen.length;
        }
      };
      grid.appendChild(c);
    });

    $('#btnABC').onclick = () => {
      const seq = LETTERS.map(l => l.u).join(', ');
      Speech.speak('A B C D E F G, H I J K L M N O P, Q R S, T U V, W X, Y and Z. ' + seq,
        { lang:'en-US', rate:0.62 });
      UI.toast('一起唱 ABC 歌 🎵');
    };
    $('#btnBigSmall').onclick = () => {
      Letters.both = !Letters.both;
      this.renderCards(body);
    };
  },

  /* ---------- 大小写配对游戏 ---------- */
  match: { left: [], right: [], selL: null, selR: null, done: 0 },

  renderMatch(body) {
    body.innerHTML = `
      <div class="panel">
        <div class="panel-head">
          <h3>🎯 帮大写字母找到它的小写好朋友</h3>
          <button class="btn btn-mini btn-pink" id="btnNewRound">换一组</button>
        </div>
        <div class="quiz-meta">
          <span class="chip">✅ 已配好 <b id="mDone">0</b> / 6</span>
          <span class="chip">🏆 完成轮数 <b>${Store.state.letters.matchWins}</b></span>
        </div>
        <div class="match-board" style="margin-top:16px">
          <div class="match-col" id="mLeft"></div>
          <div class="match-line">↔️</div>
          <div class="match-col" id="mRight"></div>
        </div>
        <p style="text-align:center;margin-top:16px;font-size:13.5px;color:var(--ink-3);font-weight:700">
          先点左边的大写字母，再点右边的小写字母，配成一对就成功啦！
        </p>
      </div>`;
    this.newRound();
    $('#btnNewRound').onclick = () => this.newRound();
  },

  newRound() {
    const gs = shuffle(LETTERS).slice(0, 6);
    this.match = { set: gs, selL: null, selR: null, done: 0 };
    const L = $('#mLeft'), R = $('#mRight');
    if (!L) return;
    L.innerHTML = ''; R.innerHTML = '';
    $('#mDone').textContent = '0';

    gs.forEach(item => {
      const b = document.createElement('button');
      b.className = 'match-tile';
      b.textContent = item.u;
      b.dataset.k = item.u;
      b.onclick = () => {
        Speech.speak(item.u, { lang:'en-US', rate:0.7 });
        this.pickTile('L', b);
      };
      L.appendChild(b);
    });

    shuffle(gs).forEach(item => {
      const b = document.createElement('button');
      b.className = 'match-tile';
      b.textContent = item.l;
      b.dataset.k = item.u;
      b.onclick = () => {
        Speech.speak(item.u, { lang:'en-US', rate:0.7 });
        this.pickTile('R', b);
      };
      R.appendChild(b);
    });
  },

  pickTile(side, btn) {
    const m = this.match;
    if (btn.classList.contains('done')) return;
    $$('.match-tile.sel').forEach(b => { if (b !== btn) b.classList.remove('sel'); });
    btn.classList.add('sel');
    m[side === 'L' ? 'selL' : 'selR'] = btn;

    if (m.selL && m.selR) {
      const a = m.selL, b = m.selR;
      if (a.dataset.k === b.dataset.k) {
        a.classList.remove('sel'); b.classList.remove('sel');
        a.classList.add('done');   b.classList.add('done');
        m.done++;
        $('#mDone').textContent = m.done;
        FX.big('✅');
        UI.toast('配对成功！');
        m.selL = m.selR = null;
        if (m.done === 6) this.winRound();
      } else {
        b.classList.add('wrong');
        setTimeout(() => { a.classList.remove('sel'); b.classList.remove('sel', 'wrong'); }, 500);
        m.selL = m.selR = null;
      }
    }
  },

  winRound() {
    Store.state.letters.matchWins++;
    Store.save();
    Store.addStars(3);
    Store.checkBadges();
    FX.cheer();
    setTimeout(() => {
      UI.modal('🎊', '全部配对成功！', '你太棒啦，获得 <b>3 颗星</b> ⭐⭐⭐',
        [{ t:'再玩一轮', c:'btn-green', fn: () => Letters.newRound() },
         { t:'去闯关',  c:'btn-purple', fn: () => go('adventure') }]);
    }, 500);
  }
};
