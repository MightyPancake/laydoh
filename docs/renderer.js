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

const stage = document.getElementById("stage"); // real overflow-y: auto viewport, native scroll
const content = document.getElementById("content"); // sized to Clay's own content height every frame

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
  content.textContent = "";
  const rects = commands.filter((c) => c.type === DRAW_RECT);
  const texts = commands.filter((c) => c.type === DRAW_TEXT);

  // Clay's root element is FIT-sized to its true content height now (see
  // demo_wasm.yp header comment) instead of being clamped to the viewport,
  // so its own bounding box already tells us exactly how tall #content needs
  // to be for #stage's native overflow-y: auto to have something real to
  // scroll -- no separate "measure the content" step needed, just track the
  // furthest bottom edge across every command actually emitted (culling is
  // disabled wasm-side, so nothing below the fold is silently missing here).
  let maxBottom = 0;
  for (const c of commands) {
    maxBottom = Math.max(maxBottom, c.y + c.h);
  }
  content.style.height = `${maxBottom}px`;

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
    content.appendChild(el);
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
    content.appendChild(el);
  }
}

function currentSize() {
  return [window.innerWidth, window.innerHeight];
}

// No scroll-input wiring at all -- scrolling is entirely native (#stage's
// own overflow-y: auto + touch-action: pan-y, see index.html), same as how
// third_party/clay/examples/clay-official-website's DOM/HTML-overlay
// renderer mode does it. An earlier version of this file fed
// Clay_SetPointerState/Clay_UpdateScrollContainers by hand every frame
// (modeled on that site's CANVAS renderer mode instead, the wrong
// reference for a div-based renderer) and felt jagged on real mobile touch
// scrolling; see demo_wasm.yp's header comment for the full story.

let lastTime = performance.now();

function frame(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  const [w, h] = currentSize();
  window._app_update(w, h, dt);

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
