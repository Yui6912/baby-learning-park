/* ===================================================================
   模块二：古诗花园（8 首经典幼儿古诗 · 拼音标注 · 整诗朗读）
   =================================================================== */

/* 全局：顺序朗读（逐句 / 整首） */
function speakSeq(items, opt) {
  opt = opt || {};
  let i = 0;
  const next = () => {
    if (i >= items.length) { if (opt.onEnd) opt.onEnd(); return; }
    const text = items[i++];
    if (opt.onItem) opt.onItem(i - 1);
    Speech.speak(text, {
      lang: opt.lang || 'zh-CN',
      rate: opt.rate != null ? opt.rate : 0.72,
      onend: () => setTimeout(next, opt.gap != null ? opt.gap : 420)
    });
  };
  next();
}

const Poems = {
  tab: 'list',
  cur: 0,

  render() {
    $$('#poemsSeg .seg-btn').forEach(b => b.classList.toggle('is-active', b.dataset.tab === this.tab));
    $$('#poemsSeg .seg-btn').forEach(b => {
      b.onclick = () => { Speech.stop(); Poems.tab = b.dataset.tab; Poems.render(); };
    });
    if (this.tab === 'list') this.renderList();
    else this.renderDetail();
  },

  renderList() {
    const learned = Store.state.poems.learned;
    $('#poemsBody').innerHTML = `
      <div class="panel">
        <div class="panel-head">
          <h3>🌸 选一首古诗读一读</h3>
          <span class="chip">📖 已学会 <b>${learned.length}</b> / ${POEMS.length} 首</span>
        </div>
        <div class="poem-grid" id="poemGrid"></div>
        <p style="margin-top:14px;font-size:13.5px;color:var(--ink-3);font-weight:700">
          每学会一首新的古诗，可以得到 <b style="color:var(--yellow-d)">2 颗星</b> ⭐⭐
        </p>
      </div>`;

    const grid = $('#poemGrid');
    POEMS.forEach((p, i) => {
      const isL = learned.indexOf(p.id) > -1;
      const c = document.createElement('button');
      c.className = 'poem-card' + (i === this.cur ? ' is-cur' : '');
      c.innerHTML = `
        <div class="pc-emoji">${p.emoji}</div>
        <div class="pc-title">${p.title}</div>
        <div class="pc-author">${p.author}</div>
        ${isL ? '<div class="pc-learned">✅ 已学会</div>' : ''}`;
      c.onclick = () => { this.cur = i; this.tab = 'detail'; this.render(); };
      grid.appendChild(c);
    });
  },

  renderDetail() {
    const p = POEMS[this.cur];
    const learned = Store.state.poems.learned;
    const isL = learned.indexOf(p.id) > -1;

    $('#poemsBody').innerHTML = `
      <div class="poem-detail">
        <div class="pd-emoji" style="font-size:44px">${p.emoji}</div>
        <div class="pd-title">${p.title}</div>
        <div class="pd-author">${p.author}</div>
        <div class="pd-lines" id="pdLines">
          ${p.lines.map((l, i) => `<div class="pd-line" data-i="${i}">${rubyLine(l)}</div>`).join('')}
        </div>
        <div class="pd-actions">
          <button class="btn btn-pink" id="btnReadAll">🔊 朗读整首诗</button>
          <button class="btn btn-blue" id="btnReadLine">📖 一句一句读</button>
          <button class="btn btn-ghost" id="btnStopRead">⏸ 停一下</button>
          <button class="btn btn-yellow" id="btnPrevPoem">⬅️ 上一首</button>
          <button class="btn btn-green" id="btnNextPoem">下一首 ➡️</button>
        </div>
        <div class="pd-mean"><b>💡 小意思：</b>${p.mean}</div>
      </div>`;

    $$('#pdLines .pd-line').forEach(el => {
      el.onclick = () => {
        const i = +el.dataset.i;
        Speech.speak(p.lines[i].hz, { lang:'zh-CN', rate:0.68 });
        $$('#pdLines .pd-line').forEach(x => x.classList.remove('speaking'));
        el.classList.add('speaking');
        setTimeout(() => el.classList.remove('speaking'), 1400);
        if (!isL) this.markLearned(p);
      };
    });

    $('#btnReadAll').onclick = (ev) => {
      speakSeq([p.title + '，' + p.author] , { rate:0.7, onEnd: () => {
        speakSeq(p.lines.map(l => l.hz), {
          rate: 0.62, gap: 620,
          onItem: (i) => {
            $$('#pdLines .pd-line').forEach(x => x.classList.remove('speaking'));
            const el = $('#pdLines .pd-line[data-i="' + i + '"]');
            if (el) el.classList.add('speaking');
          },
          onEnd: () => $$('#pdLines .pd-line').forEach(x => x.classList.remove('speaking'))
        });
      }});
      UI.toast('认真听哦 🔊');
      if (!isL) this.markLearned(p, ev);
    };

    $('#btnReadLine').onclick = (ev) => {
      speakSeq(p.lines.map(l => l.hz), {
        rate: 0.6, gap: 1500,
        onItem: (i) => {
          $$('#pdLines .pd-line').forEach(x => x.classList.remove('speaking'));
          const el = $('#pdLines .pd-line[data-i="' + i + '"]');
          if (el) el.classList.add('speaking');
        },
        onEnd: () => $$('#pdLines .pd-line').forEach(x => x.classList.remove('speaking'))
      });
      if (!isL) this.markLearned(p, ev);
    };

    $('#btnStopRead').onclick = () => { Speech.stop(); UI.toast('好，休息一下 😊'); };
    $('#btnPrevPoem').onclick = () => { Speech.stop(); this.cur = (this.cur - 1 + POEMS.length) % POEMS.length; this.render(); };
    $('#btnNextPoem').onclick = () => { Speech.stop(); this.cur = (this.cur + 1) % POEMS.length; this.render(); };
  },

  markLearned(p, ev) {
    if (Store.state.poems.learned.indexOf(p.id) > -1) return;
    Store.state.poems.learned.push(p.id);
    Store.save();
    Store.addStars(2, ev);
    Store.checkBadges();
    UI.toast(`学会《${p.title}》啦！+2 ⭐`);
  }
};
