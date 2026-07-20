#include <string.h>
#include <stdlib.h>

#define CLAY_IMPLEMENTATION
#include "third_party/clay/clay.h"

__attribute__((visibility("default")))
uint32_t clay_Clay_MinMemorySize(void) {
    return Clay_MinMemorySize();
}

__attribute__((visibility("default")))
Clay_Arena clay_Clay_CreateArenaWithCapacityAndMemory(long long capacity, void * memory) {
    return Clay_CreateArenaWithCapacityAndMemory((size_t)capacity, memory);
}

__attribute__((visibility("default")))
void clay_Clay_SetPointerState(Clay_Vector2 position, _Bool pointerDown) {
    Clay_SetPointerState(position, pointerDown);
}

__attribute__((visibility("default")))
Clay_PointerData clay_Clay_GetPointerState(void) {
    return Clay_GetPointerState();
}

__attribute__((visibility("default")))
Clay_Context * clay_Clay_Initialize(Clay_Arena arena, Clay_Dimensions layoutDimensions, Clay_ErrorHandler errorHandler) {
    return Clay_Initialize(arena, layoutDimensions, errorHandler);
}

__attribute__((visibility("default")))
Clay_Context * clay_Clay_GetCurrentContext(void) {
    return Clay_GetCurrentContext();
}

__attribute__((visibility("default")))
void clay_Clay_SetCurrentContext(Clay_Context * context) {
    Clay_SetCurrentContext(context);
}

__attribute__((visibility("default")))
void clay_Clay_UpdateScrollContainers(_Bool enableDragScrolling, Clay_Vector2 scrollDelta, float deltaTime) {
    Clay_UpdateScrollContainers(enableDragScrolling, scrollDelta, deltaTime);
}

__attribute__((visibility("default")))
Clay_Vector2 clay_Clay_GetScrollOffset(void) {
    return Clay_GetScrollOffset();
}

__attribute__((visibility("default")))
void clay_Clay_SetLayoutDimensions(Clay_Dimensions dimensions) {
    Clay_SetLayoutDimensions(dimensions);
}

__attribute__((visibility("default")))
Clay_Dimensions clay_Clay_GetLayoutDimensions(void) {
    return Clay_GetLayoutDimensions();
}

__attribute__((visibility("default")))
void clay_Clay_BeginLayout(void) {
    Clay_BeginLayout();
}

__attribute__((visibility("default")))
Clay_RenderCommandArray clay_Clay_EndLayout(float deltaTime) {
    return Clay_EndLayout(deltaTime);
}

__attribute__((visibility("default")))
uint32_t clay_Clay_GetOpenElementId(void) {
    return Clay_GetOpenElementId();
}

__attribute__((visibility("default")))
Clay_ElementId clay_Clay_GetElementId(Clay_String idString) {
    return Clay_GetElementId(idString);
}

__attribute__((visibility("default")))
Clay_ElementId clay_Clay_GetElementIdWithIndex(Clay_String idString, uint32_t index) {
    return Clay_GetElementIdWithIndex(idString, index);
}

__attribute__((visibility("default")))
Clay_ElementData clay_Clay_GetElementData(Clay_ElementId id) {
    return Clay_GetElementData(id);
}

__attribute__((visibility("default")))
_Bool clay_Clay_Hovered(void) {
    return Clay_Hovered();
}

__attribute__((visibility("default")))
void clay_Clay_OnHover(void (*onHoverFunction)(Clay_ElementId elementId, Clay_PointerData pointerData, void *userData), void *userData) {
    Clay_OnHover(onHoverFunction, userData);
}

__attribute__((visibility("default")))
_Bool clay_Clay_PointerOver(Clay_ElementId elementId) {
    return Clay_PointerOver(elementId);
}

__attribute__((visibility("default")))
Clay_ElementIdArray clay_Clay_GetPointerOverIds(void) {
    return Clay_GetPointerOverIds();
}

__attribute__((visibility("default")))
Clay_ScrollContainerData clay_Clay_GetScrollContainerData(Clay_ElementId id) {
    return Clay_GetScrollContainerData(id);
}

__attribute__((visibility("default")))
void clay_Clay_SetMeasureTextFunction(Clay_Dimensions (*measureTextFunction)(Clay_StringSlice text, Clay_TextElementConfig *config, void *userData), void *userData) {
    Clay_SetMeasureTextFunction(measureTextFunction, userData);
}

