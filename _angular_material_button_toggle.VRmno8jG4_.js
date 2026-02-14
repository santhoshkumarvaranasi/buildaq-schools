import { a as f } from "@nf-internal/chunk-RQTQHQZK";
import { a as h } from "@nf-internal/chunk-TBOQSXHX";
import { d as p } from "@nf-internal/chunk-AHQ2JYHE";
import { a as m } from "@nf-internal/chunk-WLM6SLJD";
import { b } from "@nf-internal/chunk-U6VGVGKT";
import "@nf-internal/chunk-4CLCTAJ7";
import { _IdGenerator as v, FocusMonitor as I } from "@angular/cdk/a11y";
import { Directionality as S, BidiModule as M } from "@angular/cdk/bidi";
import { SelectionModel as w } from "@angular/cdk/collections";
import { hasModifierKey as B, RIGHT_ARROW as C, DOWN_ARROW as G, LEFT_ARROW as R, UP_ARROW as E, ENTER as A, SPACE as D } from "@angular/cdk/keycodes";
import { _CdkPrivateStyleLoader as V } from "@angular/cdk/private";
import * as a from "@angular/core";
import { InjectionToken as _, forwardRef as O, inject as r, ChangeDetectorRef as y, EventEmitter as c, booleanAttribute as s, ElementRef as F, HostAttributeToken as L, signal as N } from "@angular/core";
import { NG_VALUE_ACCESSOR as z } from "@angular/forms";
import "@angular/cdk/platform";
import "@angular/cdk/coercion";
import "@angular/cdk/layout";
var P = ["button"], U = ["*"];
function H(l, u) { if (l & 1 && (a.\u0275\u0275elementStart(0, "div", 2), a.\u0275\u0275element(1, "mat-pseudo-checkbox", 6), a.\u0275\u0275elementEnd()), l & 2) {
    let t = a.\u0275\u0275nextContext();
    a.\u0275\u0275advance(), a.\u0275\u0275property("disabled", t.disabled);
} }
var k = new _("MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS", { providedIn: "root", factory: () => ({ hideSingleSelectionIndicator: !1, hideMultipleSelectionIndicator: !1, disabledInteractive: !1 }) }), x = new _("MatButtonToggleGroup"), Q = { provide: z, useExisting: O(() => j), multi: !0 }, d = class {
    source;
    value;
    constructor(u, t) { this.source = u, this.value = t; }
}, j = (() => { class l {
    _changeDetector = r(y);
    _dir = r(S, { optional: !0 });
    _multiple = !1;
    _disabled = !1;
    _disabledInteractive = !1;
    _selectionModel;
    _rawValue;
    _controlValueAccessorChangeFn = () => { };
    _onTouched = () => { };
    _buttonToggles;
    appearance;
    get name() { return this._name; }
    set name(t) { this._name = t, this._markButtonsForCheck(); }
    _name = r(v).getId("mat-button-toggle-group-");
    vertical;
    get value() { let t = this._selectionModel ? this._selectionModel.selected : []; return this.multiple ? t.map(o => o.value) : t[0] ? t[0].value : void 0; }
    set value(t) { this._setSelectionByValue(t), this.valueChange.emit(this.value); }
    valueChange = new c;
    get selected() { let t = this._selectionModel ? this._selectionModel.selected : []; return this.multiple ? t : t[0] || null; }
    get multiple() { return this._multiple; }
    set multiple(t) { this._multiple = t, this._markButtonsForCheck(); }
    get disabled() { return this._disabled; }
    set disabled(t) { this._disabled = t, this._markButtonsForCheck(); }
    get disabledInteractive() { return this._disabledInteractive; }
    set disabledInteractive(t) { this._disabledInteractive = t, this._markButtonsForCheck(); }
    get dir() { return this._dir && this._dir.value === "rtl" ? "rtl" : "ltr"; }
    change = new c;
    get hideSingleSelectionIndicator() { return this._hideSingleSelectionIndicator; }
    set hideSingleSelectionIndicator(t) { this._hideSingleSelectionIndicator = t, this._markButtonsForCheck(); }
    _hideSingleSelectionIndicator;
    get hideMultipleSelectionIndicator() { return this._hideMultipleSelectionIndicator; }
    set hideMultipleSelectionIndicator(t) { this._hideMultipleSelectionIndicator = t, this._markButtonsForCheck(); }
    _hideMultipleSelectionIndicator;
    constructor() { let t = r(k, { optional: !0 }); this.appearance = t && t.appearance ? t.appearance : "standard", this.hideSingleSelectionIndicator = t?.hideSingleSelectionIndicator ?? !1, this.hideMultipleSelectionIndicator = t?.hideMultipleSelectionIndicator ?? !1; }
    ngOnInit() { this._selectionModel = new w(this.multiple, void 0, !1); }
    ngAfterContentInit() { this._selectionModel.select(...this._buttonToggles.filter(t => t.checked)), this.multiple || this._initializeTabIndex(); }
    writeValue(t) { this.value = t, this._changeDetector.markForCheck(); }
    registerOnChange(t) { this._controlValueAccessorChangeFn = t; }
    registerOnTouched(t) { this._onTouched = t; }
    setDisabledState(t) { this.disabled = t; }
    _keydown(t) { if (this.multiple || this.disabled || B(t))
        return; let e = t.target.id, n = this._buttonToggles.toArray().findIndex(g => g.buttonId === e), i = null; switch (t.keyCode) {
        case D:
        case A:
            i = this._buttonToggles.get(n) || null;
            break;
        case E:
            i = this._getNextButton(n, -1);
            break;
        case R:
            i = this._getNextButton(n, this.dir === "ltr" ? -1 : 1);
            break;
        case G:
            i = this._getNextButton(n, 1);
            break;
        case C:
            i = this._getNextButton(n, this.dir === "ltr" ? 1 : -1);
            break;
        default: return;
    } i && (t.preventDefault(), i._onButtonClick(), i.focus()); }
    _emitChangeEvent(t) { let o = new d(t, this.value); this._rawValue = o.value, this._controlValueAccessorChangeFn(o.value), this.change.emit(o); }
    _syncButtonToggle(t, o, e = !1, n = !1) { !this.multiple && this.selected && !t.checked && (this.selected.checked = !1), this._selectionModel ? o ? this._selectionModel.select(t) : this._selectionModel.deselect(t) : n = !0, n ? Promise.resolve().then(() => this._updateModelValue(t, e)) : this._updateModelValue(t, e); }
    _isSelected(t) { return this._selectionModel && this._selectionModel.isSelected(t); }
    _isPrechecked(t) { return typeof this._rawValue > "u" ? !1 : this.multiple && Array.isArray(this._rawValue) ? this._rawValue.some(o => t.value != null && o === t.value) : t.value === this._rawValue; }
    _initializeTabIndex() { if (this._buttonToggles.forEach(t => { t.tabIndex = -1; }), this.selected)
        this.selected.tabIndex = 0;
    else
        for (let t = 0; t < this._buttonToggles.length; t++) {
            let o = this._buttonToggles.get(t);
            if (!o.disabled) {
                o.tabIndex = 0;
                break;
            }
        } }
    _getNextButton(t, o) { let e = this._buttonToggles; for (let n = 1; n <= e.length; n++) {
        let i = (t + o * n + e.length) % e.length, g = e.get(i);
        if (g && !g.disabled)
            return g;
    } return null; }
    _setSelectionByValue(t) { if (this._rawValue = t, !this._buttonToggles)
        return; let o = this._buttonToggles.toArray(); if (this.multiple && t ? (Array.isArray(t), this._clearSelection(), t.forEach(e => this._selectValue(e, o))) : (this._clearSelection(), this._selectValue(t, o)), !this.multiple && o.every(e => e.tabIndex === -1)) {
        for (let e of o)
            if (!e.disabled) {
                e.tabIndex = 0;
                break;
            }
    } }
    _clearSelection() { this._selectionModel.clear(), this._buttonToggles.forEach(t => { t.checked = !1, this.multiple || (t.tabIndex = -1); }); }
    _selectValue(t, o) { for (let e of o)
        if (e.value === t) {
            e.checked = !0, this._selectionModel.select(e), this.multiple || (e.tabIndex = 0);
            break;
        } }
    _updateModelValue(t, o) { o && this._emitChangeEvent(t), this.valueChange.emit(this.value); }
    _markButtonsForCheck() { this._buttonToggles?.forEach(t => t._markForCheck()); }
    static \u0275fac = function (o) { return new (o || l); };
    static \u0275dir = a.\u0275\u0275defineDirective({ type: l, selectors: [["mat-button-toggle-group"]], contentQueries: function (o, e, n) { if (o & 1 && a.\u0275\u0275contentQuery(n, T, 5), o & 2) {
            let i;
            a.\u0275\u0275queryRefresh(i = a.\u0275\u0275loadQuery()) && (e._buttonToggles = i);
        } }, hostAttrs: [1, "mat-button-toggle-group"], hostVars: 6, hostBindings: function (o, e) { o & 1 && a.\u0275\u0275listener("keydown", function (i) { return e._keydown(i); }), o & 2 && (a.\u0275\u0275attribute("role", e.multiple ? "group" : "radiogroup")("aria-disabled", e.disabled), a.\u0275\u0275classProp("mat-button-toggle-vertical", e.vertical)("mat-button-toggle-group-appearance-standard", e.appearance === "standard")); }, inputs: { appearance: "appearance", name: "name", vertical: [2, "vertical", "vertical", s], value: "value", multiple: [2, "multiple", "multiple", s], disabled: [2, "disabled", "disabled", s], disabledInteractive: [2, "disabledInteractive", "disabledInteractive", s], hideSingleSelectionIndicator: [2, "hideSingleSelectionIndicator", "hideSingleSelectionIndicator", s], hideMultipleSelectionIndicator: [2, "hideMultipleSelectionIndicator", "hideMultipleSelectionIndicator", s] }, outputs: { valueChange: "valueChange", change: "change" }, exportAs: ["matButtonToggleGroup"], features: [a.\u0275\u0275ProvidersFeature([Q, { provide: x, useExisting: l }])] });
} return l; })(), T = (() => {
    class l {
        _changeDetectorRef = r(y);
        _elementRef = r(F);
        _focusMonitor = r(I);
        _idGenerator = r(v);
        _animationDisabled = b();
        _checked = !1;
        ariaLabel;
        ariaLabelledby = null;
        _buttonElement;
        buttonToggleGroup;
        get buttonId() { return `${this.id}-button`; }
        id;
        name;
        value;
        get tabIndex() { return this._tabIndex(); }
        set tabIndex(t) { this._tabIndex.set(t); }
        _tabIndex;
        disableRipple;
        get appearance() { return this.buttonToggleGroup ? this.buttonToggleGroup.appearance : this._appearance; }
        set appearance(t) { this._appearance = t; }
        _appearance;
        get checked() { return this.buttonToggleGroup ? this.buttonToggleGroup._isSelected(this) : this._checked; }
        set checked(t) { t !== this._checked && (this._checked = t, this.buttonToggleGroup && this.buttonToggleGroup._syncButtonToggle(this, this._checked), this._changeDetectorRef.markForCheck()); }
        get disabled() { return this._disabled || this.buttonToggleGroup && this.buttonToggleGroup.disabled; }
        set disabled(t) { this._disabled = t; }
        _disabled = !1;
        get disabledInteractive() { return this._disabledInteractive || this.buttonToggleGroup !== null && this.buttonToggleGroup.disabledInteractive; }
        set disabledInteractive(t) { this._disabledInteractive = t; }
        _disabledInteractive;
        change = new c;
        constructor() { r(V).load(m); let t = r(x, { optional: !0 }), o = r(new L("tabindex"), { optional: !0 }) || "", e = r(k, { optional: !0 }); this._tabIndex = N(parseInt(o) || 0), this.buttonToggleGroup = t, this.appearance = e && e.appearance ? e.appearance : "standard", this.disabledInteractive = e?.disabledInteractive ?? !1; }
        ngOnInit() { let t = this.buttonToggleGroup; this.id = this.id || this._idGenerator.getId("mat-button-toggle-"), t && (t._isPrechecked(this) ? this.checked = !0 : t._isSelected(this) !== this._checked && t._syncButtonToggle(this, this._checked)); }
        ngAfterViewInit() { this._animationDisabled || this._elementRef.nativeElement.classList.add("mat-button-toggle-animations-enabled"), this._focusMonitor.monitor(this._elementRef, !0); }
        ngOnDestroy() { let t = this.buttonToggleGroup; this._focusMonitor.stopMonitoring(this._elementRef), t && t._isSelected(this) && t._syncButtonToggle(this, !1, !1, !0); }
        focus(t) { this._buttonElement.nativeElement.focus(t); }
        _onButtonClick() { if (this.disabled)
            return; let t = this.isSingleSelector() ? !0 : !this._checked; if (t !== this._checked && (this._checked = t, this.buttonToggleGroup && (this.buttonToggleGroup._syncButtonToggle(this, this._checked, !0), this.buttonToggleGroup._onTouched())), this.isSingleSelector()) {
            let o = this.buttonToggleGroup._buttonToggles.find(e => e.tabIndex === 0);
            o && (o.tabIndex = -1), this.tabIndex = 0;
        } this.change.emit(new d(this, this.value)); }
        _markForCheck() { this._changeDetectorRef.markForCheck(); }
        _getButtonName() { return this.isSingleSelector() ? this.buttonToggleGroup.name : this.name || null; }
        isSingleSelector() { return this.buttonToggleGroup && !this.buttonToggleGroup.multiple; }
        static \u0275fac = function (o) { return new (o || l); };
        static \u0275cmp = a.\u0275\u0275defineComponent({ type: l, selectors: [["mat-button-toggle"]], viewQuery: function (o, e) { if (o & 1 && a.\u0275\u0275viewQuery(P, 5), o & 2) {
                let n;
                a.\u0275\u0275queryRefresh(n = a.\u0275\u0275loadQuery()) && (e._buttonElement = n.first);
            } }, hostAttrs: ["role", "presentation", 1, "mat-button-toggle"], hostVars: 14, hostBindings: function (o, e) { o & 1 && a.\u0275\u0275listener("focus", function () { return e.focus(); }), o & 2 && (a.\u0275\u0275attribute("aria-label", null)("aria-labelledby", null)("id", e.id)("name", null), a.\u0275\u0275classProp("mat-button-toggle-standalone", !e.buttonToggleGroup)("mat-button-toggle-checked", e.checked)("mat-button-toggle-disabled", e.disabled)("mat-button-toggle-disabled-interactive", e.disabledInteractive)("mat-button-toggle-appearance-standard", e.appearance === "standard")); }, inputs: { ariaLabel: [0, "aria-label", "ariaLabel"], ariaLabelledby: [0, "aria-labelledby", "ariaLabelledby"], id: "id", name: "name", value: "value", tabIndex: "tabIndex", disableRipple: [2, "disableRipple", "disableRipple", s], appearance: "appearance", checked: [2, "checked", "checked", s], disabled: [2, "disabled", "disabled", s], disabledInteractive: [2, "disabledInteractive", "disabledInteractive", s] }, outputs: { change: "change" }, exportAs: ["matButtonToggle"], ngContentSelectors: U, decls: 7, vars: 13, consts: [["button", ""], ["type", "button", 1, "mat-button-toggle-button", "mat-focus-indicator", 3, "click", "id", "disabled"], [1, "mat-button-toggle-checkbox-wrapper"], [1, "mat-button-toggle-label-content"], [1, "mat-button-toggle-focus-overlay"], ["matRipple", "", 1, "mat-button-toggle-ripple", 3, "matRippleTrigger", "matRippleDisabled"], ["state", "checked", "aria-hidden", "true", "appearance", "minimal", 3, "disabled"]], template: function (o, e) { if (o & 1) {
                let n = a.\u0275\u0275getCurrentView();
                a.\u0275\u0275projectionDef(), a.\u0275\u0275elementStart(0, "button", 1, 0), a.\u0275\u0275listener("click", function () { return a.\u0275\u0275restoreView(n), a.\u0275\u0275resetView(e._onButtonClick()); }), a.\u0275\u0275conditionalCreate(2, H, 2, 1, "div", 2), a.\u0275\u0275elementStart(3, "span", 3), a.\u0275\u0275projection(4), a.\u0275\u0275elementEnd()(), a.\u0275\u0275element(5, "span", 4)(6, "span", 5);
            } if (o & 2) {
                let n = a.\u0275\u0275reference(1);
                a.\u0275\u0275property("id", e.buttonId)("disabled", e.disabled && !e.disabledInteractive || null), a.\u0275\u0275attribute("role", e.isSingleSelector() ? "radio" : "button")("tabindex", e.disabled && !e.disabledInteractive ? -1 : e.tabIndex)("aria-pressed", e.isSingleSelector() ? null : e.checked)("aria-checked", e.isSingleSelector() ? e.checked : null)("name", e._getButtonName())("aria-label", e.ariaLabel)("aria-labelledby", e.ariaLabelledby)("aria-disabled", e.disabled && e.disabledInteractive ? "true" : null), a.\u0275\u0275advance(2), a.\u0275\u0275conditional(e.buttonToggleGroup && (!e.buttonToggleGroup.multiple && !e.buttonToggleGroup.hideSingleSelectionIndicator || e.buttonToggleGroup.multiple && !e.buttonToggleGroup.hideMultipleSelectionIndicator) ? 2 : -1), a.\u0275\u0275advance(4), a.\u0275\u0275property("matRippleTrigger", n)("matRippleDisabled", e.disableRipple || e.disabled);
            } }, dependencies: [p, f], styles: [`.mat-button-toggle-standalone,.mat-button-toggle-group{position:relative;display:inline-flex;flex-direction:row;white-space:nowrap;overflow:hidden;-webkit-tap-highlight-color:rgba(0,0,0,0);border-radius:var(--mat-button-toggle-legacy-shape);transform:translateZ(0)}.mat-button-toggle-standalone:not([class*=mat-elevation-z]),.mat-button-toggle-group:not([class*=mat-elevation-z]){box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)}@media(forced-colors: active){.mat-button-toggle-standalone,.mat-button-toggle-group{outline:solid 1px}}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.mat-button-toggle-group-appearance-standard{border-radius:var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));border:solid 1px var(--mat-button-toggle-divider-color, var(--mat-sys-outline))}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard .mat-pseudo-checkbox,.mat-button-toggle-group-appearance-standard .mat-pseudo-checkbox{--mat-pseudo-checkbox-minimal-selected-checkmark-color: var(--mat-button-toggle-selected-state-text-color, var(--mat-sys-on-secondary-container))}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard:not([class*=mat-elevation-z]),.mat-button-toggle-group-appearance-standard:not([class*=mat-elevation-z]){box-shadow:none}@media(forced-colors: active){.mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.mat-button-toggle-group-appearance-standard{outline:0}}.mat-button-toggle-vertical{flex-direction:column}.mat-button-toggle-vertical .mat-button-toggle-label-content{display:block}.mat-button-toggle{white-space:nowrap;position:relative;color:var(--mat-button-toggle-legacy-text-color);font-family:var(--mat-button-toggle-legacy-label-text-font);font-size:var(--mat-button-toggle-legacy-label-text-size);line-height:var(--mat-button-toggle-legacy-label-text-line-height);font-weight:var(--mat-button-toggle-legacy-label-text-weight);letter-spacing:var(--mat-button-toggle-legacy-label-text-tracking);--mat-pseudo-checkbox-minimal-selected-checkmark-color: var(--mat-button-toggle-legacy-selected-state-text-color)}.mat-button-toggle.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:var(--mat-button-toggle-legacy-focus-state-layer-opacity)}.mat-button-toggle .mat-icon svg{vertical-align:top}.mat-button-toggle-checkbox-wrapper{display:inline-block;justify-content:flex-start;align-items:center;width:0;height:18px;line-height:18px;overflow:hidden;box-sizing:border-box;position:absolute;top:50%;left:16px;transform:translate3d(0, -50%, 0)}[dir=rtl] .mat-button-toggle-checkbox-wrapper{left:auto;right:16px}.mat-button-toggle-appearance-standard .mat-button-toggle-checkbox-wrapper{left:12px}[dir=rtl] .mat-button-toggle-appearance-standard .mat-button-toggle-checkbox-wrapper{left:auto;right:12px}.mat-button-toggle-checked .mat-button-toggle-checkbox-wrapper{width:18px}.mat-button-toggle-animations-enabled .mat-button-toggle-checkbox-wrapper{transition:width 150ms 45ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-button-toggle-vertical .mat-button-toggle-checkbox-wrapper{transition:none}.mat-button-toggle-checked{color:var(--mat-button-toggle-legacy-selected-state-text-color);background-color:var(--mat-button-toggle-legacy-selected-state-background-color)}.mat-button-toggle-disabled{pointer-events:none;color:var(--mat-button-toggle-legacy-disabled-state-text-color);background-color:var(--mat-button-toggle-legacy-disabled-state-background-color);--mat-pseudo-checkbox-minimal-disabled-selected-checkmark-color: var(--mat-button-toggle-legacy-disabled-state-text-color)}.mat-button-toggle-disabled.mat-button-toggle-checked{background-color:var(--mat-button-toggle-legacy-disabled-selected-state-background-color)}.mat-button-toggle-disabled-interactive{pointer-events:auto}.mat-button-toggle-appearance-standard{color:var(--mat-button-toggle-text-color, var(--mat-sys-on-surface));background-color:var(--mat-button-toggle-background-color, transparent);font-family:var(--mat-button-toggle-label-text-font, var(--mat-sys-label-large-font));font-size:var(--mat-button-toggle-label-text-size, var(--mat-sys-label-large-size));line-height:var(--mat-button-toggle-label-text-line-height, var(--mat-sys-label-large-line-height));font-weight:var(--mat-button-toggle-label-text-weight, var(--mat-sys-label-large-weight));letter-spacing:var(--mat-button-toggle-label-text-tracking, var(--mat-sys-label-large-tracking))}.mat-button-toggle-group-appearance-standard .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:solid 1px var(--mat-button-toggle-divider-color, var(--mat-sys-outline))}[dir=rtl] .mat-button-toggle-group-appearance-standard .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:none;border-right:solid 1px var(--mat-button-toggle-divider-color, var(--mat-sys-outline))}.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:none;border-right:none;border-top:solid 1px var(--mat-button-toggle-divider-color, var(--mat-sys-outline))}.mat-button-toggle-appearance-standard.mat-button-toggle-checked{color:var(--mat-button-toggle-selected-state-text-color, var(--mat-sys-on-secondary-container));background-color:var(--mat-button-toggle-selected-state-background-color, var(--mat-sys-secondary-container))}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled{color:var(--mat-button-toggle-disabled-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));background-color:var(--mat-button-toggle-disabled-state-background-color, transparent)}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled .mat-pseudo-checkbox{--mat-pseudo-checkbox-minimal-disabled-selected-checkmark-color: var(--mat-button-toggle-disabled-selected-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent))}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled.mat-button-toggle-checked{color:var(--mat-button-toggle-disabled-selected-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));background-color:var(--mat-button-toggle-disabled-selected-state-background-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent))}.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay{background-color:var(--mat-button-toggle-state-layer-color, var(--mat-sys-on-surface))}.mat-button-toggle-appearance-standard:hover .mat-button-toggle-focus-overlay{opacity:var(--mat-button-toggle-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity))}.mat-button-toggle-appearance-standard.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:var(--mat-button-toggle-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity))}@media(hover: none){.mat-button-toggle-appearance-standard:hover .mat-button-toggle-focus-overlay{display:none}}.mat-button-toggle-label-content{-webkit-user-select:none;user-select:none;display:inline-block;padding:0 16px;line-height:var(--mat-button-toggle-legacy-height);position:relative}.mat-button-toggle-appearance-standard .mat-button-toggle-label-content{padding:0 12px;line-height:var(--mat-button-toggle-height, 40px)}.mat-button-toggle-label-content>*{vertical-align:middle}.mat-button-toggle-focus-overlay{top:0;left:0;right:0;bottom:0;position:absolute;border-radius:inherit;pointer-events:none;opacity:0;background-color:var(--mat-button-toggle-legacy-state-layer-color)}@media(forced-colors: active){.mat-button-toggle-checked .mat-button-toggle-focus-overlay{border-bottom:solid 500px;opacity:.5;height:0}.mat-button-toggle-checked:hover .mat-button-toggle-focus-overlay{opacity:.6}.mat-button-toggle-checked.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay{border-bottom:solid 500px}}.mat-button-toggle .mat-button-toggle-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-button-toggle-button{border:0;background:none;color:inherit;padding:0;margin:0;font:inherit;outline:none;width:100%;cursor:pointer}.mat-button-toggle-animations-enabled .mat-button-toggle-button{transition:padding 150ms 45ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-button-toggle-vertical .mat-button-toggle-button{transition:none}.mat-button-toggle-disabled .mat-button-toggle-button{cursor:default}.mat-button-toggle-button::-moz-focus-inner{border:0}.mat-button-toggle-checked .mat-button-toggle-button:has(.mat-button-toggle-checkbox-wrapper){padding-left:30px}[dir=rtl] .mat-button-toggle-checked .mat-button-toggle-button:has(.mat-button-toggle-checkbox-wrapper){padding-left:0;padding-right:30px}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard{--mat-focus-indicator-border-radius: var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large))}.mat-button-toggle-group-appearance-standard:not(.mat-button-toggle-vertical) .mat-button-toggle:last-of-type .mat-button-toggle-button::before{border-top-right-radius:var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));border-bottom-right-radius:var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large))}.mat-button-toggle-group-appearance-standard:not(.mat-button-toggle-vertical) .mat-button-toggle:first-of-type .mat-button-toggle-button::before{border-top-left-radius:var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));border-bottom-left-radius:var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large))}.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle:last-of-type .mat-button-toggle-button::before{border-bottom-right-radius:var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));border-bottom-left-radius:var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large))}.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle:first-of-type .mat-button-toggle-button::before{border-top-right-radius:var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));border-top-left-radius:var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large))}
`], encapsulation: 2, changeDetection: 0 });
    }
    return l;
})(), ht = (() => { class l {
    static \u0275fac = function (o) { return new (o || l); };
    static \u0275mod = a.\u0275\u0275defineNgModule({ type: l });
    static \u0275inj = a.\u0275\u0275defineInjector({ imports: [h, T, M] });
} return l; })();
export { k as MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS, x as MAT_BUTTON_TOGGLE_GROUP, Q as MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR, T as MatButtonToggle, d as MatButtonToggleChange, j as MatButtonToggleGroup, ht as MatButtonToggleModule };
