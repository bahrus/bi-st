import { mergeDeep } from 'xtal-latx/mergeDeep.js';
import { XtalStateWatch } from 'xtal-state/xtal-state-watch.js';
import { define } from 'xtal-latx/define.js';
import { observeCssSelector } from 'xtal-latx/observeCssSelector.js';
import { createNestedProp } from 'xtal-latx/createNestedProp.js';
export class Bist extends observeCssSelector(XtalStateWatch) {
    static get is() { return 'bi-st'; }
    constructor() {
        super();
        this.watch = 'popstate';
    }
    connectedCallback() {
        this.style.display = 'none';
        this.getElement('_script', t => t.querySelector('script'));
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
    regListener(target) {
        //TODO:  optimize
        for (const sel in this._rules) {
            if (target.matches(sel)) {
                const rule = this._rules[sel];
                if (rule.onPopState) {
                    this.addEventListener('history-changed', e => {
                        rule.onPopState(this, target);
                    });
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
        const state = h.state;
        const hist = Object.assign({}, state);
        const mergeO = createNestedProp({}, path.split('.'), val, false);
        mergeDeep(state, mergeO);
        this.de('history', {
            value: hist
        });
        h[cmd + 'State'](hist, '', this._url);
    }
    pullFromPath(path, def) {
        let context = this._window.history.state;
        if (context === null)
            return def;
        const pathTokens = path.split('.');
        pathTokens.forEach(token => {
            context = context[token];
            if (context === null || context === undefined)
                return def;
        });
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