__attribute__((visibility("default")))
void clay_Clay_SetQueryScrollOffsetFunction(Clay_Vector2 (*queryScrollOffsetFunction)(uint32_t elementId, void *userData), void *userData) {
    Clay_SetQueryScrollOffsetFunction(queryScrollOffsetFunction, userData);
}

__attribute__((visibility("default")))
Clay_RenderCommand * clay_Clay_RenderCommandArray_Get(Clay_RenderCommandArray * array, int32_t index) {
    return Clay_RenderCommandArray_Get(array, index);
}

__attribute__((visibility("default")))
void clay_Clay_SetDebugModeEnabled(_Bool enabled) {
    Clay_SetDebugModeEnabled(enabled);
}

__attribute__((visibility("default")))
_Bool clay_Clay_IsDebugModeEnabled(void) {
    return Clay_IsDebugModeEnabled();
}

__attribute__((visibility("default")))
void clay_Clay_SetCullingEnabled(_Bool enabled) {
    Clay_SetCullingEnabled(enabled);
}

__attribute__((visibility("default")))
int32_t clay_Clay_GetMaxElementCount(void) {
    return Clay_GetMaxElementCount();
}

__attribute__((visibility("default")))
void clay_Clay_SetMaxElementCount(int32_t maxElementCount) {
    Clay_SetMaxElementCount(maxElementCount);
}

__attribute__((visibility("default")))
int32_t clay_Clay_GetMaxMeasureTextCacheWordCount(void) {
    return Clay_GetMaxMeasureTextCacheWordCount();
}

__attribute__((visibility("default")))
void clay_Clay_SetMaxMeasureTextCacheWordCount(int32_t maxMeasureTextCacheWordCount) {
    Clay_SetMaxMeasureTextCacheWordCount(maxMeasureTextCacheWordCount);
}

__attribute__((visibility("default")))
void clay_Clay_ResetMeasureTextCache(void) {
    Clay_ResetMeasureTextCache();
}

__attribute__((visibility("default")))
_Bool clay_Clay_EaseOut(Clay_TransitionCallbackArguments arguments) {
    return Clay_EaseOut(arguments);
}

__attribute__((visibility("default")))
void clay_Clay__OpenElement(void) {
    Clay__OpenElement();
}

__attribute__((visibility("default")))
void clay_Clay__OpenElementWithId(Clay_ElementId elementId) {
    Clay__OpenElementWithId(elementId);
}

__attribute__((visibility("default")))
void clay_Clay__ConfigureOpenElement(const Clay_ElementDeclaration config) {
    Clay__ConfigureOpenElement(config);
}

__attribute__((visibility("default")))
void clay_Clay__ConfigureOpenElementPtr(const Clay_ElementDeclaration * config) {
    Clay__ConfigureOpenElementPtr(config);
}

__attribute__((visibility("default")))
void clay_Clay__CloseElement(void) {
    Clay__CloseElement();
}

__attribute__((visibility("default")))
Clay_ElementId clay_Clay__HashString(Clay_String key, uint32_t seed) {
    return Clay__HashString(key, seed);
}

__attribute__((visibility("default")))
Clay_ElementId clay_Clay__HashStringWithOffset(Clay_String key, uint32_t offset, uint32_t seed) {
    return Clay__HashStringWithOffset(key, offset, seed);
}

__attribute__((visibility("default")))
void clay_Clay__OpenTextElement(Clay_String text, Clay_TextElementConfig textConfig) {
    Clay__OpenTextElement(text, textConfig);
}

/* ---- Hand-written ergonomic helpers (not part of clay.h's own API) ----
 * yap has no compound-literal / designated-initializer syntax, so building a
 * Clay_ElementDeclaration (or any of the smaller config structs) field by
 * field from a garbage-initialized local is both tedious and unsafe -- unset
 * sub-configs (floating/border/custom/...) would carry stack garbage instead
 * of the zero value CLAY__INIT gives them in C. These mirror clay.h's own
 * CLAY_SIZING_ family, CLAY_PADDING_ALL, CLAY_CORNER_RADIUS macros and the
 * StringFromCString helper every C Clay renderer ends up writing by hand.
 */

__attribute__((visibility("default")))
Clay_ElementDeclaration clay_zero_element_declaration(void) {
    Clay_ElementDeclaration d;
    memset(&d, 0, sizeof(d));
    return d;
}

__attribute__((visibility("default")))
Clay_TextElementConfig clay_zero_text_element_config(void) {
    Clay_TextElementConfig c;
    memset(&c, 0, sizeof(c));
    return c;
}

