// Live WASM renderer: drives laydoh_demo.js's app_init/app_update loop every
// animation frame and draws whatever draw commands it wrote into wasm
// memory, one absolutely-positioned <div> per rectangle/text (same DOM
// approach nullptr's "HTML renderer" mode uses).
//
// laydoh_demo.js is yap's own `-bcc=emcc` output, loaded below as a classic
// (non-module) script -- its exports (_app_init, HEAPU8, ...) are plain
// top-level `var`s in that file, which land on `window` because of that,
// not on some importable object. There's no Module.cwrap or Module.HEAPU8
// (yap's emcc backend doesn't turn on EXPORTED_RUNTIME_METHODS), so this
// reaches straight for the globals the glue script itself defines. HEAPU8 is
// read fresh every frame rather than cached, since emscripten reassigns it
// if wasm memory ever grows.

const DRAW_RECT = 1;
const DRAW_TEXT = 2;
const DRAW_COMMAND_SIZE = 36; // must match demo_wasm.yp's scratch-buffer layout

const stage = document.getElementById("stage");

function cssColor(r, g, b, a) {
  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
}

function readCommands(ptr, count) {
  const dv = new DataView(window.HEAPU8.buffer);
  const commands = [];
  for (let i = 0; i < count; i++) {
    const base = ptr + i * DRAW_COMMAND_SIZE;
    const fsLo = dv.getUint8(base + 24);
    const fsHi = dv.getUint8(base + 25);
    const tlLo = dv.getUint8(base + 26);
    const tlHi = dv.getUint8(base + 27);
    commands.push({
      type: dv.getInt32(base + 0, true),
      x: dv.getFloat32(base + 4, true),
      y: dv.getFloat32(base + 8, true),
      w: dv.getFloat32(base + 12, true),
      h: dv.getFloat32(base + 16, true),
      r: dv.getUint8(base + 20),
      g: dv.getUint8(base + 21),
      b: dv.getUint8(base + 22),
      a: dv.getUint8(base + 23),
      fontSize: fsLo + fsHi * 256,
      textLength: tlLo + tlHi * 256,
      textPtr: dv.getUint32(base + 28, true),
      cornerRadius: dv.getInt32(base + 32, true),
    });
  }
  return commands;
}

function renderStage(commands) {
  stage.textContent = "";
  const rects = commands.filter((c) => c.type === DRAW_RECT);
  const texts = commands.filter((c) => c.type === DRAW_TEXT);

  // Paint order: all rectangles first, then all text on top, so text never
  // ends up underneath a later sibling's box.
  for (const c of rects) {
    const el = document.createElement("div");
    el.className = "cmd-rect";
    el.style.left = `${c.x}px`;
    el.style.top = `${c.y}px`;
    el.style.width = `${c.w}px`;
    el.style.height = `${c.h}px`;
    el.style.background = cssColor(c.r, c.g, c.b, c.a);
    el.style.borderRadius = `${c.cornerRadius}px`;
    stage.appendChild(el);
  }
  for (const c of texts) {
    const bytes = window.HEAPU8.subarray(c.textPtr, c.textPtr + c.textLength);
    const el = document.createElement("div");
    el.className = "cmd-text";
    el.textContent = new TextDecoder().decode(bytes);
    el.style.left = `${c.x}px`;
    el.style.top = `${c.y}px`;
    el.style.width = `${c.w}px`;
    el.style.height = `${c.h}px`;
    el.style.color = cssColor(c.r, c.g, c.b, c.a);
    el.style.fontSize = `${c.fontSize}px`;
    stage.appendChild(el);
  }
}

function currentSize() {
  return [window.innerWidth, window.innerHeight];
}

// Virtual scroll: the page itself never scrolls (html/body keep
// overflow:hidden) -- instead wheel/touch-drag input accumulates into a
// pixel delta that app_update() feeds straight to Clay as a childOffset on
// the root clip container, which is what actually repositions content.
// Accumulated since the last rendered frame, then reset to zero once sent,
// matching dt's own "since last frame" semantics.
let pendingScrollDeltaY = 0;

window.addEventListener(
  "wheel",
  (e) => {
    // DOM_DELTA_LINE / DOM_DELTA_PAGE (deltaMode 1 / 2) report in lines/pages
    // rather than pixels on some browsers/devices; approximate both back to
    // pixels so the accumulated delta stays in the same units app_update
    // already treats boundingBox coordinates in.
    let dy = e.deltaY;
    if (e.deltaMode === 1) {
      dy *= 16;
    } else if (e.deltaMode === 2) {
      dy *= window.innerHeight;
    }
    pendingScrollDeltaY += dy;
    e.preventDefault();
  },
  { passive: false }
);

let touchLastY = null;

window.addEventListener(
  "touchstart",
  (e) => {
    touchLastY = e.touches[0].clientY;
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (e) => {
    if (touchLastY !== null) {
      const y = e.touches[0].clientY;
      // Dragging a finger up should reveal content further down the page --
      // the same sign convention wheel's deltaY already uses (positive =
      // scroll down), so this is the negated finger movement.
      pendingScrollDeltaY += touchLastY - y;
      touchLastY = y;
    }
    e.preventDefault();
  },
  { passive: false }
);

window.addEventListener(
  "touchend",
  () => {
    touchLastY = null;
  },
  { passive: true }
);

let lastTime = performance.now();

function frame(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  const [w, h] = currentSize();
  window._app_update(w, h, dt, pendingScrollDeltaY);
  pendingScrollDeltaY = 0;

  const ptr = window._app_get_draw_commands();
  const count = window._app_get_draw_command_count();
  renderStage(readCommands(ptr, count));

  requestAnimationFrame(frame);
}

// Must exist before laydoh_demo.js runs (loaded right after this script) --
// its glue does `var Module = typeof Module != 'undefined' ? Module : {}`,
// picking up whatever's here already.
window.Module = {
  onRuntimeInitialized() {
    const [w, h] = currentSize();
    window._app_init(w, h);
    window.addEventListener("resize", () => {
      const [w2, h2] = currentSize();
      window._app_init(w2, h2);
    });
    requestAnimationFrame(frame);
  },
};
