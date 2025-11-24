import * as i from "@angular/core";
import { inject as a, Injector as c, EnvironmentInjector as p, ApplicationRef as f, createComponent as d } from "@angular/core";
var r = new WeakMap, m = (() => { class n {
    _appRef;
    _injector = a(c);
    _environmentInjector = a(p);
    load(o) { let e = this._appRef = this._appRef || this._injector.get(f), t = r.get(e); t || (t = { loaders: new Set, refs: [] }, r.set(e, t), e.onDestroy(() => { r.get(e)?.refs.forEach(s => s.destroy()), r.delete(e); })), t.loaders.has(o) || (t.loaders.add(o), t.refs.push(d(o, { environmentInjector: this._environmentInjector }))); }
    static ɵfac = function (e) { return new (e || n); };
    static ɵprov = i.ɵɵdefineInjectable({ token: n, factory: n.ɵfac, providedIn: "root" });
} return n; })();
export { m as a };