__attribute__((visibility("default")))
Clay_String clay_string_from_cstr(const char *s) {
    Clay_String str;
    str.isStaticallyAllocated = false;
    str.length = (int32_t)strlen(s);
    str.chars = s;
    return str;
}

__attribute__((visibility("default")))
Clay_SizingAxis clay_sizing_fixed(float size) {
    Clay_SizingAxis a;
    a.size.minMax.min = size;
    a.size.minMax.max = size;
    a.type = CLAY__SIZING_TYPE_FIXED;
    return a;
}

__attribute__((visibility("default")))
Clay_SizingAxis clay_sizing_grow(float min, float max) {
    Clay_SizingAxis a;
    a.size.minMax.min = min;
    a.size.minMax.max = max;
    a.type = CLAY__SIZING_TYPE_GROW;
    return a;
}

__attribute__((visibility("default")))
Clay_SizingAxis clay_sizing_fit(float min, float max) {
    Clay_SizingAxis a;
    a.size.minMax.min = min;
    a.size.minMax.max = max;
    a.type = CLAY__SIZING_TYPE_FIT;
    return a;
}

__attribute__((visibility("default")))
Clay_SizingAxis clay_sizing_percent(float percentOfParent) {
    Clay_SizingAxis a;
    a.size.percent = percentOfParent;
    a.type = CLAY__SIZING_TYPE_PERCENT;
    return a;
}

__attribute__((visibility("default")))
Clay_CornerRadius clay_corner_radius_all(float radius) {
    Clay_CornerRadius r;
    r.topLeft = radius;
    r.topRight = radius;
    r.bottomLeft = radius;
    r.bottomRight = radius;
    return r;
}

__attribute__((visibility("default")))
Clay_Padding clay_padding_all(int32_t padding) {
    Clay_Padding p;
    p.left = (uint16_t)padding;
    p.right = (uint16_t)padding;
    p.top = (uint16_t)padding;
    p.bottom = (uint16_t)padding;
    return p;
}

__attribute__((visibility("default")))
Clay_Padding clay_padding_xy(int32_t horizontal, int32_t vertical) {
    Clay_Padding p;
    p.left = (uint16_t)horizontal;
    p.right = (uint16_t)horizontal;
    p.top = (uint16_t)vertical;
    p.bottom = (uint16_t)vertical;
    return p;
}

__attribute__((visibility("default")))
Clay_Color clay_color(float r, float g, float b, float a) {
    Clay_Color c;
    c.r = r;
    c.g = g;
    c.b = b;
    c.a = a;
    return c;
}

/* Setters for the handful of real uint16_t/int16_t fields (see binds.yp's
 * header comment) -- these hide the _lo/_hi byte-pair split entirely so
 * ordinary layout code never has to touch it. */

__attribute__((visibility("default")))
void clay_set_child_gap(Clay_LayoutConfig *layout, int32_t gap) {
    layout->childGap = (uint16_t)gap;
}

__attribute__((visibility("default")))
void clay_set_font_size(Clay_TextElementConfig *cfg, int32_t font_size) {
    cfg->fontSize = (uint16_t)font_size;
}

__attribute__((visibility("default")))
void clay_set_border_widths(Clay_BorderWidth *w, int32_t left, int32_t right, int32_t top, int32_t bottom, int32_t between_children) {
    w->left = (uint16_t)left;
    w->right = (uint16_t)right;
    w->top = (uint16_t)top;
    w->bottom = (uint16_t)bottom;
    w->betweenChildren = (uint16_t)between_children;
}

__attribute__((visibility("default")))
void clay_set_floating_z_index(Clay_FloatingElementConfig *f, int32_t z) {
    f->zIndex = (int16_t)z;
}

/* Thin malloc passthrough so callers only need `import laydoh` for arena
 * setup -- yap's own stdlib module wraps all of <stdlib.h> including glibc-
 * only extensions (rand48 family, etc.) that don't exist under emscripten's
 * musl sysroot, so libstdlib_wasm.a doesn't build. This one function is all
 * a Clay arena setup ever needs. */
// long long, not size_t: size_t is 4 bytes under wasm32 but yap's i64 always
// compiles to an 8-byte long long on every target, native or wasm -- using
// size_t here would silently mismatch the wasm function signature yap calls
// against (a param-width mismatch that gets linked as a trap stub, not a
// build error).
__attribute__((visibility("default")))
void * clay_malloc(long long size) {
    return malloc((size_t)size);
}

