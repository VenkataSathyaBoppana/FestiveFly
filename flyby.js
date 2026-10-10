// Injected into the page (or loaded on the welcome page for previews).
// Reads its config from window.__festiveFlybyCfg, draws a flyby in a closed shadow root, then cleans up.
(() => {
  const cfg = window.__festiveFlybyCfg;
  try { delete window.__festiveFlybyCfg; } catch { window.__festiveFlybyCfg = undefined; }
  if (!cfg || document.getElementById('festive-flyby-host')) return;

  // ---------- original artwork (all face left: they fly right → left) ----------
  const ART = {

    sun: `
<svg viewBox="0 0 240 100" width="250" height="104" aria-hidden="true"><g class="bob">
  <g class="spin" stroke="#f59e0b" stroke-width="5" stroke-linecap="round">
    <path d="M70 6 V16 M70 84 V94 M26 50 H36 M104 50 H114 M39 19 L46 26 M94 74 L101 81 M39 81 L46 74 M94 26 L101 19"/>
  </g>
  <circle cx="70" cy="50" r="27" fill="#fbbf24"/>
  <circle cx="70" cy="50" r="27" fill="none" stroke="#f59e0b" stroke-width="3"/>
  <path d="M58 45 q3 -4 6 0 M76 45 q3 -4 6 0" stroke="#7c2d12" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M60 56 q10 9 20 0" stroke="#7c2d12" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <circle cx="55" cy="54" r="3.5" fill="#fb923c" opacity=".7"/><circle cx="85" cy="54" r="3.5" fill="#fb923c" opacity=".7"/>
  <!-- coffee mug -->
  <path d="M136 42 H170 V70 Q170 80 160 80 H146 Q136 80 136 70 Z" fill="#2563eb"/>
  <path d="M170 48 Q182 48 182 58 Q182 68 170 68" stroke="#2563eb" stroke-width="5" fill="none"/>
  <rect x="136" y="42" width="34" height="5" fill="#1d4ed8"/>
  <path d="M146 36 q-4 -6 0 -12 q4 -6 0 -12 M156 36 q-4 -6 0 -12 q4 -6 0 -12" stroke="#94a3b8" stroke-width="2.4" fill="none" stroke-linecap="round" class="steam"/>
  <path d="M146 60 l3 -4 3 4 3 -4 3 4 3 -4" stroke="#fde68a" stroke-width="2" fill="none"/>
</g></svg>`,
    moon: `
<svg viewBox="0 0 240 100" width="250" height="104" aria-hidden="true"><g class="bob">
  <g fill="#fbbf24" class="twk">
    <path d="M150 20 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z"/>
    <path d="M190 58 l2 4.5 4.5 2 -4.5 2 -2 4.5 -2 -4.5 -4.5 -2 4.5 -2z"/>
    <path d="M214 26 l1.6 3.6 3.6 1.6 -3.6 1.6 -1.6 3.6 -1.6 -3.6 -3.6 -1.6 3.6 -1.6z"/>
  </g>
  <path d="M92 12 A40 40 0 1 0 118 82 A32 32 0 1 1 92 12 Z" fill="#facc15"/>
  <path d="M70 52 q4 3 8 0" stroke="#78350f" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M66 62 q6 4 12 0" stroke="#78350f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="62" cy="58" r="3" fill="#fb923c" opacity=".6"/>
  <!-- nightcap -->
  <path d="M60 26 Q84 4 110 18 Q96 20 86 30 Z" fill="#6366f1"/>
  <path d="M58 26 Q72 32 88 30" stroke="#e0e7ff" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="112" cy="19" r="5" fill="#e0e7ff"/>
  <text x="124" y="48" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#818cf8" class="zz">z</text>
  <text x="136" y="36" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="#a5b4fc" class="zz">z</text>
</g></svg>`,
    christmas: `
<svg viewBox="0 0 240 100" width="250" height="104" aria-hidden="true">
  <g class="bob">
    <!-- sack + gifts -->
    <ellipse cx="188" cy="42" rx="15" ry="14" fill="#8a5a2b"/>
    <path d="M182 29 q6 -6 12 0" stroke="#5c3a17" stroke-width="3" fill="none"/>
    <rect x="178" y="22" width="11" height="10" rx="1.5" fill="#1f9d55"/>
    <rect x="182.5" y="22" width="2" height="10" fill="#f4c542"/>
    <!-- Santa -->
    <path d="M140 52 q-2 -24 16 -26 q18 2 16 26 z" fill="#d62828"/>
    <rect x="141" y="44" width="30" height="4" fill="#2b2b2b"/>
    <rect x="152" y="43.5" width="6" height="5" rx="1" fill="#f4c542"/>
    <circle cx="151" cy="24" r="8.5" fill="#f5c9a6"/>
    <ellipse cx="150" cy="32" rx="9.5" ry="8.5" fill="#fbfbfb"/>
    <circle cx="146" cy="22.5" r="1.3" fill="#2b2b2b"/>
    <circle cx="143.5" cy="26" r="2" fill="#f0a58a"/>
    <path d="M141 19 q9 -16 28 -7 l-8 7 z" fill="#d62828"/>
    <rect x="140" y="17" width="23" height="5" rx="2.5" fill="#fbfbfb"/>
    <circle cx="170" cy="13" r="3.8" fill="#fbfbfb"/>
    <path d="M146 40 L127 48" stroke="#d62828" stroke-width="6" stroke-linecap="round"/>
    <circle cx="126" cy="48.5" r="3.4" fill="#2b2b2b"/>
    <!-- sleigh -->
    <path d="M112 52 L196 52 Q204 52 202 68 Q200 82 186 82 L130 82 Q112 82 112 66 Z" fill="#b5122b"/>
    <path d="M112 55 L200 55" stroke="#f4c542" stroke-width="3"/>
    <path d="M132 66 q8 -6 16 0 q8 6 16 0 q8 -6 16 0" stroke="#f4c542" stroke-width="2" fill="none"/>
    <path d="M100 91 L192 91 Q206 91 206 80 M100 91 Q90 91 93 82" stroke="#e0b030" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M132 82 V91 M178 82 V91" stroke="#e0b030" stroke-width="3"/>
    <!-- reins + harness -->
    <path d="M124 49 Q98 58 72 52" stroke="#e0b030" stroke-width="1.8" fill="none"/>
    <path d="M76 56 L112 64" stroke="#7a4a1e" stroke-width="3"/>
    <!-- reindeer -->
    <g class="legs">
      <path d="M36 62 L26 76 M43 64 L38 79 M62 64 L72 76 M68 61 L82 70" stroke="#6b4423" stroke-width="4" stroke-linecap="round"/>
    </g>
    <ellipse cx="52" cy="55" rx="27" ry="13" fill="#9a6632"/>
    <ellipse cx="54" cy="59" rx="16" ry="6" fill="#c89663"/>
    <path d="M78 50 q8 -6 6 4" fill="#c89663"/>
    <path d="M34 50 L24 38 L32 34 L42 46 Z" fill="#9a6632"/>
    <ellipse cx="20" cy="37" rx="11.5" ry="8" fill="#9a6632"/>
    <circle cx="9.5" cy="38.5" r="3.2" fill="#3a2415"/>
    <circle cx="18" cy="33.5" r="1.6" fill="#1a1a1a"/>
    <path d="M26 31 q-4 -3 2 -6" fill="#9a6632"/>
    <path d="M22 30 L18 14 M18 21 L10 16 M18 17 L22 9 M26 30 L30 15 M29 21 L37 17 M30 17 L27 9" stroke="#c9a06a" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <path d="M30 48 L42 46" stroke="#d62828" stroke-width="4" stroke-linecap="round"/>
    <circle cx="36" cy="51" r="2.4" fill="#f4c542"/>
  </g>
</svg>`,

    navratri: `
<svg viewBox="0 0 240 100" width="250" height="104" aria-hidden="true"><g class="bob">
  <!-- flaming arrow -->
  <g class="flame">
    <path d="M14 40 Q2 30 10 18 Q12 28 20 30 Q16 20 24 10 Q26 24 34 32 Q30 40 22 44 Z" fill="#f97316"/>
    <path d="M18 40 Q12 34 16 26 Q20 32 24 32 Q26 38 22 42 Z" fill="#fde047"/>
  </g>
  <path d="M22 40 L36 32 L36 48 Z" fill="#9ca3af"/>
  <path d="M34 40 L196 40" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>
  <path d="M182 40 L202 26 L210 26 L194 40 L210 54 L202 54 Z" fill="#dc2626"/>
  <path d="M170 40 L188 30 L194 30 L180 40 L194 50 L188 50 Z" fill="#f59e0b"/>
  <!-- dandiya sticks -->
  <g class="clack">
    <path d="M74 88 L104 56" stroke="#db2777" stroke-width="5" stroke-linecap="round"/>
    <path d="M104 88 L74 56" stroke="#7c3aed" stroke-width="5" stroke-linecap="round"/>
    <path d="M80 81 l4 -4 M98 81 l-4 -4" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
  </g>
  <!-- marigolds -->
  <g><circle cx="138" cy="74" r="10" fill="#f59e0b"/><circle cx="138" cy="74" r="6.5" fill="#fb923c"/><circle cx="138" cy="74" r="3" fill="#c2410c"/></g>
  <g><circle cx="160" cy="80" r="8" fill="#facc15"/><circle cx="160" cy="80" r="5" fill="#f59e0b"/><circle cx="160" cy="80" r="2.2" fill="#b45309"/></g>
  <path d="M146 70 q6 -8 12 -2" stroke="#16a34a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</g></svg>`,
    diwali: `
<svg viewBox="0 0 240 100" width="250" height="104" aria-hidden="true"><g class="bob">
  <!-- rangoli -->
  <g transform="translate(176 56)">
    <circle r="30" fill="#db2777" opacity=".9"/>
    <g fill="#f59e0b"><path d="M0 -28 Q8 -14 0 0 Q-8 -14 0 -28Z"/><path d="M0 28 Q8 14 0 0 Q-8 14 0 28Z"/><path d="M-28 0 Q-14 8 0 0 Q-14 -8 -28 0Z"/><path d="M28 0 Q14 8 0 0 Q14 -8 28 0Z"/></g>
    <g fill="#22c55e" transform="rotate(45)"><path d="M0 -24 Q6 -12 0 0 Q-6 -12 0 -24Z"/><path d="M0 24 Q6 12 0 0 Q-6 12 0 24Z"/><path d="M-24 0 Q-12 6 0 0 Q-12 -6 -24 0Z"/><path d="M24 0 Q12 6 0 0 Q12 -6 24 0Z"/></g>
    <circle r="7" fill="#fde047"/><circle r="3" fill="#7c3aed"/>
  </g>
  <!-- diya -->
  <g class="flame"><path d="M76 40 Q66 26 78 10 Q86 26 80 40 Z" fill="#f97316"/><path d="M77 40 Q72 32 78 22 Q82 32 79 40 Z" fill="#fde047"/></g>
  <path d="M42 46 Q78 56 116 44 Q110 76 78 78 Q48 76 42 46 Z" fill="#b45309"/>
  <path d="M42 46 Q78 56 116 44" stroke="#78350f" stroke-width="3" fill="none"/>
  <path d="M54 62 q6 4 12 0 q6 -4 12 0 q6 4 12 0 q6 -4 12 0" stroke="#fde047" stroke-width="2" fill="none"/>
  <!-- phuljhadi -->
  <path d="M8 86 L36 58" stroke="#6b7280" stroke-width="2.5" stroke-linecap="round"/>
  <g class="twk" stroke="#fde047" stroke-width="2" stroke-linecap="round">
    <path d="M36 58 l-8 -6 M36 58 l2 -10 M36 58 l10 -4 M36 58 l9 6 M36 58 l-10 2"/>
  </g>
</g></svg>`,
    holi: `
<svg viewBox="0 0 240 100" width="250" height="104" aria-hidden="true"><g class="bob">
  <!-- colour clouds -->
  <circle cx="30" cy="34" r="14" fill="#ec4899" opacity=".85" class="puff"/>
  <circle cx="18" cy="60" r="11" fill="#facc15" opacity=".85" class="puff"/>
  <circle cx="44" cy="70" r="9" fill="#22c55e" opacity=".85" class="puff"/>
  <circle cx="52" cy="44" r="8" fill="#3b82f6" opacity=".85" class="puff"/>
  <!-- spray -->
  <g fill="#a855f7"><circle cx="66" cy="50" r="3"/><circle cx="76" cy="46" r="2.4"/><circle cx="74" cy="56" r="2"/><circle cx="86" cy="51" r="2.6"/></g>
  <!-- pichkari -->
  <path d="M92 52 L104 48 L104 56 Z" fill="#0ea5e9"/>
  <rect x="104" y="42" width="70" height="20" rx="8" fill="#22c55e"/>
  <rect x="112" y="46" width="54" height="5" rx="2.5" fill="#bbf7d0"/>
  <rect x="174" y="48" width="26" height="8" fill="#16a34a"/>
  <rect x="200" y="40" width="8" height="24" rx="3" fill="#f97316"/>
  <!-- gulaal bowl -->
  <path d="M120 74 Q150 96 180 74 Z" fill="#7c3aed"/>
  <path d="M126 74 Q150 62 174 74 Z" fill="#ec4899"/>
</g></svg>`,
    rakhi: `
<svg viewBox="0 0 240 100" width="250" height="104" aria-hidden="true"><g class="bob">
  <!-- thread -->
  <path d="M10 52 Q60 40 100 50 M140 50 Q180 60 224 48" stroke="#dc2626" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M10 52 Q60 40 100 50 M140 50 Q180 60 224 48" stroke="#fde047" stroke-width="1.5" stroke-dasharray="4 5" fill="none"/>
  <circle cx="14" cy="52" r="4" fill="#fde047"/><circle cx="220" cy="48" r="4" fill="#fde047"/>
  <!-- centrepiece -->
  <g transform="translate(120 50)" class="spinslow">
    <g fill="#f59e0b"><circle cx="0" cy="-20" r="9"/><circle cx="0" cy="20" r="9"/><circle cx="-20" cy="0" r="9"/><circle cx="20" cy="0" r="9"/>
      <circle cx="14" cy="14" r="9"/><circle cx="-14" cy="14" r="9"/><circle cx="14" cy="-14" r="9"/><circle cx="-14" cy="-14" r="9"/></g>
    <circle r="16" fill="#db2777"/><circle r="10" fill="#fde047"/><circle r="4.5" fill="#16a34a"/>
  </g>
  <!-- sweets box -->
  <rect x="168" y="66" width="34" height="22" rx="3" fill="#7c3aed"/>
  <rect x="183" y="66" width="4" height="22" fill="#fde047"/>
  <path d="M178 66 q7 -10 7 0 q0 -10 7 0" stroke="#fde047" stroke-width="2.5" fill="none"/>
</g></svg>`,
    ganesh: `
<svg viewBox="0 0 240 100" width="250" height="104" aria-hidden="true"><g class="bob">
  <!-- marigold toran -->
  <path d="M10 14 Q120 44 230 14" stroke="#16a34a" stroke-width="2" fill="none"/>
  <g fill="#f59e0b"><circle cx="30" cy="20" r="6"/><circle cx="70" cy="30" r="6"/><circle cx="120" cy="35" r="6"/><circle cx="170" cy="30" r="6"/><circle cx="210" cy="20" r="6"/></g>
  <g fill="#fb923c"><circle cx="50" cy="26" r="5"/><circle cx="95" cy="33" r="5"/><circle cx="145" cy="33" r="5"/><circle cx="190" cy="26" r="5"/></g>
  <!-- modaks on a thali -->
  <ellipse cx="96" cy="84" rx="62" ry="9" fill="#eab308"/>
  <ellipse cx="96" cy="82" rx="54" ry="6" fill="#fde047"/>
  <g fill="#fef3c7" stroke="#d97706" stroke-width="1.5">
    <path d="M58 80 Q54 66 68 54 Q82 66 78 80 Z"/><path d="M84 80 Q80 62 96 48 Q112 62 108 80 Z"/><path d="M114 80 Q110 66 124 54 Q138 66 134 80 Z"/>
  </g>
  <path d="M68 58 V76 M96 52 V76 M124 58 V76" stroke="#d97706" stroke-width="1.2"/>
  <!-- diya -->
  <g class="flame"><path d="M190 60 Q184 50 191 40 Q197 50 193 60 Z" fill="#f97316"/></g>
  <path d="M172 64 Q192 70 212 62 Q208 80 192 80 Q176 80 172 64 Z" fill="#b45309"/>
</g></svg>`,
    halloween: `
<svg viewBox="0 0 240 100" width="250" height="104" aria-hidden="true">
  <g class="bat b1" fill="#8e44c4"><path d="M0 4 q6 -8 10 0 q2 -3 4 0 q4 -8 10 0 q-6 -1 -8 5 q-2 -2 -4 0 q-2 -6 -12 -5z"/></g>
  <g class="bat b2" fill="#b36ae2"><path d="M0 4 q6 -8 10 0 q2 -3 4 0 q4 -8 10 0 q-6 -1 -8 5 q-2 -2 -4 0 q-2 -6 -12 -5z"/></g>
  <g class="bob">
    <!-- broom -->
    <path d="M18 72 L176 70" stroke="#8b5a2b" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M172 62 L214 52 Q220 70 214 90 L172 80 Z" fill="#e0a43a"/>
    <path d="M178 66 L212 60 M178 71 L216 71 M178 76 L212 82" stroke="#b27a1f" stroke-width="1.5"/>
    <path d="M170 61 L176 61 L176 81 L170 81 Z" fill="#7a3b12"/>
    <!-- lantern pumpkin hanging from the front -->
    <path d="M32 72 V80" stroke="#6b4423" stroke-width="2"/>
    <ellipse cx="32" cy="88" rx="12" ry="9" fill="#f28c28"/>
    <path d="M26 80 q6 -3 12 0" stroke="#d9731a" stroke-width="1.5" fill="none"/>
    <path d="M32 79 q1 -4 4 -4" stroke="#3c8d2f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M25 85 l3 -3 l2 3 z M34 85 l3 -3 l2 3 z M25 91 q7 4 14 0 l-3 1 l-1 -2 l-2 2 l-2 -2 l-2 2 l-1 -2 z" fill="#4a1d00"/>
    <!-- witch -->
    <path d="M114 42 Q144 40 160 26 Q150 58 124 64 Z" fill="#8e44c4"/>
    <path d="M80 71 L94 38 L114 38 L126 71 Z" fill="#6b2fa0"/>
    <path d="M100 70 L94 86" stroke="#6b2fa0" stroke-width="6" stroke-linecap="round"/>
    <path d="M89 86 L99 86 L99 90 L84 90 Q84 86 89 86 Z" fill="#e74c3c"/>
    <path d="M97 46 L82 67" stroke="#6b2fa0" stroke-width="6" stroke-linecap="round"/>
    <circle cx="81" cy="69" r="3.2" fill="#7cc242"/>
    <path d="M104 26 q16 4 14 22 q-6 -8 -12 -10 z" fill="#f28c28"/>
    <circle cx="100" cy="30" r="8.5" fill="#7cc242"/>
    <path d="M92.5 29 L83 33 L93 35 Z" fill="#7cc242"/>
    <circle cx="96" cy="28" r="1.4" fill="#1a1a1a"/>
    <path d="M94 34.5 q3 2 6 0" stroke="#2f5e14" stroke-width="1.2" fill="none"/>
    <ellipse cx="101" cy="21.5" rx="16" ry="3.6" fill="#4b2378"/>
    <path d="M92 21 L111 21 Q116 10 126 4 Q112 6 104 8 Z" fill="#4b2378"/>
    <path d="M93 18 L110 18 L111 21 L92 21 Z" fill="#f28c28"/>
  </g>
</svg>`
  };

  const art = cfg.art || cfg.season;
  const dark = cfg.theme ? cfg.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Inverted contrast: dark system → light card, light system → dark card.
  const bg = dark ? '#ffffff' : '#111111';
  const fg = dark ? '#111111' : '#ffffff';
  const sub = dark ? '#4b5563' : '#c7c9d1';
  const accent = { christmas: '#d62828', halloween: '#f28c28', sun: '#f59e0b', moon: '#6366f1',
                   navratri: '#dc2626', diwali: '#f59e0b', holi: '#ec4899', rakhi: '#db2777', ganesh: '#f97316' }[art] || '#6d28d9';
  const duration = Math.max(6, Number(cfg.duration) || 10) * 1000;

  const host = document.createElement('div');
  host.id = 'festive-flyby-host';
  host.style.cssText = 'all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483647;';
  const root = host.attachShadow({ mode: 'closed' });

  root.innerHTML = `
<style>
  .lane { position: absolute; left: 0; top: 12vh; width: 100vw; height: 110px; overflow: visible; }
  .card {
    position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 4px;
    padding: 6px 26px 6px 10px; border-radius: 999px; background: ${bg}; color: ${fg};
    box-shadow: 0 10px 30px rgba(0,0,0,.28), 0 0 0 1px rgba(127,127,127,.18);
    font: 600 16px/1.25 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; white-space: nowrap;
    will-change: transform;
  }
  .rope { width: 22px; height: 2px; background: ${accent}; opacity: .8; margin-right: 2px; }
  .msg { display: flex; flex-direction: column; border-left: 4px solid ${accent}; padding-left: 12px; }
  .msg b { font-size: 19px; letter-spacing: -.01em; }
  .msg span { font-weight: 500; font-size: 14px; color: ${sub}; }
  .trail { display: flex; gap: 10px; margin-left: 14px; font-size: 14px; }
  .trail i { font-style: normal; animation: twinkle 1s ease-in-out infinite alternate; }
  .trail i:nth-child(2) { animation-delay: .3s; } .trail i:nth-child(3) { animation-delay: .6s; }
  .bob { animation: bob 1.4s ease-in-out infinite; transform-origin: center; }
  .legs { animation: gallop .5s ease-in-out infinite alternate; transform-origin: 50px 60px; }
  .bat { animation: flap .35s ease-in-out infinite alternate; }
  .b1 { transform: translate(44px, 14px); } .b2 { transform: translate(66px, 4px) scale(.8); animation-delay: .15s; }
  @keyframes bob { 50% { transform: translateY(-4px) rotate(-1.5deg); } }
  @keyframes gallop { to { transform: rotate(6deg); } }
  @keyframes flap { to { transform: translate(44px, 16px) scaleY(.6); } }
  .b2 { animation-name: flap2; } @keyframes flap2 { to { transform: translate(66px, 6px) scale(.8, .5); } }
  .spin { animation: spin 8s linear infinite; transform-box: view-box; transform-origin: 70px 50px; }
  .steam { animation: steam 1.6s ease-in-out infinite alternate; }
  .twk, .zz { animation: twinkle 1s ease-in-out infinite alternate; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes steam { from { opacity: .3; transform: translateY(2px); } to { opacity: .9; transform: translateY(-2px); } }
  @keyframes twinkle { from { opacity: .25; transform: scale(.8); } to { opacity: 1; transform: scale(1.1); } }
  .flame { animation: flicker .25s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center bottom; }
  .clack { animation: clack .4s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
  .puff { animation: puff 1.2s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
  .spinslow { animation: spinslow 6s linear infinite; }
  @keyframes flicker { from { transform: scale(.9, .85); opacity: .85; } to { transform: scale(1.05, 1.1); opacity: 1; } }
  @keyframes clack { to { transform: rotate(8deg); } }
  @keyframes puff { to { transform: scale(1.15); } }
  @keyframes spinslow { from { transform: translate(120px, 50px) rotate(0); } to { transform: translate(120px, 50px) rotate(360deg); } }
  .bursts { position: absolute; inset: 0; }
  .burst { position: absolute; width: 0; height: 0; }
  .burst i { position: absolute; left: -2px; top: -2px; width: 4px; height: 4px; border-radius: 50%; opacity: 0; }
  @media (prefers-reduced-motion: reduce) { .bob, .legs, .bat, .trail i, .spin, .steam, .twk, .zz, .flame, .clack, .puff, .spinslow { animation: none; } }
</style>
<div class="bursts"></div>
<div class="lane"><div class="card" role="status" aria-live="polite">
  ${ART[art] || ''}
  <div class="rope"></div>
  <div class="msg"><b></b><span></span></div>
  <div class="trail"><i></i><i></i><i></i></div>
</div></div>`;

  root.querySelector('.msg b').textContent = cfg.title || '';
  root.querySelector('.msg span').textContent = cfg.sub || '';
  const sparkle = { halloween: '✦', christmas: '❄', sun: '✺', moon: '✧', navratri: '✿', diwali: '✨', holi: '●', rakhi: '✿', ganesh: '✿' }[art] || '✦';
  root.querySelectorAll('.trail i').forEach(i => (i.textContent = sparkle));
  root.querySelectorAll('.trail i').forEach(i => (i.style.color = accent));

  (document.body || document.documentElement).appendChild(host);
  const card = root.querySelector('.card');

  // Diwali crackers: bursts popping across the screen while the card flies (skipped with reduce motion).
  const burstAnims = [];
  if (cfg.bursts && !reduce) {
    const layer = root.querySelector('.bursts');
    const colors = ['#fde047', '#f97316', '#ec4899', '#22c55e', '#38bdf8', '#a855f7', '#ffffff'];
    const n = Math.min(Number(cfg.bursts) || 0, 20);
    for (let b = 0; b < n; b++) {
      const el = document.createElement('div');
      el.className = 'burst';
      el.style.left = `${8 + Math.random() * 84}vw`;
      el.style.top = `${6 + Math.random() * 55}vh`;
      const color = colors[b % colors.length];
      const sparks = 14, radius = 50 + Math.random() * 50, delay = (b / n) * (duration - 1500) + Math.random() * 300;
      for (let k = 0; k < sparks; k++) {
        const dot = document.createElement('i');
        dot.style.background = color;
        dot.style.boxShadow = `0 0 6px ${color}`;
        el.appendChild(dot);
        const a = (k / sparks) * Math.PI * 2;
        const dx = Math.cos(a) * radius, dy = Math.sin(a) * radius;
        burstAnims.push(dot.animate([
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${dx * .8}px, ${dy * .8}px) scale(1)`, opacity: 1, offset: .6 },
          { transform: `translate(${dx}px, ${dy + 18}px) scale(.4)`, opacity: 0 }
        ], { duration: 1200, delay, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' }));
      }
      layer.appendChild(el);
    }
  }

  let anim;
  if (reduce) {
    card.style.left = '50%';
    anim = card.animate(
      [{ opacity: 0, transform: 'translateX(-50%)' }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .9 }, { opacity: 0, transform: 'translateX(-50%)' }],
      { duration: 6000, fill: 'forwards' });
  } else {
    // Enter from the right edge, glide across on a gentle wave, exit left.
    const w = card.getBoundingClientRect().width;
    const vw = window.innerWidth;
    const x = p => `${vw + 20 - p * (vw + w + 40)}px`;
    anim = card.animate([
      { transform: `translate(${x(0)}, 18px) rotate(-.5deg)` },
      { transform: `translate(${x(.25)}, -6px) rotate(1deg)` },
      { transform: `translate(${x(.5)}, 14px) rotate(-.5deg)` },
      { transform: `translate(${x(.75)}, -8px) rotate(1deg)` },
      { transform: `translate(${x(1)}, 10px) rotate(-1deg)` }
    ], { duration, easing: 'linear', fill: 'forwards' });
  }

  const cleanup = () => { document.removeEventListener('keydown', onKey, true); host.remove(); };
  const onKey = e => { if (e.key === 'Escape') { anim.cancel(); burstAnims.forEach(a => a.cancel()); cleanup(); } };
  document.addEventListener('keydown', onKey, true);
  anim.finished.then(cleanup, cleanup);
})();
