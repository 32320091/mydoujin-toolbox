// ==UserScript==
// @name         我的同人｜工具箱
// @namespace    mydoujin-toolbox
// @version      1.0.0
// @description  戰報統計、戰報逐行播放、Boss 冷卻倒數、角色查詢整合成一個插件；左下角 🧰 按鈕可查看所有功能並個別開關
// @match        https://mydoujin.online/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  // 同一頁只跑一次（例如工具箱被裝了兩份）
  if (window.__mdToolbox) return;
  const TK_VER = "1.0.0";
  window.__mdToolbox = TK_VER;

  const OFF_KEY = 'mdtk:off';
  const readOff = () => { try { const v = JSON.parse(localStorage.getItem(OFF_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const writeOff = v => { try { localStorage.setItem(OFF_KEY, JSON.stringify(v)); } catch (e) { /* 無痕模式等 */ } };

  const MODS = [
    Object.assign({"id": "stats", "icon": "📊", "name": "戰報統計", "desc": "戰報頁右下角的統計面板：傷害、承傷、回血、爆擊率、MVP。", "feats": ["玩家與 BOSS 的造成／幸運／總計傷害、承受傷害、回血、回 SP、爆擊率", "頂部摘要：我方總傷害、MVP、最佳坦克、最佳奶媽", "MVP 權重：輸出×1 > 補隊友×0.5 > 承傷×0.25 = 回SP×0.25 > 自回×0.1", "簡易／詳細切換；顯示全部／玩家／BOSS；⤢ 自動縮放成一個視窗", "燒掉的生命上限、特殊迴避、中毒／出血／凍傷等異常狀態與反傷", "西米專屬：番茄湯、臭臭茶、回收桶紀錄", "手機直拿自動改成底部抽屜＋角色卡片"], "ver": "1.20.0", "at": "start"}, { run: function () {
// ===== 戰報統計 1.20.0（mydoujin_戰報統計.user.js）=====
(function () {
  'use strict';

  const API = 'https://mydoujin-backend.onrender.com';
  const cache = new Map();   // reportId -> 戰報 JSON
  const errors = {};
  const pending = new Set();
  let currentId = null;
  let host = null, root = null;
  let statusText = '';
  const state = {
    mode: 'shown',                     // 固定用戰報文字上的數字（已移除「實際扣血」切換）
    collapsed: load('collapsed', false),
    fit: load('fit', true),            // 自動縮放：整個面板縮到一個視窗看得完
    sideView: 'all',                   // 顯示哪一邊：all／A（玩家）／B（BOSS／對手）／C（其他）
    view: load('view', 'detail'),       // simple = 簡易（總計／承受／回血），detail = 詳細（全部欄位＋點開細項）
    hidden: false,
    pos: load('pos', null),
    open: {},
  };

  function load(k, d) { try { const v = localStorage.getItem('mdbs:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem('mdbs:' + k, JSON.stringify(v)); } catch (e) {} }

  /* ---------- 攔截網站自己抓戰報的請求，不額外打 API ---------- */
  const origFetch = window.fetch;
  if (origFetch && !origFetch.__mdbs) {
    const wrapped = function (input) {
      const p = origFetch.apply(this, arguments);
      try {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        const m = url.match(/\/api\/battle-reports\/(\d+)(?:[?#]|$)/);
        if (m) {
          p.then(res => {
            if (!res.ok) return;
            res.clone().json().then(d => {
              if (d && Array.isArray(d.logs)) { cache.set(m[1], d); if (m[1] === currentId) render(); }
            }).catch(() => {});
          }).catch(() => {});
        }
      } catch (e) {}
      return p;
    };
    wrapped.__mdbs = true;
    window.fetch = wrapped;
  }

  function ensureData(id, force) {
    if (!force && cache.has(id)) return;
    setTimeout(async () => {
      if (!force && (cache.has(id) || pending.has(id))) return;
      let token = null;
      try { token = localStorage.getItem('token'); } catch (e) {}
      if (!token) { errors[id] = '尚未登入，無法讀取戰報'; render(); return; }
      pending.add(id); delete errors[id]; statusText = '讀取中…'; render();
      try {
        const r = await origFetch.call(window, API + '/api/battle-reports/' + id, { headers: { Authorization: 'Bearer ' + token } });
        const d = await r.json();
        if (d && Array.isArray(d.logs)) cache.set(id, d);
        else errors[id] = (d && d.error) || ('讀取失敗（HTTP ' + r.status + '）');
      } catch (e) {
        errors[id] = '連線失敗：' + e.message;
      } finally {
        pending.delete(id); statusText = ''; render();
      }
    }, force ? 0 : 1500);
  }

  /* ---------- 統計 ---------- */
  function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

  function newUnit(p, side) {
    return {
      id: p.userId || p.entityId || p._id || p.name,
      side,
      name: p.characterName || p.name || '?',
      names: [p.characterName, p.name].filter(Boolean),
      sub: p.characterName ? p.name : (p.title || ''),
      isAssist: !!p.isAssist,
      maxHpStat: p.stats && p.stats.hp,
      luk: p.stats && p.stats.luk != null ? Number(p.stats.luk) : null,
      stats: p.stats || null,
      isBoss: !!(p.entityId || p.monsterId),
      floor: p.floor != null ? p.floor : null,
      mlevel: p.level != null ? p.level : null,
      dealt: { real: 0, shown: 0 },
      taken: { real: 0, shown: 0 },
      byKind: { normal: { real: 0, shown: 0, n: 0 }, skill: { real: 0, shown: 0, n: 0 }, counter: { real: 0, shown: 0, n: 0 }, dot: { real: 0, shown: 0, n: 0 }, passive: { real: 0, shown: 0, n: 0 }, fart: { real: 0, shown: 0, n: 0 } },
      simmer: null,   // 西米（死靈廚師）專屬：番茄湯、臭臭茶放屁、回收桶
      luck: 0, luckN: 0, luckTaken: 0, luckTakenN: 0,
      heal: 0, healTeam: 0, healSolo: 0, selfHeal: {}, healRecv: 0, sp: 0, spRecv: 0,   // healTeam＝治療技能（補隊友、或能補隊友的技能補到自己）、healSolo＝只能補自己（吸血、自補）
      crit: 0, hitN: 0, blockedN: 0, maxHit: 0, missN: 0, dodgeN: 0,
      hpLeft: null, hpMax: null, dead: false,
      burn: 0, burnN: 0,
      attackedN: 0, specialN: 0, special: {},
      dot: {}, dotTaken: {},   // 持續傷害／異常狀態：{ 名稱: { dmg, n, restore, rn } }
      passiveDot: {}, passiveTaken: {},   // 被動反傷
      // 召喚物（例：菠蘿頭的影分身）。分身是獨立行動者，但算在召喚者同一陣營
      isSummon: false, ownerId: null, ownerName: '', summonSkill: '', summonN: 0, summons: [],
    };
  }

  const escRe = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 一般閃避：「…被 角色名 躲開了／閃開了」，灰燼的「被 灰燼 用翻滾躲開了」也算一般閃避
  // 其他灰色（閃避色）紀錄算角色特殊迴避，例如「用翻滾的無敵幀躲開了」「攻擊穿過亡靈史內趴」
  const NORMAL_DODGE_WORDS = '(?:用翻滾)?';
  function isNormalDodge(msg, t) {
    const names = t && t.names && t.names.length ? t.names : null;
    if (!names) return new RegExp('被\\s*\\S+\\s*' + NORMAL_DODGE_WORDS + '(躲開|閃開|閃過|避開)了').test(msg);
    return names.some(n => new RegExp('被\\s*' + escRe(n) + '\\s*' + NORMAL_DODGE_WORDS + '(躲開|閃開|閃過|避開)了').test(msg));
  }
  function specialKey(msg, t) {
    let s = String(msg);
    const k = s.lastIndexOf('但是');
    if (k >= 0) s = s.slice(k + 2);
    (t.names || []).forEach(n => { s = s.split(n).join('〈T〉'); });
    return s.replace(/\d+/g, '#').trim();
  }

  // 會補隊友的治療技能（就算這次剛好補到自己也算治療技能）：希露菲治癒魔術／無詠唱治癒、西米料理、回收桶；
  // 其他技能只要同一場有補過別人也會自動算進來（例如酷拉皮卡治癒之鎖、同人的小黃金樹、緊急包紮）
  const TEAM_HEAL_SKILLS = ['sylphy_healing', 'sylphy_chantless_healing', 'simmer_cook', 'simmer_recycle_bin'];
  const TEAM_HEAL_MSG = /治癒之鎖|治癒魔術|小黃金樹|緊急包紮|番茄湯/;
  function analyze(rep) {
    const P = rep.participants || {};
    const units = [];
    const byId = new Map();
    (P.players || []).forEach(p => { const u = newUnit(p, 'A'); units.push(u); byId.set(u.id, u); });
    (P.enemies || []).forEach(p => { const u = newUnit(p, 'B'); units.push(u); byId.set(u.id, u); });
    const get = id => {
      if (!id) return null;
      let u = byId.get(id);
      if (!u) { u = newUnit({ name: String(id) }, 'C'); units.push(u); byId.set(id, u); }
      return u;
    };
    const logs = rep.logs || [];

    /* 召喚物：戰報把分身當成獨立行動者（actorId = summon_1），participants 裡沒有它。
       先掃一遍 SUMMON 紀錄，把它登記成召喚者「同陣營」的單位，否則會被丟進「其他」而不計入我方輸出。
       例：菠蘿頭 shadow_clone_jutsu →「菠蘿頭的影分身 從白煙裡滾了出來。」
       實測分身的能力值＝本體（同技能非爆擊均傷 237 vs 251、爆擊 951 vs 958），
       但 HP 上限只有 1，被打中就消失（戰報會寫 4075 點傷害但 actualDamage 只有 1）。 */
    logs.forEach(l => {
      if (!l || l.type !== 'SUMMON' || !l.targetId) return;
      const owner = byId.get(l.actorId);
      const mn = String(l.message || '').match(/^\s*(\S+?)\s/);
      const nm = (mn && mn[1]) || ((owner ? owner.name : '') + '的分身') || String(l.targetId);
      let u = byId.get(l.targetId);
      if (!u) { u = newUnit({ name: nm }, owner ? owner.side : 'C'); u.id = l.targetId; units.push(u); byId.set(l.targetId, u); }
      u.name = nm; u.names = [nm];
      if (owner) u.side = owner.side;
      u.isSummon = true;
      u.ownerId = l.actorId;
      u.ownerName = owner ? owner.name : '';
      u.summonSkill = l.skillId || '';
      u.sub = l.skillId || '召喚物';
      if (owner && u.luk == null) u.luk = owner.luk;          // 分身沿用本體能力值
      if (owner && owner.summons.indexOf(u) < 0) owner.summons.push(u);
    });

    /* 持續傷害（BUFF_EFFECT）：紀錄裡只寫了「誰被扣血」，要自己找出是誰放的 */
    const buffSrc = {};          // 受害者 id -> { buffId: 施放者 id }
    const applyLog = [];         // BUFF_APPLY 紀錄，用來比對狀態名稱（例如「酸蝕」）
    const prefixOwner = {};      // 技能 id 前綴 -> 使用者（viper_decay ↔ viper_poison_cloud）
    const lastDotSrc = {};       // 受害者|名稱 -> 施放者
    let lastZoneEnd = '';        // 最近一個散去的毒氣區域（腐蝕毒霧／毒雲瘴壁／蝮蛇領域…）
    const pending = {};          // 受害者 id -> { 衰變名稱: 上次回復後累積的衰變 }
    const IGNORE_PREFIX = { basic: 1, imitated: 1, standard: 1 };
    const dotName = (l, msg) => {
      let m = msg.match(/在\s*(.+?)\s*中\s*(衰變)/); if (m) return m[1] + '・' + m[2];
      m = msg.match(/受到\s*(.+?)\s*影響/); if (m) return m[1];
      m = msg.match(/(中毒|燃燒|流血|出血|凍傷|灼燒)/); if (m) return m[1];
      return l.buffId || '持續傷害';
    };
    const dotSource = (l, name, victim) => {
      const bs = buffSrc[victim.id];
      if (l.buffId && bs && bs[l.buffId]) return get(bs[l.buffId]);
      const key = name.split('・').pop();
      for (let k = applyLog.length - 1; k >= 0; k--) {
        const x = applyLog[k];
        if (x.victim === victim.id && key && x.msg.includes(key)) return get(x.actor);
      }
      if (l.buffId) { const o = prefixOwner[l.buffId.split('_')[0]]; if (o && o.side !== victim.side) return o; }
      const opp = units.filter(x => x.side !== victim.side && x.side !== 'C');
      return opp.length === 1 ? opp[0] : null;
    };
    const dotSlot = (obj, name) => (obj[name] = obj[name] || { dmg: 0, n: 0, restore: 0, rn: 0 });

    /* 異常狀態傷害：型別是 DAMAGE 但沒有 skillId，靠 source / passiveId / 訊息判斷
       例：壺頭哥「積累的傷口一齊裂開…血如泉湧」＝出血、「霜華自骨縫裡炸開…凍傷了」＝凍傷
       這類傷害不會爆擊，處理方式比照薇蝮的毒（BUFF_EFFECT）：算進造成傷害，但獨立列出、不進爆擊率分母 */
    const STATUS_PATTERNS = [
      { re: /積累的傷口一齊裂開|血如泉湧|流血|出血/, name: '出血' },
      { re: /霜華自骨縫裡炸開|凍傷|凍結|冰封/, name: '凍傷' },
      { re: /中毒|毒發|毒性發作/, name: '中毒' },
      { re: /燃燒|灼燒|焚身/, name: '燒傷' },
      { re: /酸蝕/, name: '酸蝕' },
      { re: /衰變/, name: '衰變' },
    ];
    const statusDamage = (l, msg) => {
      if (l.skillId || l.isNormalAttack || l.isCounter) return null;
      const src = String(l.source || '');
      if (src === 'REFLECTION') return { kind: 'passive', name: '反傷' };
      for (let i = 0; i < STATUS_PATTERNS.length; i++) {
        if (STATUS_PATTERNS[i].re.test(msg)) return { kind: 'dot', name: STATUS_PATTERNS[i].name };
      }
      if (src === 'DIRECT' || l.passiveId) return { kind: 'dot', name: l.passiveId || '異常狀態' };
      return null;
    };

    /* 西米（simmer）：
       - 番茄湯：上菜時立即回 智力×0.9（HEAL，skillId simmer_cook），之後每跳 智力×0.15（BUFF_EFFECT，buffId simmer_dish_tomato_soup，
         actorId 是喝湯的人）。持續回復算回西米身上，西米倒下後還在跳的也算，另外標出來。
       - 臭臭茶：喝過的隊友被打時「憋不住放了一個屁」反打攻擊者（DAMAGE，source SIMMER_FART，actorId 是西米），傷害看西米智力。
       - 回收桶（被動 simmer_recycle_bin）：只算「X 被這一擊打進了回收桶」那一句（掀蓋子、台詞都不算），
         接著那筆「從桶裡爬了出來…恢復了 N HP」（HEAL，skillId simmer_recycle_bin）記成這次救回的血。 */
    const simOf = u => u.simmer || (u.simmer = { soupNow: 0, soupNowN: 0, soupTick: 0, soupTickN: 0, soupAfterDeath: 0, soupBy: {}, fart: 0, fartN: 0, fartBy: {}, bin: [], binHeal: 0 });
    const lastDish = {};          // 隊友 id → 最後端給他的料理名稱
    const soupOwner = {};         // 喝湯的人 id → 端湯的西米
    let simmerUnit = null;

    // 只有普攻／技能／反擊會判定爆擊；異常狀態與反傷不會，不能算進爆擊率分母
    const CRITABLE = { normal: 1, skill: 1, counter: 1 };
    const hit = (a, t, real, shown, kind, l) => {
      if (a) {
        a.dealt.real += real; a.dealt.shown += shown;
        const k = a.byKind[kind]; k.real += real; k.shown += shown; k.n++;
        if (CRITABLE[kind]) { a.hitN++; if (l.isCrit) a.crit++; }
        if (l.blocked || l.type === 'BLOCK') a.blockedN++;
        if (shown > a.maxHit) a.maxHit = shown;
      }
      if (t) { t.taken.real += real; t.taken.shown += shown; if (CRITABLE[kind]) t.attackedN++; }
    };

    logs.forEach((l, i) => {
      if (!l || typeof l !== 'object') return;
      const a = get(l.actorId), t = get(l.targetId);
      const v = num(l.value);
      if (a && l.skillId) { const pre = String(l.skillId).split('_')[0]; if (!IGNORE_PREFIX[pre] && !prefixOwner[pre]) prefixOwner[pre] = a; }
      if (a && l.skillId === 'simmer_cook') {
        simmerUnit = simmerUnit || a;
        const md = String(l.message || '').match(/把一盤\s*(.+?)\s*推到/);
        if (md && t) { lastDish[t.id] = md[1]; if (/番茄湯/.test(md[1])) soupOwner[t.id] = a; }
      }
      if (a && l.skillId === 'simmer_recycle_bin') {
        const sm = simOf(a);
        const msg = String(l.message || '');
        const mw = msg.match(/^\s*(.+?)\s*(?:被這一擊打進|從桶裡爬)/);
        const who = t ? t.name : (mw ? mw[1] : '');
        if (/打進了?回收桶/.test(msg)) sm.bin.push({ who, heal: null });
        else if (l.type === 'HEAL') {
          sm.binHeal += v;
          const open = [...sm.bin].reverse().filter(x => x.heal == null);
          const last = open.find(x => x.who === who) || open.find(x => !x.who || !who);
          if (last && !last.who) last.who = who;
          if (last) last.heal = v; else sm.bin.push({ who, heal: v });
        }
      }
      switch (l.type) {
        case 'SKILL_TEXT': {
          const mz = String(l.message || '').match(/([^\s，。！」]+?)(?:散去了|消散了)/);
          if (mz) lastZoneEnd = mz[1];
          break;
        }
        case 'BUFF_APPLY':
          if (a && t && a.side !== t.side) {   // 只記對手上的狀態，自己給自己的增益不算
            (buffSrc[t.id] = buffSrc[t.id] || {})[l.buffId || ''] = a.id;
            applyLog.push({ victim: t.id, actor: a.id, msg: String(l.message || '') });
          }
          break;
        case 'BUFF_EFFECT': {
          // actorId = 被影響的人（例如「桐人 在毒雲瘴壁中衰變，失去了 278 點生命」）
          const msg = String(l.message || '');
          if (!a || !v) break;
          if (l.buffId === 'simmer_dish_tomato_soup' || (/番茄湯/.test(msg) && /恢復|回復/.test(msg))) {
            a.healRecv += v;
            const cook = soupOwner[a.id] || simmerUnit;
            if (cook) {
              cook.heal += v;
              cook.healTeam += v;   // 番茄湯是補全隊的料理
              const sm = simOf(cook); sm.soupTick += v; sm.soupTickN++;
              if (cook.dead) sm.soupAfterDeath += v;
              const b = (sm.soupBy[a.name] = sm.soupBy[a.name] || { now: 0, tick: 0, n: 0 }); b.tick += v; b.n++;
            }
            break;
          }
          if (/恢復|回復/.test(msg) && !/傷害|失去/.test(msg)) { a.healRecv += v; break; }
          const name = dotName(l, msg);
          const src = dotSource(l, name, a);
          if (src) {
            src.dealt.real += v; src.dealt.shown += v;
            src.byKind.dot.real += v; src.byKind.dot.shown += v; src.byKind.dot.n++;
            const d = dotSlot(src.dot, name); d.dmg += v; d.n++;
          }
          a.taken.real += v; a.taken.shown += v;
          const dt = dotSlot(a.dotTaken, name); dt.dmg += v; dt.n++;
          lastDotSrc[a.id + '|' + name] = src;
          if (name.includes('衰變')) { const pd = (pending[a.id] = pending[a.id] || {}); pd[name] = (pd[name] || 0) + v; }
          break;
        }
        case 'DAMAGE':
        case 'BLOCK': {
          const real = l.actualDamage != null ? num(l.actualDamage) : v;
          if (l.source === 'SIMMER_FART' || l.passiveId === 'simmer_fart') {
            hit(a, t, real, v, 'fart', l);
            if (a) {
              const sm = simOf(a); sm.fart += real; sm.fartN++;
              const me = String(l.message || '').match(/^\s*(.+?)\s*挨了這一下/);
              const who = me ? me[1] : '？';
              const b = (sm.fartBy[who] = sm.fartBy[who] || { dmg: 0, n: 0 }); b.dmg += real; b.n++;
            }
            break;
          }
          const st = statusDamage(l, String(l.message || ''));
          if (st) {
            hit(a, t, real, v, st.kind, l);
            const mine = st.kind === 'passive' ? 'passiveDot' : 'dot';
            const his = st.kind === 'passive' ? 'passiveTaken' : 'dotTaken';
            if (a) { const d = dotSlot(a[mine], st.name); d.dmg += real; d.n++; }
            if (t) { const dt = dotSlot(t[his], st.name); dt.dmg += real; dt.n++; }
            break;
          }
          const kind = l.isCounter ? 'counter' : (l.isNormalAttack ? 'normal' : 'skill');
          hit(a, t, real, v, kind, l);
          break;
        }
        case 'COUNTER': {
          if (l.value == null) break;
          // 有些反擊（例如盾反）後面還會另外記一筆 isCounter 的 DAMAGE，避免重複計算
          let dup = false;
          for (let j = i + 1; j < Math.min(logs.length, i + 6); j++) {
            const x = logs[j];
            if (x && (x.type === 'DAMAGE' || x.type === 'BLOCK') && x.isCounter && (num(x.value) === v || x.actorId === l.actorId)) { dup = true; break; }
          }
          if (!dup) hit(a, t, v, v, 'counter', l);
          break;
        }
        case 'LUCK_EVENT': {
          // actorId/targetId = 被砸中的人；opponentId = 觸發幸運事件的對手
          const src = get(l.opponentId);
          if (src) { src.luck += v; src.luckN++; }
          if (t) { t.luckTaken += v; t.luckTakenN++; t.taken.real += v; t.taken.shown += v; }
          break;
        }
        case 'HEAL': {
          const msg = String(l.message || '');
          // 「桐人 離開毒氣，衰變的傷勢回復了 834 HP」：不是桐人自己的治療，而是把衰變扣掉的血還回來
          if (!l.skillId && /離開毒氣|衰變的傷勢/.test(msg)) {
            const victim = t || a;
            if (!victim) break;
            victim.healRecv += v;
            // 規則（3 場戰報驗證）：回復＝上次回復後累積衰變的一半（捨去），但不會超過當下缺的血量
            // 多種毒氣重疊時，依各自累積的衰變比例分攤這次回復
            const pd = pending[victim.id] || {};
            let zones = Object.keys(pd).filter(n => pd[n] > 0);
            if (!zones.length) {
              const keys = Object.keys(victim.dotTaken);
              zones = [(lastZoneEnd && keys.find(n => n === lastZoneEnd + '・衰變')) || keys.find(n => n.includes('衰變')) || '衰變'];
              pd[zones[0]] = 0;
            }
            const tot = zones.reduce((s2, n) => s2 + pd[n], 0);
            const theory = Math.floor(tot / 2);
            let leftV = v, leftT = theory;
            zones.sort((x, y) => pd[y] - pd[x]).forEach((n, k) => {
              const last = k === zones.length - 1;
              const share = last ? leftV : (tot ? Math.round(v * pd[n] / tot) : 0);
              const shareT = last ? leftT : (tot ? Math.round(theory * pd[n] / tot) : 0);
              leftV -= share; leftT -= shareT;
              const dt = dotSlot(victim.dotTaken, n); dt.restore += share; dt.rn++; dt.theory = (dt.theory || 0) + Math.max(shareT, share);
              const src = lastDotSrc[victim.id + '|' + n];
              if (src) { const d = dotSlot(src.dot, n); d.restore += share; d.rn++; d.theory = (d.theory || 0) + Math.max(shareT, share); }
            });
            pending[victim.id] = {};
            break;
          }
          if (a) { a.heal += v; if (t && t !== a) a.healTeam += v; else { const k = TEAM_HEAL_MSG.test(String(l.message || '')) ? 'msg:team' : (l.skillId || l.passiveId || 'msg:'); a.selfHeal[k] = (a.selfHeal[k] || 0) + v; } }
          if (t) t.healRecv += v;
          if (a && t && l.skillId === 'simmer_cook' && /番茄湯/.test(lastDish[t.id] || '')) {
            const sm = simOf(a); sm.soupNow += v; sm.soupNowN++;
            const b = (sm.soupBy[t.name] = sm.soupBy[t.name] || { now: 0, tick: 0, n: 0 }); b.now += v;
          }
          break;
        }
        case 'SP_RECOVER':
          if (a) a.sp += v;
          if (t) t.spRecv += v;
          break;
        case 'TEXT': {
          // 少數技能只把回復寫在文字裡（例如芙莉蓮解除魔力限制「恢復了 12 SP」）
          const msg = String(l.message || '');
          const ms = msg.match(/恢復了\s*(\d+)\s*SP/);
          if (ms && a) { a.sp += num(ms[1]); a.spRecv += num(ms[1]); }
          const mh = msg.match(/恢復了\s*(\d+)\s*HP/);
          if (mh && a) { a.heal += num(mh[1]); const k = TEAM_HEAL_MSG.test(msg) ? 'msg:team' : (l.skillId || l.passiveId || 'msg:'); a.selfHeal[k] = (a.selfHeal[k] || 0) + num(mh[1]); a.healRecv += num(mh[1]); }
          // 燒生命上限（例如酷拉皮卡緋紅眼「燃燒掉 174 點生命上限」），整場戰鬥不會回來
          const mb = msg.match(/(?:燃燒掉|燒掉|減少|失去|扣除)了?\s*(\d+)\s*點?生命上限/);
          if (mb && a) { a.burn += num(mb[1]); a.burnN++; }
          break;
        }
        case 'MISS': {
          if (a) a.missN++;
          if (t) {
            t.attackedN++;
            const msg = String(l.message || '');
            if (isNormalDodge(msg, t)) t.dodgeN++;
            else { t.specialN++; const key = specialKey(msg, t); t.special[key] = (t.special[key] || 0) + 1; }
          }
          break;
        }
        case 'SUMMON':
          if (a) a.summonN++;
          break;
        case 'DEATH':
          if (a) a.dead = true;
          break;
        case 'HP_REMAINING':
          if (a) { a.hpLeft = v; a.hpMax = l.maxHp != null ? num(l.maxHp) : null; }
          break;
      }
    });
    // 補到自己的治療：如果同一招在這場有補過別人（或是已知的補師技能），就算治療技能；否則算只能補自己（吸血、自補）
    const teamSkills = new Set(TEAM_HEAL_SKILLS);
    logs.forEach(l => { if (l && l.type === 'HEAL' && l.targetId && l.actorId !== l.targetId && (l.skillId || l.passiveId)) teamSkills.add(l.skillId || l.passiveId); });
    teamSkills.add('msg:team');
    units.forEach(u => Object.entries(u.selfHeal).forEach(([k, v]) => { if (teamSkills.has(k)) u.healTeam += v; else u.healSolo += v; }));
    return units;
  }

  /* 舊版累積的傷害樣本與 BOSS 圖鑑已停用，順手把留在 localStorage 的舊資料清掉，釋放空間 */
  try { ['mdbs:samples', 'mdbs:sampleIds', 'mdbs:bossdex', 'mdbs:bossdexIds'].forEach(k => localStorage.removeItem(k)); } catch (e) {}

  /* ---------- UI ---------- */
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const RESULT = { WIN: '勝利', LOSE: '敗北', DRAW: '平手' };

  const CSS = `
  :host { all: initial; }
  * { box-sizing: border-box; }
  .panel { position: fixed; z-index: 2147483000; width: 940px; max-width: calc(100vw - 32px); max-height: calc(100vh - 24px);
    display: flex; flex-direction: column; background: linear-gradient(180deg,#1a2030 0%,#151a25 100%); color: rgba(255,255,255,.88);
    border: 1px solid #34405a; border-radius: 14px;
    box-shadow: 0 18px 48px rgba(0,0,0,.6), 0 0 0 1px rgba(79,209,197,.06) inset; font: 14px/1.5 "Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif; overflow: hidden; }
  .panel.simple { width: 640px; }
  .hd { display: flex; align-items: center; gap: 10px; padding: 10px 12px 10px 14px; background: linear-gradient(180deg,#222b3d,#1a2131);
    border-bottom: 1px solid #2d3748; cursor: move; user-select: none; position: relative; }
  .hd::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg,#4FD1C5,#2c7a7b); }
  .chip { display: inline-flex; align-items: center; font-size: 11.5px; line-height: 1; padding: 4px 8px; border-radius: 999px;
    background: rgba(255,255,255,.06); color: #a8b4c8; border: 1px solid rgba(255,255,255,.08); white-space: nowrap; }
  .chip.win { background: rgba(72,187,120,.16); color: #8ee6ad; border-color: rgba(72,187,120,.45); font-weight: 700; }
  .chip.lose { background: rgba(245,101,101,.14); color: #fca5a5; border-color: rgba(245,101,101,.45); font-weight: 700; }
  .chip.draw { background: rgba(160,174,192,.14); color: #e2e8f0; border-color: rgba(160,174,192,.4); font-weight: 700; }
  .chips { display: flex; gap: 5px; align-items: center; min-width: 0; overflow: hidden; }
  .seg { display: inline-flex; padding: 2px; gap: 2px; background: #10141d; border: 1px solid #34405a; border-radius: 8px; }
  .seg button { border: none; background: transparent; color: #8b98ad; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
  .seg button:hover { background: rgba(255,255,255,.05); color: #e2e8f0; }
  .seg button.on { background: linear-gradient(180deg,#2c9a92,#2c7a7b); color: #fff; font-weight: 700; box-shadow: 0 1px 4px rgba(0,0,0,.35); }
  .tb { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 0 0 10px; flex-wrap: wrap; }
  .tb .lb { color: #8b98ad; font-size: 12px; margin-right: 6px; }
  .tb .seg button { padding: 3px 10px; }
  .tb .seg button i { font-style: normal; color: #6b7a92; font-size: 11px; margin-left: 3px; }
  .tb .seg button.on i { color: rgba(255,255,255,.75); }
  .fitb { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #a8b4c8; background: #10141d; border: 1px solid #34405a; border-radius: 8px; padding: 4px 10px; }
  .fitb.on { color: #4FD1C5; border-color: rgba(79,209,197,.55); }
  .fitb b { font-variant-numeric: tabular-nums; color: inherit; }
  .panel.dense th, .panel.dense td { padding-top: 4px; padding-bottom: 4px; }
  .panel.dense .bar { margin-top: 2px; }
  .panel.dense .sumbar { margin-bottom: 10px; }
  .panel.dense .tile { padding: 3px 8px 4px; }
  .panel.dense .side { margin-bottom: 10px; }
  .panel.dense .nm small { display: inline; margin-left: 8px; }
  .playing { padding: 28px 12px 30px; text-align: center; color: #a8b4c8; }
  .playing .pi { font-size: 30px; animation: mdbsPulse 1.6s ease-in-out infinite; }
  .playing .pt { margin-top: 6px; font-size: 15px; font-weight: 700; color: #e2e8f0; }
  .playing .pt b { margin-left: 8px; color: #4FD1C5; font-variant-numeric: tabular-nums; }
  .playing .ps { margin-top: 4px; font-size: 12.5px; }
  .chip.play { background: rgba(79,209,197,.12); color: #81e6d9; border-color: rgba(79,209,197,.4); }
  @keyframes mdbsPulse { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
  .sumbar { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 6px; margin: 0 0 10px; }
  .tile { background: linear-gradient(180deg,#212a3b,#1b2232); border: 1px solid #2d3748; border-radius: 8px; padding: 4px 9px 5px; min-width: 0; }
  .tile .top { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; min-width: 0; }
  .tile .lb { color: #8b98ad; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .tile .v { color: #fff; font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.3; flex: none; }
  .tile .who { color: #cbd5e0; font-size: 11.5px; line-height: 1.35; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tile.t-dmg .v { color: #4FD1C5; } .tile.t-take .v { color: #f6878b; } .tile.t-heal .v { color: #7bd5a6; } .tile.t-mvp .v { color: #f6e05e; }
  .rk { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; font-size: 11px; font-weight: 800;
    margin-right: 7px; background: #2a3346; color: #a0aec0; vertical-align: 1px; flex: none; }
  .rk.r1 { background: linear-gradient(180deg,#f6e05e,#d69e2e); color: #3b2a05; }
  .rk.r2 { background: linear-gradient(180deg,#e2e8f0,#a0aec0); color: #1a202c; }
  .rk.r3 { background: linear-gradient(180deg,#f6ad55,#c05621); color: #2d1606; }
  .side.sB .bar i { background: linear-gradient(90deg,#9b2c2c,#f56565); }
  .side.sB .bar { background: rgba(245,101,101,.13); }
  .side.sB .c-tot, .side.sB .c-big b { color: #fc8181; }
  .side-hd .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #4FD1C5; margin-right: 7px; vertical-align: 1px; box-shadow: 0 0 6px rgba(79,209,197,.6); }
  .side.sB .side-hd .dot { background: #f56565; box-shadow: 0 0 6px rgba(245,101,101,.6); }
  .side.sC .side-hd .dot { background: #a0aec0; box-shadow: none; }
  table.simple td.nm { min-width: 0; }
  table.simple .bar { height: 6px; }
  .sm-line { display: flex; gap: 12px; margin-top: 6px; font-size: 12.5px; color: #8b98ad; }
  .sm-line b { font-variant-numeric: tabular-nums; margin-left: 3px; }
  .card.simple { cursor: default; padding: 9px 11px; }
  .card.simple .bar { margin: 6px 0 0; }
  @media (max-width: 760px) { .sumbar { grid-template-columns: repeat(2, minmax(0,1fr)); } }
  .ttlw { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 10px; }
  .ttl { font-weight: 700; color: #fff; white-space: nowrap; letter-spacing: .5px; }
  .sub { color: #8b98ad; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .tools { display: flex; gap: 4px; flex-shrink: 0; align-items: center; }
  button { font: inherit; font-size: 12px; color: #e2e8f0; background: #263042; border: 1px solid #3a4558; border-radius: 6px; padding: 4px 10px; cursor: pointer; white-space: nowrap; }
  button:hover { background: #33405a; }
  button.on { border-color: #4FD1C5; color: #4FD1C5; }
  button.ib { width: 30px; height: 28px; padding: 0; display: inline-flex; align-items: center; justify-content: center; font-size: 15px; line-height: 1; }
  .panel.col { width: auto; min-width: 240px; }
  .panel.col .hd { border-bottom: none; }
  .bd { overflow: auto; padding: 10px 12px 14px; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
  .side { margin-bottom: 14px; }
  .side-hd { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font-weight: 700; color: #e9eef6; margin: 2px 2px 7px; font-size: 14.5px; }
  .side-hd span { font-weight: 400; color: #8b98ad; font-size: 12px; text-align: right; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #2d3748; border-radius: 8px; overflow: hidden; }
  th, td { padding: 7px 9px; border-bottom: 1px solid rgba(255,255,255,.06); white-space: nowrap; }
  th { font-size: 12px; font-weight: 600; color: #8b98ad; text-align: right; background: #1d2433; position: sticky; top: 0; letter-spacing: .3px; }
  tbody tr.u:nth-of-type(even) td { background: rgba(255,255,255,.015); }
  th:first-child, td:first-child { text-align: left; }
  td { text-align: right; font-variant-numeric: tabular-nums; }
  tr.u { cursor: pointer; }
  tr.u:hover td, tr.u.open td { background: rgba(79,209,197,.05); }
  .arw { color: #4FD1C5; font-size: 11px; margin-right: 5px; }
  .nm { color: #fff; font-weight: 600; min-width: 200px; }
  .nm small { display: block; font-weight: 400; color: #8b98ad; font-size: 12px; margin-left: 16px; }
  tr.u.hasbst > td { border-bottom: none; padding-bottom: 2px; }
  tr.bst { cursor: pointer; }
  tr.bst td { padding: 0 9px 7px 25px; text-align: left; white-space: normal; font-weight: 400; color: #8b98ad; font-size: 12px; }
  .tag { display: inline-block; font-size: 11px; padding: 0 6px; margin-left: 4px; border: 1px solid; border-radius: 999px; vertical-align: 1px; font-weight: 400; line-height: 1.6; }
  .tag.dead { color: #f6878b; border-color: #f6878b; }
  .tag.ast { color: #90cdf4; border-color: #90cdf4; }
  .tag.burn { color: #f6ad55; border-color: #f6ad55; }
  .tag.spx { color: #cbd5e0; border-color: #a0aec0; }
  .tag.dot { color: #9ae6b4; border-color: #68d391; }
  .tag.pas { color: #90cdf4; border-color: #63b3ed; }
  .tag.sum { color: #d6bcfa; border-color: #b794f4; }
  .tag.soup { color: #feb2b2; border-color: #fc8181; }
  .tag.fart { color: #c6f6d5; border-color: #48bb78; background: rgba(72,187,120,.12); }
  .spl .ad { color: #feb2b2; }
  .spl .dotl b { color: #9ae6b4; }
  .spl .rst b { color: #7bd5a6; }
  .spl { margin-top: 9px; padding-top: 7px; border-top: 1px dashed rgba(255,255,255,.12); font-size: 13px; }
  .spl .k { color: #8b98ad; }
  .spl div { color: #cbd5e0; margin-top: 2px; }
  .spl b { color: #fff; font-variant-numeric: tabular-nums; margin-left: 6px; }
  .grid .burn b { color: #f6ad55; }
  .grid .sum b { color: #d6bcfa; }
  .c-dmg { color: #fff; } .c-luck { color: #c084fc; } .c-tot { color: #4FD1C5; font-weight: 700; }
  .c-take { color: #f6878b; } .c-heal { color: #7bd5a6; } .c-sp { color: #90cdf4; }
  .c-crit { color: #f6e05e; font-variant-numeric: tabular-nums; }
  .zero { color: rgba(255,255,255,.25) !important; font-weight: 400 !important; }
  .bar { height: 5px; border-radius: 3px; background: rgba(79,209,197,.13); margin-top: 4px; overflow: hidden; }
  .bar i { display: block; height: 100%; background: linear-gradient(90deg,#2c7a7b,#4FD1C5); border-radius: 2px; }
  .pct { font-size: 11px; color: #8b98ad; font-weight: 400; }
  tr.sum td { border-top: 1px solid #3a4558; font-weight: 700; background: rgba(255,255,255,.03); }
  tr.sum td:first-child { color: #e2e8f0; }
  tr.det td { background: #1f2636; text-align: left; white-space: normal; padding: 10px 12px; }
  .grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 5px 18px; font-size: 13px; }
  .grid > div { display: flex; justify-content: space-between; gap: 8px; border-bottom: 1px dotted rgba(255,255,255,.07); padding: 2px 0; }
  .grid b { color: #fff; font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
  .grid .k { color: #8b98ad; }
  .msg { padding: 16px 4px; color: #8b98ad; }
  .msg.err { color: #f6878b; }
  .fab { position: fixed; z-index: 2147483000; right: 16px; bottom: 16px; padding: 8px 14px; background: #171c27; color: #4FD1C5;
    border: 1px solid #4FD1C5; border-radius: 999px; font: 600 13px "Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif; cursor: pointer; box-shadow: 0 6px 18px rgba(0,0,0,.5); }
  .fab.m { right: 12px; bottom: calc(12px + env(safe-area-inset-bottom)); padding: 10px 16px; font-size: 14px; }
  /* ---------- 手機：底部抽屜＋卡片 ---------- */
  .panel.mob { left: 0; right: 0; bottom: 0; top: auto; width: 100%; max-width: none; max-height: 82vh; border-radius: 16px 16px 0 0;
    border-left: none; border-right: none; border-bottom: none; font-size: 14px; padding-bottom: env(safe-area-inset-bottom); }
  .panel.mob .hd { cursor: pointer; position: relative; padding: 14px 12px 10px; }
  .panel.mob .grab { position: absolute; left: 50%; top: 5px; width: 40px; height: 4px; margin-left: -20px; border-radius: 2px; background: #3a4558; }
  .panel.mob .ttlw { flex-direction: column; gap: 4px; align-items: flex-start; }
  .panel.mob .chips { flex-wrap: wrap; }
  .panel.mob .tools .seg button { font-size: 13px; padding: 6px 10px; min-width: 0; height: auto; }
  .panel.mob .tools { flex-wrap: wrap; justify-content: flex-end; }
  .panel.mob .sub { max-width: 100%; }
  .panel.mob .tools button { font-size: 16px; padding: 6px 12px; min-width: 40px; }
  .panel.mob .tools button.ib { width: 40px; height: 36px; font-size: 17px; }
  .panel.mob .bd { padding: 8px 10px 16px; }
  .card { background: linear-gradient(180deg,#212a3b,#1c2333); border: 1px solid #2d3748; border-radius: 12px; padding: 10px 11px; margin-bottom: 8px; cursor: pointer; }
  .card.open { border-color: #2c7a7b; }
  .c-top { display: flex; align-items: flex-start; gap: 8px; }
  .c-nm { flex: 1; min-width: 0; }
  .c-nm > b { color: #fff; font-size: 15px; font-weight: 700; margin-right: 2px; }
  .c-nm small { display: block; color: #8b98ad; font-size: 12px; margin-top: 1px; }
  .c-big { text-align: right; flex: none; }
  .c-big b { display: block; color: #4FD1C5; font-size: 19px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.2; }
  .c-big span { color: #8b98ad; font-size: 11px; }
  .card .bar { margin: 7px 0 8px; height: 5px; }
  .c-stats { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 5px; }
  .cs { background: #171c27; border-radius: 7px; padding: 5px 7px; display: flex; flex-direction: column; min-width: 0; }
  .cs span { color: #8b98ad; font-size: 11px; }
  .cs b { font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; }
  .cs i { font-style: normal; color: #8b98ad; font-size: 10px; }
  .cs.zero b { color: rgba(255,255,255,.25); }
  .c-bst { margin-top: 7px; color: #8b98ad; font-size: 12px; line-height: 1.5; }
  .c-more { margin-top: 7px; text-align: center; color: #4FD1C5; font-size: 12px; }
  .c-det { margin-top: 8px; padding-top: 8px; border-top: 1px solid #2d3748; cursor: default; }
  .c-det .grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 3px 12px; font-size: 12.5px; }
  .c-det .spl { font-size: 12.5px; }
  @media (max-width: 760px) { .grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
  `;


  function mount() {
    if (host || !document.body) return;
    host = document.createElement('div');
    host.id = 'mdbs-host';
    root = host.attachShadow({ mode: 'open' });
    document.body.appendChild(host);
    root.addEventListener('click', onClick);
    root.addEventListener('pointerdown', onDragStart);
  }
  function unmount() { if (host) { host.remove(); host = null; root = null; } }

  function sideLabel(rep, side) {
    if (side === 'A') return '玩家';
    if (side === 'C') return '其他';
    return rep.battleType === 'BOSS' ? 'BOSS' : rep.battleType === 'PVP' ? '對手' : '敵方';
  }

  function cell(v, cls) { return `<td class="${v ? cls : cls + ' zero'}">${fmt(v)}</td>`; }

  const critPct = (c, n) => n > 0 ? (c / n * 100).toFixed(1) + '%' : '—';
  // 2026-09-23 以 51 場戰報、2348 次判定迴歸：爆擊率 = 幸運 ÷（幸運 + 318），95% CI K=[289,350]
  const CRIT_K = 318;
  const critTheory = luk => luk == null ? '' : (luk / (luk + CRIT_K) * 100).toFixed(1) + '%';
  function critCell(c, n, cls) {
    return `<td class="c-crit${n ? '' : ' zero'}">${critPct(c, n)}<span class="pct"> ${c}/${n}</span></td>`;
  }

  const STAT_LABELS = [['HP', 'hp'], ['攻擊', 'atk'], ['防禦', 'def'], ['體力', 'sta'], ['敏捷', 'agi'], ['反應', 'spd'], ['技巧', 'tec'], ['智力', 'int'], ['幸運', 'luk']];
  function statLine(s) {
    if (!s) return '';
    return STAT_LABELS.filter(([, k]) => s[k] != null).map(([l, k]) => l + ' ' + fmt(num(s[k]))).join('｜');
  }

  function unitHead(u) {
    const tags = (u.dead ? '<span class="tag dead">倒下</span>' : '') + (u.isAssist ? '<span class="tag ast">支援</span>' : '') +
      (u.burn ? `<span class="tag burn">燒上限 −${fmt(u.burn)}</span>` : '') +
      (u.specialN ? `<span class="tag spx">特殊迴避 ×${u.specialN}</span>` : '') +
      (u.byKind.dot.n ? `<span class="tag dot">異常狀態 ${fmt(u.byKind.dot.real)}</span>` : '') +
      (u.byKind.passive.n ? `<span class="tag pas">反傷 ${fmt(u.byKind.passive.real)}</span>` : '') +
      (u.simmer && (u.simmer.soupNow + u.simmer.soupTick) ? `<span class="tag soup">番茄湯 +${fmt(u.simmer.soupNow + u.simmer.soupTick)}</span>` : '') +
      (u.simmer && u.simmer.fartN ? `<span class="tag fart">放屁 ${fmt(u.simmer.fart)}</span>` : '') +
      (u.simmer && u.simmer.bin.length ? `<span class="tag soup">回收桶 ×${u.simmer.bin.length}</span>` : '') +
      (u.isSummon ? '<span class="tag sum">分身</span>' : '') +
      (u.summonN ? `<span class="tag sum">召喚 ×${u.summonN}</span>` : '');
    const hp = u.hpLeft != null ? `剩餘 HP ${fmt(u.hpLeft)}${u.hpMax ? ' / ' + fmt(u.hpMax) : ''}` : '';
    const subline = [u.isSummon && u.ownerName ? '本體 ' + u.ownerName : '', u.sub, hp].filter(Boolean).join('｜');
    return { tags, subline };
  }

  function detHtml(u, mode) {
    const k = u.byKind;
    const item = (label, val, cls) => `<div${cls ? ` class="${cls}"` : ''}><span class="k">${label}</span><b>${val}</b></div>`;
    let burnItems = '';
    if (u.burn) {
      const base = num(u.maxHpStat);
      const after = base - u.burn;
      burnItems = item('燒掉生命上限', fmt(u.burn) + '（' + u.burnN + ' 次）', 'burn') +
        (base ? item('生命上限', fmt(base) + ' → ' + fmt(after) + '（−' + (u.burn / base * 100).toFixed(1) + '%）', 'burn') : '') +
        item('每次燒', fmt(u.burn / u.burnN), 'burn');
    }
    return `<div class="grid">
        ${burnItems}
        ${item('普攻傷害', fmt(k.normal[mode]) + '（' + k.normal.n + ' 下）')}
        ${item('技能傷害', fmt(k.skill[mode]) + '（' + k.skill.n + ' 下）')}
        ${item('反擊傷害', fmt(k.counter[mode]) + '（' + k.counter.n + ' 下）')}
        ${k.dot.n ? item('異常狀態傷害', fmt(k.dot[mode]) + '（' + k.dot.n + ' 次）') : ''}
        ${k.passive.n ? item('反傷', fmt(k.passive[mode]) + '（' + k.passive.n + ' 次）') : ''}
        ${k.fart.n ? item('臭臭茶放屁', fmt(k.fart[mode]) + '（' + k.fart.n + ' 次）', 'fart') : ''}
        ${item('爆擊率', critPct(u.crit, u.hitN) + '（' + u.crit + ' / ' + u.hitN + ' 次判定）')}
        ${u.luk != null ? item('幸運值', u.luk + (u.isSummon ? '（沿用本體，公式推估 ' : '（公式推估 ') + critTheory(u.luk) + '）') : ''}
        ${u.isSummon && u.ownerName ? item('本體', u.ownerName + (u.summonSkill ? '（' + u.summonSkill + '）' : ''), 'sum') : ''}
        ${u.summons.length ? item('分身輸出', fmt(u.summons.reduce((s2, x) => s2 + x.dealt[mode], 0)) + '（' + u.summons.length + ' 具）', 'sum') : ''}
        ${u.summons.length ? item('本體＋分身', fmt(u.dealt[mode] + u.summons.reduce((s2, x) => s2 + x.dealt[mode], 0)), 'sum') : ''}
        ${item('被格擋次數', u.blockedN)}
        ${item('最高單擊', fmt(u.maxHit))}
        ${item('攻擊落空', u.missN + ' 次')}
        ${item('一般閃避', u.dodgeN + ' 次' + (u.attackedN ? '（' + (u.dodgeN / u.attackedN * 100).toFixed(1) + '%）' : ''))}
        ${item('特殊迴避', u.specialN + ' 次' + (u.attackedN ? '（' + (u.specialN / u.attackedN * 100).toFixed(1) + '%）' : ''))}
        ${item('被攻擊', u.attackedN + ' 下')}
        ${item('幸運觸發', u.luckN + ' 次')}
        ${item('被幸運砸中', u.luckTakenN + ' 次／' + fmt(u.luckTaken))}
        ${item('治療技能', fmt(u.healTeam))}
        ${item('只補自己（吸血、自補）', fmt(u.healSolo))}
        ${item('受到治療', fmt(u.healRecv))}
        ${item('獲得 SP', fmt(u.spRecv))}
      </div>${dotList(u.dot, '異常狀態／持續傷害（這個角色造成的）')}${dotList(u.dotTaken, '受到的異常狀態／持續傷害')}${dotList(u.passiveDot, '反傷（這個角色造成的）')}${dotList(u.passiveTaken, '受到的反傷')}${simmerList(u)}${specialList(u)}`;
  }

  // 電腦：表格的一列
  const rkBadge = i => `<span class="rk${i < 3 ? ' r' + (i + 1) : ''}">${i + 1}</span>`;
  function unitRows(u, sideTot, mode, i) {
    const dmg = u.dealt[mode], tot = dmg + u.luck, take = u.taken[mode];
    const pct = sideTot > 0 ? tot / sideTot * 100 : 0;
    const key = u.id;
    const { tags, subline } = unitHead(u);
    const bst = u.isBoss && u.stats ? `<tr class="bst" data-key="${esc(key)}"><td colspan="8">${esc(statLine(u.stats))}</td></tr>` : '';
    let html = `<tr class="u${bst ? ' hasbst' : ''}${state.open[key] ? ' open' : ''}" data-key="${esc(key)}">
      <td class="nm"><span class="arw">${state.open[key] ? '▾' : '▸'}</span>${rkBadge(i)}${esc(u.name)}${tags}<small>${esc(subline)}</small></td>
      ${cell(dmg, 'c-dmg')}${cell(u.luck, 'c-luck')}
      <td class="c-tot${tot ? '' : ' zero'}">${fmt(tot)} <span class="pct">${pct.toFixed(1)}%</span><div class="bar"><i style="width:${Math.min(100, pct).toFixed(1)}%"></i></div></td>
      ${cell(take, 'c-take')}${cell(u.heal, 'c-heal')}${cell(u.sp, 'c-sp')}${critCell(u.crit, u.hitN)}
    </tr>` + bst;
    if (state.open[key]) html += `<tr class="det"><td colspan="8">${detHtml(u, mode)}</td></tr>`;
    return html;
  }

  // 手機：每個角色一張卡片，主數字放大，其他數字排成格子；點卡片展開細項
  function unitCard(u, sideTot, mode, i) {
    const dmg = u.dealt[mode], tot = dmg + u.luck, take = u.taken[mode];
    const pct = sideTot > 0 ? tot / sideTot * 100 : 0;
    const key = u.id, open = !!state.open[key];
    const { tags, subline } = unitHead(u);
    const st = (label, v, cls) => `<div class="cs ${cls}${v ? '' : ' zero'}"><span>${label}</span><b>${fmt(v)}</b></div>`;
    return `<div class="card${open ? ' open' : ''}" data-key="${esc(key)}">
      <div class="c-top">
        <div class="c-nm">${rkBadge(i)}<b>${esc(u.name)}</b>${tags}${subline ? `<small>${esc(subline)}</small>` : ''}</div>
        <div class="c-big${tot ? '' : ' zero'}"><b>${fmt(tot)}</b><span>${pct.toFixed(1)}%</span></div>
      </div>
      <div class="bar"><i style="width:${Math.min(100, pct).toFixed(1)}%"></i></div>
      <div class="c-stats">
        ${st('造成', dmg, 'c-dmg')}${st('幸運', u.luck, 'c-luck')}${st('承受', take, 'c-take')}
        ${st('回血', u.heal, 'c-heal')}${st('回SP', u.sp, 'c-sp')}
        <div class="cs c-crit${u.hitN ? '' : ' zero'}"><span>爆擊</span><b>${critPct(u.crit, u.hitN)}</b><i>${u.crit}/${u.hitN}</i></div>
      </div>
      ${u.isBoss && u.stats ? `<div class="c-bst">${esc(statLine(u.stats))}</div>` : ''}
      <div class="c-more">${open ? '▴ 收起細項' : '▾ 點開看細項'}</div>
      ${open ? `<div class="c-det">${detHtml(u, mode)}</div>` : ''}
    </div>`;
  }

  function dotList(obj, title) {
    const ent = Object.entries(obj).sort((a, b) => b[1].dmg - a[1].dmg);
    if (!ent.length) return '';
    let totD = 0, totR = 0;
    const rows = ent.map(([name, d]) => {
      totD += d.dmg; totR += d.restore;
      let h = `<div class="dotl">・${esc(name)}<b>${fmt(d.dmg)}</b>（${d.n} 次${d.n ? '，每次約 ' + fmt(d.dmg / d.n) : ''}）</div>`;
      if (d.restore) h += `<div class="rst">　離開後回復<b>−${fmt(d.restore)}</b>（${d.rn} 次${d.theory > d.restore ? '，照規則應回 ' + fmt(d.theory) + '，因為當時快滿血少回了 ' + fmt(d.theory - d.restore) : ''}）　淨傷害<b>${fmt(d.dmg - d.restore)}</b></div>`;
      return h;
    }).join('');
    const sum = ent.length > 1 || totR ? `<div class="dotl">・合計<b>${fmt(totD)}</b>${totR ? `，扣掉回復後淨傷害<b>${fmt(totD - totR)}</b>` : ''}</div>` : '';
    return `<div class="spl"><span class="k">${esc(title)}</span>${rows}${sum}</div>`;
  }

  /* 西米專屬：番茄湯（立即＋持續，逐位隊友）、臭臭茶放屁（逐位喝茶的隊友）、回收桶 */
  function simmerList(u) {
    const s = u.simmer;
    if (!s) return '';
    let h = '';
    const soup = s.soupNow + s.soupTick;
    if (soup) {
      h += `<div class="dotl">・番茄湯總回復<b>${fmt(soup)}</b>（立即 ${fmt(s.soupNow)}／${s.soupNowN} 碗，持續 ${fmt(s.soupTick)}／${s.soupTickN} 跳${s.soupAfterDeath ? `，其中西米倒下後還跳了 <b class="ad">${fmt(s.soupAfterDeath)}</b>` : ''}）</div>`;
      h += Object.entries(s.soupBy).sort((a, b) => (b[1].now + b[1].tick) - (a[1].now + a[1].tick))
        .map(([n, b]) => `<div class="rst">　${esc(n)}<b>${fmt(b.now + b.tick)}</b>（立即 ${fmt(b.now)}＋持續 ${fmt(b.tick)}／${b.n} 跳）</div>`).join('');
    }
    if (s.fartN) {
      h += `<div class="dotl">・臭臭茶放屁傷害<b>${fmt(s.fart)}</b>（${s.fartN} 次，每次約 ${fmt(s.fart / s.fartN)}；傷害看西米的智力）</div>`;
      h += Object.entries(s.fartBy).sort((a, b) => b[1].dmg - a[1].dmg)
        .map(([n, b]) => `<div class="rst">　${esc(n)} 放的<b>${fmt(b.dmg)}</b>（${b.n} 次）</div>`).join('');
    }
    if (s.bin.length) {
      h += `<div class="dotl">・回收桶<b>${s.bin.length} 次</b>，爬出來共回復<b>${fmt(s.binHeal)}</b> HP</div>` +
        s.bin.map((x, i) => `<div class="rst">　第 ${i + 1} 次：${esc(x.who || '？')} 被打進回收桶${x.heal != null ? `，爬出來回復<b>${fmt(x.heal)}</b>` : ''}</div>`).join('');
    }
    return h ? `<div class="spl"><span class="k">西米料理（番茄湯／臭臭茶／回收桶）</span>${h}</div>` : '';
  }

  function specialList(u) {
    const ent = Object.entries(u.special).sort((a, b) => b[1] - a[1]);
    if (!ent.length) return '';
    return `<div class="spl"><span class="k">特殊迴避內容（灰色字但不是一般閃避）</span>` +
      ent.map(([k, n]) => `<div>・${esc(k.split('〈T〉').join(u.name))}<b>×${n}</b></div>`).join('') + `</div>`;
  }

  // 簡易模式：只看名次、總計傷害（佔比）、承受、回血、爆擊率；不展開細項
  const simpleTags = u => (u.dead ? '<span class="tag dead">倒下</span>' : '') + (u.isAssist ? '<span class="tag ast">支援</span>' : '') + (u.isSummon ? '<span class="tag sum">分身</span>' : '');
  function sideSimple(rep, units, side, mode, mob) {
    const list = units.filter(u => u.side === side);
    if (!list.length) return '';
    const S = list.reduce((s, u) => { s.tot += u.dealt[mode] + u.luck; s.take += u.taken[mode]; s.heal += u.heal; s.crit += u.crit; s.hitN += u.hitN; return s; }, { tot: 0, take: 0, heal: 0, crit: 0, hitN: 0 });
    list.sort((a, b) => (b.dealt[mode] + b.luck) - (a.dealt[mode] + a.luck));
    const pctOf = u => S.tot > 0 ? (u.dealt[mode] + u.luck) / S.tot * 100 : 0;
    const head = `<div class="side-hd"><span style="color:inherit;font-size:inherit"><i class="dot"></i>${sideLabel(rep, side)}</span><span>${list.length} 名${list.length > 1 ? `・總計 ${fmt(S.tot)}` : ''}</span></div>`;
    if (mob) {
      return `<div class="side s${side}">${head}${list.map((u, i) => {
        const tot = u.dealt[mode] + u.luck, p = pctOf(u);
        return `<div class="card simple"><div class="c-top"><div class="c-nm">${rkBadge(i)}<b>${esc(u.name)}</b>${simpleTags(u)}</div>
          <div class="c-big${tot ? '' : ' zero'}"><b>${fmt(tot)}</b><span>${p.toFixed(1)}%</span></div></div>
          <div class="bar"><i style="width:${Math.min(100, p).toFixed(1)}%"></i></div>
          <div class="sm-line"><span>承受<b class="c-take">${fmt(u.taken[mode])}</b></span>${u.heal ? `<span>回血<b class="c-heal">${fmt(u.heal)}</b></span>` : ''}<span>爆擊<b class="c-crit">${critPct(u.crit, u.hitN)}</b> <i style="font-style:normal;font-size:11px">${u.crit}/${u.hitN}</i></span></div></div>`;
      }).join('')}</div>`;
    }
    return `<div class="side s${side}">${head}
      <table class="simple"><thead><tr><th>角色</th><th>總計傷害</th><th>承受傷害</th><th>回復血量</th><th>爆擊率</th></tr></thead><tbody>
      ${list.map((u, i) => {
        const tot = u.dealt[mode] + u.luck, p = pctOf(u);
        return `<tr class="u0"><td class="nm">${rkBadge(i)}${esc(u.name)}${simpleTags(u)}</td>
          <td class="c-tot${tot ? '' : ' zero'}" style="min-width:190px">${fmt(tot)} <span class="pct">${p.toFixed(1)}%</span><div class="bar"><i style="width:${Math.min(100, p).toFixed(1)}%"></i></div></td>
          ${cell(u.taken[mode], 'c-take')}${cell(u.heal, 'c-heal')}${critCell(u.crit, u.hitN)}</tr>`;
      }).join('')}
      ${list.length > 1 ? `<tr class="sum"><td>合計</td>${cell(S.tot, 'c-tot')}${cell(S.take, 'c-take')}${cell(S.heal, 'c-heal')}${critCell(S.crit, S.hitN)}</tr>` : ''}
      </tbody></table></div>`;
  }

  // 頂部摘要：我方總傷害、MVP（綜合貢獻）、最佳坦克、最佳奶媽
  // MVP 綜合貢獻＝各項佔全隊比例的加權平均，權重：輸出（含幸運、分身）×1 > 補隊友×0.5 > 承受傷害×0.25 = 回 SP×0.25 > 自回×0.1；
  // 補隊友＝治療技能全算（能補隊友的招：番茄湯、小黃金樹、緊急包紮、治癒之鎖、治癒魔術…補到自己也算）
  //      自回＝只能補自己的（吸血、自補），單獨一項。
  // 全隊都是 0 的項目不列入。所有玩家的綜合貢獻加起來是 100%。
  const MVP_W = [['輸出', 1], ['補隊友', 0.5], ['承傷', 0.25], ['自回', 0.1], ['回SP', 0.25]];
  function contribution(mine, mode) {
    const outOf = u => u.dealt[mode] + u.luck + u.summons.reduce((s2, x) => s2 + x.dealt[mode] + x.luck, 0);
    const vals = u => [outOf(u), u.healTeam, u.taken[mode], u.healSolo, u.sp];
    const tot = MVP_W.map(() => 0);
    mine.forEach(u => vals(u).forEach((v, i) => { tot[i] += v; }));
    const used = MVP_W.map(([, w], i) => tot[i] > 0 ? w : 0);
    const wsum = used.reduce((a, b) => a + b, 0) || 1;
    return mine.map(u => {
      const v = vals(u), share = v.map((x, i) => tot[i] > 0 ? x / tot[i] : 0);
      const score = share.reduce((a, x, i) => a + x * used[i], 0) / wsum;
      return { u, out: v[0], score, parts: MVP_W.map(([n], i) => used[i] && share[i] > 0 ? `${n}${(share[i] * 100).toFixed(0)}%` : '').filter(Boolean) };
    });
  }
  function summaryBar(rep, units, mode) {
    const mine = units.filter(u => u.side === 'A' && !u.isSummon);
    if (!mine.length) return '';
    const top = (arr, f) => arr.reduce((b, u) => (f(u) > f(b) ? u : b), arr[0]);
    const cs = contribution(mine, mode);
    const all = cs.reduce((s, c) => s + c.out, 0);
    const mvp = top(cs, c => c.score), tank = top(mine, u => u.taken[mode]), healer = top(mine, u => u.healTeam);
    const tile = (cls, lb, v, who, tip) => `<div class="tile ${cls}" title="${esc(tip || who.replace(/<[^>]+>/g, ''))}"><div class="top"><span class="lb">${lb}</span><span class="v">${v}</span></div><div class="who">${who}</div></div>`;
    const rank = cs.slice().sort((a, b) => b.score - a.score).map(c => `${c.u.name} ${(c.score * 100).toFixed(1)}%（${c.parts.join('、') || '無'}）`).join('\n');
    return `<div class="sumbar">
      ${tile('t-dmg', '⚔️ 我方總傷害', fmt(all), mine.length + ' 名玩家')}
      ${tile('t-mvp', '🏆 MVP', (mvp.score * 100).toFixed(1) + '%', esc(mvp.u.name) + (mvp.parts.length ? '・' + esc(mvp.parts.join(' ')) : ''),
        '綜合貢獻＝各項佔全隊比例的加權平均（全隊都是 0 的項目不算）\n權重：輸出×1 > 補隊友×0.5 > 承受傷害×0.25 = 回SP×0.25 > 自回×0.1\n補隊友＝能補隊友的治療技能（番茄湯、小黃金樹、緊急包紮、治癒之鎖、治癒魔術…補到自己也算）\n自回＝只能補自己的（吸血、自補）\n\n' + rank)}
      ${tile('t-take', '🛡️ 最佳坦克', fmt(tank.taken[mode]), esc(tank.name))}
      ${tile('t-heal', '💚 最佳奶媽', healer.healTeam ? fmt(healer.healTeam) : '—', healer.healTeam ? esc(healer.name) : '沒有人用治療技能',
        '最佳奶媽看「治療技能」的回血：能補隊友的招都算（補到自己也算），吸血、自補不算\n\n' + mine.slice().sort((a, b) => b.healTeam - a.healTeam).map(u => `${u.name}：治療技能 ${fmt(u.healTeam)}、只補自己 ${fmt(u.healSolo)}`).join('\n'))}
    </div>`;
  }

  function sideTable(rep, units, side, mode) {
    const list = units.filter(u => u.side === side);
    if (!list.length) return '';
    const S = list.reduce((s, u) => {
      s.dmg += u.dealt[mode]; s.luck += u.luck; s.take += u.taken[mode]; s.heal += u.heal; s.sp += u.sp;
      s.crit += u.crit; s.hitN += u.hitN; return s;
    }, { dmg: 0, luck: 0, take: 0, heal: 0, sp: 0, crit: 0, hitN: 0 });
    const tot = S.dmg + S.luck;
    list.sort((a, b) => (b.dealt[mode] + b.luck) - (a.dealt[mode] + a.luck));
    return `<div class="side s${side}">
      <div class="side-hd"><span style="color:inherit;font-size:inherit"><i class="dot"></i>${sideLabel(rep, side)}</span><span>${list.length} 名・點角色列看細項</span></div>
      <table><thead><tr>
        <th>角色</th><th>造成傷害</th><th>幸運傷害</th><th>總計傷害</th><th>承受傷害</th><th>回復血量</th><th>回復SP</th><th>爆擊率</th>
      </tr></thead><tbody>
        ${list.map((u, i) => unitRows(u, tot, mode, i)).join('')}
        ${list.length > 1 ? `<tr class="sum"><td>合計</td>${cell(S.dmg, 'c-dmg')}${cell(S.luck, 'c-luck')}${cell(tot, 'c-tot')}${cell(S.take, 'c-take')}${cell(S.heal, 'c-heal')}${cell(S.sp, 'c-sp')}${critCell(S.crit, S.hitN)}</tr>` : ''}
      </tbody></table></div>`;
  }

  function sideCards(rep, units, side, mode) {
    const list = units.filter(u => u.side === side);
    if (!list.length) return '';
    const S = list.reduce((s, u) => { s.dmg += u.dealt[mode]; s.luck += u.luck; s.take += u.taken[mode]; s.heal += u.heal; return s; },
      { dmg: 0, luck: 0, take: 0, heal: 0 });
    const tot = S.dmg + S.luck;
    list.sort((a, b) => (b.dealt[mode] + b.luck) - (a.dealt[mode] + a.luck));
    return `<div class="side s${side}">
      <div class="side-hd"><span style="color:inherit;font-size:inherit"><i class="dot"></i>${sideLabel(rep, side)}</span><span>${list.length} 名${list.length > 1 ? `・總計 ${fmt(tot)}・承受 ${fmt(S.take)}${S.heal ? '・回血 ' + fmt(S.heal) : ''}` : ''}</span></div>
      ${list.map((u, i) => unitCard(u, tot, mode, i)).join('')}
    </div>`;
  }

  // 窄螢幕（手機直拿）改用卡片＋底部抽屜；轉橫或電腦就回到表格
  const narrow = () => { try { return matchMedia('(max-width: 640px)').matches; } catch (e) { return false; } };
  let wasNarrow = null;
  window.addEventListener('mdp-playback', () => { if (currentId) render(); });
  window.addEventListener('resize', () => { const n = narrow(); if (n !== wasNarrow && currentId) render(); else applyFit(); });

  function render() {
    if (!currentId) return;
    mount();
    if (!root) return;
    const mob = narrow();
    wasNarrow = mob;
    const pos = state.pos;
    const posStyle = mob ? '' : pos
      ? `left:${Math.max(0, Math.min(pos.left, document.documentElement.clientWidth - 160))}px;top:${Math.max(0, Math.min(pos.top, document.documentElement.clientHeight - 40))}px;`
      : 'right:16px;top:72px;';
    const playing = document.documentElement.hasAttribute('data-mdp-playing');
    if (state.hidden) {
      root.innerHTML = `<style>${CSS}</style><button class="fab${mob ? ' m' : ''}" data-act="show">📊 戰報統計${playing ? '・⏳ 播放中' : ''}</button>`;
      return;
    }
    const rep = cache.get(currentId);
    const mode = state.mode;
    let sub = `<span class="chip">#${esc(currentId)}</span>`, body;
    const simple = state.view === 'simple';
    if (rep && playing) {
      // 逐行播放中：數字全部先不顯示，播完才出現
      sub = `<span class="chip play">⏳ 播放中</span>` + (rep.battleType ? `<span class="chip">${esc(rep.battleType)}</span>` : '') + `<span class="chip">#${esc(currentId)}</span>`;
      body = `<div class="playing"><div class="pi">⏳</div><div class="pt">戰報逐行播放中</div>
        <div class="ps">播完最後一行才顯示傷害、MVP 與勝負</div></div>`;
    } else if (rep) {
      const units = analyze(rep);
      const t = rep.createdAt ? new Date(rep.createdAt).toLocaleString() : '';
      const rc = { WIN: 'win', LOSE: 'lose', DRAW: 'draw' }[rep.result] || '';
      // 戰報逐行播放還在播時，先不顯示勝負（播完才揭曉）
      sub = (playing ? `<span class="chip" title="逐行播放完才顯示勝負">⏳ 播放中</span>` : rep.result ? `<span class="chip ${rc}">${esc(RESULT[rep.result] || rep.result)}</span>` : '') +
        (rep.battleType ? `<span class="chip">${esc(rep.battleType)}</span>` : '') +
        `<span class="chip">#${esc(currentId)}</span>` + (t ? `<span class="chip">${esc(t)}</span>` : '');
      const sides = ['A', 'B', 'C'].filter(sd => units.some(u => u.side === sd));
      if (state.sideView !== 'all' && !sides.includes(state.sideView)) state.sideView = 'all';
      const cnt = sd => units.filter(u => u.side === sd).length;
      const sv = state.sideView;
      const tb = `<div class="tb">
        <div><span class="lb">顯示</span><span class="seg">
          <button data-act="side" data-s="all" class="${sv === 'all' ? 'on' : ''}">全部<i>${units.length}</i></button>
          ${sides.map(sd => `<button data-act="side" data-s="${sd}" class="${sv === sd ? 'on' : ''}">${sideLabel(rep, sd)}<i>${cnt(sd)}</i></button>`).join('')}
        </span></div>
        ${mob ? '' : `<button data-act="fit" class="fitb${state.fit ? ' on' : ''}" title="自動縮小整個面板，讓戰報在一個視窗內看完（不用捲動）">⤢ 自動縮放 <b class="fitv">${state.fit ? '' : '關'}</b></button>`}
      </div>`;
      body = tb + (sv === 'all' || sv === 'A' ? summaryBar(rep, units, mode) : '') +
        sides.filter(sd => sv === 'all' || sv === sd).map(sd => simple ? sideSimple(rep, units, sd, mode, mob) : (mob ? sideCards : sideTable)(rep, units, sd, mode)).join('');
    } else if (errors[currentId]) {
      body = `<div class="msg err">${esc(errors[currentId])}</div>`;
    } else {
      body = `<div class="msg">${esc(statusText || '等待戰報資料…')}</div>`;
    }
    const col = state.collapsed;
    root.innerHTML = `<style>${CSS}</style>
      <div class="panel${mob ? ' mob' : ''}${col ? ' col' : ''}${simple && !mob ? ' simple' : ''}" style="${posStyle}">
        <div class="hd"${mob ? ' data-act="collapse"' : ' data-drag="1"'}>
          ${mob ? '<span class="grab"></span>' : ''}
          <div class="ttlw"><span class="ttl">📊 戰報統計</span>${col ? (playing ? `<span class="chips"><span class="chip play">⏳ 播放中</span></span>` : '') : `<span class="chips">${sub}</span>`}</div>
          <div class="tools">
            ${col ? '' : `<span class="seg"><button data-act="view" data-v="simple" class="${simple ? 'on' : ''}" title="只看總計傷害、承受、回血">簡易</button><button data-act="view" data-v="detail" class="${simple ? '' : 'on'}" title="全部欄位，點角色看細項">詳細</button></span>`}
            <button data-act="collapse" class="ib" title="${col ? '展開' : '收合'}">${col ? (mob ? '▴' : '＋') : (mob ? '▾' : '－')}</button>
            <button data-act="hide" class="ib" title="縮成小按鈕">✕</button>
          </div>
        </div>
        ${col ? '' : `<div class="bd">${body}</div>`}
      </div>`;
    applyFit();
  }

  // 自動縮放：量出面板完整高度，超過視窗就整個等比縮小（最小 50%，再不夠才捲動）
  function applyFit() {
    const p = root && root.querySelector('.panel');
    if (!p) return;
    p.style.transform = ''; p.style.maxHeight = ''; p.classList.remove('dense');
    const lab = root.querySelector('.fitv');
    const mob = narrow();
    const top = p.getBoundingClientRect().top;
    const avail = Math.max(200, window.innerHeight - top - 12);
    if (mob || state.collapsed || !state.fit || !cache.get(currentId) || document.documentElement.hasAttribute('data-mdp-playing')) {
      if (!mob) p.style.maxHeight = avail + 'px';      // 不縮放時也不要超出視窗底部
      if (lab) lab.textContent = state.fit ? '100%' : '關';
      return;
    }
    p.style.maxHeight = 'none';
    let H = p.offsetHeight;
    if (H > avail) { p.classList.add('dense'); H = p.offsetHeight; }   // 先把行距收緊，還不夠再縮放
    let sc = Math.min(1, avail / H);
    if (sc < 0.5) { sc = 0.5; p.style.maxHeight = Math.floor(avail / sc) + 'px'; }
    if (sc < 0.999) {
      p.style.transformOrigin = state.pos ? 'top left' : 'top right';
      p.style.transform = `scale(${sc.toFixed(3)})`;
    }
    if (lab) lab.textContent = Math.round(sc * 100) + '%';
  }

  function onClick(e) {
    const btn = e.target.closest('[data-act]');
    if (btn) {
      const act = btn.dataset.act;
      if (act === 'side') { state.sideView = btn.dataset.s || 'all'; render(); }
      else if (act === 'fit') { state.fit = !state.fit; save('fit', state.fit); render(); }
      else if (act === 'view') { state.view = btn.dataset.v === 'simple' ? 'simple' : 'detail'; save('view', state.view); render(); }
      else if (act === 'collapse') { if (e.target.closest('button') && e.target.closest('button') !== btn) return; state.collapsed = !state.collapsed; save('collapsed', state.collapsed); render(); }
      else if (act === 'hide') { state.hidden = true; render(); }
      else if (act === 'show') { state.hidden = false; render(); }
      return;
    }
    const row = e.target.closest('tr[data-key], .card[data-key]');
    if (row) { const k = row.dataset.key; state.open[k] = !state.open[k]; render(); }
  }

  function onDragStart(e) {
    const hd = e.target.closest('[data-drag]');
    if (!hd || e.target.closest('button')) return;
    const panel = hd.parentElement;
    const r = panel.getBoundingClientRect();
    // 縮放時改成以左上角為準，畫面位置不跳動
    panel.style.transformOrigin = 'top left'; panel.style.left = r.left + 'px'; panel.style.top = r.top + 'px'; panel.style.right = 'auto';
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    const move = ev => {
      const left = Math.max(0, Math.min(window.innerWidth - 80, ev.clientX - dx));
      const top = Math.max(0, Math.min(window.innerHeight - 40, ev.clientY - dy));
      panel.style.left = left + 'px'; panel.style.top = top + 'px'; panel.style.right = 'auto';
      state.pos = { left: Math.round(left), top: Math.round(top) };
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); if (state.pos) save('pos', state.pos); applyFit(); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    e.preventDefault();
  }

  /* ---------- SPA 路由監聽 ---------- */
  function routeId() { const m = location.pathname.match(/^\/reports\/(\d+)\/?$/); return m ? m[1] : null; }
  function onRoute() {
    if (!document.body) return;
    const id = routeId();
    if (id === currentId) return;
    currentId = id;
    state.open = {};
    state.sideView = 'all';
    if (!id) { unmount(); return; }
    state.hidden = false;
    render();
    ensureData(id);
  }
  ['pushState', 'replaceState'].forEach(fn => {
    const o = history[fn];
    history[fn] = function () { const r = o.apply(this, arguments); setTimeout(onRoute, 0); return r; };
  });
  window.addEventListener('popstate', () => setTimeout(onRoute, 0));
  document.addEventListener('DOMContentLoaded', onRoute);
  setInterval(onRoute, 800);
})();
} }),
    Object.assign({"id": "playback", "icon": "▶️", "name": "戰報逐行播放", "desc": "Boss、切磋／茶渡、遭遇戰、戰報頁：戰鬥過程一行一行出現，最後才揭曉勝負。", "feats": ["逐行播放，可「跳過，直接看結果」、播完可重播", "播完前蓋住勝利／失敗／平手、死亡標記與死亡橫幅", "事件「遭遇戰鬥！」不先寫結果", "播放中戰報統計只顯示「⏳ 播放中」，不顯示總行數", "每一行後面顯示被打／被補的人剩多少血", "「⚙ 戰報播放」設定：逐行／直接顯示、剩餘血量、每行間隔、自動捲動"], "ver": "1.2.3", "at": "start"}, { run: function () {
// ===== 戰報逐行播放 1.2.3（mydoujin_戰報播放.user.js）=====
(function () {
  'use strict';

  /* 原理：遊戲把整場戰報一次畫好，這支腳本只是先把每一行藏起來、照間隔一行一行放出來，
     同時把「勝利／失敗／平手」「死亡」標籤、頂端「你的角色死亡了」橫幅、隊伍成員的存活狀態
     暫時蓋住，播完才恢復。不改任何資料。
     剩餘血量：從戰報資料逐行推算（受傷扣、回復加、倒下歸零），並用戰報最後的「剩餘 HP」校正。 */
  const CFG_KEY = 'mdp:cfg';
  const DEF = { mode: 'step', sec: 0.6, hp: true };
  const load = () => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(CFG_KEY)) || {}); } catch (e) { return Object.assign({}, DEF); } };
  const save = () => { try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) {} };
  let cfg = load();
  const clampSec = v => Math.max(0.05, Math.min(10, Number(v) || DEF.sec));
  cfg.sec = clampSec(cfg.sec);

  // 只在這三種頁面作用：Boss、玩家詳情（切磋／茶渡）、單篇戰報
  const routeOk = () => /^\/(boss|players\/[^/]+|reports\/[^/]+)?\/?$/.test(location.pathname);
  const homePage = () => /^\/?$/.test(location.pathname);   // 首頁：事件遭遇戰按「查看戰報」開出來的視窗

  /* ---------- 結果遮蔽 ---------- */
  const DEATH_BANNER = '你的角色死亡了，請進行轉生';
  const STATUS_RE = /^.+ · Lv\.\d+ · (死亡|存活)$/;
  const OUTCOME_RE = /^(勝利|失敗|敗北|平手|平局|死亡)$/;
  let guard = false, guardTimer = null;        // 戰鬥送出後到播放結束前，都要蓋住結果
  function ensureStyle() {
    if (document.getElementById('mdp-style')) return;
    const st = document.createElement('style');
    st.id = 'mdp-style';
    st.textContent = '[data-mdp-hide]{visibility:hidden !important}[data-mdp-gone]{display:none !important}' +
      // 播放中／等戰報時：對話框標題（戰報）後面的標籤直接用 CSS 蓋住，React 重畫也不會露出來
      // 逐行模式：戰報視窗一打開就先蓋住，播完（data-mdp-reveal）才露出
      'html[data-mdp-playing] [data-part="title"] ~ *, html[data-mdp-guard] [data-part="title"] ~ *,' +
      'html.mdp-step:not([data-mdp-reveal]) [data-mdp-report] [data-part="title"] ~ *,' +
      'html.mdp-step:not([data-mdp-reveal]) [data-mdp-report] h2 ~ span,' +
      'html[data-mdp-playing] [role="dialog"] h2 ~ span, html[data-mdp-guard] [role="dialog"] h2 ~ span{visibility:hidden !important}' +
      // 事件視窗的「遭遇戰鬥！ (勝利)」：把原字縮成 0、換成不帶結果的字，顏色也統一（原本勝負用不同顏色）
      '[data-mdp-enc]{font-size:0 !important;color:#a0aec0 !important}' +
      '[data-mdp-enc]::after{content:"遭遇戰鬥！（勝負在戰報最後揭曉）";font-size:14px;font-weight:700}';
    (document.head || document.documentElement).appendChild(st);
  }
  function hideOutcome() {
    ensureStyle();
    // 頂端死亡橫幅
    document.querySelectorAll('div').forEach(d => {
      if (d.childElementCount === 0 && d.textContent.trim() === DEATH_BANNER) d.setAttribute('data-mdp-gone', '');
    });
    // 隊伍成員「… · Lv.58 · 存活／死亡」：不管死活一律蓋住，免得從誰被蓋住猜出結果
    document.querySelectorAll('p').forEach(p => {
      if (p.childElementCount === 0 && STATUS_RE.test(p.textContent.trim())) p.setAttribute('data-mdp-hide', '');
    });
    // 戰報視窗裡的「勝利／失敗／平手／平局」「死亡」標籤：直接找文字，不靠標題位置（Boss 頁的視窗結構不同）
    document.querySelectorAll('[role="dialog"], [role="alertdialog"], [data-scope="dialog"][data-part="content"]').forEach(dlg => {
      dlg.querySelectorAll('span, p, div').forEach(e => {
        if (e.childElementCount === 0 && OUTCOME_RE.test(e.textContent.trim()) && !e.closest('[data-mdp-bar]')) e.setAttribute('data-mdp-hide', '');
      });
    });
    // 標題「戰報」後面的勝負、死亡標籤蓋住；不限定在 role=dialog 裡
    document.querySelectorAll('h2, h3, p, div, span').forEach(title => {
      if (title.childElementCount !== 0 || title.textContent.trim() !== '戰報' || title.closest('[data-mdp-bar]')) return;
      for (let s = title.nextElementSibling; s; s = s.nextElementSibling) {
        if (OUTCOME_RE.test(s.textContent.trim())) s.setAttribute('data-mdp-hide', '');   // 只蓋勝負／死亡標籤，不動其他內容
      }
    });
  }
  // 事件遭遇戰：事件結算視窗會直接寫「遭遇戰鬥！ (勝利／失敗／平手)」，逐行模式下一律改成不寫結果
  const ENC_RE = /^遭遇戰鬥！\s*[(（]\s*(勝利|失敗|平手)\s*[)）]$/;
  function maskEncounter() {
    if (cfg.mode !== 'step') {
      document.querySelectorAll('[data-mdp-enc]').forEach(e => e.removeAttribute('data-mdp-enc'));
      return;
    }
    ensureStyle();
    document.querySelectorAll('[role="dialog"] p, [role="dialog"] div').forEach(e => {
      if (e.childElementCount === 0 && !e.hasAttribute('data-mdp-enc') && ENC_RE.test(e.textContent.trim())) e.setAttribute('data-mdp-enc', '');
    });
  }
  // 讓其他腳本（戰報統計）知道正在逐行播放，播完前不要顯示勝負
  function announce(playing) {
    try {
      const de = document.documentElement;
      if (playing) { ensureStyle(); de.setAttribute('data-mdp-playing', '1'); }
      else de.removeAttribute('data-mdp-playing');
      de.removeAttribute('data-mdp-progress');
      window.dispatchEvent(new CustomEvent('mdp-playback', { detail: { playing: !!playing } }));
    } catch (e) {}
  }
  function showOutcome() {
    if (!guard) document.documentElement.removeAttribute('data-mdp-guard');
    document.querySelectorAll('[data-mdp-hide]').forEach(e => e.removeAttribute('data-mdp-hide'));
    document.querySelectorAll('[data-mdp-gone]').forEach(e => e.removeAttribute('data-mdp-gone'));
  }
  const hiding = () => guard || !!(cur && cur.playing);
  function armGuard() {
    if (cfg.mode !== 'step') return;
    guard = true; hideOutcome();
    document.documentElement.setAttribute('data-mdp-guard', '1');
    clearTimeout(guardTimer);
    guardTimer = setTimeout(() => { guard = false; document.documentElement.removeAttribute('data-mdp-guard'); if (!hiding()) showOutcome(); }, 45000);   // 保險：45 秒沒等到戰報就放掉
  }

  /* 戰鬥送出時就先蓋住結果：Boss 頁送出挑戰後，隊伍狀態可能比戰報視窗先更新 */
  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    const p = origFetch.apply(this, arguments);
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      const method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      const battlePost = method === 'POST' && (/\/api\/dungeon\/challenge(?:[?#]|$)/.test(url) || /\/api\/players\/[^/]+\/[^/?#]+(?:[?#]|$)/.test(url));
      if (battlePost) armGuard();
      // 順手把遊戲自己拿到的戰報資料記下來，用來算每一行的剩餘血量（不另外打 API）
      if (battlePost || (method === 'GET' && /\/api\/battle-reports\/\d+(?:[?#]|$)/.test(url))) {
        p.then(res => { if (res && res.ok) res.clone().json().then(remember).catch(() => {}); }).catch(() => {});
      }
    } catch (e) {}
    return p;
  };

  /* ---------- 找戰鬥過程 ---------- */
  // 每一行是一個 flex，裡面兩個 <p>：行號、內容
  const isRow = el => !!el && el.childElementCount === 2 && el.children[0].tagName === 'P' && el.children[1].tagName === 'P' && /^\d+$/.test(el.children[0].textContent.trim());
  function findLogBoxes() {
    const out = [];
    document.querySelectorAll('p').forEach(p => {
      if (p.textContent.trim() !== '1') return;
      const row = p.parentElement;
      if (!isRow(row) || row.firstElementChild !== p) return;
      const box = row.parentElement;
      if (box && box.firstElementChild === row) out.push(box);
    });
    return out;
  }
  const rowsOf = box => [...box.children].filter(isRow);
  // 一行的戰報文字（不含這支腳本加上去的血量標籤）
  const msgText = row => { let t = ''; row.children[1].childNodes.forEach(n => { if (!(n.nodeType === 1 && n.hasAttribute('data-mdp-hp'))) t += n.textContent; }); return t; };
  const sigOf = box => { const r = rowsOf(box); return r.length + '|' + (r[0] ? msgText(r[0]).slice(0, 40) : '') + '|' + (r.length ? msgText(r[r.length - 1]).slice(0, 40) : ''); };


  /* ---------- 剩餘血量 ---------- */
  const API = 'https://mydoujin-backend.onrender.com';
  const datasets = [];      // 最近拿到的戰報資料 { logs, participants, reportId }
  function findBattle(d, depth) {
    if (!d || typeof d !== 'object' || depth > 3) return null;
    if (Array.isArray(d.logs) && d.logs.some(l => l && typeof l === 'object')) return d;
    for (const k of Object.keys(d)) {
      const v = d[k];
      if (v && typeof v === 'object' && !Array.isArray(v)) { const r = findBattle(v, depth + 1); if (r) return r; }
    }
    return null;
  }
  function remember(d) {
    const b = findBattle(d, 0);
    if (!b) return;
    const rid = b.reportId != null ? String(b.reportId) : null;
    let ds = rid ? datasets.find(x => x.reportId === rid) : null;
    if (ds) { ds.logs = b.logs; if (b.participants) ds.participants = b.participants; }
    else {
      datasets.unshift({ logs: b.logs, participants: b.participants || null, reportId: rid });
      if (datasets.length > 6) datasets.pop();
    }
    schedule();
  }
  const shownLogs = logs => {
    const idx = [];
    logs.forEach((l, i) => { if (typeof l === 'string' || (l && (l.message ?? l.description) !== '')) idx.push(i); });
    return idx;
  };
  const logText = l => typeof l === 'string' ? l : (l.message ?? l.description ?? JSON.stringify(l));

  // 戰報資料要跟畫面上的行一一對得起來才用：行數一樣、頭中尾三行文字相同
  function matchDataset(rows) {
    const n = rows.length;
    for (const ds of datasets) {
      const idx = ds.idx || (ds.idx = shownLogs(ds.logs));
      if (idx.length !== n) continue;
      const ok = [0, n >> 1, n - 1].every(k => msgText(rows[k]).trim() === String(logText(ds.logs[idx[k]])).trim());
      if (ok) return ds;
    }
    return null;
  }

  /* 推算方式（用 20 場實際戰報驗證過，最後剩餘 HP 全部對得上）：
     - 起始血量＝滿血；造成傷害用 actualDamage（真正扣掉的血），反擊沒有 actualDamage 就用數值、扣到 0 為止
     - 治療、持續回復、文字裡的「回復了 N HP」加血，不超過上限；「失去了 N HP」扣血
     - 有戰報最後的「剩餘 HP」或「倒下了」就從結尾倒推回來校正。
       愛國者這種殘血後重生的 BOSS，重生之後改用倒推的數字 */
  function computeHp(ds) {
    const logs = ds.logs, P = ds.participants || {};
    const U = {};
    const unit = id => id ? (U[id] || (U[id] = { id, name: null, max: null, ev: [], anchor: null })) : null;
    (P.players || []).forEach(p => { const u = unit(p.userId || p.entityId || p._id); if (u) { u.name = p.characterName || p.name; u.max = Number(p.stats && p.stats.hp) || null; u.side = 'A'; } });
    (P.enemies || []).forEach(p => { const u = unit(p.userId || p.entityId || p._id); if (u) { u.name = p.characterName || p.name; u.max = Number(p.stats && p.stats.hp) || null; u.side = 'B'; } });
    const ev = (id, i, d, heal) => { const u = unit(id); if (u) u.ev.push({ i, d, heal: !!heal }); };
    logs.forEach((l, i) => {
      if (!l || typeof l !== 'object') return;
      const v = Number(l.value) || 0, msg = String(l.message || '');
      const real = l.actualDamage != null ? Number(l.actualDamage) || 0 : v;
      switch (l.type) {
        case 'DAMAGE': case 'BLOCK': ev(l.targetId, i, -real); break;
        case 'COUNTER': {
          if (l.value == null) break;
          // 有些反擊後面還會再記一筆 isCounter 的 DAMAGE，那筆才算
          let dup = false;
          for (let j = i + 1; j < Math.min(logs.length, i + 6); j++) {
            const x = logs[j];
            if (x && (x.type === 'DAMAGE' || x.type === 'BLOCK') && x.isCounter && (Number(x.value) === v || x.actorId === l.actorId)) { dup = true; break; }
          }
          if (!dup) ev(l.targetId, i, -real);
          break;
        }
        case 'LUCK_EVENT': ev(l.targetId, i, -v); break;
        case 'MISS': ev(l.targetId, i, 0); break;
        case 'BUFF_EFFECT':
          if (!v) break;
          if (l.buffType === 'HOT' || (/恢復|回復/.test(msg) && !/傷害|失去/.test(msg))) ev(l.actorId, i, v, true);
          else ev(l.actorId, i, -v);
          break;
        case 'HEAL': ev(l.targetId || l.actorId, i, v, true); break;
        case 'DEATH': {
          const u = unit(l.actorId);
          if (u) { u.anchor = { i, v: 0 }; if (!u.name) { const m = msg.match(/^(.+?)\s*倒下了/); if (m) u.name = m[1]; } }
          ev(l.actorId, i, 0);
          break;
        }
        case 'HP_REMAINING': {
          const u = unit(l.actorId);
          if (u) { u.anchor = { i, v }; if (l.maxHp) u.max = Number(l.maxHp); if (!u.name) { const m = msg.match(/^(.+?)\s*剩餘/); if (m) u.name = m[1]; } }
          break;
        }
        default: {
          if (!/TEXT|BUFF_APPLY/.test(String(l.type))) break;
          const mh = msg.match(/(?:恢復|回復)了\s*(\d+)\s*(?:HP|點生命)/);
          if (mh) ev(l.actorId, i, Number(mh[1]), true);
          const ml = msg.match(/失去了\s*(\d+)\s*(?:HP|點生命)/);
          if (ml) ev(l.actorId, i, -Number(ml[1]));
        }
      }
    });
    const out = {};   // 戰報第 i 筆 → [{ name, hp, max, side }]
    Object.values(U).forEach(u => {
      const E = u.ev.filter(e => !u.anchor || e.i <= u.anchor.i);
      if (!E.length) return;
      let F = null, B = null;
      if (u.max) { F = []; let h = u.max; E.forEach(e => { h = e.heal ? Math.min(u.max, h + e.d) : Math.max(0, h + e.d); F.push(h); }); }
      if (u.anchor) {
        B = new Array(E.length);
        let b = u.anchor.v;
        for (let k = E.length - 1; k >= 0; k--) { B[k] = b; b -= E[k].d; if (u.max) b = Math.min(u.max, b); b = Math.max(0, b); }
      }
      let V;
      if (!F) V = B;
      else if (!B) V = F;
      else if (Math.abs(F[F.length - 1] - u.anchor.v) <= 1) V = F;
      else {
        // 推算的結尾對不上：多半是殘血後重生。掉到 1 滴血之後、下一次真的扣血或補血之前照推算的，之後改用倒推的
        let r = F.findIndex(x => x <= 1);
        if (r >= 0) { while (r + 1 < E.length && E[r + 1].d === 0) r++; V = F.map((x, k) => k <= r ? x : B[k]); }
        else V = B;
      }
      if (!V) return;
      E.forEach((e, k) => { (out[e.i] = out[e.i] || []).push({ name: u.name || '？', hp: Math.round(V[k]), max: u.max, side: u.side }); });
    });
    return out;
  }

  const fmt = n => Number(n).toLocaleString('en-US');
  const hpColor = (hp, max) => { if (!max) return '#a0aec0'; const r = hp / max; return r > 0.5 ? '#68d391' : r > 0.25 ? '#f6e05e' : '#fc8181'; };
  function chipEl(list) {
    const wrap = document.createElement('span');
    wrap.setAttribute('data-mdp-hp', '');
    wrap.style.cssText = 'display:inline-flex;flex-wrap:wrap;gap:4px 10px;margin-left:8px;vertical-align:middle;font-size:11px;line-height:1.6;font-family:inherit;white-space:nowrap;';
    list.forEach(x => {
      const c = document.createElement('span');
      c.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:0 6px;border-radius:4px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);';
      const col = hpColor(x.hp, x.max);
      const pct = x.max ? Math.max(0, Math.min(100, x.hp / x.max * 100)) : 0;
      c.innerHTML = '<span style="color:#cbd5e0"></span>' +
        (x.max ? '<span style="display:inline-block;width:38px;height:5px;border-radius:3px;background:rgba(255,255,255,.15);overflow:hidden"><span style="display:block;height:100%;width:' + pct.toFixed(1) + '%;background:' + col + '"></span></span>' : '') +
        '<span style="color:' + col + ';font-weight:700"></span>' + (x.max ? '<span style="color:#718096"></span>' : '');
      c.children[0].textContent = x.name;
      const val = c.children[x.max ? 2 : 1];
      val.textContent = x.hp <= 0 ? '0' : fmt(x.hp);
      if (x.max) c.children[3].textContent = '/' + fmt(x.max);
      c.title = x.name + ' 剩餘 ' + fmt(x.hp) + (x.max ? ' / ' + fmt(x.max) + ' HP' : ' HP');
      wrap.appendChild(c);
    });
    return wrap;
  }
  const clearChips = box => { box.querySelectorAll('[data-mdp-hp]').forEach(e => e.remove()); };

  const hpState = new WeakMap();   // box → { sig, ds, withP }
  function requestReport(ds) {
    if (!ds.reportId || ds.fetching || ds.failed) return;
    let token = null;
    try { token = localStorage.getItem('token'); } catch (e) {}
    if (!token) { ds.failed = true; return; }
    ds.fetching = true;
    // 挑戰／切磋的回傳沒有角色血量上限時，讀一次這場的戰報補上（跟戰報頁讀的是同一份）
    origFetch.call(window, API + '/api/battle-reports/' + ds.reportId, { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(j => { if (j && j.participants) ds.participants = j.participants; else ds.failed = true; })
      .catch(() => { ds.failed = true; })
      .finally(() => { ds.fetching = false; schedule(); });
  }
  function ensureHp(box) {
    if (!cfg.hp) { if (hpState.has(box)) { clearChips(box); hpState.delete(box); } return; }
    const rows = rowsOf(box);
    if (!rows.length) return;
    const sig = sigOf(box);
    const st = hpState.get(box);
    // 已經畫好、而且沒有新的血量上限資料進來 → 不用重畫
    if (st && st.sig === sig && (st.withP || !st.ds.participants)) return;
    const ds = matchDataset(rows);
    if (!ds) return;            // 資料還沒到，下一輪再試
    const res = computeHp(ds);
    clearChips(box);
    rows.forEach((row, k) => { const list = res[ds.idx[k]]; if (list && list.length) row.children[1].appendChild(chipEl(list)); });
    hpState.set(box, { sig, ds, withP: !!ds.participants });
    if (!ds.participants) requestReport(ds);
  }

  /* ---------- 播放 ---------- */
  let cur = null;            // { box, rows, idx, playing, timer, bar, sig }
  const seen = new WeakMap(); // box → sig，同一份戰報不重播

  const setReveal = on => { try { if (on) document.documentElement.setAttribute('data-mdp-reveal', '1'); else document.documentElement.removeAttribute('data-mdp-reveal'); } catch (e) {} };
  function startPlayback(box) {
    stopPlayback(false);
    setReveal(false);
    const rows = rowsOf(box);
    if (!rows.length) return;
    cur = { box, rows, idx: 0, playing: true, timer: null, bar: null, sig: sigOf(box) };
    seen.set(box, cur.sig);
    rows.forEach(r => { r.style.display = 'none'; });
    hideOutcome();
    announce(true);
    cur.bar = makeBar(box);
    step();
  }

  function step() {
    if (!cur || !cur.playing) return;
    if (!cur.box.isConnected) { stopPlayback(false); return; }
    const r = cur.rows[cur.idx];
    if (r) {
      r.style.display = '';
      if (cfg.follow !== false) { try { r.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
    }
    cur.idx++;
    updateBar();
    if (cur.idx >= cur.rows.length) { finish(); return; }
    cur.timer = setTimeout(step, clampSec(cfg.sec) * 1000);
  }

  function finish() {
    if (!cur) return;
    clearTimeout(cur.timer);
    cur.rows.forEach(r => { r.style.display = ''; });
    cur.idx = cur.rows.length;
    cur.playing = false;
    guard = false; clearTimeout(guardTimer);
    setReveal(true);
    showOutcome();
    announce(false);
    updateBar();
  }

  function stopPlayback(reveal) {
    if (!cur) return;
    clearTimeout(cur.timer);
    if (reveal !== false || !cur.box.isConnected) cur.rows.forEach(r => { r.style.display = ''; });
    if (cur.bar) cur.bar.remove();
    cur = null;
    if (!guard) showOutcome();
    announce(false);
  }

  function replay() {
    if (!cur) return;
    clearTimeout(cur.timer);
    cur.rows = rowsOf(cur.box);
    cur.rows.forEach(r => { r.style.display = 'none'; });
    cur.idx = 0; cur.playing = true;
    setReveal(false);
    hideOutcome();
    announce(true);
    updateBar();
    step();
  }

  /* 戰鬥過程上方的小控制列 */
  const BAR_CSS = `
  :host { all: initial; display: block; margin: 4px 0 6px; }
  * { box-sizing: border-box; font-family: "Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif; }
  .b { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 5px 8px; border: 1px solid rgba(79,209,197,.4);
    border-radius: 6px; background: rgba(79,209,197,.08); color: #b2f5ea; font-size: 13px; }
  .b .sp { flex: 1; }
  button { font: inherit; font-size: 12px; color: #fff; background: #2c7a7b; border: 1px solid #4FD1C5; border-radius: 5px; padding: 3px 10px; cursor: pointer; }
  button:hover { background: #319795; }
  .dim { color: #a0aec0; }
  `;
  function makeBar(box) {
    const host = document.createElement('div');
    host.setAttribute('data-mdp-bar', '');
    const sr = host.attachShadow({ mode: 'open' });
    sr.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      if (b.dataset.a === 'skip') finish();
      else if (b.dataset.a === 'replay') replay();
    });
    box.parentElement.insertBefore(host, box);
    host.__sr = sr;
    return host;
  }
  function updateBar() {
    if (!cur || !cur.bar) return;
    const n = cur.rows.length;
    cur.bar.__sr.innerHTML = `<style>${BAR_CSS}</style><div class="b">` + (cur.playing
      ? `<span>▶ 播放中・第 ${Math.min(cur.idx, n)} 行</span><span class="dim">每行 ${clampSec(cfg.sec)} 秒</span><span class="sp"></span><button data-a="skip">跳過，直接看結果</button>`
      : `<span>✔ 播放完畢（共 ${n} 行）</span><span class="sp"></span><button data-a="replay">重播</button>`) + `</div>`;
  }

  /* 有新的戰鬥過程出現就開始播 */
  function scan() {
    try { maskEncounter(); } catch (e) {}
    try {
      ensureStyle();
      document.documentElement.classList.toggle('mdp-step', cfg.mode === 'step');
      // 標記「戰報」視窗（標題文字是「戰報」），CSS 只蓋這種視窗的標籤
      document.querySelectorAll('[role="dialog"] h2, [role="alertdialog"] h2, [data-part="title"]').forEach(t => {
        if (t.textContent.trim() !== '戰報') return;
        const d = t.closest('[role="dialog"], [role="alertdialog"], [data-scope="dialog"][data-part="content"]') || (t.matches('[data-part="title"]') ? t.parentElement : null);
        if (d && !d.hasAttribute('data-mdp-report')) d.setAttribute('data-mdp-report', '');
      });
      // 戰報視窗都關了：下一次打開的視窗要重新蓋住
      if (!cur && !findLogBoxes().length) setReveal(false);
    } catch (e) {}
    if (!routeOk()) { if (cur) stopPlayback(true); guard = false; document.documentElement.removeAttribute('data-mdp-guard'); return; }
    if (cur && !cur.box.isConnected) stopPlayback(false);
    if (cur && cur.box.isConnected && cur.playing) {
      const s = sigOf(cur.box);
      if (s !== cur.sig) startPlayback(cur.box);      // 同一個視窗換成另一場
    }
    const boxes = findLogBoxes().filter(b => !homePage() || b.closest('[role="dialog"]'));
    boxes.forEach(box => { try { ensureHp(box); } catch (e) {} });
    boxes.forEach(box => {
      if (cur && cur.box === box) return;
      const s = sigOf(box);
      if (seen.get(box) === s) return;
      seen.set(box, s);
      if (cfg.mode === 'step') startPlayback(box);
      else { guard = false; showOutcome(); }
    });
    if (hiding()) hideOutcome();
    mountSettings();
  }

  /* ---------- 設定按鈕 ---------- */
  const SET_CSS = `
  :host { all: initial; display: inline-block; vertical-align: middle; }
  * { box-sizing: border-box; font-family: "Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif; }
  .open { font-size: 12px; font-weight: 600; color: #fff; background: #2c7a7b; border: 1px solid #4FD1C5; border-radius: 4px;
    padding: 3px 9px; cursor: pointer; white-space: nowrap; }
  .open:hover { background: #319795; }
  .pop { position: fixed; z-index: 2147483000; width: 260px; padding: 10px 12px; background: #1a1f2e; color: #e2e8f0;
    border: 1px solid rgba(255,255,255,.15); border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,.6); font-size: 13px; }
  .pop h4 { margin: 0 0 8px; font-size: 13px; color: #81e6d9; }
  .seg { display: flex; gap: 4px; margin-bottom: 10px; }
  .seg button { flex: 1; font: inherit; font-size: 12px; padding: 6px 4px; border-radius: 5px; cursor: pointer;
    color: #cbd5e0; background: #2d3748; border: 1px solid #4a5568; }
  .seg button.on { color: #fff; background: #2c7a7b; border-color: #4FD1C5; font-weight: 700; }
  .row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
  .row input[type=number] { width: 70px; font: inherit; color: #fff; background: #171923; border: 1px solid #4a5568; border-radius: 5px; padding: 4px 6px; }
  .row input[type=checkbox] { accent-color: #4FD1C5; }
  .hint { color: #718096; font-size: 11px; line-height: 1.5; }
  .row.off { opacity: .4; }
  `;
  const hosts = new Map();   // 位置 → host
  let popOpen = false;

  function renderSettings(sr) {
    const step = cfg.mode === 'step';
    sr.innerHTML = `<style>${SET_CSS}</style><button class="open" data-a="toggle">⚙ 戰報播放</button>` + (popOpen ? `
      <div class="pop" id="pop"><h4>戰報播放設定</h4>
        <div class="seg"><button data-a="mode" data-v="step" class="${step ? 'on' : ''}">一行一行播放</button>
          <button data-a="mode" data-v="instant" class="${step ? '' : 'on'}">直接顯示結果</button></div>
        <div class="row${step ? '' : ' off'}"><label>每行間隔</label><input id="sec" type="number" min="0.05" max="10" step="0.1" value="${cfg.sec}"${step ? '' : ' disabled'}><span>秒</span></div>
        <div class="row${step ? '' : ' off'}"><input id="follow" type="checkbox"${cfg.follow !== false ? ' checked' : ''}${step ? '' : ' disabled'}><label for="follow">自動捲到最新一行</label></div>
        <div class="row"><input id="hp" type="checkbox"${cfg.hp !== false ? ' checked' : ''}><label for="hp">每一行顯示被打／被補的人剩餘血量</label></div>
        <div class="hint">播放時「勝利／失敗／平手」「死亡」標籤、頂端死亡橫幅、隊伍成員存活狀態、事件視窗的「遭遇戰鬥！(結果)」都會先蓋住，最後一行出現才揭曉；戰報統計面板的勝負標籤也會等播完才出現。</div>
      </div>` : '');
    if (popOpen) placePop(sr);
  }
  function placePop(sr) {
    const btn = sr.querySelector('.open'), pop = sr.getElementById('pop');
    if (!btn || !pop) return;
    const r = btn.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
    const w = Math.min(260, vw - 16);
    pop.style.width = w + 'px';
    pop.style.left = Math.min(Math.max(8, r.right - w), vw - w - 8) + 'px';
    const below = vh - r.bottom;
    if (below < 200 && r.top > below) { pop.style.top = 'auto'; pop.style.bottom = (vh - r.top + 6) + 'px'; }
    else { pop.style.bottom = 'auto'; pop.style.top = (r.bottom + 6) + 'px'; }
  }
  function rerenderAll() { hosts.forEach(h => { if (h.isConnected) renderSettings(h.__sr); }); }

  function makeSettings(extraCss) {
    const host = document.createElement('span');
    host.setAttribute('data-mdp-set', '');
    if (extraCss) host.style.cssText = extraCss;
    const sr = host.attachShadow({ mode: 'open' });
    host.__sr = sr;
    sr.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      e.stopPropagation();
      if (b.dataset.a === 'toggle') { popOpen = !popOpen; rerenderAll(); }
      else if (b.dataset.a === 'mode') {
        cfg.mode = b.dataset.v; save(); rerenderAll();
        if (cfg.mode === 'instant' && cur && cur.playing) finish();     // 正在播的直接揭曉
      }
    });
    sr.addEventListener('change', e => {
      const t = e.target;
      if (t.id === 'sec') { cfg.sec = clampSec(t.value); t.value = cfg.sec; save(); updateBar(); }
      if (t.id === 'follow') { cfg.follow = t.checked; save(); }
      if (t.id === 'hp') { cfg.hp = t.checked; save(); findLogBoxes().forEach(b => { hpState.delete(b); if (!cfg.hp) clearChips(b); }); schedule(); }
    });
    renderSettings(sr);
    return host;
  }

  function mountAt(key, find, place, css) {
    const old = hosts.get(key);
    if (old && old.isConnected) return;
    const target = find();
    if (!target) return;
    const h = makeSettings(css);
    place(target, h);
    hosts.set(key, h);
  }

  function mountSettings() {
    const p = location.pathname;
    if (/^\/reports\/[^/]+\/?$/.test(p)) {
      // 戰報頁：放在「戰鬥過程」標題旁邊
      mountAt('report', () => [...document.querySelectorAll('h2')].find(h => h.textContent.replace(/⚙.*$/, '').trim() === '戰鬥過程' && !h.querySelector('[data-mdp-set]')) || null,
        (h, host) => { h.style.display = 'flex'; h.style.alignItems = 'center'; h.style.gap = '10px'; h.appendChild(host); });
    } else if (/^\/boss\/?$/.test(p)) {
      // Boss 頁：隊伍代碼那一列的最右邊；還沒有隊伍時放在「隊伍 刷新」那一列
      mountAt('boss', () => {
        const code = [...document.querySelectorAll('p')].find(e => e.textContent.trim().startsWith('隊伍代碼：'));
        if (code) return code.parentElement;
        const h = [...document.querySelectorAll('h2')].find(e => e.textContent.trim() === '隊伍');
        return h ? h.parentElement : null;
      }, (row, host) => row.appendChild(host), 'margin-left:auto;');
    } else if (/^\/players\/[^/]+\/?$/.test(p)) {
      // 玩家頁：放在「友好切磋」「我要茶渡你」上面，兩顆按鈕往下推
      mountAt('duel', () => {
        const b = [...document.querySelectorAll('button')].find(x => /^(友好切磋|切磋中)/.test(x.textContent.trim()));
        return b && b.parentElement && b.parentElement.parentElement ? b.parentElement.parentElement : null;
      }, (col, host) => col.parentElement.insertBefore(host, col), 'display:block;margin-top:24px;');
    }
  }

  // 點到設定視窗外面就收起來
  document.addEventListener('click', e => {
    if (!popOpen) return;
    const path = e.composedPath ? e.composedPath() : [];
    if (![...hosts.values()].some(h => path.includes(h))) { popOpen = false; rerenderAll(); }
  }, true);
  window.addEventListener('resize', () => { if (popOpen) hosts.forEach(h => h.isConnected && placePop(h.__sr)); });

  /* ---------- 啟動：DOM 一變就檢查（在畫面畫出來之前就把行藏好） ---------- */
  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; try { scan(); } catch (e) {} });
  }
  const mo = new MutationObserver(schedule);
  function start() {
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setInterval(() => { try { scan(); } catch (e) {} }, 500);
    scan();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
} }),
    Object.assign({"id": "cooldown", "icon": "⏱️", "name": "Boss 冷卻倒數", "desc": "Boss 頁「還有 N 分鐘」改成每秒跳動的「還有 M 分 SS 秒」。", "feats": ["同場打的人用戰報時間＋30 分鐘，一進頁面就準到秒", "別場打的隊友在分鐘跳號時補查校正（每段冷卻最多 8 次）", "冷卻結束顯示「已結束 ✅」並自動按「刷新」（可點「⟳ 自動刷新」開關）"], "ver": "1.0.0", "at": "start"}, { run: function () {
// ===== Boss 冷卻倒數 1.0.0（mydoujin_Boss冷卻倒數.user.js）=====
(function () {
  'use strict';

  const COOLDOWN_MS = 30 * 60 * 1000;   // Boss 冷卻 30 分鐘（伺服器顯示為無條件進位的分鐘數）
  const MIN = 60000;
  const EXACT_W = 2000;                 // 誤差 ≤ 2 秒視為精準
  const MAX_PROBES = 8;                 // 每段冷卻最多自行查詢幾次來校正秒數
  const STORE = 'mdbc:v1';
  const CD_RE = /^(.*?)的\s*Boss\s*挑戰冷卻中，還有\s*(\d+)\s*(分鐘|秒)/;

  let apiBase = 'https://mydoujin-backend.onrender.com';
  let offset = 0;                       // 伺服器時間 − 本機時間
  let state = null;                     // 最新的 /api/dungeon/party 回應
  let me = null;                        // { id, nickname }
  const anchorTried = new Set();

  /* ---------- 冷卻結束時間：以區間 [lo, hi] 逐步收斂（本機時鐘） ---------- */
  let cds = {};
  try { cds = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { cds = {}; }
  const save = () => {
    const now = Date.now();
    for (const k of Object.keys(cds)) if (cds[k].hi < now - 10 * MIN) delete cds[k];
    try { localStorage.setItem(STORE, JSON.stringify(cds)); } catch (e) { /* 無痕模式等 */ }
  };

  // 在 [tSend, tRecv] 之間伺服器說「還有 m 分鐘」（無條件進位）→ end ∈ (tSend+(m-1)分, tRecv+m分]
  function observe(key, m, unit, tSend, tRecv) {
    let lo, hi;
    if (unit === '秒') { lo = tSend + (m - 1) * 1000; hi = tRecv + m * 1000; }
    else { lo = tSend + (m - 1) * MIN; hi = tRecv + m * MIN; }
    const c = cds[key];
    if (c && c.lo <= hi + 1000 && lo <= c.hi + 1000) {
      c.lo = Math.max(c.lo, lo); c.hi = Math.min(c.hi, hi);
      if (c.lo > c.hi) { const mid = (c.lo + c.hi) / 2; c.lo = c.hi = mid; }
    } else {
      cds[key] = { lo, hi, probes: 0, src: 'obs', id: tRecv };   // 新的一段冷卻
    }
  }

  function clearDone(keysInBlockers, tSend) {
    // 伺服器已不再列出的人 → 冷卻已結束
    for (const k of Object.keys(cds)) {
      if (!keysInBlockers.has(k) && cds[k].hi > tSend && cds[k].lo < tSend + 20 * MIN) {
        cds[k].hi = Math.min(cds[k].hi, tSend); cds[k].lo = Math.min(cds[k].lo, cds[k].hi);
      }
    }
  }

  const keyOf = name => {
    const mem = state?.party?.members?.find(x => x.nickname === name);
    if (mem) return mem.userId;
    if (me && (me.nickname === name || !name)) return me.id;
    return 'name:' + name;
  };

  /* ---------- 攔截遊戲自己的請求（不額外增加流量） ---------- */
  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const tSend = Date.now();
    const p = origFetch.apply(this, arguments);
    if (/\/api\/(dungeon\/(party|boss)|action\/status|users\/me)(\/|\?|$)/.test(url)) {
      p.then(res => {
        const tRecv = Date.now();
        res.clone().json().then(j => onApi(url, j, tSend, tRecv)).catch(() => {});
      }).catch(() => {});
    }
    return p;
  };

  function onApi(url, j, tSend, tRecv) {
    if (!j || typeof j !== 'object') return;
    const b = url.match(/^(https?:\/\/[^/]+)\/api\//); if (b) apiBase = b[1];
    const st = j.floorSelect?.serverTime || j.serverTime;
    if (st) {
      const s = Date.parse(st);
      if (!isNaN(s)) offset = s - (tSend + tRecv) / 2;
    }
    if (/\/users\/me/.test(url) && j.id) me = { id: j.id, nickname: j.nickname };
    if (Array.isArray(j.blockers)) onParty(j, tSend, tRecv);
  }

  function onParty(j, tSend, tRecv) {
    state = j;
    if (j.viewerId && !me) me = { id: j.viewerId, nickname: j.party?.members?.find(x => x.userId === j.viewerId)?.nickname };
    const seen = new Set();
    for (const line of j.blockers) {
      const m = String(line).match(CD_RE);
      if (!m) continue;
      const k = keyOf(m[1].trim());
      seen.add(k);
      observe(k, +m[2], m[3], tSend, tRecv);
    }
    clearDone(seen, tSend);
    save();
    if (seen.size) tryAnchor([...seen]);
    render();
  }

  /* ---------- 精準校正 1：用戰報建立時間 + 30 分鐘 ---------- */
  async function tryAnchor(keys) {
    const need = keys.filter(k => !k.startsWith('name:') && cds[k] && cds[k].hi - cds[k].lo > EXACT_W && !anchorTried.has(k + '@' + cds[k].id));
    if (!need.length) return;
    need.forEach(k => anchorTried.add(k + '@' + cds[k].id));
    try {
      const r = await origFetch(apiBase + '/api/battle-reports?category=PVE&limit=10', { headers: auth() });
      const list = await r.json();
      if (!Array.isArray(list)) return;
      for (const k of need) {
        const rep = list.filter(x => x.battleType === 'BOSS' && (x.outcomes || []).some(o => o.userId === k))
          .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
        if (!rep) continue;
        const end = Date.parse(rep.createdAt) - offset + COOLDOWN_MS;
        const c = cds[k];
        if (c && end >= c.lo - 1500 && end <= c.hi + 1500) {   // 跟伺服器顯示的分鐘數吻合才採用
          c.lo = c.hi = end; c.src = 'report';
        }
      }
      save(); render();
    } catch (e) { /* 失敗就用分鐘區間 */ }
  }

  /* ---------- 精準校正 2：在「分鐘跳號」的時間點自己查一次隊伍，二分法夾出秒數 ---------- */
  let probeTimer = null;
  function scheduleProbe() {
    if (probeTimer || !onBoss() || document.hidden) return;
    const now = Date.now();
    let best = null;
    for (const [k, c] of Object.entries(cds)) {
      if (c.hi - c.lo <= EXACT_W || c.hi <= now + 5000 || (c.probes || 0) >= MAX_PROBES) continue;
      const mid = (c.lo + c.hi) / 2;
      const kk = Math.floor((mid - now - 1000) / MIN);
      if (kk < 0) continue;
      const at = mid - kk * MIN;
      if (!best || at < best.at) best = { k, at };
    }
    if (!best) return;
    probeTimer = setTimeout(async () => {
      probeTimer = null;
      const c = cds[best.k];
      if (!c || !onBoss()) return;
      c.probes = (c.probes || 0) + 1;
      try { await window.fetch(apiBase + '/api/dungeon/party', { headers: auth() }); } catch (e) { /* ignore */ }
      scheduleProbe();
    }, Math.max(0, best.at - now));
  }

  const auth = () => {
    const t = localStorage.getItem('token');
    return t ? { Authorization: 'Bearer ' + t } : {};
  };
  const onBoss = () => /^\/boss\/?$/.test(location.pathname);

  /* ---------- 畫面 ---------- */
  const fmt = ms => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(s / 60);
    return (m ? m + ' 分 ' : '') + String(s % 60).padStart(m ? 2 : 1, '0') + ' 秒';
  };

  function ensureStyle() {
    if (document.getElementById('mdbc-style')) return;
    const st = document.createElement('style');
    st.id = 'mdbc-style';
    st.textContent = `
      [data-mdbc]{font-size:0 !important}
      [data-mdbc] > .mdbc{font-size:var(--mdbc-fs,14px);font-variant-numeric:tabular-nums}
      [data-mdbc] > .mdbc b{color:#fbd38d}
      [data-mdbc] > .mdbc .ok{color:#68d391;font-weight:bold}
      [data-mdbc] > .mdbc .apx{opacity:.6;font-size:.85em;margin-left:4px}
      [data-mdbc] > .mdbc .tg{margin-left:10px;font-size:.8em;color:#a0aec0;cursor:pointer;text-decoration:underline dotted;white-space:nowrap}`;
    (document.head || document.documentElement).appendChild(st);
  }

  let lastAuto = 0, autoCount = 0;
  function render() {
    if (!document.body || !onBoss()) return;
    ensureStyle();
    const now = Date.now();
    let anyDone = false;
    const xp = document.evaluate("//*[contains(text(),'挑戰冷卻中')]", document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    let first = true;
    for (let i = 0; i < xp.snapshotLength; i++) {
      const el = xp.snapshotItem(i);
      if (el.closest('.mdbc') || el.closest('script,style')) continue;
      const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue).join('').trim();
      const m = own.match(CD_RE);
      if (!m) continue;
      const name = m[1].trim();
      const c = cds[keyOf(name)];
      if (el.dataset.mdbc == null) {
        el.style.setProperty('--mdbc-fs', getComputedStyle(el).fontSize);
        el.dataset.mdbc = '';
      }
      let span = el.querySelector(':scope > .mdbc');
      if (!span) { span = document.createElement('span'); span.className = 'mdbc'; el.appendChild(span); }
      let html;
      if (!c) html = `${esc(name)}的 Boss 挑戰冷卻中，還有 <b>${m[2]} ${m[3]}</b>。`;
      else {
        const w = c.hi - c.lo;
        const left = (w > EXACT_W ? (c.lo + c.hi) / 2 : c.hi) - now;   // 校正中先顯示區間中點
        if (c.hi - now <= 0) { html = `${esc(name)}的 Boss 冷卻 <span class="ok">已結束 ✅</span>`; anyDone = true; }
        else if (left <= 0) html = `${esc(name)}的 Boss 冷卻 <b>即將結束…</b>`;
        else {
          const apx = w > EXACT_W ? `<span class="apx">（校正中 ±${Math.ceil(w / 2000)} 秒）</span>` : '';
          html = `${esc(name)}的 Boss 挑戰冷卻中，還有 <b>${fmt(left)}</b>。${apx}`;
        }
      }
      if (first) {
        html += `<a class="tg" data-mdbc-tg title="冷卻結束時自動按「刷新」，讓「開始挑戰」按鈕解鎖">⟳ 自動刷新：${autoRefreshOn() ? '開' : '關'}</a>`;
        first = false;
      }
      if (span.innerHTML !== html) span.innerHTML = html;
    }
    if (anyDone && autoRefreshOn() && onBoss()) autoRefresh(now);
    scheduleProbe();
  }

  const autoRefreshOn = () => { try { return localStorage.getItem('mdbc:auto') !== '0'; } catch (e) { return true; } };
  function autoRefresh(now) {
    if (now - lastAuto < 15000) return;
    if (now - lastAuto > 5 * MIN) autoCount = 0;
    if (autoCount >= 3) return;                                  // 避免一直按
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '刷新' && !b.disabled);
    if (!btn) return;
    lastAuto = now; autoCount++;
    setTimeout(() => btn.click(), 1500);                          // 多等 1.5 秒，避免比伺服器早
  }

  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  document.addEventListener('click', e => {
    if (!e.target.closest || !e.target.closest('[data-mdbc-tg]')) return;
    e.preventDefault(); e.stopPropagation();
    try { localStorage.setItem('mdbc:auto', autoRefreshOn() ? '0' : '1'); } catch (err) { /* ignore */ }
    render();
  }, true);

  setInterval(render, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  const mo = new MutationObserver(() => { if (!render.q) { render.q = 1; requestAnimationFrame(() => { render.q = 0; render(); }); } });
  const start = () => mo.observe(document.body || document.documentElement, { childList: true, subtree: true, characterData: true });
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
} }),
    Object.assign({"id": "finder", "icon": "🔎", "name": "角色查詢", "desc": "玩家列表與「選擇助戰」裡，依角色和等級查出誰在用。", "feats": ["玩家列表：掃描全部玩家後依角色、關鍵字篩選，點暱稱進玩家頁", "選擇助戰：掃描可借名單，顯示等級、樓層與九項能力值，一鍵「帶入」搜尋", "Lv 最低～最高篩選；角色標籤人數跟著等級範圍變", "只有按「掃描」才讀資料，結果存在本機"], "ver": "1.1.0", "at": "idle"}, { run: function () {
// ===== 角色查詢 1.1.0（mydoujin_角色查詢.user.js）=====
(function () {
  'use strict';

  const API = 'https://mydoujin-backend.onrender.com';
  const P_KEY = 'mdcf:players';          // 玩家列表掃描結果（localStorage）
  const A_KEY = 'mdcf:assist';           // 助戰名單掃描結果（sessionStorage，依樓層區間）
  const P_FRESH = 30 * 60 * 1000;        // 玩家列表 30 分鐘內算新
  const A_FRESH = 3 * 60 * 1000;         // 助戰名單 3 分鐘內算新
  const SHOW_MAX = 200;

  /* ---------- 小工具 ---------- */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ago = t => {
    const m = Math.floor((Date.now() - t) / 60000);
    if (m < 1) return '剛剛';
    if (m < 60) return m + ' 分鐘前';
    const h = Math.floor(m / 60);
    return h < 24 ? h + ' 小時前' : Math.floor(h / 24) + ' 天前';
  };
  const ls = {
    get(store, k) { try { return JSON.parse(store.getItem(k) || 'null'); } catch (e) { return null; } },
    set(store, k, v) { try { store.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };

  async function api(path) {
    const tok = localStorage.getItem('token');
    if (!tok) throw new Error('請先登入遊戲');
    for (let i = 0; i < 3; i++) {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 25000);
      let r;
      try { r = await fetch(API + path, { headers: { Authorization: 'Bearer ' + tok }, signal: ctl.signal }); }
      catch (e) { clearTimeout(timer); if (i === 2) throw new Error('連線逾時，請稍後再試'); await sleep(1500); continue; }
      clearTimeout(timer);
      if (r.status === 429) { await sleep(3000 * (i + 1)); continue; }
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || ('讀取失敗（' + r.status + '）'));
      return d;
    }
    throw new Error('伺服器忙碌，請稍後再試');
  }

  /* ---------- 資料：玩家列表（全部玩家） ---------- */
  const slimP = p => ({
    id: p.id, nick: p.nickname || '', lv: p.level, ch: p.characterName || '', ti: p.characterTitle || '',
    img: p.imagePath || '', fl: p.floor, hf: p.highestFloor, dead: !!p.isDead,
  });
  let pScan = null; // 進行中的掃描
  function scanPlayers(onProg) {
    if (pScan) return pScan;
    pScan = (async () => {
      const q = p => `/api/players?page=${p}&limit=50&sort=level&order=desc`;
      const first = await api(q(1));
      const total = (first.pagination && first.pagination.totalPages) || 1;
      const pages = { 1: first.players || [] };
      let done = 1; onProg && onProg(done, total);
      const todo = []; for (let p = 2; p <= total; p++) todo.push(p);
      // 一次最多 2 個請求、每個之間稍微停一下，不要對伺服器灌請求
      const worker = async () => {
        while (todo.length) {
          const p = todo.shift();
          const d = await api(q(p));
          pages[p] = d.players || [];
          done++; onProg && onProg(done, total);
          await sleep(250);
        }
      };
      await Promise.all([worker(), worker()]);
      const seen = new Set(), list = [];
      for (let p = 1; p <= total; p++) (pages[p] || []).forEach(x => { if (!seen.has(x.id)) { seen.add(x.id); list.push(slimP(x)); } });
      const data = { t: Date.now(), list };
      ls.set(localStorage, P_KEY, data);
      return data;
    })().finally(() => { pScan = null; });
    return pScan;
  }

  /* ---------- 資料：助戰名單（同樓層區間） ---------- */
  const slimA = c => {
    const ch = c.character || {};
    return {
      cid: c.characterId, uid: c.userId, nick: c.nickname || '', fl: c.floor,
      ch: ch.name || '', ti: ch.title || '', lv: ch.level, img: ch.imagePath || '', st: ch.stats || {},
    };
  };
  let aScan = null;
  function scanAssist(onProg) {
    if (aScan) return aScan;
    aScan = (async () => {
      const list = [], seen = new Set();
      let page = 1, range = null;
      while (page <= 40) {
        const d = await api('/api/dungeon/party/assist/candidates?page=' + page);
        range = d.floorRange || range;
        (d.candidates || []).forEach(c => { if (!seen.has(c.characterId)) { seen.add(c.characterId); list.push(slimA(c)); } });
        onProg && onProg(page, d.hasNextPage);
        if (!d.hasNextPage) break;
        page++;
        await sleep(250);
      }
      const data = { t: Date.now(), range, list };
      const all = ls.get(sessionStorage, A_KEY) || {};
      all[rangeKey(range)] = data;
      ls.set(sessionStorage, A_KEY, all);
      return data;
    })().finally(() => { aScan = null; });
    return aScan;
  }
  const rangeKey = r => r ? r[0] + '-' + (r[1] == null ? '' : r[1]) : '?';
  const rangeTxt = r => !r ? '' : r[1] == null ? `${r[0]} 樓以上` : `${r[0]}～${r[1]} 樓`;

  /* ---------- 樣式 ---------- */
  const CSS = `
  :host { all: initial; display: block; }
  * { box-sizing: border-box; }
  .box { margin: 10px 0 12px; background: #171c27; color: rgba(255,255,255,.88); border: 1px solid #2c7a7b; border-radius: 10px;
    font: 14px/1.5 "Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif; overflow: hidden; text-align: left; }
  .hd { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: linear-gradient(180deg,#1f2636,#191f2c);
    border-bottom: 1px solid #2d3748; cursor: pointer; user-select: none; flex-wrap: wrap; }
  .box.col .hd { border-bottom: none; }
  .ttl { font-weight: 700; color: #fff; white-space: nowrap; }
  .ttl small { color: #8b98ad; font-weight: 400; font-size: 12px; margin-left: 4px; }
  .meta { color: #8b98ad; font-size: 12px; margin-left: auto; }
  .tg { color: #4FD1C5; font-size: 12px; }
  .bd { padding: 10px 12px 12px; }
  .row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  select, input, button { font: inherit; font-size: 13px; color: #e2e8f0; background: #121722; border: 1px solid #3a4558; border-radius: 6px; padding: 6px 9px; }
  select { min-width: 150px; flex: 1 1 160px; max-width: 260px; }
  input { flex: 1 1 140px; min-width: 0; }
  select:focus, input:focus { outline: none; border-color: #4FD1C5; }
  button { background: #263042; cursor: pointer; white-space: nowrap; }
  button:hover { background: #33405a; }
  button:disabled { opacity: .5; cursor: default; }
  button.pri { background: #2c7a7b; border-color: #2c7a7b; color: #fff; font-weight: 700; }
  button.pri:hover { background: #319795; }
  .st { margin-top: 8px; font-size: 12.5px; color: #8b98ad; }
  .st.err { color: #f6878b; }
  .prog { height: 4px; background: rgba(79,209,197,.13); border-radius: 2px; overflow: hidden; margin-top: 6px; }
  .prog i { display: block; height: 100%; background: linear-gradient(90deg,#2c7a7b,#4FD1C5); transition: width .2s; }
  .chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 9px; }
  .chip { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px 3px 4px; border: 1px solid #3a4558; border-radius: 999px;
    background: #1f2636; cursor: pointer; font-size: 12.5px; color: #cbd5e0; }
  .chip:hover { border-color: #4FD1C5; color: #fff; }
  .chip img { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; background: #121722; }
  .chip b { color: #4FD1C5; font-variant-numeric: tabular-nums; }
  .list { margin-top: 9px; max-height: 460px; overflow: auto; border: 1px solid #2d3748; border-radius: 8px; overscroll-behavior: contain; }
  .it { display: flex; gap: 9px; align-items: center; padding: 7px 9px; border-top: 1px solid #232b3a; }
  .it:first-child { border-top: none; }
  .it:hover { background: rgba(79,209,197,.05); }
  .av { width: 38px; height: 38px; border-radius: 8px; object-fit: cover; background: #121722; flex: none; }
  .mn { flex: 1; min-width: 0; }
  .l1 { display: flex; gap: 6px; align-items: baseline; flex-wrap: wrap; }
  .nk { color: #fff; font-weight: 700; text-decoration: none; overflow-wrap: anywhere; }
  a.nk:hover { color: #4FD1C5; text-decoration: underline; }
  .lv { color: #f6e05e; font-size: 12.5px; font-variant-numeric: tabular-nums; }
  .fl { color: #90cdf4; font-size: 12.5px; font-variant-numeric: tabular-nums; }
  .dead { font-size: 11px; color: #f6878b; border: 1px solid #f6878b; border-radius: 999px; padding: 0 6px; }
  .l2 { color: #a0aec0; font-size: 12.5px; }
  .sts { display: flex; flex-wrap: wrap; gap: 2px 9px; margin-top: 2px; font-size: 11.5px; color: #8b98ad; }
  .sts span b { color: #e2e8f0; font-weight: 600; margin-left: 2px; font-variant-numeric: tabular-nums; }
  .act { flex: none; }
  input.lvin { flex: 0 0 64px; width: 64px; text-align: center; }
  .lvw { display: inline-flex; align-items: center; gap: 4px; color: #8b98ad; font-size: 12.5px; }
  .empty { padding: 14px; color: #8b98ad; text-align: center; font-size: 13px; }
  .more { padding: 6px; text-align: center; color: #8b98ad; font-size: 12px; border-top: 1px solid #232b3a; }
  @media (max-width: 640px) {
    .lvw { flex: 1 1 100%; }
    .meta { margin-left: 0; width: 100%; }
    select { max-width: none; }
    .list { max-height: 60vh; }
  }`;

  const STAT_ORDER = [['hp', 'HP'], ['atk', '攻'], ['def', '防'], ['sta', '體'], ['agi', '敏'], ['spd', '反'], ['tec', '技'], ['int', '智'], ['luk', '幸']];

  /* ---------- 共用元件 ---------- */
  function makeHost(kind) {
    const host = document.createElement('div');
    host.setAttribute('data-mdcf', kind);
    const root = host.attachShadow({ mode: 'open' });
    return { host, root };
  }

  // 依角色統計：[{ch, n, img}]，人數多的在前
  function countByChar(list) {
    const m = new Map();
    list.forEach(x => {
      if (!x.ch) return;
      const o = m.get(x.ch) || { ch: x.ch, n: 0, img: x.img };
      o.n++; m.set(x.ch, o);
    });
    return [...m.values()].sort((a, b) => b.n - a.n || a.ch.localeCompare(b.ch, 'zh-Hant'));
  }

  // 等級範圍：空白＝不限；上下限填反了自動對調
  function lvRange(ui) {
    let lo = parseInt(ui.lo, 10), hi = parseInt(ui.hi, 10);
    lo = Number.isFinite(lo) ? lo : null; hi = Number.isFinite(hi) ? hi : null;
    if (lo != null && hi != null && lo > hi) [lo, hi] = [hi, lo];
    return { lo, hi, on: lo != null || hi != null };
  }
  const lvOk = (x, r) => (r.lo == null || +x.lv >= r.lo) && (r.hi == null || +x.lv <= r.hi);
  const lvTxt = r => r.lo != null && r.hi != null ? `Lv${r.lo}～${r.hi}` : r.lo != null ? `Lv${r.lo} 以上` : `Lv${r.hi} 以下`;
  function filterList(list, ch, kw, r) {
    kw = (kw || '').trim().toLowerCase();
    return list.filter(x => (!r || lvOk(x, r)) && (!ch || x.ch === ch) &&
      (!kw || x.ch.toLowerCase().includes(kw) || x.ti.toLowerCase().includes(kw) || x.nick.toLowerCase().includes(kw)));
  }

  /* ---------- 玩家列表頁 ---------- */
  const pUI = { open: ls.get(localStorage, 'mdcf:pOpen') !== false, ch: '', kw: '', lo: '', hi: '', busy: false, prog: null, err: '' };

  function mountPlayers() {
    if (location.pathname !== '/players') return;
    const h2 = [...document.querySelectorAll('h2')].find(e => e.textContent.trim() === '玩家列表');
    if (!h2) return;
    if (h2.nextElementSibling && h2.nextElementSibling.getAttribute('data-mdcf') === 'players') return;
    document.querySelectorAll('[data-mdcf="players"]').forEach(e => e.remove());
    const { host, root } = makeHost('players');
    h2.insertAdjacentElement('afterend', host);
    root.addEventListener('click', e => onPlayersClick(e, root));
    root.addEventListener('change', e => { if (e.target.id === 'ch') { pUI.ch = e.target.value; renderPlayers(root); } });
    root.addEventListener('input', e => {
      if (e.target.id === 'kw') pUI.kw = e.target.value;
      else if (e.target.id === 'lo') pUI.lo = e.target.value;
      else if (e.target.id === 'hi') pUI.hi = e.target.value;
      else return;
      renderPlayersList(root);
    });
    renderPlayers(root);
  }

  function renderPlayers(root) {
    const data = ls.get(localStorage, P_KEY);
    const list = data ? data.list : [];
    const stale = data && Date.now() - data.t > P_FRESH;
    const meta = pUI.busy ? '掃描中…' : data ? `${list.length} 人 · ${ago(data.t)}更新${stale ? '（建議重新掃描）' : ''}` : '尚未掃描';
    let h = `<style>${CSS}</style><div class="box${pUI.open ? '' : ' col'}">
      <div class="hd" data-act="toggle"><span class="ttl">🔎 依角色查玩家</span><span class="meta">${esc(meta)}</span><span class="tg">${pUI.open ? '收起 ▴' : '展開 ▾'}</span></div>`;
    if (pUI.open) {
      const chars = countByChar(list);
      h += `<div class="bd"><div class="row">
          <select id="ch"${list.length ? '' : ' disabled'}><option value="">全部角色${list.length ? '（' + chars.length + ' 種）' : ''}</option>
            ${chars.map(c => `<option value="${esc(c.ch)}"${c.ch === pUI.ch ? ' selected' : ''}>${esc(c.ch)}（${c.n}）</option>`).join('')}</select>
          <input id="kw" placeholder="關鍵字：角色／稱號／暱稱" value="${esc(pUI.kw)}"${list.length ? '' : ' disabled'}>
          <span class="lvw">Lv <input id="lo" class="lvin" type="number" min="1" max="100" placeholder="最低" value="${esc(pUI.lo)}"${list.length ? '' : ' disabled'}> ～ <input id="hi" class="lvin" type="number" min="1" max="100" placeholder="最高" value="${esc(pUI.hi)}"${list.length ? '' : ' disabled'}></span>
          <button class="pri" data-act="scan"${pUI.busy ? ' disabled' : ''}>${data ? '重新掃描' : '掃描全部玩家'}</button>
        </div>`;
      if (pUI.busy && pUI.prog) h += `<div class="st">讀取玩家列表 ${pUI.prog[0]} / ${pUI.prog[1]} 頁…</div><div class="prog"><i style="width:${Math.round(pUI.prog[0] / pUI.prog[1] * 100)}%"></i></div>`;
      else if (pUI.busy) h += `<div class="st">連線中…</div>`;
      if (pUI.err) h += `<div class="st err">${esc(pUI.err)}</div>`;
      if (!data && !pUI.busy) h += `<div class="st">第一次使用請按「掃描全部玩家」（八百多人分 17 頁，大約 10～30 秒），結果會存在你的瀏覽器，30 分鐘內不用重掃。</div>`;
      h += `<div id="res"></div></div>`;
    }
    h += `</div>`;
    root.innerHTML = h;
    if (pUI.open) renderPlayersList(root);
  }

  function renderPlayersList(root) {
    const el = root.getElementById('res');
    if (!el) return;
    const data = ls.get(localStorage, P_KEY);
    if (!data || !data.list.length) { el.innerHTML = ''; return; }
    const r = lvRange(pUI);
    const inLv = r.on ? data.list.filter(x => lvOk(x, r)) : data.list;
    let h = '';
    if (!pUI.ch) {
      const cs = countByChar(inLv);
      h += `<div class="st">${r.on ? `${lvTxt(r)} 共 ${inLv.length} 人，` : ''}點角色直接篩選：</div><div class="chips">` +
        (cs.map(c => `<span class="chip" data-ch="${esc(c.ch)}">${c.img ? `<img src="${esc(c.img)}" alt="">` : ''}${esc(c.ch)} <b>${c.n}</b></span>`).join('') || '<span class="st">這個等級範圍沒有玩家</span>') + `</div>`;
      if (!pUI.kw.trim() && !r.on) { el.innerHTML = h; return; }
    }
    const rows = filterList(data.list, pUI.ch, pUI.kw, r).sort((a, b) => (b.lv - a.lv) || ((b.hf || 0) - (a.hf || 0)));
    h += `<div class="st">找到 <b style="color:#4FD1C5">${rows.length}</b> 人${r.on ? `（${lvTxt(r)}）` : ''}${rows.length > SHOW_MAX ? `，只列前 ${SHOW_MAX} 位` : ''}（依等級排序）</div>` +
      (rows.length ? `<div class="list">${rows.slice(0, SHOW_MAX).map(x => `
        <div class="it">
          ${x.img ? `<img class="av" src="${esc(x.img)}" alt="" loading="lazy">` : '<span class="av"></span>'}
          <div class="mn">
            <div class="l1"><a class="nk" href="/players/${esc(x.id)}" target="_self">${esc(x.nick || '-')}</a><span class="lv">Lv.${esc(x.lv)}</span>${x.dead ? '<span class="dead">死亡</span>' : ''}</div>
            <div class="l2">${esc(x.ch)}${x.ti ? '（' + esc(x.ti) + '）' : ''} · <span class="fl">${esc(x.fl)} / ${esc(x.hf)} 樓</span></div>
          </div>
        </div>`).join('')}</div>` : `<div class="list"><div class="empty">沒有符合的玩家</div></div>`);
    el.innerHTML = h;
  }

  async function onPlayersClick(e, root) {
    const chip = e.target.closest('[data-ch]');
    if (chip) { pUI.ch = chip.dataset.ch; pUI.kw = ''; renderPlayers(root); return; }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'toggle') { pUI.open = !pUI.open; ls.set(localStorage, 'mdcf:pOpen', pUI.open); renderPlayers(root); }
    else if (b.dataset.act === 'scan' && !pUI.busy) {
      pUI.busy = true; pUI.err = ''; pUI.prog = null; renderPlayers(root);
      try { await scanPlayers((d, t) => { pUI.prog = [d, t]; if (root.host.isConnected) renderPlayers(root); }); }
      catch (err) { pUI.err = '掃描失敗：' + err.message; }
      pUI.busy = false; pUI.prog = null;
      document.querySelectorAll('[data-mdcf="players"]').forEach(h => renderPlayers(h.shadowRoot));
    }
  }

  /* ---------- Boss 頁：選擇助戰 ---------- */
  const aUI = { ch: '', kw: '', lo: '', hi: '', busy: false, prog: 0, err: '', note: '' };

  function findAssistForm() {
    const inp = document.querySelector('input[placeholder^="搜尋暱稱（需完全相符）"]');
    return inp ? { inp, form: inp.closest('form') } : null;
  }
  function boxRange(form) {
    const t = form && form.parentElement && form.parentElement.textContent || '';
    const m = t.match(/選擇助戰（(\d+)(?:～(\d+)|\s*樓以上)/);
    return m ? [+m[1], m[2] ? +m[2] : null] : null;
  }

  function mountAssist() {
    const f = findAssistForm();
    if (!f || !f.form) return;
    if (f.form.nextElementSibling && f.form.nextElementSibling.getAttribute('data-mdcf') === 'assist') return;
    document.querySelectorAll('[data-mdcf="assist"]').forEach(e => e.remove());
    const { host, root } = makeHost('assist');
    f.form.insertAdjacentElement('afterend', host);
    root.addEventListener('click', e => onAssistClick(e, root));
    root.addEventListener('change', e => { if (e.target.id === 'ch') { aUI.ch = e.target.value; renderAssist(root); } });
    root.addEventListener('input', e => {
      if (e.target.id === 'kw') aUI.kw = e.target.value;
      else if (e.target.id === 'lo') aUI.lo = e.target.value;
      else if (e.target.id === 'hi') aUI.hi = e.target.value;
      else return;
      renderAssistList(root);
    });
    aUI.note = '';
    renderAssist(root);
  }

  function assistData(root) {
    const range = boxRange(root.host.parentElement && root.host.parentElement.querySelector('form') || root.host.previousElementSibling);
    const all = ls.get(sessionStorage, A_KEY) || {};
    return { range, data: all[rangeKey(range)] || null };
  }

  function renderAssist(root) {
    const { range, data } = assistData(root);
    const list = data ? data.list : [];
    const stale = data && Date.now() - data.t > A_FRESH;
    const meta = aUI.busy ? '掃描中…' : data ? `${list.length} 人 · ${ago(data.t)}更新${stale ? '（建議重新掃描）' : ''}` : '尚未掃描';
    const chars = countByChar(list);
    let h = `<style>${CSS}</style><div class="box">
      <div class="hd"><span class="ttl">🔎 依角色找助戰<small>${esc(rangeTxt(range))}</small></span><span class="meta">${esc(meta)}</span></div>
      <div class="bd"><div class="row">
        <select id="ch"${list.length ? '' : ' disabled'}><option value="">全部角色${list.length ? '（' + chars.length + ' 種）' : ''}</option>
          ${chars.map(c => `<option value="${esc(c.ch)}"${c.ch === aUI.ch ? ' selected' : ''}>${esc(c.ch)}（${c.n}）</option>`).join('')}</select>
        <input id="kw" placeholder="關鍵字：角色／稱號／暱稱" value="${esc(aUI.kw)}"${list.length ? '' : ' disabled'}>
        <span class="lvw">Lv <input id="lo" class="lvin" type="number" min="1" max="100" placeholder="最低" value="${esc(aUI.lo)}"${list.length ? '' : ' disabled'}> ～ <input id="hi" class="lvin" type="number" min="1" max="100" placeholder="最高" value="${esc(aUI.hi)}"${list.length ? '' : ' disabled'}></span>
        <button class="pri" data-act="scan"${aUI.busy ? ' disabled' : ''}>${data ? '重新掃描' : '掃描助戰名單'}</button>
      </div>`;
    if (aUI.busy) h += `<div class="st">讀取助戰名單第 ${aUI.prog || 1} 頁…</div>`;
    if (aUI.err) h += `<div class="st err">${esc(aUI.err)}</div>`;
    if (aUI.note) h += `<div class="st" style="color:#7bd5a6">${esc(aUI.note)}</div>`;
    if (!data && !aUI.busy) h += `<div class="st">按「掃描助戰名單」會一次讀完這個樓層區間所有可借的人（通常幾頁而已），再依角色篩選。</div>`;
    h += `<div id="res"></div></div></div>`;
    root.innerHTML = h;
    renderAssistList(root);
  }

  function renderAssistList(root) {
    const el = root.getElementById('res');
    if (!el) return;
    const { data } = assistData(root);
    if (!data || !data.list.length) { el.innerHTML = data ? `<div class="list"><div class="empty">這個樓層區間目前沒有人可以借</div></div>` : ''; return; }
    const r = lvRange(aUI);
    let h = '';
    if (!aUI.ch) {
      const inLv = r.on ? data.list.filter(x => lvOk(x, r)) : data.list;
      const cs = countByChar(inLv);
      h += `<div class="st">${r.on ? `${lvTxt(r)} 共 ${inLv.length} 人，` : ''}點角色直接篩選：</div><div class="chips">` +
        (cs.map(c => `<span class="chip" data-ch="${esc(c.ch)}">${c.img ? `<img src="${esc(c.img)}" alt="">` : ''}${esc(c.ch)} <b>${c.n}</b></span>`).join('') || '<span class="st">這個等級範圍沒有人</span>') + `</div>`;
      if (!aUI.kw.trim() && !r.on) { el.innerHTML = h; return; }
    }
    const rows = filterList(data.list, aUI.ch, aUI.kw, r).sort((a, b) => (b.lv - a.lv) || ((b.st.hp || 0) - (a.st.hp || 0)));
    el.innerHTML = h + `<div class="st">找到 <b style="color:#4FD1C5">${rows.length}</b> 人${r.on ? `（${lvTxt(r)}）` : ''}（依等級排序）。按「帶入」會把暱稱填進上面的搜尋框並搜尋，再按遊戲的「選擇」就好。</div>` +
      (rows.length ? `<div class="list">${rows.slice(0, SHOW_MAX).map(x => `
        <div class="it">
          ${x.img ? `<img class="av" src="${esc(x.img)}" alt="" loading="lazy">` : '<span class="av"></span>'}
          <div class="mn">
            <div class="l1"><span class="nk">${esc(x.nick || '-')}</span><span class="lv">Lv.${esc(x.lv)}</span><span class="fl">${esc(x.fl)}F</span></div>
            <div class="l2">${esc(x.ch)}${x.ti ? '（' + esc(x.ti) + '）' : ''}</div>
            <div class="sts">${STAT_ORDER.map(([k, n]) => x.st[k] != null ? `<span>${n}<b>${esc(x.st[k])}</b></span>` : '').join('')}</div>
          </div>
          <button class="act" data-act="pick" data-nick="${esc(x.nick)}">帶入</button>
        </div>`).join('')}</div>` : `<div class="list"><div class="empty">沒有符合的玩家</div></div>`);
  }

  // 把暱稱填進遊戲自己的搜尋框並送出（遊戲會只列出這個人，再由玩家自己按「選擇」）
  async function fillGameSearch(nick) {
    const f = findAssistForm();
    if (!f) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(f.inp, nick);
    f.inp.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(60);
    const btn = f.form.querySelector('button[type="submit"]');
    if (btn && !btn.disabled) btn.click();
    else if (f.form.requestSubmit) f.form.requestSubmit();
    return true;
  }

  async function onAssistClick(e, root) {
    const chip = e.target.closest('[data-ch]');
    if (chip) { aUI.ch = chip.dataset.ch; aUI.kw = ''; renderAssist(root); return; }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'scan' && !aUI.busy) {
      aUI.busy = true; aUI.err = ''; aUI.note = ''; aUI.prog = 1; renderAssist(root);
      try { await scanAssist(p => { aUI.prog = p; if (root.host.isConnected) renderAssist(root); }); }
      catch (err) { aUI.err = '掃描失敗：' + err.message; }
      aUI.busy = false;
      document.querySelectorAll('[data-mdcf="assist"]').forEach(h => renderAssist(h.shadowRoot));
    } else if (b.dataset.act === 'pick') {
      const nick = b.dataset.nick;
      if (await fillGameSearch(nick)) { aUI.note = `已帶入「${nick}」，請在下方遊戲名單按「選擇」。`; renderAssist(root); }
    }
  }

  /* ---------- 掛載（SPA 換頁時持續檢查） ---------- */
  let tick = 0;
  const check = () => { try { mountPlayers(); mountAssist(); } catch (e) {} };
  new MutationObserver(() => { if (!tick) tick = requestAnimationFrame(() => { tick = 0; check(); }); })
    .observe(document, { childList: true, subtree: true });
  check();
})();
} }),
  ];

  /* ---------- 依開關啟動各功能 ---------- */
  const offAtLoad = readOff();
  const status = {};   // id → 'on' | 'off' | 'err'
  for (const m of MODS) {
    if (offAtLoad.includes(m.id)) { status[m.id] = 'off'; continue; }
    const go = () => {
      try { m.run(); status[m.id] = 'on'; }
      catch (e) { status[m.id] = 'err'; console.error('[我的同人工具箱] ' + m.name + ' 啟動失敗', e); }
    };
    if (m.at === 'idle' && document.readyState === 'loading') { status[m.id] = 'on'; document.addEventListener('DOMContentLoaded', go, { once: true }); }
    else go();
  }

  /* ---------- 🧰 按鈕與功能面板 ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: "Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif; }
    .fab { position: fixed; left: 14px; bottom: calc(14px + env(safe-area-inset-bottom)); z-index: 2147482990;
      width: 38px; height: 38px; border-radius: 50%; border: 1px solid #2d3748; background: #171c27; color: #e2e8f0;
      font-size: 19px; line-height: 36px; text-align: center; cursor: pointer; opacity: .78; padding: 0;
      box-shadow: 0 4px 14px rgba(0,0,0,.45); transition: opacity .15s, transform .15s; }
    .fab:hover, .fab.open { opacity: 1; transform: scale(1.06); }
    .fab .dot { position: absolute; top: -2px; right: -2px; width: 11px; height: 11px; border-radius: 50%; background: #f6ad55; border: 2px solid #171c27; display: none; }
    .fab.pend .dot { display: block; }
    .pan { position: fixed; left: 14px; bottom: calc(62px + env(safe-area-inset-bottom)); z-index: 2147483001; width: 360px;
      max-width: calc(100vw - 28px); max-height: calc(100vh - 90px); overflow: auto; background: #1a1f2e; color: #e2e8f0;
      border: 1px solid #2d3748; border-radius: 12px; box-shadow: 0 12px 34px rgba(0,0,0,.55); font-size: 13px; display: none; }
    .pan.show { display: block; }
    .hd { display: flex; align-items: center; gap: 8px; padding: 11px 14px; border-bottom: 1px solid #2d3748; position: sticky; top: 0; background: #1a1f2e; z-index: 1; }
    .hd b { font-size: 15px; } .hd small { color: #718096; } .hd .x { margin-left: auto; background: none; border: 0; color: #a0aec0; font-size: 16px; cursor: pointer; }
    .card { margin: 10px 12px; padding: 10px 12px; border: 1px solid #2d3748; border-radius: 10px; background: #171c27; }
    .card.off { opacity: .62; }
    .row { display: flex; align-items: center; gap: 8px; }
    .ic { font-size: 18px; width: 24px; text-align: center; }
    .nm { font-weight: bold; font-size: 14px; } .ver { color: #718096; font-size: 11px; }
    .st { font-size: 11px; padding: 1px 7px; border-radius: 9px; margin-left: 2px; white-space: nowrap; }
    .st.on { background: #1c4532; color: #9ae6b4; } .st.off { background: #2d3748; color: #a0aec0; }
    .st.pend { background: #744210; color: #fbd38d; } .st.err { background: #63171b; color: #feb2b2; }
    .sw { margin-left: auto; position: relative; width: 40px; height: 22px; flex: none; cursor: pointer; }
    .sw input { opacity: 0; width: 0; height: 0; position: absolute; }
    .sw span { position: absolute; inset: 0; border-radius: 11px; background: #4a5568; transition: background .15s; }
    .sw span::after { content: ''; position: absolute; left: 3px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .15s; }
    .sw input:checked + span { background: #319795; } .sw input:checked + span::after { transform: translateX(18px); }
    .ds { color: #a0aec0; margin: 6px 0 0 32px; line-height: 1.5; }
    details { margin: 6px 0 0 32px; } summary { cursor: pointer; color: #4FD1C5; font-size: 12px; user-select: none; }
    ul { margin: 6px 0 0; padding-left: 18px; color: #cbd5e0; line-height: 1.6; } li { margin: 1px 0; }
    .ft { padding: 10px 14px 14px; color: #a0aec0; font-size: 12px; line-height: 1.6; border-top: 1px solid #2d3748; }
    .ft .acts { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
    .btn { border: 1px solid #2d3748; background: #2d3748; color: #e2e8f0; padding: 5px 12px; border-radius: 7px; cursor: pointer; font-size: 12px; }
    .btn.hi { background: #dd6b20; border-color: #dd6b20; color: #fff; font-weight: bold; }
    .btn[disabled] { opacity: .45; cursor: default; }
  `;

  let root, pan, fab;
  function build() {
    if (root) return;
    const host = document.createElement('div');
    host.id = 'md-toolbox';
    document.documentElement.appendChild(host);
    root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${CSS}</style>
      <button class="fab" title="我的同人工具箱：查看功能、開關">🧰<i class="dot"></i></button>
      <div class="pan" role="dialog" aria-label="我的同人工具箱"></div>`;
    fab = root.querySelector('.fab');
    pan = root.querySelector('.pan');
    fab.addEventListener('click', () => toggle());
    pan.addEventListener('change', e => {
      const id = e.target.dataset && e.target.dataset.id;
      if (!id) return;
      const off = readOff().filter(x => x !== id);
      if (!e.target.checked) off.push(id);
      writeOff(off);
      paint();
    });
    pan.addEventListener('click', e => {
      const a = e.target.closest('[data-act]');
      if (!a) return;
      if (a.dataset.act === 'close') toggle(false);
      if (a.dataset.act === 'reload') location.reload();
      if (a.dataset.act === 'all') { writeOff([]); paint(); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
    document.addEventListener('pointerdown', e => { if (pan.classList.contains('show') && !e.composedPath().includes(host)) toggle(false); }, true);
    paint();
  }

  function toggle(force) {
    const show = force === undefined ? !pan.classList.contains('show') : force;
    pan.classList.toggle('show', show);
    fab.classList.toggle('open', show);
    if (show) paint();
  }

  function paint() {
    const off = readOff();
    let pending = 0;
    const cards = MODS.map(m => {
      const want = !off.includes(m.id), now = status[m.id];
      const changed = want !== (now === 'on' || now === 'err');
      if (changed) pending++;
      const st = changed ? `<span class="st pend">重新整理後${want ? '開啟' : '關閉'}</span>`
        : now === 'err' ? '<span class="st err">啟動失敗</span>'
        : now === 'on' ? '<span class="st on">執行中</span>' : '<span class="st off">已關閉</span>';
      return `<div class="card${want ? '' : ' off'}">
        <div class="row"><span class="ic">${m.icon}</span><span class="nm">${esc(m.name)}</span><span class="ver">v${esc(m.ver)}</span>${st}
          <label class="sw" title="${want ? '關閉' : '開啟'}「${esc(m.name)}」"><input type="checkbox" data-id="${m.id}" ${want ? 'checked' : ''}><span></span></label></div>
        <div class="ds">${esc(m.desc)}</div>
        <details><summary>全部功能（${m.feats.length}）</summary><ul>${m.feats.map(f => `<li>${esc(f)}</li>`).join('')}</ul></details>
      </div>`;
    }).join('');
    pan.innerHTML = `<div class="hd"><b>🧰 我的同人工具箱</b><small>v${esc(TK_VER)}</small><button class="x" data-act="close" title="關閉">✕</button></div>
      ${cards}
      <div class="ft">開關存在這個瀏覽器裡；切換後要<b>重新整理頁面</b>才會生效。
        <div class="acts"><button class="btn${pending ? ' hi' : ''}" data-act="reload" ${pending ? '' : 'disabled'}>⟳ 重新整理套用${pending ? `（${pending}）` : ''}</button>
        <button class="btn" data-act="all" ${off.length ? '' : 'disabled'}>全部開啟</button></div></div>`;
    fab.classList.toggle('pend', pending > 0);
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build, { once: true });
})();
