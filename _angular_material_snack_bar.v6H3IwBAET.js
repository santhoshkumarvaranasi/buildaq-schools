import { d as A, l as x } from "@nf-internal/chunk-OCEEB5QP";
import "@nf-internal/chunk-JIGJMOXE";
import "@nf-internal/chunk-G6LXKUAW";
import "@nf-internal/chunk-PGOQVX7J";
import "@nf-internal/chunk-4MZRILT7";
import { a as g, c as _ } from "@nf-internal/chunk-HOIKB3FD";
import "@nf-internal/chunk-PRCOYL4O";
import { a as b } from "@nf-internal/chunk-2H5YBILG";
import "@nf-internal/chunk-X7SFHLJ5";
import { b as y } from "@nf-internal/chunk-QA6ELNH7";
import "@nf-internal/chunk-K3GOACLW";
import "@nf-internal/chunk-7N7HFQKY";
import "@nf-internal/chunk-FSAIB72R";
import "@nf-internal/chunk-JYXTBF5A";
import "@nf-internal/chunk-DQM2BKPX";
import { a as m } from "@nf-internal/chunk-4CLCTAJ7";
import * as n from "@angular/core";
import { InjectionToken as w, inject as r, NgZone as R, ElementRef as I, ChangeDetectorRef as O, DOCUMENT as P, Injector as f, afterNextRender as S, TemplateRef as j } from "@angular/core";
import { Subject as d, of as F } from "rxjs";
import { _IdGenerator as N, LiveAnnouncer as L } from "@angular/cdk/a11y";
import { Platform as z } from "@angular/cdk/platform";
import { BasePortalOutlet as V, CdkPortalOutlet as B, ComponentPortal as C, TemplatePortal as q, PortalModule as H } from "@angular/cdk/portal";
import { OverlayConfig as Z, createGlobalPositionStrategy as Q, createOverlayRef as U, OverlayModule as W } from "@angular/cdk/overlay";
import { takeUntil as K } from "rxjs/operators";
import "@angular/cdk/bidi";
function X(i, l) { if (i & 1) {
    let t = n.\u0275\u0275getCurrentView();
    n.\u0275\u0275elementStart(0, "div", 1)(1, "button", 2), n.\u0275\u0275listener("click", function () { n.\u0275\u0275restoreView(t); let a = n.\u0275\u0275nextContext(); return n.\u0275\u0275resetView(a.action()); }), n.\u0275\u0275text(2), n.\u0275\u0275elementEnd()();
} if (i & 2) {
    let t = n.\u0275\u0275nextContext();
    n.\u0275\u0275advance(2), n.\u0275\u0275textInterpolate1(" ", t.data.action, " ");
} }
var G = ["label"];
function $(i, l) { }
var Y = Math.pow(2, 31) - 1, p = class {
    _overlayRef;
    instance;
    containerInstance;
    _afterDismissed = new d;
    _afterOpened = new d;
    _onAction = new d;
    _durationTimeoutId;
    _dismissedByAction = !1;
    constructor(l, t) { this._overlayRef = t, this.containerInstance = l, l._onExit.subscribe(() => this._finishDismiss()); }
    dismiss() { this._afterDismissed.closed || this.containerInstance.exit(), clearTimeout(this._durationTimeoutId); }
    dismissWithAction() { this._onAction.closed || (this._dismissedByAction = !0, this._onAction.next(), this._onAction.complete(), this.dismiss()), clearTimeout(this._durationTimeoutId); }
    closeWithAction() { this.dismissWithAction(); }
    _dismissAfter(l) { this._durationTimeoutId = setTimeout(() => this.dismiss(), Math.min(l, Y)); }
    _open() { this._afterOpened.closed || (this._afterOpened.next(), this._afterOpened.complete()); }
    _finishDismiss() { this._overlayRef.dispose(), this._onAction.closed || this._onAction.complete(), this._afterDismissed.next({ dismissedByAction: this._dismissedByAction }), this._afterDismissed.complete(), this._dismissedByAction = !1; }
    afterDismissed() { return this._afterDismissed; }
    afterOpened() { return this.containerInstance._onEnter; }
    onAction() { return this._onAction; }
}, M = new w("MatSnackBarData"), u = class {
    politeness = "polite";
    announcementMessage = "";
    viewContainerRef;
    duration = 0;
    panelClass;
    direction;
    data = null;
    horizontalPosition = "center";
    verticalPosition = "bottom";
}, J = (() => { class i {
    static \u0275fac = function (e) { return new (e || i); };
    static \u0275dir = n.\u0275\u0275defineDirective({ type: i, selectors: [["", "matSnackBarLabel", ""]], hostAttrs: [1, "mat-mdc-snack-bar-label", "mdc-snackbar__label"] });
} return i; })(), tt = (() => { class i {
    static \u0275fac = function (e) { return new (e || i); };
    static \u0275dir = n.\u0275\u0275defineDirective({ type: i, selectors: [["", "matSnackBarActions", ""]], hostAttrs: [1, "mat-mdc-snack-bar-actions", "mdc-snackbar__actions"] });
} return i; })(), et = (() => { class i {
    static \u0275fac = function (e) { return new (e || i); };
    static \u0275dir = n.\u0275\u0275defineDirective({ type: i, selectors: [["", "matSnackBarAction", ""]], hostAttrs: [1, "mat-mdc-snack-bar-action", "mdc-snackbar__action"] });
} return i; })(), D = (() => {
    class i {
        snackBarRef = r(p);
        data = r(M);
        constructor() { }
        action() { this.snackBarRef.dismissWithAction(); }
        get hasAction() { return !!this.data.action; }
        static \u0275fac = function (e) { return new (e || i); };
        static \u0275cmp = n.\u0275\u0275defineComponent({ type: i, selectors: [["simple-snack-bar"]], hostAttrs: [1, "mat-mdc-simple-snack-bar"], exportAs: ["matSnackBar"], decls: 3, vars: 2, consts: [["matSnackBarLabel", ""], ["matSnackBarActions", ""], ["matButton", "", "matSnackBarAction", "", 3, "click"]], template: function (e, a) {
                e & 1 && (n.\u0275\u0275elementStart(0, "div", 0), n.\u0275\u0275text(1), n.\u0275\u0275elementEnd(), n.\u0275\u0275conditionalCreate(2, X, 3, 1, "div", 1)), e & 2 && (n.\u0275\u0275advance(), n.\u0275\u0275textInterpolate1(" ", a.data.message, `
`), n.\u0275\u0275advance(), n.\u0275\u0275conditional(a.hasAction ? 2 : -1));
            }, dependencies: [A, J, tt, et], styles: [`.mat-mdc-simple-snack-bar{display:flex}.mat-mdc-simple-snack-bar .mat-mdc-snack-bar-label{max-height:50vh;overflow:auto}
`], encapsulation: 2, changeDetection: 0 });
    }
    return i;
})(), k = "_mat-snack-bar-enter", v = "_mat-snack-bar-exit", nt = (() => {
    class i extends V {
        _ngZone = r(R);
        _elementRef = r(I);
        _changeDetectorRef = r(O);
        _platform = r(z);
        _animationsDisabled = _();
        snackBarConfig = r(u);
        _document = r(P);
        _trackedModals = new Set;
        _enterFallback;
        _exitFallback;
        _injector = r(f);
        _announceDelay = 150;
        _announceTimeoutId;
        _destroyed = !1;
        _portalOutlet;
        _onAnnounce = new d;
        _onExit = new d;
        _onEnter = new d;
        _animationState = "void";
        _live;
        _label;
        _role;
        _liveElementId = r(N).getId("mat-snack-bar-container-live-");
        constructor() { super(); let t = this.snackBarConfig; t.politeness === "assertive" && !t.announcementMessage ? this._live = "assertive" : t.politeness === "off" ? this._live = "off" : this._live = "polite", this._platform.FIREFOX && (this._live === "polite" && (this._role = "status"), this._live === "assertive" && (this._role = "alert")); }
        attachComponentPortal(t) { this._assertNotAttached(); let e = this._portalOutlet.attachComponentPortal(t); return this._afterPortalAttached(), e; }
        attachTemplatePortal(t) { this._assertNotAttached(); let e = this._portalOutlet.attachTemplatePortal(t); return this._afterPortalAttached(), e; }
        attachDomPortal = t => { this._assertNotAttached(); let e = this._portalOutlet.attachDomPortal(t); return this._afterPortalAttached(), e; };
        onAnimationEnd(t) { t === v ? this._completeExit() : t === k && (clearTimeout(this._enterFallback), this._ngZone.run(() => { this._onEnter.next(), this._onEnter.complete(); })); }
        enter() { this._destroyed || (this._animationState = "visible", this._changeDetectorRef.markForCheck(), this._changeDetectorRef.detectChanges(), this._screenReaderAnnounce(), this._animationsDisabled ? S(() => { this._ngZone.run(() => queueMicrotask(() => this.onAnimationEnd(k))); }, { injector: this._injector }) : (clearTimeout(this._enterFallback), this._enterFallback = setTimeout(() => { this._elementRef.nativeElement.classList.add("mat-snack-bar-fallback-visible"), this.onAnimationEnd(k); }, 200))); }
        exit() { return this._destroyed ? F(void 0) : (this._ngZone.run(() => { this._animationState = "hidden", this._changeDetectorRef.markForCheck(), this._elementRef.nativeElement.setAttribute("mat-exit", ""), clearTimeout(this._announceTimeoutId), this._animationsDisabled ? S(() => { this._ngZone.run(() => queueMicrotask(() => this.onAnimationEnd(v))); }, { injector: this._injector }) : (clearTimeout(this._exitFallback), this._exitFallback = setTimeout(() => this.onAnimationEnd(v), 200)); }), this._onExit); }
        ngOnDestroy() { this._destroyed = !0, this._clearFromModals(), this._completeExit(); }
        _completeExit() { clearTimeout(this._exitFallback), queueMicrotask(() => { this._onExit.next(), this._onExit.complete(); }); }
        _afterPortalAttached() { let t = this._elementRef.nativeElement, e = this.snackBarConfig.panelClass; e && (Array.isArray(e) ? e.forEach(o => t.classList.add(o)) : t.classList.add(e)), this._exposeToModals(); let a = this._label.nativeElement, s = "mdc-snackbar__label"; a.classList.toggle(s, !a.querySelector(`.${s}`)); }
        _exposeToModals() { let t = this._liveElementId, e = this._document.querySelectorAll('body > .cdk-overlay-container [aria-modal="true"]'); for (let a = 0; a < e.length; a++) {
            let s = e[a], o = s.getAttribute("aria-owns");
            this._trackedModals.add(s), o ? o.indexOf(t) === -1 && s.setAttribute("aria-owns", o + " " + t) : s.setAttribute("aria-owns", t);
        } }
        _clearFromModals() { this._trackedModals.forEach(t => { let e = t.getAttribute("aria-owns"); if (e) {
            let a = e.replace(this._liveElementId, "").trim();
            a.length > 0 ? t.setAttribute("aria-owns", a) : t.removeAttribute("aria-owns");
        } }), this._trackedModals.clear(); }
        _assertNotAttached() { this._portalOutlet.hasAttached(); }
        _screenReaderAnnounce() { this._announceTimeoutId || this._ngZone.runOutsideAngular(() => { this._announceTimeoutId = setTimeout(() => { if (this._destroyed)
            return; let t = this._elementRef.nativeElement, e = t.querySelector("[aria-hidden]"), a = t.querySelector("[aria-live]"); if (e && a) {
            let s = null;
            this._platform.isBrowser && document.activeElement instanceof HTMLElement && e.contains(document.activeElement) && (s = document.activeElement), e.removeAttribute("aria-hidden"), a.appendChild(e), s?.focus(), this._onAnnounce.next(), this._onAnnounce.complete();
        } }, this._announceDelay); }); }
        static \u0275fac = function (e) { return new (e || i); };
        static \u0275cmp = n.\u0275\u0275defineComponent({ type: i, selectors: [["mat-snack-bar-container"]], viewQuery: function (e, a) { if (e & 1 && (n.\u0275\u0275viewQuery(B, 7), n.\u0275\u0275viewQuery(G, 7)), e & 2) {
                let s;
                n.\u0275\u0275queryRefresh(s = n.\u0275\u0275loadQuery()) && (a._portalOutlet = s.first), n.\u0275\u0275queryRefresh(s = n.\u0275\u0275loadQuery()) && (a._label = s.first);
            } }, hostAttrs: [1, "mdc-snackbar", "mat-mdc-snack-bar-container"], hostVars: 6, hostBindings: function (e, a) { e & 1 && n.\u0275\u0275listener("animationend", function (o) { return a.onAnimationEnd(o.animationName); })("animationcancel", function (o) { return a.onAnimationEnd(o.animationName); }), e & 2 && n.\u0275\u0275classProp("mat-snack-bar-container-enter", a._animationState === "visible")("mat-snack-bar-container-exit", a._animationState === "hidden")("mat-snack-bar-container-animations-enabled", !a._animationsDisabled); }, features: [n.\u0275\u0275InheritDefinitionFeature], decls: 6, vars: 3, consts: [["label", ""], [1, "mdc-snackbar__surface", "mat-mdc-snackbar-surface"], [1, "mat-mdc-snack-bar-label"], ["aria-hidden", "true"], ["cdkPortalOutlet", ""]], template: function (e, a) { e & 1 && (n.\u0275\u0275elementStart(0, "div", 1)(1, "div", 2, 0)(3, "div", 3), n.\u0275\u0275template(4, $, 0, 0, "ng-template", 4), n.\u0275\u0275elementEnd(), n.\u0275\u0275element(5, "div"), n.\u0275\u0275elementEnd()()), e & 2 && (n.\u0275\u0275advance(5), n.\u0275\u0275attribute("aria-live", a._live)("role", a._role)("id", a._liveElementId)); }, dependencies: [B], styles: [`@keyframes _mat-snack-bar-enter{from{transform:scale(0.8);opacity:0}to{transform:scale(1);opacity:1}}@keyframes _mat-snack-bar-exit{from{opacity:1}to{opacity:0}}.mat-mdc-snack-bar-container{display:flex;align-items:center;justify-content:center;box-sizing:border-box;-webkit-tap-highlight-color:rgba(0,0,0,0);margin:8px}.mat-mdc-snack-bar-handset .mat-mdc-snack-bar-container{width:100vw}.mat-snack-bar-container-animations-enabled{opacity:0}.mat-snack-bar-container-animations-enabled.mat-snack-bar-fallback-visible{opacity:1}.mat-snack-bar-container-animations-enabled.mat-snack-bar-container-enter{animation:_mat-snack-bar-enter 150ms cubic-bezier(0, 0, 0.2, 1) forwards}.mat-snack-bar-container-animations-enabled.mat-snack-bar-container-exit{animation:_mat-snack-bar-exit 75ms cubic-bezier(0.4, 0, 1, 1) forwards}.mat-mdc-snackbar-surface{box-shadow:0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);display:flex;align-items:center;justify-content:flex-start;box-sizing:border-box;padding-left:0;padding-right:8px}[dir=rtl] .mat-mdc-snackbar-surface{padding-right:0;padding-left:8px}.mat-mdc-snack-bar-container .mat-mdc-snackbar-surface{min-width:344px;max-width:672px}.mat-mdc-snack-bar-handset .mat-mdc-snackbar-surface{width:100%;min-width:0}@media(forced-colors: active){.mat-mdc-snackbar-surface{outline:solid 1px}}.mat-mdc-snack-bar-container .mat-mdc-snackbar-surface{color:var(--mat-snack-bar-supporting-text-color, var(--mat-sys-inverse-on-surface));border-radius:var(--mat-snack-bar-container-shape, var(--mat-sys-corner-extra-small));background-color:var(--mat-snack-bar-container-color, var(--mat-sys-inverse-surface))}.mdc-snackbar__label{width:100%;flex-grow:1;box-sizing:border-box;margin:0;padding:14px 8px 14px 16px}[dir=rtl] .mdc-snackbar__label{padding-left:8px;padding-right:16px}.mat-mdc-snack-bar-container .mdc-snackbar__label{font-family:var(--mat-snack-bar-supporting-text-font, var(--mat-sys-body-medium-font));font-size:var(--mat-snack-bar-supporting-text-size, var(--mat-sys-body-medium-size));font-weight:var(--mat-snack-bar-supporting-text-weight, var(--mat-sys-body-medium-weight));line-height:var(--mat-snack-bar-supporting-text-line-height, var(--mat-sys-body-medium-line-height))}.mat-mdc-snack-bar-actions{display:flex;flex-shrink:0;align-items:center;box-sizing:border-box}.mat-mdc-snack-bar-handset,.mat-mdc-snack-bar-container,.mat-mdc-snack-bar-label{flex:1 1 auto}.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled){--mat-button-text-state-layer-color: currentColor;--mat-button-text-ripple-color: currentColor}.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled).mat-unthemed{color:var(--mat-snack-bar-button-color, var(--mat-sys-inverse-primary))}.mat-mdc-snack-bar-container .mat-mdc-button.mat-mdc-snack-bar-action:not(:disabled) .mat-ripple-element{opacity:.1}
`], encapsulation: 2 });
    }
    return i;
})();
function at() { return new u; }
var it = new w("mat-snack-bar-default-options", { providedIn: "root", factory: at }), st = (() => { class i {
    _live = r(L);
    _injector = r(f);
    _breakpointObserver = r(y);
    _parentSnackBar = r(i, { optional: !0, skipSelf: !0 });
    _defaultConfig = r(it);
    _animationsDisabled = _();
    _snackBarRefAtThisLevel = null;
    simpleSnackBarComponent = D;
    snackBarContainerComponent = nt;
    handsetCssClass = "mat-mdc-snack-bar-handset";
    get _openedSnackBarRef() { let t = this._parentSnackBar; return t ? t._openedSnackBarRef : this._snackBarRefAtThisLevel; }
    set _openedSnackBarRef(t) { this._parentSnackBar ? this._parentSnackBar._openedSnackBarRef = t : this._snackBarRefAtThisLevel = t; }
    constructor() { }
    openFromComponent(t, e) { return this._attach(t, e); }
    openFromTemplate(t, e) { return this._attach(t, e); }
    open(t, e = "", a) { let s = m(m({}, this._defaultConfig), a); return s.data = { message: t, action: e }, s.announcementMessage === t && (s.announcementMessage = void 0), this.openFromComponent(this.simpleSnackBarComponent, s); }
    dismiss() { this._openedSnackBarRef && this._openedSnackBarRef.dismiss(); }
    ngOnDestroy() { this._snackBarRefAtThisLevel && this._snackBarRefAtThisLevel.dismiss(); }
    _attachSnackBarContainer(t, e) { let a = e && e.viewContainerRef && e.viewContainerRef.injector, s = f.create({ parent: a || this._injector, providers: [{ provide: u, useValue: e }] }), o = new C(this.snackBarContainerComponent, e.viewContainerRef, s), c = t.attach(o); return c.instance.snackBarConfig = e, c.instance; }
    _attach(t, e) { let a = m(m(m({}, new u), this._defaultConfig), e), s = this._createOverlay(a), o = this._attachSnackBarContainer(s, a), c = new p(o, s); if (t instanceof j) {
        let h = new q(t, null, { $implicit: a.data, snackBarRef: c });
        c.instance = o.attachTemplatePortal(h);
    }
    else {
        let h = this._createInjector(a, c), T = new C(t, void 0, h), E = o.attachComponentPortal(T);
        c.instance = E.instance;
    } return this._breakpointObserver.observe(g.HandsetPortrait).pipe(K(s.detachments())).subscribe(h => { s.overlayElement.classList.toggle(this.handsetCssClass, h.matches); }), a.announcementMessage && o._onAnnounce.subscribe(() => { this._live.announce(a.announcementMessage, a.politeness); }), this._animateSnackBar(c, a), this._openedSnackBarRef = c, this._openedSnackBarRef; }
    _animateSnackBar(t, e) { t.afterDismissed().subscribe(() => { this._openedSnackBarRef == t && (this._openedSnackBarRef = null), e.announcementMessage && this._live.clear(); }), e.duration && e.duration > 0 && t.afterOpened().subscribe(() => t._dismissAfter(e.duration)), this._openedSnackBarRef ? (this._openedSnackBarRef.afterDismissed().subscribe(() => { t.containerInstance.enter(); }), this._openedSnackBarRef.dismiss()) : t.containerInstance.enter(); }
    _createOverlay(t) { let e = new Z; e.direction = t.direction; let a = Q(this._injector), s = t.direction === "rtl", o = t.horizontalPosition === "left" || t.horizontalPosition === "start" && !s || t.horizontalPosition === "end" && s, c = !o && t.horizontalPosition !== "center"; return o ? a.left("0") : c ? a.right("0") : a.centerHorizontally(), t.verticalPosition === "top" ? a.top("0") : a.bottom("0"), e.positionStrategy = a, e.disableAnimations = this._animationsDisabled, U(this._injector, e); }
    _createInjector(t, e) { let a = t && t.viewContainerRef && t.viewContainerRef.injector; return f.create({ parent: a || this._injector, providers: [{ provide: p, useValue: e }, { provide: M, useValue: t.data }] }); }
    static \u0275fac = function (e) { return new (e || i); };
    static \u0275prov = n.\u0275\u0275defineInjectable({ token: i, factory: i.\u0275fac, providedIn: "root" });
} return i; })();
var Bt = (() => { class i {
    static \u0275fac = function (e) { return new (e || i); };
    static \u0275mod = n.\u0275\u0275defineNgModule({ type: i });
    static \u0275inj = n.\u0275\u0275defineInjector({ providers: [st], imports: [W, H, x, b, D, b] });
} return i; })(), Ct = { snackBarState: { type: 7, name: "state", definitions: [{ type: 0, name: "void, hidden", styles: { type: 6, styles: { transform: "scale(0.8)", opacity: 0 }, offset: null } }, { type: 0, name: "visible", styles: { type: 6, styles: { transform: "scale(1)", opacity: 1 }, offset: null } }, { type: 1, expr: "* => visible", animation: { type: 4, styles: null, timings: "150ms cubic-bezier(0, 0, 0.2, 1)" }, options: null }, { type: 1, expr: "* => void, * => hidden", animation: { type: 4, styles: { type: 6, styles: { opacity: 0 }, offset: null }, timings: "75ms cubic-bezier(0.4, 0.0, 1, 1)" }, options: null }], options: {} } };
export { M as MAT_SNACK_BAR_DATA, it as MAT_SNACK_BAR_DEFAULT_OPTIONS, at as MAT_SNACK_BAR_DEFAULT_OPTIONS_FACTORY, st as MatSnackBar, et as MatSnackBarAction, tt as MatSnackBarActions, u as MatSnackBarConfig, nt as MatSnackBarContainer, J as MatSnackBarLabel, Bt as MatSnackBarModule, p as MatSnackBarRef, D as SimpleSnackBar, Ct as matSnackBarAnimations };
