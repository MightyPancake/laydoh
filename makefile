YAP := yap

.PHONY: all wasm_lib wasm_demo clean_wasm

all: wasm_demo

# libclay_wasm.a: the wasm-flavored module library yap's import resolution
# looks for under -bcc=emcc targets (lib<name>_wasm.a, static only). Mirrors
# libclay.a's own hand-built recipe (see wrapper.c's git history), with emcc
# instead of gcc. Rebuilds only when wrapper.c changes.
libclay_wasm.a: wrapper.c
	nix-shell -p emscripten --run "emcc -fPIC -c wrapper.c -o wrapper_wasm.o -I. && ar rcs libclay_wasm.a wrapper_wasm.o && rm wrapper_wasm.o"

wasm_lib: libclay_wasm.a

# examples/web/laydoh_demo.js/.wasm: the live browser demo. Needs emcc on
# PATH, hence the nix-shell wrapper -- this repo doesn't otherwise assume a
# Nix environment.
examples/web/laydoh_demo.js: examples/demo_wasm.yp libclay_wasm.a
	nix-shell -p emscripten --run "$(YAP) -bcc=emcc \
		-bexport=app_init -bexport=app_update \
		-bexport=app_get_draw_commands -bexport=app_get_draw_command_count \
		-o examples/web/laydoh_demo.js examples/demo_wasm.yp"
	@rm -f a.out

wasm_demo: examples/web/laydoh_demo.js

clean_wasm:
	rm -f libclay_wasm.a examples/web/laydoh_demo.js examples/web/laydoh_demo.wasm
