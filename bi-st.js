import { mergeDeep } from 'xtal-latx/mergeDeep.js';
import { getWinCtx } from 'xtal-state/xtal-state-base.js';
import { XtalStateWatch } from 'xtal-state/xtal-state-watch.js';
import { define } from 'xtal-latx/define.js';
import { observeCssSelector } from 'xtal-latx/observeCssSelector.js';
import { createNestedProp } from 'xtal-latx/createNestedProp.js';
import { UrlFormatter } from 'xtal-state/url-formatter.js';
export class Bist extends UrlFormatter(observeCssSelector(XtalStateWatch)) {
    static get is() { return 'bi-st'; }
    constructor() {
        super();
        this.watch = 'popstate';
    }
    connectedCallback() {
        this.style.display = 'none';
        if (this._disabled)
            return;
        this.getElement('_script', t => t.querySelector('script'));
        super.connectedCallback();
        getWinCtx(this, this.level).then(win => {
            this.addEventListener('history-changed', this.histChgListener);
            const w = win;
            if (win.history.state !== null) {
                this.sync(w);
            }
        });
    }
    static get observedAttributes() {
        return super.observedAttributes.concat(this.UFAttribs);
    }
    getElement(fieldName, getter) {
        this[fieldName] = getter(this);
        if (!this[fieldName]) {
            setTimeout(() => {
                this.getElement(fieldName, getter);
            }, 50);
            return;
        }
        this.evaluateCode(this._script);
    }
    evaluateCode(scriptElement) {
        //this.attachBehavior(XtallatX)
        this._rules = eval(scriptElement.innerHTML);
        const sel = Object.keys(this._rules).join(',');
        this.addCSSListener(Bist.is, sel, this.insertListener);
    }
    insertListener(e) {
        if (e.animationName === Bist.is) {
            const target = e.target;
            setTimeout(() => {
                this.regListener(target);
            }, 0);
        }
    }
    histChgListener(e) {
        this.sync(this._window);
    }
    sync(win) {
        this.value = win.history.state;
        this.de('sync-history', {
            value: this.value
        }, true);
    }
    regListener(target) {
        //TODO:  optimize
        for (const sel in this._rules) {
            if (target.matches(sel)) {
                const rule = this._rules[sel];
                if (rule.onPopState) {
                    this.addEventListener('history-changed', e => {
                        rule.onPopState(this, target);
                    });
                    if (this._window.history.state !== null) {
                        rule.onPopState(this, target);
                    }
                }
                if (rule.on) {
                    for (const t in rule.on) {
                        const eR = rule.on[t];
                        const _t = this;
                        target.addEventListener(t, e => {
                            eR(e, _t);
                        });
                    }
                }
            }
        }
    }
    merge(path, val, cmd) {
        const h = this._window.history;
        const state = h.state || {};
        const hist = Object.assign({}, state);
        const newObj = {};
        createNestedProp(newObj, path.split('.'), val, true);
        mergeDeep(state, newObj);
        this.value = state;
        this.de('sync-history', {
            value: state
        }, true);
        const url = this.adjustUrl(this._url);
        h[cmd + 'State'](state, '', url);
    }
    pullFromPath(path, def) {
        let context = this._window.history.state;
        if (context === null)
            return def;
        const pathTokens = path.split('.');
        for (let i = 0, ii = pathTokens.length; i < ii; i++) {
            const token = pathTokens[i];
            context = context[token];
            if (context === null || context === undefined) {
                return def;
            }
        }
        return context;
    }
    get url() {
        return this._url;
    }
    set url(v) {
        this._url = v;
    }
}
define(Bist);
//# sourceMappingURL=bi-st.js.map