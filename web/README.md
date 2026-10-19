# laydoh web runtime

`runtime.js` drives a yap `-bcc=emcc` app's `app_init`/`app_update` loop and
renders the draw commands it writes into wasm memory as real DOM elements --
one absolutely-positioned `<div>` per rectangle and per text run, with the
browser's own `overflow-y` doing the scrolling.

It is the shared, site-agnostic half of that job. `docs/renderer.js` is the
original single-purpose version, kept as-is so the committed demo build keeps
working; new sites should use this one.

## Usage

```html
<div id="stage"><div id="content"></div></div>
<script src="runtime.js"></script>
<script>
  Laydoh.start({
    // Extra args appended after (width, height, dt) -- must line up with this
    // app's own app_update signature.
    updateArgs: ({ pointer, scrollTop }) =>
      [pointer.x, pointer.y, pointer.down ? 1 : 0, scrollTop],
    onRect(el, cmd, { hovered }) { /* style it */ },
    onLink(url) { /* return true to handle it yourself */ },
  });
</script>
<script src="app.js"></script>
```

`runtime.js` must load *before* the app's glue script: it installs
`window.Module` so the glue adopts it rather than creating its own.

### Options

| option | purpose |
| --- | --- |
| `stageId` / `contentId` | element ids, default `stage` / `content` |
| `currentSize` | `() => [w, h]`, default the window's inner size |
| `updateArgs` | extra `app_update` args after `(w, h, dt)` |
| `onRect` / `onText` | per-element styling hook, called before attach |
| `afterRender` | runs once per frame with every command |
| `onLink` | handle `app_get_pending_link`; return `true` to claim it |
| `onReady` | awaited after `app_init`, before the first frame |

The app side needs `app_init`, `app_update`, `app_get_draw_commands` and
`app_get_draw_command_count` exported; `app_get_pending_link` is optional.
