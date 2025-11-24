import * as i from "@angular/core";
import { inject as r, APP_ID as c } from "@angular/core";
var a = {}, e = class o {
    _appId = r(c);
    static _infix = `a${Math.floor(Math.random() * 1e5).toString()}`;
    getId(t, n = !1) { return this._appId !== "ng" && (t += this._appId), a.hasOwnProperty(t) || (a[t] = 0), `${t}${n ? o._infix + "-" : ""}${a[t]++}`; }
    static ɵfac = function (n) { return new (n || o); };
    static ɵprov = i.ɵɵdefineInjectable({ token: o, factory: o.ɵfac, providedIn: "root" });
};
export { e as a };
