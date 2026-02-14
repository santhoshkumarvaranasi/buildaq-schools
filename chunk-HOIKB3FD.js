import { a as t } from "@nf-internal/chunk-QA6ELNH7";
import * as a from "@angular/core";
import "@angular/core";
import "rxjs";
import "rxjs/operators";
import "@angular/common";
var u = { XSmall: "(max-width: 599.98px)", Small: "(min-width: 600px) and (max-width: 959.98px)", Medium: "(min-width: 960px) and (max-width: 1279.98px)", Large: "(min-width: 1280px) and (max-width: 1919.98px)", XLarge: "(min-width: 1920px)", Handset: "(max-width: 599.98px) and (orientation: portrait), (max-width: 959.98px) and (orientation: landscape)", Tablet: "(min-width: 600px) and (max-width: 839.98px) and (orientation: portrait), (min-width: 960px) and (max-width: 1279.98px) and (orientation: landscape)", Web: "(min-width: 840px) and (orientation: portrait), (min-width: 1280px) and (orientation: landscape)", HandsetPortrait: "(max-width: 599.98px) and (orientation: portrait)", TabletPortrait: "(min-width: 600px) and (max-width: 839.98px) and (orientation: portrait)", WebPortrait: "(min-width: 840px) and (orientation: portrait)", HandsetLandscape: "(max-width: 959.98px) and (orientation: landscape)", TabletLandscape: "(min-width: 960px) and (max-width: 1279.98px) and (orientation: landscape)", WebLandscape: "(min-width: 1280px) and (orientation: landscape)" };
import { InjectionToken as e, inject as i, ANIMATION_MODULE_TYPE as o } from "@angular/core";
var r = new e("MATERIAL_ANIMATIONS");
var n = null;
function d() { return i(r, { optional: !0 })?.animationsDisabled || i(o, { optional: !0 }) === "NoopAnimations" ? "di-disabled" : (n ??= i(t).matchMedia("(prefers-reduced-motion)").matches, n ? "reduced-motion" : "enabled"); }
function M() { return d() !== "enabled"; }
export { u as a, d as b, M as c };
