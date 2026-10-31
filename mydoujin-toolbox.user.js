// ==UserScript==
// @name         我的同人｜工具箱
// @namespace    mydoujin-toolbox
// @version      1.4.1
// @description  戰報統計、戰報逐行播放、Boss 冷卻倒數、角色查詢、轉生頁整理（含首頁一鍵轉生）、首頁頭像整合成一個插件；左下角圖示按鈕可個別開關各功能（立即生效）
// @match        https://mydoujin.online/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';
  if (window.__mdToolbox) return;
  const TK_VER = "1.4.1";
  window.__mdToolbox = TK_VER;
  const ICON = "data:image/webp;base64,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";
  const OFF_KEY = 'mdtk:off';
  const readOff = () => { try { const v = JSON.parse(localStorage.getItem(OFF_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const writeOff = v => { try { localStorage.setItem(OFF_KEY, JSON.stringify(v)); } catch (e) {  } };
  const MODS = [
    Object.assign({"id": "stats", "icon": "📊", "name": "戰報統計", "desc": "戰報頁右下角的統計面板：傷害、承傷、回血、爆擊率、MVP。", "ver": "1.23.0", "at": "start"}, { run: function (TK) {
// ===== 戰報統計 1.23.0（mydoujin_戰報統計.user.js）=====
(function () {
  'use strict';
  const tk = (typeof TK === 'object' && TK) || { on: true, onToggle() {} };
  const API = 'https://mydoujin-backend.onrender.com';
  const cache = new Map();
  const errors = {};
  const pending = new Set();
  let currentId = null;
  let host = null, root = null;
  let statusText = '';
  const state = {
    mode: 'shown',
    collapsed: load('collapsed', false),
    fit: load('fit', true),
    sideView: 'all',
    view: load('view', 'detail'),
    hidden: false,
    pos: load('pos', null),
    size: load('size', null),
    open: {},
  };
  function load(k, d) { try { const v = localStorage.getItem('mdbs:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem('mdbs:' + k, JSON.stringify(v)); } catch (e) {} }
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
  function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
  const shortName = n => { const s2 = String(n || '').split(/[。！？!?]/).map(x => x.trim()).filter(Boolean); return s2.length ? s2[s2.length - 1] : String(n || ''); };
  function newUnit(p, side) {
    const full = p.characterName || p.name || '?';
    return {
      id: p.userId || p.entityId || p._id || p.name,
      side,
      name: shortName(full),
      full,
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
      byKind: { normal: { real: 0, shown: 0, n: 0 }, skill: { real: 0, shown: 0, n: 0 }, counter: { real: 0, shown: 0, n: 0 }, dot: { real: 0, shown: 0, n: 0 }, passive: { real: 0, shown: 0, n: 0 }, fart: { real: 0, shown: 0, n: 0 }, finale: { real: 0, shown: 0, n: 0 } },
      simmer: null,
      luck: 0, luckN: 0, luckTaken: 0, luckTakenN: 0,
      heal: 0, healTeam: 0, healSolo: 0, selfHeal: {}, healRecv: 0, sp: 0, spRecv: 0,
      crit: 0, hitN: 0, blockedN: 0, maxHit: 0, missN: 0, dodgeN: 0,
      hpLeft: null, hpMax: null, dead: false, deathN: 0,
      revN: 0, revBy: {}, revivedN: 0, finaleBy: {},
      burn: 0, burnN: 0,
      attackedN: 0, specialN: 0, special: {},
      dot: {}, dotTaken: {},
      passiveDot: {}, passiveTaken: {},
      isSummon: false, ownerId: null, ownerName: '', summonSkill: '', summonN: 0, summons: [],
    };
  }
  const escRe = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  const TEAM_HEAL_SKILLS = ['sylphy_healing', 'sylphy_chantless_healing', 'simmer_cook', 'simmer_recycle_bin'];
  const REVIVE_MSG = /重新站了起來|復活了|起死回生|甦醒過來/;
  const TEAM_HEAL_MSG = /治癒之鎖|治癒魔術|小黃金樹|緊急包紮|番茄湯/;
  const KNOWN_SUMMONS = ['邪經文大僧正', '月蝕盡絕黑阿修羅', '魄啜繚亂弟切花魁', '殉國禁獄鬼軍曹'];
  const PUNCT = /[，。！？、；：,.!?;:「」『』（）()—…]/;
  const NAME_PATTERNS = [
    /對\s+(.+?)\s+造成了/, /^\s*(.+?)\s+倒下了/, /^\s*(.+?)\s+身上/, /被\s+(.+?)\s+(?:用\S+)?(?:躲開|閃開|閃過|避開|抵擋)/,
    /(?:砸向|撞向|斬向|捲到了旁邊的|衝向|往)\s+(.+?)(?:\s+身上|，|！|$)/,
  ];
  function summonName(l, logs) {
    const msg = String(l.message || '').trim();
    const known = KNOWN_SUMMONS.find(n => msg.includes(n));
    if (known) return known;
    const sid = l.targetId;
    const rel = logs.filter(x => x && x !== l && x.type !== 'SUMMON' && (x.actorId === sid || x.targetId === sid));
    const vote = new Map();
    const add = (n, w, min = 2) => { n = String(n || '').trim(); if (n.length >= min && n.length <= 24 && !PUNCT.test(n)) vote.set(n, (vote.get(n) || 0) + w); };
    rel.forEach(x => {
      const m = String(x.message || '');
      if (x.targetId === sid) NAME_PATTERNS.forEach(re => { const r = m.match(re); if (r) add(r[1], 3, 1); });
      if (x.actorId === sid) { const r = m.match(/^\s*(\S+(?:\s+T-\d+)?)\s/); if (r) add(r[1], 1); }
    });
    if (!vote.size) rel.forEach(x => String(x.message || '').split(/\s+/).forEach(t => add(t.split(PUNCT)[0], 1)));
    if (vote.size) {
      const inMsg = n => msg.includes(n) ? 0.5 : 0;
      return [...vote.entries()].sort((p, q) => (q[1] + inMsg(q[0])) - (p[1] + inMsg(p[0])) || p[0].length - q[0].length)[0][0];
    }
    const q = msg.match(/「([^」]{1,16})」/);
    if (q) return q[1];
    const toks = msg.split(/\s+/).filter(Boolean);
    const pick = toks.length >= 3 ? toks[1] : (toks[0] || '');
    return pick.split(PUNCT).filter(Boolean).pop() || '';
  }
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
    const legacyIds = [...new Set(logs.flatMap(l => l ? [l.actorId, l.targetId] : []).filter(x => typeof x === 'string' && /^legacy_/.test(x)))];
    legacyIds.forEach(lid => {
      const own = logs.filter(l => l && l.actorId === lid);
      const cnt = new Map();
      own.forEach(l => {
        if (/^skull_reaper_|arrive|intercept/.test(l.skillId || '')) return;
        if (l.targetId && l.targetId !== lid && (/^legacy_/.test(l.targetId) || byId.has(l.targetId) && byId.get(l.targetId).side === 'A')) return;
        const m = String(l.message || '');
        (m.match(/[^\s，。！？：、「」—]+?的遺志/g) || []).forEach(n => cnt.set(n, (cnt.get(n) || 0) + (m.trim().startsWith(n) ? 3 : 1)));
      });
      const name = [...cnt.entries()].sort((p, q) => q[1] - p[1])[0]?.[0] || '陌生攻略者的遺志';
      const base = name.replace(/的遺志$/, '');
      const reOwner = new RegExp('([^\\s，。！？：、「」—]+)的' + escRe(base) + '(?!的遺志)');
      let owner = '';
      for (const l of own) { const m = String(l.message || '').match(reOwner); if (m && !/遺志$/.test(m[1])) { owner = m[1]; break; } }
      const u = newUnit({ name }, 'D');
      u.id = lid; u.isLegacy = true; u.legacyOwner = owner;
      u.name = owner ? `${base}（${owner}）` : name; u.full = name; u.names = [name];
      u.sub = owner ? `${owner} 交出的資料` : '陌生攻略者的資料';
      units.push(u); byId.set(lid, u);
    });
    logs.forEach(l => {
      if (!l || l.type !== 'SUMMON' || !l.targetId) return;
      const owner = byId.get(l.actorId);
      const nm = summonName(l, logs) || ((owner ? owner.name : '') + '的分身') || String(l.targetId);
      let u = byId.get(l.targetId);
      if (!u) { u = newUnit({ name: nm }, owner ? owner.side : 'C'); u.id = l.targetId; units.push(u); byId.set(l.targetId, u); }
      u.name = shortName(nm); u.full = nm; u.names = [nm];
      if (owner) u.side = owner.side;
      u.isSummon = true;
      u.ownerId = l.actorId;
      u.ownerName = owner ? owner.name : '';
      u.summonSkill = l.skillId || '';
      u.sub = l.skillId || '召喚物';
      if (owner && u.luk == null) u.luk = owner.luk;
      if (owner && owner.summons.indexOf(u) < 0) owner.summons.push(u);
    });
    const buffSrc = {};
    const applyLog = [];
    const prefixOwner = {};
    const lastDotSrc = {};
    let lastZoneEnd = '';
    const pending = {};
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
    const simOf = u => u.simmer || (u.simmer = { soupNow: 0, soupNowN: 0, soupTick: 0, soupTickN: 0, soupAfterDeath: 0, soupBy: {}, fart: 0, fartN: 0, fartBy: {}, bin: [], binHeal: 0 });
    const lastDish = {};
    const soupOwner = {};
    let simmerUnit = null;
    const CRITABLE = { normal: 1, skill: 1, counter: 1 };
    const hit = (a, t, real, shown, kind, l) => {
      if (a) {
        a.dealt.real += real; a.dealt.shown += shown;
        const k = a.byKind[kind]; k.real += real; k.shown += shown; k.n++;
        if (CRITABLE[kind]) { a.hitN++; if (l.isCrit) a.crit++; }
        if (l.blocked || l.type === 'BLOCK') a.blockedN++;
        if (kind !== 'finale' && shown > a.maxHit) a.maxHit = shown;
      }
      if (t) { t.taken.real += real; t.taken.shown += shown; if (CRITABLE[kind]) t.attackedN++; }
    };
    logs.forEach((l, i) => {
      if (!l || typeof l !== 'object') return;
      const a = get(l.actorId), t = get(l.targetId);
      const v = num(l.value);
      if (a && l.skillId) { const pre = String(l.skillId).split('_')[0]; if (!IGNORE_PREFIX[pre] && !prefixOwner[pre]) prefixOwner[pre] = a; }
      if (a && (l.skillId === 'black_tome_final_page' || /寫下「全劇終」/.test(String(l.message || '')))) {
        units.filter(u => u.side !== a.side && !u.isSummon && !u.isLegacy && num(u.maxHpStat) > 0).forEach(u => {
          const rem = Math.max(0, num(u.maxHpStat) - u.taken.real + u.healRecv);
          if (!rem) return;
          hit(a, u, rem, rem, 'finale', l);
          a.finaleBy[u.name] = (a.finaleBy[u.name] || 0) + rem;
        });
      }
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
          if (a && t && a.side !== t.side) {
            (buffSrc[t.id] = buffSrc[t.id] || {})[l.buffId || ''] = a.id;
            applyLog.push({ victim: t.id, actor: a.id, msg: String(l.message || '') });
          }
          break;
        case 'BUFF_EFFECT': {
          const msg = String(l.message || '');
          if (!a || !v) break;
          if (l.buffId === 'simmer_dish_tomato_soup' || (/番茄湯/.test(msg) && /恢復|回復/.test(msg))) {
            a.healRecv += v;
            const cook = soupOwner[a.id] || simmerUnit;
            if (cook) {
              cook.heal += v;
              cook.healTeam += v;
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
          let dup = false;
          for (let j = i + 1; j < Math.min(logs.length, i + 6); j++) {
            const x = logs[j];
            if (x && (x.type === 'DAMAGE' || x.type === 'BLOCK') && x.isCounter && (num(x.value) === v || x.actorId === l.actorId)) { dup = true; break; }
          }
          if (!dup) hit(a, t, v, v, 'counter', l);
          break;
        }
        case 'LUCK_EVENT': {
          const src = get(l.opponentId);
          if (src) { src.luck += v; src.luckN++; }
          if (t) { t.luckTaken += v; t.luckTakenN++; t.taken.real += v; t.taken.shown += v; }
          break;
        }
        case 'HEAL': {
          const msg = String(l.message || '');
          if (!l.skillId && /離開毒氣|衰變的傷勢/.test(msg)) {
            const victim = t || a;
            if (!victim) break;
            victim.healRecv += v;
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
          if (t && (t.dead || REVIVE_MSG.test(msg))) {
            if (a && a !== t) { a.revN++; a.revBy[t.name] = (a.revBy[t.name] || 0) + 1; }
            t.revivedN++; t.dead = false;
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
          const msg = String(l.message || '');
          const ms = msg.match(/恢復了\s*(\d+)\s*SP/);
          if (ms && a) { a.sp += num(ms[1]); a.spRecv += num(ms[1]); }
          const mh = msg.match(/恢復了\s*(\d+)\s*HP/);
          if (mh && a) { a.heal += num(mh[1]); const k = TEAM_HEAL_MSG.test(msg) ? 'msg:team' : (l.skillId || l.passiveId || 'msg:'); a.selfHeal[k] = (a.selfHeal[k] || 0) + num(mh[1]); a.healRecv += num(mh[1]); }
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
          if (a) { a.dead = true; a.deathN++; }
          break;
        case 'HP_REMAINING':
          if (a) { a.hpLeft = v; a.hpMax = l.maxHp != null ? num(l.maxHp) : null; }
          break;
      }
    });
    const teamSkills = new Set(TEAM_HEAL_SKILLS);
    logs.forEach(l => { if (l && l.type === 'HEAL' && l.targetId && l.actorId !== l.targetId && (l.skillId || l.passiveId)) teamSkills.add(l.skillId || l.passiveId); });
    teamSkills.add('msg:team');
    units.forEach(u => Object.entries(u.selfHeal).forEach(([k, v]) => { if (teamSkills.has(k)) u.healTeam += v; else u.healSolo += v; }));
    return units;
  }
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
  .rz { position: absolute; right: 0; bottom: 0; width: 18px; height: 18px; cursor: nwse-resize; z-index: 3; touch-action: none;
    background: linear-gradient(135deg, transparent 0 45%, #4FD1C5 45% 52%, transparent 52% 64%, #4FD1C5 64% 71%, transparent 71%); opacity: .55; }
  .rz:hover { opacity: 1; }
  .panel.sized { max-width: calc(100vw - 8px); }
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
  .side.sD .side-hd .dot { background: #63b3ed; box-shadow: 0 0 6px rgba(99,179,237,.6); }
  .side.sD .bar i { background: linear-gradient(90deg,#2b6cb0,#63b3ed); }
  .side.sD .bar { background: rgba(99,179,237,.13); }
  .side.sD .c-tot, .side.sD .c-big b { color: #90cdf4; }
  table.simple td.nm { min-width: 0; }
  td.nm { white-space: normal; overflow-wrap: anywhere; min-width: 150px; max-width: 280px; }
  td.nm .tag { white-space: nowrap; }
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
  .tag.rev { color: #fbd38d; border-color: #d69e2e; background: rgba(214,158,46,.12); font-weight: 700; cursor: help; }
  .tag.rvd { color: #faf089; border-color: #b7791f; }
  .tag.fin { color: #e9d8fd; border-color: #805ad5; background: rgba(128,90,213,.18); font-weight: 700; cursor: help; }
  .grid .rev b { color: #fbd38d; }
  .tag.dot { color: #9ae6b4; border-color: #68d391; }
  .tag.pas { color: #90cdf4; border-color: #63b3ed; }
  .tag.sum { color: #d6bcfa; border-color: #b794f4; }
  .tag.lgc { color: #90cdf4; border-color: #4299e1; background: rgba(66,153,225,.12); }
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
    root.addEventListener('dblclick', e => { if (e.target.closest('[data-rz]')) { state.size = null; save('size', null); render(); } });
  }
  function unmount() { if (host) { host.remove(); host = null; root = null; } }
  function sideLabel(rep, side) {
    if (side === 'A') return '玩家';
    if (side === 'D') return '遺志（陌生攻略者的資料）';
    if (side === 'C') return '其他';
    return rep.battleType === 'BOSS' ? 'BOSS' : rep.battleType === 'PVP' ? '對手' : '敵方';
  }
  function cell(v, cls) { return `<td class="${v ? cls : cls + ' zero'}">${fmt(v)}</td>`; }
  const critPct = (c, n) => n > 0 ? (c / n * 100).toFixed(1) + '%' : '—';
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
      revTags(u) +
      (u.isLegacy ? '<span class="tag lgc">遺志</span>' : '') +
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
        ${k.finale.n ? item('全劇終（對手剩餘血量）', fmt(k.finale[mode]), 'rev') : ''}
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
        ${u.revN ? item('拉起隊友', u.revN + ' 人次（' + Object.keys(u.revBy).length + ' 人）', 'rev') : ''}
        ${u.deathN ? item('倒下次數', u.deathN + ' 次' + (u.revivedN ? '（被拉起 ' + u.revivedN + ' 次）' : '')) : ''}
        ${item('受到治療', fmt(u.healRecv))}
        ${item('獲得 SP', fmt(u.spRecv))}
      </div>${dotList(u.dot, '異常狀態／持續傷害（這個角色造成的）')}${dotList(u.dotTaken, '受到的異常狀態／持續傷害')}${dotList(u.passiveDot, '反傷（這個角色造成的）')}${dotList(u.passiveTaken, '受到的反傷')}${reviveList(u)}${simmerList(u)}${specialList(u)}`;
  }
  const rkBadge = i => `<span class="rk${i < 3 ? ' r' + (i + 1) : ''}">${i + 1}</span>`;
  function unitRows(u, sideTot, mode, i) {
    const dmg = u.dealt[mode], tot = dmg + u.luck, take = u.taken[mode];
    const pct = sideTot > 0 ? tot / sideTot * 100 : 0;
    const key = u.id;
    const { tags, subline } = unitHead(u);
    const bst = u.isBoss && u.stats ? `<tr class="bst" data-key="${esc(key)}"><td colspan="8">${esc(statLine(u.stats))}</td></tr>` : '';
    let html = `<tr class="u${bst ? ' hasbst' : ''}${state.open[key] ? ' open' : ''}" data-key="${esc(key)}">
      <td class="nm"><span class="arw">${state.open[key] ? '▾' : '▸'}</span>${rkBadge(i)}${nmTxt(u)}${tags}<small>${esc(subline)}</small></td>
      ${cell(dmg, 'c-dmg')}${cell(u.luck, 'c-luck')}
      <td class="c-tot${tot ? '' : ' zero'}">${fmt(tot)} <span class="pct">${pct.toFixed(1)}%</span><div class="bar"><i style="width:${Math.min(100, pct).toFixed(1)}%"></i></div></td>
      ${cell(take, 'c-take')}${cell(u.heal, 'c-heal')}${cell(u.sp, 'c-sp')}${critCell(u.crit, u.hitN)}
    </tr>` + bst;
    if (state.open[key]) html += `<tr class="det"><td colspan="8">${detHtml(u, mode)}</td></tr>`;
    return html;
  }
  function unitCard(u, sideTot, mode, i) {
    const dmg = u.dealt[mode], tot = dmg + u.luck, take = u.taken[mode];
    const pct = sideTot > 0 ? tot / sideTot * 100 : 0;
    const key = u.id, open = !!state.open[key];
    const { tags, subline } = unitHead(u);
    const st = (label, v, cls) => `<div class="cs ${cls}${v ? '' : ' zero'}"><span>${label}</span><b>${fmt(v)}</b></div>`;
    return `<div class="card${open ? ' open' : ''}" data-key="${esc(key)}">
      <div class="c-top">
        <div class="c-nm">${rkBadge(i)}<b>${nmTxt(u)}</b>${tags}${subline ? `<small>${esc(subline)}</small>` : ''}</div>
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
  function revTags(u) {
    let h = '';
    if (u.revN) {
      const ent = Object.entries(u.revBy).sort((a, b) => b[1] - a[1]);
      h += `<span class="tag rev" title="${esc('拉起來的隊友：\n' + ent.map(([n, c]) => `${n} ×${c}`).join('\n'))}">拉起 ${u.revN} 人次（${ent.length} 人）</span>`;
    }
    if (u.revivedN) h += `<span class="tag rvd">被拉起 ×${u.revivedN}</span>`;
    if (u.byKind.finale.n) h += `<span class="tag fin" title="${esc('全劇終：對手剩下的血量全部算給這個角色\n' + Object.entries(u.finaleBy).map(([n, v]) => `${n} ${fmt(v)}`).join('\n'))}">全劇終 +${fmt(u.byKind.finale.real)}</span>`;
    return h;
  }
  function reviveList(u) {
    const ent = Object.entries(u.revBy).sort((a, b) => b[1] - a[1]);
    if (!ent.length) return '';
    return `<div class="spl"><span class="k">拉起倒下的隊友：共 ${u.revN} 人次、${ent.length} 人</span>` +
      ent.map(([n, c]) => `<div>・${esc(n)}<b>×${c}</b></div>`).join('') + `</div>`;
  }
  const nmTxt = u => u.full && u.full !== u.name ? `<span title="${esc(u.full)}">${esc(u.name)}</span>` : esc(u.name);
  const simpleTags = u => (u.dead ? '<span class="tag dead">倒下</span>' : '') + (u.isAssist ? '<span class="tag ast">支援</span>' : '') + revTags(u) + (u.isLegacy ? '<span class="tag lgc">遺志</span>' : '') + (u.isSummon ? '<span class="tag sum">分身</span>' : '');
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
        return `<div class="card simple"><div class="c-top"><div class="c-nm">${rkBadge(i)}<b>${nmTxt(u)}</b>${simpleTags(u)}</div>
          <div class="c-big${tot ? '' : ' zero'}"><b>${fmt(tot)}</b><span>${p.toFixed(1)}%</span></div></div>
          <div class="bar"><i style="width:${Math.min(100, p).toFixed(1)}%"></i></div>
          <div class="sm-line"><span>承受<b class="c-take">${fmt(u.taken[mode])}</b></span>${u.heal ? `<span>回血<b class="c-heal">${fmt(u.heal)}</b></span>` : ''}<span>爆擊<b class="c-crit">${critPct(u.crit, u.hitN)}</b> <i style="font-style:normal;font-size:11px">${u.crit}/${u.hitN}</i></span></div></div>`;
      }).join('')}</div>`;
    }
    return `<div class="side s${side}">${head}
      <table class="simple"><thead><tr><th>角色</th><th>總計傷害</th><th>承受傷害</th><th>回復血量</th><th>爆擊率</th></tr></thead><tbody>
      ${list.map((u, i) => {
        const tot = u.dealt[mode] + u.luck, p = pctOf(u);
        return `<tr class="u0"><td class="nm">${rkBadge(i)}${nmTxt(u)}${simpleTags(u)}</td>
          <td class="c-tot${tot ? '' : ' zero'}" style="min-width:190px">${fmt(tot)} <span class="pct">${p.toFixed(1)}%</span><div class="bar"><i style="width:${Math.min(100, p).toFixed(1)}%"></i></div></td>
          ${cell(u.taken[mode], 'c-take')}${cell(u.heal, 'c-heal')}${critCell(u.crit, u.hitN)}</tr>`;
      }).join('')}
      ${list.length > 1 ? `<tr class="sum"><td>合計</td>${cell(S.tot, 'c-tot')}${cell(S.take, 'c-take')}${cell(S.heal, 'c-heal')}${critCell(S.crit, S.hitN)}</tr>` : ''}
      </tbody></table></div>`;
  }
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
  const narrow = () => { try { return matchMedia('(max-width: 640px)').matches; } catch (e) { return false; } };
  let wasNarrow = null;
  window.addEventListener('mdp-playback', () => { if (currentId) render(); });
  window.addEventListener('resize', () => { const n = narrow(); if (n !== wasNarrow && currentId) render(); else applyFit(); });
  function render() {
    if (!tk.on || !currentId) return;
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
      sub = `<span class="chip play">⏳ 播放中</span>` + (rep.battleType ? `<span class="chip">${esc(rep.battleType)}</span>` : '') + `<span class="chip">#${esc(currentId)}</span>`;
      body = `<div class="playing"><div class="pi">⏳</div><div class="pt">戰報逐行播放中</div>
        <div class="ps">播完最後一行才顯示傷害、MVP 與勝負</div></div>`;
    } else if (rep) {
      const units = analyze(rep);
      const t = rep.createdAt ? new Date(rep.createdAt).toLocaleString() : '';
      const rc = { WIN: 'win', LOSE: 'lose', DRAW: 'draw' }[rep.result] || '';
      sub = (playing ? `<span class="chip" title="逐行播放完才顯示勝負">⏳ 播放中</span>` : rep.result ? `<span class="chip ${rc}">${esc(RESULT[rep.result] || rep.result)}</span>` : '') +
        (rep.battleType ? `<span class="chip">${esc(rep.battleType)}</span>` : '') +
        `<span class="chip">#${esc(currentId)}</span>` + (t ? `<span class="chip">${esc(t)}</span>` : '');
      const sides = ['A', 'D', 'B', 'C'].filter(sd => units.some(u => u.side === sd));
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
    const sz = !mob && state.size ? state.size : null;
    const szStyle = sz ? `width:${sz.w}px;` + (col ? '' : `height:${sz.h}px;`) : '';
    root.innerHTML = `<style>${CSS}</style>
      <div class="panel${mob ? ' mob' : ''}${col ? ' col' : ''}${simple && !mob ? ' simple' : ''}${sz ? ' sized' : ''}" style="${posStyle}${szStyle}">
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
        ${col || mob ? '' : '<div class="rz" data-rz="1" title="拖曳調整大小（雙擊恢復預設大小）"></div>'}
      </div>`;
    applyFit();
  }
  function applyFit() {
    const p = root && root.querySelector('.panel');
    if (!p) return;
    p.style.transform = ''; p.style.maxHeight = ''; p.classList.remove('dense');
    const lab = root.querySelector('.fitv');
    const mob = narrow();
    const top = p.getBoundingClientRect().top;
    const avail = Math.max(200, window.innerHeight - top - 12);
    if (!mob && state.size && !state.collapsed) {
      p.style.height = Math.min(state.size.h, avail) + 'px';
      if (lab) lab.textContent = '手動';
      return;
    }
    if (mob || state.collapsed || !state.fit || !cache.get(currentId) || document.documentElement.hasAttribute('data-mdp-playing')) {
      if (!mob) p.style.maxHeight = avail + 'px';
      if (lab) lab.textContent = state.fit ? '100%' : '關';
      return;
    }
    p.style.maxHeight = 'none';
    let H = p.offsetHeight;
    if (H > avail) { p.classList.add('dense'); H = p.offsetHeight; }
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
      else if (act === 'fit') { if (state.size) { state.size = null; save('size', null); state.fit = true; } else state.fit = !state.fit; save('fit', state.fit); render(); }
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
    if (e.target.closest('[data-rz]')) { onResizeStart(e); return; }
    const hd = e.target.closest('[data-drag]');
    if (!hd || e.target.closest('button')) return;
    const panel = hd.parentElement;
    const r = panel.getBoundingClientRect();
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
  function onResizeStart(e) {
    const panel = e.target.closest('.panel');
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    panel.style.transform = ''; panel.style.maxHeight = 'none';
    panel.style.left = r.left + 'px'; panel.style.top = r.top + 'px'; panel.style.right = 'auto';
    state.pos = { left: Math.round(r.left), top: Math.round(r.top) };
    const sx = e.clientX, sy = e.clientY, w0 = r.width, h0 = r.height;
    const move = ev => {
      const w = Math.max(360, Math.min(window.innerWidth - r.left - 4, w0 + ev.clientX - sx));
      const h = Math.max(160, Math.min(window.innerHeight - r.top - 4, h0 + ev.clientY - sy));
      panel.style.width = w + 'px'; panel.style.height = h + 'px';
      state.size = { w: Math.round(w), h: Math.round(h) };
    };
    const up = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      save('pos', state.pos);
      if (state.size) { save('size', state.size); render(); }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    e.preventDefault();
  }
  function routeId() { const m = location.pathname.match(/^\/reports\/(\d+)\/?$/); return m ? m[1] : null; }
  function onRoute() {
    if (!document.body) return;
    if (!tk.on) { currentId = null; unmount(); return; }
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
  tk.onToggle(() => { currentId = null; onRoute(); });
})();
} }),
    Object.assign({"id": "playback", "icon": "▶️", "name": "戰報逐行播放", "desc": "Boss、切磋／茶渡、遭遇戰、戰報頁：戰鬥過程一行一行出現，最後才揭曉勝負。", "ver": "1.2.4", "at": "start"}, { run: function (TK) {
// ===== 戰報逐行播放 1.2.4（mydoujin_戰報播放.user.js）=====
(function () {
  'use strict';
  const tk = (typeof TK === 'object' && TK) || { on: true, onToggle() {} };
  const CFG_KEY = 'mdp:cfg';
  const DEF = { mode: 'step', sec: 0.6, hp: true };
  const load = () => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(CFG_KEY)) || {}); } catch (e) { return Object.assign({}, DEF); } };
  const save = () => { try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) {} };
  let cfg = load();
  const clampSec = v => Math.max(0.05, Math.min(10, Number(v) || DEF.sec));
  cfg.sec = clampSec(cfg.sec);
  const routeOk = () => /^\/(boss|players\/[^/]+|reports\/[^/]+)?\/?$/.test(location.pathname);
  const homePage = () => /^\/?$/.test(location.pathname);
  const DEATH_BANNER = '你的角色死亡了，請進行轉生';
  const STATUS_RE = /^.+ · Lv\.\d+ · (死亡|存活)$/;
  const OUTCOME_RE = /^(勝利|失敗|敗北|平手|平局|死亡)$/;
  let guard = false, guardTimer = null;
  function ensureStyle() {
    if (document.getElementById('mdp-style')) return;
    const st = document.createElement('style');
    st.id = 'mdp-style';
    st.textContent = '[data-mdp-hide]{visibility:hidden !important}[data-mdp-gone]{display:none !important}' +
      'html[data-mdp-playing] [data-part="title"] ~ *, html[data-mdp-guard] [data-part="title"] ~ *,' +
      'html.mdp-step:not([data-mdp-reveal]) [data-mdp-report] [data-part="title"] ~ *,' +
      'html.mdp-step:not([data-mdp-reveal]) [data-mdp-report] h2 ~ span,' +
      'html[data-mdp-playing] [role="dialog"] h2 ~ span, html[data-mdp-guard] [role="dialog"] h2 ~ span{visibility:hidden !important}' +
      '[data-mdp-enc]{font-size:0 !important;color:#a0aec0 !important}' +
      '[data-mdp-enc]::after{content:"遭遇戰鬥！（勝負在戰報最後揭曉）";font-size:14px;font-weight:700}';
    (document.head || document.documentElement).appendChild(st);
  }
  function hideOutcome() {
    ensureStyle();
    document.querySelectorAll('div').forEach(d => {
      if (d.childElementCount === 0 && d.textContent.trim() === DEATH_BANNER) d.setAttribute('data-mdp-gone', '');
    });
    document.querySelectorAll('p').forEach(p => {
      if (p.childElementCount === 0 && STATUS_RE.test(p.textContent.trim())) p.setAttribute('data-mdp-hide', '');
    });
    document.querySelectorAll('[role="dialog"], [role="alertdialog"], [data-scope="dialog"][data-part="content"]').forEach(dlg => {
      dlg.querySelectorAll('span, p, div').forEach(e => {
        if (e.childElementCount === 0 && OUTCOME_RE.test(e.textContent.trim()) && !e.closest('[data-mdp-bar]')) e.setAttribute('data-mdp-hide', '');
      });
    });
    document.querySelectorAll('h2, h3, p, div, span').forEach(title => {
      if (title.childElementCount !== 0 || title.textContent.trim() !== '戰報' || title.closest('[data-mdp-bar]')) return;
      for (let s = title.nextElementSibling; s; s = s.nextElementSibling) {
        if (OUTCOME_RE.test(s.textContent.trim())) s.setAttribute('data-mdp-hide', '');
      }
    });
  }
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
    if (!tk.on || cfg.mode !== 'step') return;
    guard = true; hideOutcome();
    document.documentElement.setAttribute('data-mdp-guard', '1');
    clearTimeout(guardTimer);
    guardTimer = setTimeout(() => { guard = false; document.documentElement.removeAttribute('data-mdp-guard'); if (!hiding()) showOutcome(); }, 45000);
  }
  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    const p = origFetch.apply(this, arguments);
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      const method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      const battlePost = method === 'POST' && (/\/api\/dungeon\/challenge(?:[?#]|$)/.test(url) || /\/api\/players\/[^/]+\/[^/?#]+(?:[?#]|$)/.test(url));
      if (battlePost) armGuard();
      if (battlePost || (method === 'GET' && /\/api\/battle-reports\/\d+(?:[?#]|$)/.test(url))) {
        p.then(res => { if (res && res.ok) res.clone().json().then(remember).catch(() => {}); }).catch(() => {});
      }
    } catch (e) {}
    return p;
  };
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
  const msgText = row => { let t = ''; row.children[1].childNodes.forEach(n => { if (!(n.nodeType === 1 && n.hasAttribute('data-mdp-hp'))) t += n.textContent; }); return t; };
  const sigOf = box => { const r = rowsOf(box); return r.length + '|' + (r[0] ? msgText(r[0]).slice(0, 40) : '') + '|' + (r.length ? msgText(r[r.length - 1]).slice(0, 40) : ''); };
  const API = 'https://mydoujin-backend.onrender.com';
  const datasets = [];
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
    const out = {};
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
  const hpState = new WeakMap();
  function requestReport(ds) {
    if (!ds.reportId || ds.fetching || ds.failed) return;
    let token = null;
    try { token = localStorage.getItem('token'); } catch (e) {}
    if (!token) { ds.failed = true; return; }
    ds.fetching = true;
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
    if (st && st.sig === sig && (st.withP || !st.ds.participants)) return;
    const ds = matchDataset(rows);
    if (!ds) return;
    const res = computeHp(ds);
    clearChips(box);
    rows.forEach((row, k) => { const list = res[ds.idx[k]]; if (list && list.length) row.children[1].appendChild(chipEl(list)); });
    hpState.set(box, { sig, ds, withP: !!ds.participants });
    if (!ds.participants) requestReport(ds);
  }
  let cur = null;
  const seen = new WeakMap();
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
  function scan() {
    if (!tk.on) return;
    try { maskEncounter(); } catch (e) {}
    try {
      ensureStyle();
      document.documentElement.classList.toggle('mdp-step', cfg.mode === 'step');
      document.querySelectorAll('[role="dialog"] h2, [role="alertdialog"] h2, [data-part="title"]').forEach(t => {
        if (t.textContent.trim() !== '戰報') return;
        const d = t.closest('[role="dialog"], [role="alertdialog"], [data-scope="dialog"][data-part="content"]') || (t.matches('[data-part="title"]') ? t.parentElement : null);
        if (d && !d.hasAttribute('data-mdp-report')) d.setAttribute('data-mdp-report', '');
      });
      if (!cur && !findLogBoxes().length) setReveal(false);
    } catch (e) {}
    if (!routeOk()) { if (cur) stopPlayback(true); guard = false; document.documentElement.removeAttribute('data-mdp-guard'); return; }
    if (cur && !cur.box.isConnected) stopPlayback(false);
    if (cur && cur.box.isConnected && cur.playing) {
      const s = sigOf(cur.box);
      if (s !== cur.sig) startPlayback(cur.box);
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
  const hosts = new Map();
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
        if (cfg.mode === 'instant' && cur && cur.playing) finish();
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
      mountAt('report', () => [...document.querySelectorAll('h2')].find(h => h.textContent.replace(/⚙.*$/, '').trim() === '戰鬥過程' && !h.querySelector('[data-mdp-set]')) || null,
        (h, host) => { h.style.display = 'flex'; h.style.alignItems = 'center'; h.style.gap = '10px'; h.appendChild(host); });
    } else if (/^\/boss\/?$/.test(p)) {
      mountAt('boss', () => {
        const code = [...document.querySelectorAll('p')].find(e => e.textContent.trim().startsWith('隊伍代碼：'));
        if (code) return code.parentElement;
        const h = [...document.querySelectorAll('h2')].find(e => e.textContent.trim() === '隊伍');
        return h ? h.parentElement : null;
      }, (row, host) => row.appendChild(host), 'margin-left:auto;');
    } else if (/^\/players\/[^/]+\/?$/.test(p)) {
      mountAt('duel', () => {
        const b = [...document.querySelectorAll('button')].find(x => /^(友好切磋|切磋中)/.test(x.textContent.trim()));
        return b && b.parentElement && b.parentElement.parentElement ? b.parentElement.parentElement : null;
      }, (col, host) => col.parentElement.insertBefore(host, col), 'display:block;margin-top:24px;');
    }
  }
  document.addEventListener('click', e => {
    if (!popOpen) return;
    const path = e.composedPath ? e.composedPath() : [];
    if (![...hosts.values()].some(h => path.includes(h))) { popOpen = false; rerenderAll(); }
  }, true);
  window.addEventListener('resize', () => { if (popOpen) hosts.forEach(h => h.isConnected && placePop(h.__sr)); });
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
  tk.onToggle(on => {
    const de = document.documentElement;
    if (on) { findLogBoxes().forEach(b => seen.set(b, sigOf(b))); schedule(); return; }
    stopPlayback(true);
    guard = false; clearTimeout(guardTimer);
    de.removeAttribute('data-mdp-guard'); de.classList.remove('mdp-step'); setReveal(false);
    showOutcome();
    document.querySelectorAll('[data-mdp-enc]').forEach(e => e.removeAttribute('data-mdp-enc'));
    document.querySelectorAll('[data-mdp-report]').forEach(e => e.removeAttribute('data-mdp-report'));
    findLogBoxes().forEach(b => { clearChips(b); hpState.delete(b); });
    popOpen = false;
    hosts.forEach(h => h.remove()); hosts.clear();
  });
})();
} }),
    Object.assign({"id": "cooldown", "icon": "⏱️", "name": "Boss 冷卻倒數", "desc": "Boss 頁「還有 N 分鐘」改成每秒跳動的「還有 M 分 SS 秒」。", "ver": "1.0.1", "at": "start"}, { run: function (TK) {
// ===== Boss 冷卻倒數 1.0.1（mydoujin_Boss冷卻倒數.user.js）=====
(function () {
  'use strict';
  const tk = (typeof TK === 'object' && TK) || { on: true, onToggle() {} };
  const COOLDOWN_MS = 30 * 60 * 1000;
  const MIN = 60000;
  const EXACT_W = 2000;
  const MAX_PROBES = 8;
  const STORE = 'mdbc:v1';
  const CD_RE = /^(.*?)的\s*Boss\s*挑戰冷卻中，還有\s*(\d+)\s*(分鐘|秒)/;
  let apiBase = 'https://mydoujin-backend.onrender.com';
  let offset = 0;
  let state = null;
  let me = null;
  const anchorTried = new Set();
  let cds = {};
  try { cds = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { cds = {}; }
  const save = () => {
    const now = Date.now();
    for (const k of Object.keys(cds)) if (cds[k].hi < now - 10 * MIN) delete cds[k];
    try { localStorage.setItem(STORE, JSON.stringify(cds)); } catch (e) {  }
  };
  function observe(key, m, unit, tSend, tRecv) {
    let lo, hi;
    if (unit === '秒') { lo = tSend + (m - 1) * 1000; hi = tRecv + m * 1000; }
    else { lo = tSend + (m - 1) * MIN; hi = tRecv + m * MIN; }
    const c = cds[key];
    if (c && c.lo <= hi + 1000 && lo <= c.hi + 1000) {
      c.lo = Math.max(c.lo, lo); c.hi = Math.min(c.hi, hi);
      if (c.lo > c.hi) { const mid = (c.lo + c.hi) / 2; c.lo = c.hi = mid; }
    } else {
      cds[key] = { lo, hi, probes: 0, src: 'obs', id: tRecv };
    }
  }
  function clearDone(keysInBlockers, tSend) {
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
  const origFetch = window.fetch;
  window.fetch = function (input) {
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
    if (seen.size && tk.on) tryAnchor([...seen]);
    render();
  }
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
        if (c && end >= c.lo - 1500 && end <= c.hi + 1500) {
          c.lo = c.hi = end; c.src = 'report';
        }
      }
      save(); render();
    } catch (e) {  }
  }
  let probeTimer = null;
  function scheduleProbe() {
    if (!tk.on || probeTimer || !onBoss() || document.hidden) return;
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
      try { await window.fetch(apiBase + '/api/dungeon/party', { headers: auth() }); } catch (e) {  }
      scheduleProbe();
    }, Math.max(0, best.at - now));
  }
  const auth = () => {
    const t = localStorage.getItem('token');
    return t ? { Authorization: 'Bearer ' + t } : {};
  };
  const onBoss = () => /^\/boss\/?$/.test(location.pathname);
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
    if (!tk.on || !document.body || !onBoss()) return;
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
        const left = (w > EXACT_W ? (c.lo + c.hi) / 2 : c.hi) - now;
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
    if (autoCount >= 3) return;
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '刷新' && !b.disabled);
    if (!btn) return;
    lastAuto = now; autoCount++;
    setTimeout(() => btn.click(), 1500);
  }
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  document.addEventListener('click', e => {
    if (!e.target.closest || !e.target.closest('[data-mdbc-tg]')) return;
    e.preventDefault(); e.stopPropagation();
    try { localStorage.setItem('mdbc:auto', autoRefreshOn() ? '0' : '1'); } catch (err) {  }
    render();
  }, true);
  tk.onToggle(on => {
    if (on) { render(); return; }
    clearTimeout(probeTimer); probeTimer = null;
    document.querySelectorAll('[data-mdbc]').forEach(el => { delete el.dataset.mdbc; el.style.removeProperty('--mdbc-fs'); el.querySelectorAll(':scope > .mdbc').forEach(x => x.remove()); });
  });
  setInterval(render, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  const mo = new MutationObserver(() => { if (!render.q) { render.q = 1; requestAnimationFrame(() => { render.q = 0; render(); }); } });
  const start = () => mo.observe(document.body || document.documentElement, { childList: true, subtree: true, characterData: true });
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
} }),
    Object.assign({"id": "finder", "icon": "🔎", "name": "角色查詢", "desc": "玩家列表與「選擇助戰」裡，依角色和等級查出誰在用。", "ver": "1.2.1", "at": "idle"}, { run: function (TK) {
// ===== 角色查詢 1.2.1（mydoujin_角色查詢.user.js）=====
(function () {
  'use strict';
  const tk = (typeof TK === 'object' && TK) || { on: true, onToggle() {} };
  const API = 'https://mydoujin-backend.onrender.com';
  const P_KEY = 'mdcf:players';
  const A_KEY = 'mdcf:assist';
  const P_FRESH = 30 * 60 * 1000;
  const A_FRESH = 3 * 60 * 1000;
  const SHOW_MAX = 200;
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
  const slimP = p => ({
    id: p.id, nick: p.nickname || '', lv: p.level, ch: p.characterName || '', ti: p.characterTitle || '',
    img: p.imagePath || '', fl: p.floor, hf: p.highestFloor, dead: !!p.isDead,
  });
  let pScan = null;
  function scanPlayers(onProg) {
    if (pScan) return pScan;
    pScan = (async () => {
      const q = p => `/api/players?page=${p}&limit=50&sort=level&order=desc`;
      const first = await api(q(1));
      const total = (first.pagination && first.pagination.totalPages) || 1;
      const pages = { 1: first.players || [] };
      let done = 1; onProg && onProg(done, total);
      const todo = []; for (let p = 2; p <= total; p++) todo.push(p);
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
  @media (max-width: 640px) {
    .lvw { flex: 1 1 100%; }
    .meta { margin-left: 0; width: 100%; }
    select { max-width: none; }
    .list { max-height: 60vh; }
  }`;
  const STAT_ORDER = [['hp', 'HP'], ['atk', '攻'], ['def', '防'], ['sta', '體'], ['agi', '敏'], ['spd', '反'], ['tec', '技'], ['int', '智'], ['luk', '幸']];
  function makeHost(kind) {
    const host = document.createElement('div');
    host.setAttribute('data-mdcf', kind);
    const root = host.attachShadow({ mode: 'open' });
    return { host, root };
  }
  function countByChar(list) {
    const m = new Map();
    list.forEach(x => {
      if (!x.ch) return;
      const o = m.get(x.ch) || { ch: x.ch, n: 0, img: x.img };
      o.n++; m.set(x.ch, o);
    });
    return [...m.values()].sort((a, b) => b.n - a.n || a.ch.localeCompare(b.ch, 'zh-Hant'));
  }
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
  const aUI = { open: ls.get(localStorage, 'mdcf:aOpen') !== false, ch: '', kw: '', lo: '100', hi: '', busy: false, prog: 0, err: '', note: '' };
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
    let h = `<style>${CSS}</style><div class="box${aUI.open ? '' : ' col'}">
      <div class="hd" data-act="toggle"><span class="ttl">🔎 依角色找助戰<small>${esc(rangeTxt(range))}</small></span><span class="meta">${esc(meta)}</span><span class="tg">${aUI.open ? '收起 ▴' : '展開 ▾'}</span></div>`;
    if (!aUI.open) { root.innerHTML = h + '</div>'; return; }
    h += `
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
    if (b.dataset.act === 'toggle') { aUI.open = !aUI.open; ls.set(localStorage, 'mdcf:aOpen', aUI.open); renderAssist(root); return; }
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
  let tick = 0;
  const check = () => { if (!tk.on) return; try { mountPlayers(); mountAssist(); } catch (e) {} };
  tk.onToggle(on => { if (on) check(); else document.querySelectorAll('[data-mdcf]').forEach(e => e.remove()); });
  new MutationObserver(() => { if (!tick) tick = requestAnimationFrame(() => { tick = 0; check(); }); })
    .observe(document, { childList: true, subtree: true });
  check();
})();
} }),
    Object.assign({"id": "reinc", "icon": "⭐", "name": "轉生頁整理", "desc": "首頁一鍵轉生（上一次的角色＋上一輪配點，按兩次確認）；轉生頁：「分配轉生點」放到角色清單左邊、一鍵套用上一輪配點、一鍵取消配點；角色可加到最愛，可只顯示最愛角色。", "ver": "1.3.0", "at": "idle"}, { run: function (TK) {
// ===== 轉生頁整理 1.3.0（mydoujin_轉生最愛.user.js）=====
(function () {
  'use strict';
  const tk = (typeof TK === 'object' && TK) || { on: true, onToggle() {} };
  const FAV_KEY = 'mdrc:fav', ONLY_KEY = 'mdrc:onlyFav';
  const WIDE = 1100;
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {  } };
  let fav = new Set(load(FAV_KEY, []));
  let onlyFav = !!load(ONLY_KEY, false);
  const onPage = () => /^\/reincarnation\/?$/.test(location.pathname);
  const onHome = () => location.pathname === '/';
  const CSS = `
    @media (min-width: ${WIDE}px) {
      [data-mdrc-outer] { max-width: min(1600px, calc(100vw - 32px)) !important; display: grid !important;
        grid-template-columns: minmax(400px, 1fr) minmax(460px, 1.25fr); column-gap: 16px; align-items: start; }
      [data-mdrc-outer] > [data-mdrc-alloc] { grid-column: 1; grid-row: 1; margin-top: 8px !important;
        position: sticky; top: 8px; max-height: calc(100vh - 16px); overflow-y: auto !important; scrollbar-width: thin; }
      [data-mdrc-outer] > [data-mdrc-list] { grid-column: 2; grid-row: 1; }
    }
    [data-mdrc-card] { position: relative; }
    [data-mdrc-card][data-mdrc-hide] { display: none !important; }
    .mdrc-star { position: absolute; top: 6px; right: 6px; z-index: 2; width: 34px; height: 34px; border-radius: 50%;
      border: 1px solid rgba(255,255,255,.18); background: rgba(23,25,35,.82); color: #a0aec0; font-size: 20px; line-height: 30px;
      text-align: center; cursor: pointer; padding: 0; transition: transform .12s, color .12s; }
    .mdrc-star:hover { transform: scale(1.1); color: #f6e05e; }
    .mdrc-star.on { color: #f6e05e; border-color: #d69e2e; background: rgba(116,66,16,.55); }
    .mdrc-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: -4px 0 10px; font-size: 14px; color: #cbd5e0; }
    .mdrc-bar label { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; }
    .mdrc-bar input { width: 16px; height: 16px; accent-color: #d69e2e; }
    .mdrc-bar .mu { color: #a0aec0; font-size: 12px; }
    .mdrc-prev { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 12px; }
    .mdrc-prev button { font: inherit; font-size: 13px; font-weight: 700; color: #fff; background: #2c7a7b; border: 1px solid #4FD1C5;
      border-radius: 6px; padding: 5px 12px; cursor: pointer; }
    .mdrc-prev button:hover { background: #319795; }
    .mdrc-prev button:disabled { opacity: .45; cursor: default; }
    .mdrc-prev .mu { color: #a0aec0; font-size: 12px; }
    .mdrc-prev button.zero { background: #742a2a; border-color: #fc8181; }
    .mdrc-prev button.zero:hover { background: #9b2c2c; }
    .mdrc-zero { min-width: 30px; height: 32px; padding: 0 6px; margin-left: 4px; border-radius: 6px; border: 1px solid #fc8181;
      background: transparent; color: #fc8181; font-size: 13px; font-weight: 700; cursor: pointer; }
    .mdrc-zero:hover { background: rgba(252,129,129,.15); }
    .mdrc-zero:disabled { opacity: .3; cursor: default; background: transparent; }
    .mdrc-home { margin-top: 12px; padding: 10px 12px; border: 1px solid #2c7a7b; background: #171923; color: #e2e8f0; font-size: 14px; line-height: 1.6; }
    .mdrc-home .t { font-weight: 700; color: #81e6d9; margin-bottom: 4px; }
    .mdrc-home .mu { color: #a0aec0; font-size: 12px; }
    .mdrc-home .warn { color: #f6ad55; }
    .mdrc-home .err { color: #fc8181; }
    .mdrc-home .ok { color: #68d391; }
    .mdrc-home label { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; margin-right: 12px; }
    .mdrc-home input { width: 16px; height: 16px; accent-color: #319795; }
    .mdrc-home .acts { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
    .mdrc-home button { font: inherit; font-size: 14px; font-weight: 700; color: #fff; background: #2c7a7b; border: 1px solid #4FD1C5;
      border-radius: 6px; padding: 6px 16px; cursor: pointer; }
    .mdrc-home button:hover { background: #319795; }
    .mdrc-home button.arm { background: #c53030; border-color: #feb2b2; }
    .mdrc-home button:disabled { opacity: .45; cursor: default; }
    .mdrc-home button.ghost { background: transparent; border-color: #4a5568; color: #a0aec0; padding: 6px 10px; }
  `;
  function ensureStyle() {
    if (document.getElementById('mdrc-style')) return;
    const st = document.createElement('style');
    st.id = 'mdrc-style';
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
  function cardId(card) {
    const fk = Object.keys(card).find(k => k.startsWith('__reactFiber$'));
    for (let f = fk && card[fk], i = 0; f && i < 6; f = f.return, i++) if (f.key) return String(f.key);
    const v = [...card.querySelectorAll('td.val')].slice(0, 2).map(td => td.textContent.trim());
    return v.length ? 'n:' + v.join('｜') : null;
  }
  function apply() {
    if (!tk.on) return;
    if (onHome()) homeCard(); else home.data = null;
    if (!onPage()) return;
    const list = document.querySelector('.reincarnation-char-list');
    if (!list || !list.firstElementChild) return;
    ensureStyle();
    let box = list;
    while (box.parentElement && ![...box.parentElement.children].some(c => c !== box && /分配轉生點/.test(c.textContent))) box = box.parentElement;
    const outer = box.parentElement;
    if (outer && outer !== document.body) {
      outer.setAttribute('data-mdrc-outer', '');
      box.setAttribute('data-mdrc-list', '');
      const alloc = [...outer.children].find(c => c !== box && /分配轉生點/.test(c.textContent));
      if (alloc) alloc.setAttribute('data-mdrc-alloc', '');
    }
    const allocBox = outer && outer.querySelector(':scope > [data-mdrc-alloc]');
    const allocHead = allocBox && [...allocBox.querySelectorAll('h2')].find(h => h.textContent.trim() === '分配轉生點');
    if (allocHead && !allocBox.querySelector('.mdrc-prev')) {
      const anchor = allocHead.nextElementSibling || allocHead;
      const pv = document.createElement('div');
      pv.className = 'mdrc-prev';
      pv.innerHTML = '<button type="button" data-mdrc-prev title="把每一項配點調成上一輪轉生時的點數（各項的「上一輪 N 點」）">↺ 使用上一輪的配點</button>' +
        '<button type="button" class="zero" data-mdrc-zeroall title="把這次分配的點數全部退回（每一項歸零）">✕ 取消全部配點</button><span class="mu" data-mdrc-prevmsg></span>';
      pv.querySelector('[data-mdrc-prev]').addEventListener('click', () => usePrevious(allocBox));
      pv.querySelector('[data-mdrc-zeroall]').addEventListener('click', () => zeroAll(allocBox));
      anchor.insertAdjacentElement('afterend', pv);
    }
    if (allocBox) {
      const rows = readRows(allocBox);
      const btn = allocBox.querySelector('[data-mdrc-prev]');
      const has = rows.some(r => r.prev > 0);
      if (btn && btn.disabled === has) btn.disabled = !has;
      const za = allocBox.querySelector('[data-mdrc-zeroall]');
      const any = rows.some(r => r.cur > 0);
      if (za && za.disabled === any) za.disabled = !any;
      rows.forEach(r => {
        const host = r.p10 && r.p10.parentElement;
        if (!host) return;
        let z = host.querySelector(':scope > .mdrc-zero');
        if (!z) {
          z = document.createElement('button');
          z.type = 'button';
          z.className = 'mdrc-zero';
          z.textContent = '✕';
          z.title = `取消「${r.name}」的配點（歸零）`;
          z.addEventListener('click', () => { const row = readRows(allocBox).find(x => x.p10 && x.p10.parentElement === host); if (row) zeroRow(row); });
          host.appendChild(z);
        }
        if (z.disabled === r.cur > 0) z.disabled = !(r.cur > 0);
      });
    }
    const search = list.parentElement && [...list.parentElement.children].find(c => c.tagName === 'INPUT');
    let bar = document.querySelector('.mdrc-bar');
    if (!bar && search) {
      bar = document.createElement('div');
      bar.className = 'mdrc-bar';
      bar.innerHTML = '<label title="只列出按過 ☆ 的角色"><input type="checkbox" data-mdrc-only> 只顯示最愛角色</label><span class="mu" data-mdrc-info></span>';
      bar.querySelector('[data-mdrc-only]').addEventListener('change', e => { onlyFav = e.target.checked; save(ONLY_KEY, onlyFav); apply(); });
      search.insertAdjacentElement('afterend', bar);
    }
    const cards = [...list.firstElementChild.children];
    let favShown = 0;
    cards.forEach(card => {
      const id = cardId(card);
      if (!id) return;
      card.setAttribute('data-mdrc-card', '');
      let star = card.querySelector(':scope > .mdrc-star');
      if (!star) {
        star = document.createElement('button');
        star.type = 'button';
        star.className = 'mdrc-star';
        star.addEventListener('click', e => {
          e.stopPropagation(); e.preventDefault();
          const cid = cardId(card);
          if (fav.has(cid)) fav.delete(cid); else fav.add(cid);
          save(FAV_KEY, [...fav]);
          apply();
        });
        card.appendChild(star);
      }
      const on = fav.has(id);
      if (on) favShown++;
      star.classList.toggle('on', on);
      if (star.textContent !== (on ? '★' : '☆')) star.textContent = on ? '★' : '☆';
      star.title = on ? '從最愛移除' : '加到最愛';
      card.toggleAttribute('data-mdrc-hide', onlyFav && fav.size > 0 && !on);
    });
    if (bar) {
      const cb = bar.querySelector('[data-mdrc-only]');
      if (cb.checked !== onlyFav) cb.checked = onlyFav;
      const info = bar.querySelector('[data-mdrc-info]');
      const txt = !fav.size ? '點卡片右上角的 ☆ 加到最愛'
        : onlyFav ? `顯示 ${favShown} 隻最愛角色` : `最愛 ${fav.size} 隻`;
      if (info.textContent !== txt) info.textContent = txt;
    }
  }
  function readRows(box) {
    return [...box.querySelectorAll('.rp-table tr')].map(tr => {
      const ctrl = tr.querySelector('td.ctrl');
      if (!ctrl) return null;
      const ps = [...ctrl.querySelectorAll('p')];
      const cur = ps.map(p => p.textContent.trim()).find(t => /^\d+$/.test(t));
      const pm = ps.map(p => p.textContent.match(/上一輪\s*(\d+)\s*點/)).find(Boolean);
      const btn = re => [...ctrl.querySelectorAll('button')].find(b => re.test(b.getAttribute('aria-label') || ''));
      return {
        name: (tr.querySelector('td.label') || {}).textContent?.trim() || '?',
        cur: cur == null ? null : +cur, prev: pm ? +pm[1] : 0,
        m10: btn(/^減少.*配點 10 點$/), m1: btn(/^減少.*配點$/), p1: btn(/^增加.*配點$/), p10: btn(/^增加.*配點 10 點$/),
      };
    }).filter(r => r && r.cur != null);
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const press = (b, n) => { for (let i = 0; i < n && b; i++) b.click(); };
  let prevBusy = false;
  async function usePrevious(box) {
    if (prevBusy) return;
    prevBusy = true;
    const msg = box.querySelector('[data-mdrc-prevmsg]');
    try {
      let rows = readRows(box);
      if (!rows.some(r => r.prev > 0)) { if (msg) msg.textContent = '沒有上一輪的配點'; return; }
      rows.forEach(r => { const d = r.cur - r.prev; if (d > 0) { press(r.m10, Math.floor(d / 10)); press(r.m1, d % 10); } });
      await wait(80);
      readRows(box).forEach(r => { const d = r.prev - r.cur; if (d > 0) { press(r.p10, Math.floor(d / 10)); press(r.p1, d % 10); } });
      await wait(120);
      rows = readRows(box);
      const bad = rows.filter(r => r.cur !== r.prev);
      const done = rows.filter(r => r.prev > 0).map(r => `${r.name} ${r.prev}`).join('、');
      if (msg) msg.textContent = bad.length
        ? `可用點數不夠，差 ${bad.reduce((a, r) => a + (r.prev - r.cur), 0)} 點（${bad.map(r => `${r.name} ${r.cur}/${r.prev}`).join('、')}）`
        : `已套用：${done}`;
    } finally { prevBusy = false; }
  }
  const zeroRow = r => { if (r.cur > 0) { press(r.m10, Math.floor(r.cur / 10)); press(r.m1, r.cur % 10); } };
  async function zeroAll(box) {
    const msg = box.querySelector('[data-mdrc-prevmsg]');
    readRows(box).forEach(zeroRow);
    await wait(120);
    const left = readRows(box).filter(r => r.cur > 0);
    if (msg) msg.textContent = left.length ? `還有 ${left.map(r => r.name).join('、')} 沒歸零，請再按一次` : '已取消全部配點';
  }
  const API = 'https://mydoujin-backend.onrender.com/api';
  const LEGACY_KEY = 'mdrc:legacy';
  const ALLOC_KEYS = ['hp', 'atk', 'def', 'sta', 'agi', 'spd', 'tec', 'int', 'luk', 'expBonus', 'eventBonus', 'effortBonus', 'aggroIncrease', 'aggroDecrease'];
  const ALLOC_NAME = { hp: 'HP', atk: '攻擊', def: '防禦', sta: '體力', agi: '敏捷', spd: '反應速度', tec: '技巧', int: '智力', luk: '幸運',
    expBonus: '經驗值加成', eventBonus: '事件觸發加速', effortBonus: '增加行動努力值', aggroIncrease: '增加仇恨', aggroDecrease: '減少仇恨' };
  const home = { data: null, loading: false, err: '', msg: '', msgCls: 'mu', armUntil: 0, busy: false };
  const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  async function api(path, opt) {
    const t = localStorage.getItem('token');
    const r = await fetch(API + path, { ...opt, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || j.message || 'HTTP ' + r.status);
    return j;
  }
  async function loadHome() {
    const [all, act] = await Promise.all([api('/characters'), api('/characters/active')]);
    const a = act.character || {};
    const rein = all.reincarnation || {};
    const ch = (all.characters || []).find(c => c._id === a._id);
    const allocation = Object.fromEntries(ALLOC_KEYS.map(k => [k, +(rein.allocated || {})[k] || 0]));
    const id = ch && (ch.reincarnationIdentity || ch);
    return { ch, name: id ? id.name : a.name, title: id ? id.title : a.title, level: +a.level || 0, allocation, rein };
  }
  function refreshHome() {
    if (home.loading) return;
    home.loading = true; home.err = '';
    loadHome().then(d => { home.data = d; }, e => { home.err = e.message; home.data = { failed: true }; })
      .finally(() => { home.loading = false; paintHome(); });
  }
  function homeCard() {
    const h = [...document.querySelectorAll('h2')].find(x => x.textContent.trim() === '我的角色');
    const content = h && h.nextElementSibling;
    if (!content) return;
    ensureStyle();
    let box = content.parentElement.querySelector(':scope > .mdrc-home');
    if (!box) {
      box = document.createElement('div');
      box.className = 'mdrc-home';
      box.addEventListener('click', onHomeClick);
      box.addEventListener('change', e => { if (e.target.matches('[data-mdrc-legacy]')) { save(LEGACY_KEY, e.target.checked); home.armUntil = 0; paintHome(); } });
      content.insertAdjacentElement('afterend', box);
      paintHome();
    }
    if (!home.data && !home.loading) refreshHome();
  }
  function paintHome() {
    const box = document.querySelector('.mdrc-home');
    if (!box) return;
    const d = home.data;
    let html = '<div class="t">⟳ 一鍵轉生（上一次的角色＋上一輪配點）</div>';
    if (!d) html += '<div class="mu">讀取中…</div>';
    else if (d.failed) html += `<div class="err">讀取失敗：${esc(home.err)}</div><div class="acts"><button type="button" class="ghost" data-act="reload">重新讀取</button></div>`;
    else {
      const used = ALLOC_KEYS.filter(k => d.allocation[k] > 0);
      const sum = used.reduce((a, k) => a + d.allocation[k], 0);
      const total = +d.rein.total || 0;
      const legacy = !!d.rein.legacyUnlocked && !!load(LEGACY_KEY, false);
      const armed = Date.now() < home.armUntil;
      html += `<div>角色：<b>${esc(d.name)}</b>${d.title ? `（${esc(d.title)}）` : ''}　目前 Lv.${d.level}${d.level < 100 ? ' <span class="warn">⚠ 還沒滿 100 級</span>' : ''}</div>`;
      html += !d.ch ? '<div class="err">轉生清單裡找不到目前的角色，請到轉生頁自己選。</div>' : '';
      html += `<div>配點：${used.length ? used.map(k => `${ALLOC_NAME[k]} ${d.allocation[k]}`).join('、') : '<span class="warn">上一輪沒有配點（這次也不配）</span>'}` +
        `<span class="mu">（共 ${sum}／可用 ${total} 點）</span></div>`;
      if (sum > total) html += '<div class="err">上一輪配點超過目前可用點數，請到轉生頁自己配。</div>';
      html += '<div>' + (d.rein.legacyUnlocked ? `<label title="勾了會保留一半的總經驗值與事件能力值（跟轉生頁的「傳承」一樣）"><input type="checkbox" data-mdrc-legacy ${legacy ? 'checked' : ''}> 傳承</label>` : '') +
        '<span class="mu">不跳樓；其他設定照轉生頁預設</span></div>';
      const can = d.ch && sum <= total && !home.busy;
      html += `<div class="acts"><button type="button" data-act="go" class="${armed ? 'arm' : ''}" ${can ? '' : 'disabled'}>` +
        `${home.busy ? '轉生中…' : armed ? `確定轉生成「${esc(d.name)}」？再按一次` : '轉生'}</button>` +
        (armed ? '<button type="button" class="ghost" data-act="cancel">取消</button>' : '<button type="button" class="ghost" data-act="reload" title="重新讀取角色與配點">↻</button>') + '</div>';
    }
    if (home.msg) html += `<div class="${home.msgCls}">${esc(home.msg)}</div>`;
    if (box.dataset.h !== html) { box.innerHTML = html; box.dataset.h = html; }
  }
  function onHomeClick(e) {
    const b = e.target.closest('button[data-act]');
    if (!b || b.disabled) return;
    const act = b.dataset.act;
    if (act === 'reload') { home.msg = ''; home.armUntil = 0; home.data = null; paintHome(); refreshHome(); return; }
    if (act === 'cancel') { home.armUntil = 0; paintHome(); return; }
    if (act !== 'go') return;
    if (Date.now() >= home.armUntil) {
      home.armUntil = Date.now() + 5000; home.msg = '';
      paintHome();
      setTimeout(paintHome, 5050);
      return;
    }
    doReincarnate();
  }
  async function doReincarnate() {
    home.armUntil = 0; home.busy = true; home.msg = ''; paintHome();
    try {
      const d = await loadHome();
      if (!d.ch) throw new Error('轉生清單裡找不到目前的角色');
      const sum = ALLOC_KEYS.reduce((a, k) => a + d.allocation[k], 0);
      if (sum > (+d.rein.total || 0)) throw new Error('上一輪配點超過目前可用點數');
      const body = { userCharacterId: d.ch._id, allocation: d.allocation, jumpToFirstFloor: false, jumpToFloor: 1,
        legacy: !!d.rein.legacyUnlocked && !!load(LEGACY_KEY, false), keepProgress: false };
      const r = await api('/characters/reincarnate', { method: 'POST', body: JSON.stringify(body) });
      const gain = (r.gainCharacters || []).map(c => `${c.name}（${c.title}）`);
      home.msg = `轉生完成：${d.name}${body.legacy ? '（傳承）' : ''}${gain.length ? `；解鎖新角色：${gain.join('、')}` : ''}，頁面即將重新整理…`;
      home.msgCls = 'ok';
      paintHome();
      setTimeout(() => location.reload(), gain.length ? 4000 : 1500);
    } catch (e) {
      home.msg = '轉生失敗：' + e.message; home.msgCls = 'err';
      home.busy = false; home.data = null; paintHome(); refreshHome();
    }
  }
  const of = window.fetch;
  window.fetch = function (input, init) {
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      if (/\/api\/characters\/reincarnate$/.test(url) && init && typeof init.body === 'string') {
        const b = JSON.parse(init.body);
        if (b && 'legacy' in b) save(LEGACY_KEY, !!b.legacy);
      }
    } catch (e) {  }
    return of.apply(this, arguments);
  };
  function clear() {
    home.data = null; home.armUntil = 0;
    document.querySelectorAll('.mdrc-star, .mdrc-bar, .mdrc-prev, .mdrc-zero, .mdrc-home').forEach(e => e.remove());
    ['data-mdrc-outer', 'data-mdrc-list', 'data-mdrc-alloc', 'data-mdrc-card', 'data-mdrc-hide'].forEach(a =>
      document.querySelectorAll('[' + a + ']').forEach(e => e.removeAttribute(a)));
  }
  let queued = false;
  const schedule = () => { if (!queued) { queued = true; setTimeout(() => { queued = false; try { apply(); } catch (e) {  } }, 30); } };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  window.addEventListener('storage', e => { if (e.key === FAV_KEY || e.key === ONLY_KEY) { fav = new Set(load(FAV_KEY, [])); onlyFav = !!load(ONLY_KEY, false); schedule(); } });
  tk.onToggle(on => { if (on) schedule(); else clear(); });
  schedule();
})();
} }),
    Object.assign({"id": "avatar", "icon": "🐱", "name": "首頁頭像", "desc": "首頁「我的角色」的頭像換成自訂動圖（只改自己畫面上的顯示）。", "ver": "1.0.0", "at": "idle"}, { run: function (TK) {
// ===== 首頁頭像 1.0.0（mydoujin_首頁頭像.user.js）=====
(function () {
  'use strict';
  const tk = (typeof TK === 'object' && TK) || { on: true, onToggle() {} };
  const AVATAR = 'data:image/webp;base64,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';
  function apply() {
    if (!tk.on || location.pathname !== '/') return;
    const h = [...document.querySelectorAll('h2')].find(x => x.textContent.trim() === '我的角色');
    const img = h && h.parentElement && h.parentElement.querySelector('img');
    if (!img) return;
    const cur = img.getAttribute('src');
    if (cur === AVATAR) return;
    img.dataset.mdavOrig = cur || '';
    if (img.hasAttribute('srcset')) { img.dataset.mdavSrcset = img.getAttribute('srcset'); img.removeAttribute('srcset'); }
    img.setAttribute('src', AVATAR);
    img.setAttribute('data-mdav', '');
  }
  function clear() {
    document.querySelectorAll('img[data-mdav]').forEach(img => {
      if (img.getAttribute('src') === AVATAR && img.dataset.mdavOrig) img.setAttribute('src', img.dataset.mdavOrig);
      if (img.dataset.mdavSrcset) img.setAttribute('srcset', img.dataset.mdavSrcset);
      ['data-mdav', 'data-mdav-orig', 'data-mdav-srcset'].forEach(a => img.removeAttribute(a));
    });
  }
  let queued = false;
  const schedule = () => { if (!queued) { queued = true; setTimeout(() => { queued = false; try { apply(); } catch (e) {  } }, 30); } };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  tk.onToggle(on => { if (on) schedule(); else clear(); });
  schedule();
})();
} }),
  ];
  const offAtLoad = readOff();
  const status = {};
  const ctxs = {};
  for (const m of MODS) {
    const subs = [];
    const ctx = ctxs[m.id] = { on: !offAtLoad.includes(m.id), onToggle(fn) { subs.push(fn); }, _subs: subs };
    const go = () => {
      try { m.run(ctx); status[m.id] = 'ok'; }
      catch (e) { status[m.id] = 'err'; console.error('[我的同人工具箱] ' + m.name + ' 啟動失敗', e); }
    };
    if (m.at === 'idle' && document.readyState === 'loading') { status[m.id] = 'ok'; document.addEventListener('DOMContentLoaded', go, { once: true }); }
    else go();
  }
  function setOn(id, on) {
    const ctx = ctxs[id];
    if (!ctx || ctx.on === on) return;
    ctx.on = on;
    const off = readOff().filter(x => x !== id);
    if (!on) off.push(id);
    writeOff(off);
    ctx._subs.forEach(fn => { try { fn(on); } catch (e) { console.error('[我的同人工具箱] 切換失敗', id, e); } });
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: "Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif; }
    .fab { position: fixed; left: 14px; bottom: calc(14px + env(safe-area-inset-bottom)); z-index: 2147482990;
      width: 44px; height: 44px; border-radius: 50%; border: 1px solid #2d3748; background: #171c27; color: #e2e8f0;
      cursor: pointer; opacity: .85; padding: 0; overflow: visible;
      box-shadow: 0 4px 14px rgba(0,0,0,.45); transition: opacity .15s, transform .15s; }
    .fab img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; pointer-events: none; }
    .fab:hover, .fab.open { opacity: 1; transform: scale(1.08); }
    .pan { position: fixed; left: 14px; bottom: calc(68px + env(safe-area-inset-bottom)); z-index: 2147483001; width: 360px;
      max-width: calc(100vw - 28px); max-height: calc(100vh - 90px); overflow: auto; background: #1a1f2e; color: #e2e8f0;
      border: 1px solid #2d3748; border-radius: 12px; box-shadow: 0 12px 34px rgba(0,0,0,.55); font-size: 13px; display: none; }
    .pan.show { display: block; }
    .hd { display: flex; align-items: center; gap: 8px; padding: 11px 14px; border-bottom: 1px solid #2d3748; position: sticky; top: 0; background: #1a1f2e; z-index: 1; }
    .hd img { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; }
    .hd b { font-size: 15px; } .hd small { color: #718096; } .hd .x { margin-left: auto; background: none; border: 0; color: #a0aec0; font-size: 16px; cursor: pointer; }
    .card { margin: 10px 12px; padding: 10px 12px; border: 1px solid #2d3748; border-radius: 10px; background: #171c27; }
    .card.off { opacity: .62; }
    .row { display: flex; align-items: center; gap: 8px; }
    .ic { font-size: 18px; width: 24px; text-align: center; }
    .nm { font-weight: bold; font-size: 14px; } .ver { color: #718096; font-size: 11px; }
    .st { font-size: 11px; padding: 1px 7px; border-radius: 9px; margin-left: 2px; white-space: nowrap; }
    .st.on { background: #1c4532; color: #9ae6b4; } .st.off { background: #2d3748; color: #a0aec0; }
    .st.err { background: #63171b; color: #feb2b2; }
    .sw { margin-left: auto; position: relative; width: 40px; height: 22px; flex: none; cursor: pointer; }
    .sw input { opacity: 0; width: 0; height: 0; position: absolute; }
    .sw span { position: absolute; inset: 0; border-radius: 11px; background: #4a5568; transition: background .15s; }
    .sw span::after { content: ''; position: absolute; left: 3px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .15s; }
    .sw input:checked + span { background: #319795; } .sw input:checked + span::after { transform: translateX(18px); }
    .ds { color: #a0aec0; margin: 6px 0 0 32px; line-height: 1.5; }
    .ft { padding: 10px 14px 14px; color: #a0aec0; font-size: 12px; line-height: 1.6; border-top: 1px solid #2d3748; }
    .ft .acts { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
    .btn { border: 1px solid #2d3748; background: #2d3748; color: #e2e8f0; padding: 5px 12px; border-radius: 7px; cursor: pointer; font-size: 12px; }
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
      <button class="fab" title="我的同人工具箱：查看功能、開關"><img src="${ICON}" alt="工具箱"></button>
      <div class="pan" role="dialog" aria-label="我的同人工具箱"></div>`;
    fab = root.querySelector('.fab');
    pan = root.querySelector('.pan');
    fab.addEventListener('click', () => toggle());
    pan.addEventListener('change', e => {
      const id = e.target.dataset && e.target.dataset.id;
      if (!id) return;
      setOn(id, e.target.checked);
      paint();
    });
    pan.addEventListener('click', e => {
      const a = e.target.closest('[data-act]');
      if (!a) return;
      if (a.dataset.act === 'close') toggle(false);
      if (a.dataset.act === 'all') { MODS.forEach(m => setOn(m.id, true)); paint(); }
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
    const cards = MODS.map(m => {
      const on = ctxs[m.id].on;
      const st = status[m.id] === 'err' ? '<span class="st err">啟動失敗</span>'
        : on ? '<span class="st on">開啟</span>' : '<span class="st off">關閉</span>';
      return `<div class="card${on ? '' : ' off'}">
        <div class="row"><span class="ic">${m.icon}</span><span class="nm">${esc(m.name)}</span><span class="ver">v${esc(m.ver)}</span>${st}
          <label class="sw" title="${on ? '關閉' : '開啟'}「${esc(m.name)}」"><input type="checkbox" data-id="${m.id}" ${on ? 'checked' : ''}><span></span></label></div>
        <div class="ds">${esc(m.desc)}</div>
      </div>`;
    }).join('');
    const anyOff = MODS.some(m => !ctxs[m.id].on);
    pan.innerHTML = `<div class="hd"><img src="${ICON}" alt=""><b>我的同人工具箱</b><small>v${esc(TK_VER)}</small><button class="x" data-act="close" title="關閉">✕</button></div>
      ${cards}
      <div class="ft">開關<b>立即生效</b>，不用重新整理；設定存在這個瀏覽器裡。
        <div class="acts"><button class="btn" data-act="all" ${anyOff ? '' : 'disabled'}>全部開啟</button></div></div>`;
  }
  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build, { once: true });
})();