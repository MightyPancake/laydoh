// laydoh web runtime: drives a yap `-bcc=emcc` app's app_init/app_update loop
// every animation frame and turns the draw commands it writes into wasm memory
// into real DOM elements -- one absolutely-positioned <div> per rectangle and
// per text run.
//
// This is the generalized form of docs/renderer.js (laydoh's own demo
// renderer), which it now supersedes for anything beyond that demo. The
// mechanics that every div-based laydoh site needs live here; everything
// site-specific -- what the page looks like, how it routes, what its
// app_update signature is -- is supplied by the caller through start()'s
// options, so two different sites can share this file without either one's
// styling leaking into the other.
//
// The app's exports are plain top-level `var`s in yap's emcc glue (yap doesn't
// turn on EXPORTED_RUNTIME_METHODS, so there's no Module.cwrap/Module.HEAPU8),
// which is why this reaches for window._app_* and window.HEAPU8 directly.
// HEAPU8 is re-read every frame rather than cached, since emscripten
// reassigns it whenever wasm memory grows.

(function (global) {
  "use strict";

  const DRAW_RECT = 1;
  const DRAW_TEXT = 2;
  // Must match the packed scratch-buffer layout the yap side writes (see
  // demo_wasm.yp's write_rect_command/write_text_command).
  const DRAW_COMMAND_SIZE = 36;

  function cssColor(r, g, b, a) {
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
  }

  function readCommands(ptr, count) {
    const dv = new DataView(global.HEAPU8.buffer);
    const commands = [];
    for (let i = 0; i < count; i++) {
      const base = ptr + i * DRAW_COMMAND_SIZE;
      // fontSize/textLength are stored as two bytes each rather than an i32 --
      // the yap side pokes raw bytes at computed offsets, so this unpacks them
      // the same way round.
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

  // Reads a NUL-terminated C string out of wasm memory. Used for anything the
  // yap side can only hand over as a pointer (a link target, a prerendered
  // HTML blob), where the length isn't known up front the way a draw command's
  // textLength is.
  function readCString(ptr) {
    if (!ptr) return "";
    const heap = global.HEAPU8;
    let end = ptr;
    while (heap[end] !== 0) end++;
    return new TextDecoder().decode(heap.subarray(ptr, end));
  }

  function decodeText(cmd) {
    const bytes = global.HEAPU8.subarray(cmd.textPtr, cmd.textPtr + cmd.textLength);
    return new TextDecoder().decode(bytes);
  }

  function start(options) {
    const opts = options || {};
    const stage = document.getElementById(opts.stageId || "stage");
    const content = document.getElementById(opts.contentId || "content");
    if (!stage || !content) {
      throw new Error("laydoh runtime: #stage / #content not found in the document");
    }

    // Real cursor position, tracked here rather than leaned on CSS :hover,
    // because renderStage rebuilds #content's entire subtree every frame -- no
    // element survives for the browser's own :hover bookkeeping to live on, so
    // each frame's freshly-built div has to be born already in the right
    // state. Fed to the yap side too (via updateArgs) so Clay's own
    // hover/click detection sees the same coordinates.
    const pointer = { x: -1e9, y: -1e9, down: false };

    function trackPointer(e) {
      // Viewport-relative on purpose: the yap side is told #stage's scrollTop
      // separately, so it can account for native scroll itself rather than
      // receiving coordinates that have already been adjusted twice.
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
    global.addEventListener("pointermove", trackPointer, { passive: true });
    global.addEventListener("pointerdown", (e) => {
      trackPointer(e);
      pointer.down = true;
    }, { passive: true });
    global.addEventListener("pointerup", (e) => {
      trackPointer(e);
      pointer.down = false;
    }, { passive: true });
    // A pointer leaving the window never produces an "up", so without this a
    // drag that ends outside would leave the app stuck in a pressed state.
    global.addEventListener("pointercancel", () => { pointer.down = false; }, { passive: true });
    global.addEventListener("blur", () => { pointer.down = false; });

    const currentSize = opts.currentSize || (() => [global.innerWidth, global.innerHeight]);

    function renderStage(commands) {
      content.textContent = "";

      // Culling is disabled wasm-side so content below the fold is still
      // emitted, which means the furthest bottom edge across every command is
      // the real content height -- what #stage's native overflow-y needs in
      // order to have something to scroll to. Taken from the commands rather
      // than from Clay's reported root height, which is clamped to the
      // viewport by Clay's own implicit root container.
      let maxBottom = 0;
      for (const c of commands) maxBottom = Math.max(maxBottom, c.y + c.h);
      content.style.height = `${maxBottom}px`;

      const hovered = (c) =>
        pointer.x >= c.x && pointer.x <= c.x + c.w &&
        pointer.y >= c.y - stage.scrollTop && pointer.y <= c.y + c.h - stage.scrollTop;

      // Rectangles first, then text, so a later sibling's box can never land
      // on top of earlier text.
      for (const c of commands) {
        if (c.type !== DRAW_RECT) continue;
        const el = document.createElement("div");
        el.className = "cmd-rect";
        el.style.left = `${c.x}px`;
        el.style.top = `${c.y}px`;
        el.style.width = `${c.w}px`;
        el.style.height = `${c.h}px`;
        el.style.background = cssColor(c.r, c.g, c.b, c.a);
        el.style.borderRadius = `${c.cornerRadius}px`;
        // Hooks get the element before it is attached, so a site can restyle
        // or wrap it without this file knowing anything about that site.
        if (opts.onRect) opts.onRect(el, c, { hovered: hovered(c), pressed: pointer.down });
        content.appendChild(el);
      }
      for (const c of commands) {
        if (c.type !== DRAW_TEXT) continue;
        const el = document.createElement("div");
        el.className = "cmd-text";
        el.textContent = decodeText(c);
        el.style.left = `${c.x}px`;
        el.style.top = `${c.y}px`;
        el.style.width = `${c.w}px`;
        el.style.height = `${c.h}px`;
        el.style.color = cssColor(c.r, c.g, c.b, c.a);
        el.style.fontSize = `${c.fontSize}px`;
        if (opts.onText) opts.onText(el, c, { hovered: hovered(c) });
        content.appendChild(el);
      }

      if (opts.afterRender) opts.afterRender(commands, { content, stage });
    }

    // A link the yap side fired this frame. Clay's own click edge is exactly
    // one frame wide, so this slot is naturally back to 0 the next frame with
    // no debounce needed on this side.
    function drainPendingLink() {
      if (!global._app_get_pending_link) return;
      const ptr = global._app_get_pending_link();
      if (!ptr) return;
      const url = readCString(ptr);
      if (opts.onLink && opts.onLink(url) === true) return; // site handled it
      if (/^https?:\/\//.test(url)) {
        // Someone else's site, so a new tab -- noopener/noreferrer because the
        // opened page has no business reaching back into this one.
        global.open(url, "_blank", "noopener,noreferrer");
      } else if (url) {
        global.location.href = url;
      }
    }

    let lastTime = performance.now();

    function frame(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const [w, h] = currentSize();
      const extra = opts.updateArgs
        ? opts.updateArgs({ pointer, scrollTop: stage.scrollTop, width: w, height: h })
        : [];
      global._app_update(w, h, dt, ...extra);

      renderStage(readCommands(global._app_get_draw_commands(), global._app_get_draw_command_count()));
      drainPendingLink();

      requestAnimationFrame(frame);
    }

    // Must be in place before the app's own glue script runs: that glue does
    // `var Module = typeof Module != 'undefined' ? Module : {}`, so it adopts
    // whatever is already here.
    global.Module = {
      async onRuntimeInitialized() {
        const [w, h] = currentSize();
        global._app_init(w, h);
        // app_init doubles as "tell the app the viewport changed" -- it
        // early-returns once Clay has a context (see demo_wasm.yp), so calling
        // it again on resize just updates the layout dimensions.
        global.addEventListener("resize", () => {
          const [w2, h2] = currentSize();
          global._app_init(w2, h2);
        });
        if (opts.onReady) await opts.onReady();
        requestAnimationFrame(frame);
      },
    };
  }

  global.Laydoh = { start, readCommands, readCString, cssColor, DRAW_RECT, DRAW_TEXT, DRAW_COMMAND_SIZE };
})(window);
