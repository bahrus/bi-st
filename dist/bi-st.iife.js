
    //@ts-check
    (function () {
    function define(custEl) {
    let tagName = custEl.is;
    if (customElements.get(tagName)) {
        console.warn('Already registered ' + tagName);
        return;
    }
    customElements.define(tagName, custEl);
}
const disabled = 'disabled';
/**
 * Base class for many xtal- components
 * @param superClass
 */
function XtallatX(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this._evCount = {};
        }
        static get observedAttributes() {
            return [disabled];
        }
        /**
         * Any component that emits events should not do so if it is disabled.
         * Note that this is not enforced, but the disabled property is made available.
         * Users of this mix-in should ensure not to call "de" if this property is set to true.
         */
        get disabled() {
            return this._disabled;
        }
        set disabled(val) {
            this.attr(disabled, val, '');
        }
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            const v = val ? 'set' : 'remove'; //verb
            this[v + 'Attribute'](name, trueVal || val);
        }
        /**
         * Turn number into string with even and odd values easy to query via css.
         * @param n
         */
        to$(n) {
            const mod = n % 2;
            return (n - mod) / 2 + '-' + mod;
        }
        /**
         * Increment event count
         * @param name
         */
        incAttr(name) {
            const ec = this._evCount;
            if (name in ec) {
                ec[name]++;
            }
            else {
                ec[name] = 0;
            }
            this.attr('data-' + name, this.to$(ec[name]));
        }
        attributeChangedCallback(name, oldVal, newVal) {
            switch (name) {
                case disabled:
                    this._disabled = newVal !== null;
                    break;
            }
        }
        /**
         * Dispatch Custom Event
         * @param name Name of event to dispatch ("-changed" will be appended if asIs is false)
         * @param detail Information to be passed with the event
         * @param asIs If true, don't append event name with '-changed'
         */
        de(name, detail, asIs = false) {
            const eventName = name + (asIs ? '' : '-changed');
            const newEvent = new CustomEvent(eventName, {
                detail: detail,
                bubbles: true,
                composed: false,
            });
            this.dispatchEvent(newEvent);
            this.incAttr(eventName);
            return newEvent;
        }
        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         */
        _upgradeProperties(props) {
            props.forEach(prop => {
                if (this.hasOwnProperty(prop)) {
                    let value = this[prop];
                    delete this[prop];
                    this[prop] = value;
                }
            });
        }
    };
}
function getHost(el) {
    let parent = el;
    while (parent = (parent.parentNode)) {
        if (parent.nodeType === 11) {
            return parent['host'];
        }
        else if (parent.tagName === 'BODY') {
            return null;
        }
    }
    return null;
}
const history_state_update = 'history-state-update';
/**
 *
 * @param par Parent or document fragment which should mantain regional state
 * @param _t XtalStateBase element
 */
function getIFrmWin(par, callBack) {
    let ifr = par.querySelector('iframe[xtal-state]');
    if (ifr === null) {
        ifr = document.createElement('iframe');
        //ifr.src = 'about:blank';
        ifr.setAttribute('xtal-state', '');
        ifr.addEventListener('load', () => {
            ifr.setAttribute('loaded', '');
            if (callBack !== null)
                callBack(ifr);
        });
        ifr.src = 'blank.html';
        ifr.style.display = 'none';
        par.appendChild(ifr);
    }
    else {
        if (!ifr.hasAttribute('loaded')) {
            ifr.addEventListener('load', () => {
                if (callBack !== null)
                    callBack(ifr);
            });
        }
        else {
            if (callBack !== null)
                callBack(ifr);
        }
    }
    return ifr.contentWindow;
}
function getMchPar(el, level) {
    let test = el.parentElement;
    while (test) {
        if (test.matches(level))
            return test;
        test = test.parentElement;
    }
}
function getSC(el) {
    const test = getHost(el);
    return test.shadowRoot === null ? test : test.shadowRoot;
}
function getWinCtx(el, level) {
    const _t = this;
    return new Promise((resolve, reject) => {
        switch (level) {
            case "global":
                init(self);
                resolve(self);
                break;
            case "local":
                getIFrmWin(el.parentElement, ifrm => {
                    init(ifrm.contentWindow);
                    resolve(ifrm.contentWindow);
                });
                break;
            case "shadow":
                getIFrmWin(getSC(el), ifrm => {
                    init(ifrm.contentWindow);
                    resolve(ifrm.contentWindow);
                });
                break;
            default:
                getIFrmWin(getMchPar(el, level), ifrm => {
                    init(ifrm.contentWindow);
                    resolve(ifrm.contentWindow);
                });
        }
    });
}
function de(oldState, win) {
    const detail = {
        oldState: oldState,
        newState: win.history.state,
        initVal: false
    };
    const historyInfo = win.__xtalStateInfo;
    if (!historyInfo.hasStarted) {
        historyInfo.hasStarted = true;
        if (historyInfo.startedAsNull) {
            detail.initVal = true;
        }
    }
    const newEvent = new CustomEvent(history_state_update, {
        detail: detail,
        bubbles: true,
        composed: true,
    });
    win.dispatchEvent(newEvent);
}
function init(win) {
    if (win.__xtalStateInit)
        return;
    win.__xtalStateInit = true;
    if (!win.__xtalStateInfo) {
        win.__xtalStateInfo = {
            startedAsNull: win.history.state === null,
        };
    }
    const originalPushState = win.history.pushState;
    const boundPushState = originalPushState.bind(win.history);
    win.history.pushState = function (newState, title, URL) {
        const oldState = win.history.state;
        boundPushState(newState, title, URL);
        de(oldState, win);
    };
    const originalReplaceState = win.history.replaceState;
    const boundReplaceState = originalReplaceState.bind(win.history);
    win.history.replaceState = function (newState, title, URL) {
        const oldState = win.history.state;
        boundReplaceState(newState, title, URL);
        de(oldState, win);
    };
}
const level = 'level';
class XtalStateBase extends XtallatX(HTMLElement) {
    constructor() {
        super(...arguments);
        this._level = 'global';
    }
    get level() {
        return this._level;
    }
    set level(val) {
        this.attr(level, val);
    }
    static get observedAttributes() {
        return super.observedAttributes.concat([level]);
    }
    get window() {
        return this._window;
    }
    attributeChangedCallback(name, oldVal, newVal) {
        super.attributeChangedCallback(name, oldVal, newVal);
        switch (name) {
            case level:
                this._level = newVal;
                break;
        }
        this.onPropsChange();
    }
    connectedCallback() {
        this.style.display = 'none';
        this._upgradeProperties(['disabled', level]);
        this._conn = true;
        this.onPropsChange();
    }
    onPropsChange() {
        if (!this._conn || this._disabled)
            return true;
        if (!this._window) {
            this._notReady = true;
            getWinCtx(this, this._level).then((win) => {
                this._window = win;
                this._notReady = false;
            });
        }
        if (this._notReady)
            return true;
    }
}
const watch = 'watch';
const all = 'all';
const xtal_subscribers = 'xtal-subscribers';
const popstate = 'popstate';
//const once = 'once';
function remove(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}
class XtalStateWatch extends XtalStateBase {
    static get is() { return 'xtal-state-watch'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([watch]);
    }
    attributeChangedCallback(name, oldValue, nv) {
        super.attributeChangedCallback(name, oldValue, nv);
        switch (name) {
            case watch:
                this._watch = (nv === '') ? all : popstate;
                break;
        }
        this.notify();
    }
    pushReplaceHandler(e) {
        const win = this._window;
        const detail = e.detail;
        //if(detail.newState && win.__xtalStateInfo.startedAsNull && !win.__xtalStateInfo.hasStarted){
        if (detail.initVal) {
            //win.__xtalStateInfo.hasStarted;
            this.dataset.historyInit = 'true';
            this.dataset.popstate = 'true';
        }
        else {
            delete this.dataset.popstate;
            delete this.dataset.historyInit;
        }
        this.history = this._window.history.state;
    }
    popStateHandler(e) {
        this.dataset.popstate = 'true';
        this.history = this._window.history.state;
    }
    addSubscribers() {
        if (this._notReady) {
            setTimeout(() => {
                this.addSubscribers();
            }, 50);
            return;
        }
        switch (this._watch) {
            case all:
            case popstate:
                if (!this._boundPushReplaceListener) {
                    this._boundPushReplaceListener = this.pushReplaceHandler.bind(this);
                    this._window.addEventListener(history_state_update, this._boundPushReplaceListener);
                }
        }
        switch (this._watch) {
            case popstate:
                if (!this._boundPopStateListener) {
                    this._boundPopStateListener = this.popStateHandler.bind(this);
                    this._window.addEventListener(popstate, this._boundPopStateListener);
                }
        }
        this._connected = true;
        this.history = this._window.history.state;
        //this.notify();
    }
    connectedCallback() {
        //this._connected = true;
        this._upgradeProperties([watch]);
        super.connectedCallback();
        this.addSubscribers();
    }
    disconnect() {
        if (this._boundPopStateListener)
            this.removeEventListener(popstate, this._boundPopStateListener);
        if (this._boundPushReplaceListener)
            this.removeEventListener(history_state_update, this._boundPushReplaceListener);
    }
    disconnectedCallback() {
        this.disconnect();
    }
    get history() {
        return this._history;
    }
    set history(newVal) {
        this._history = newVal;
        if (this._watch)
            this.notify();
    }
    get watch() { return this._watch; }
    set watch(nv) {
        this.attr(watch, nv);
    }
    notify() {
        if (!this._watch || this._disabled || !this._connected || this._history === undefined || this._history === null)
            return;
        this.de('history', {
            value: this._history,
        });
    }
}
define(XtalStateWatch);
const url = 'url';
const url_search = 'url-search';
const replace_url_value = 'replace-url-value';
function UrlFormatter(superClass) {
    return class extends superClass {
        /**
         * URL to use when calling push/replace state
         */
        get url() {
            return this._url;
        }
        set url(val) {
            this.attr(url, val);
        }
        /**
         * Regular expression to search url for.
         */
        get urlSearch() {
            return this._urlSearch;
        }
        set urlSearch(val) {
            this.attr(url_search, val);
        }
        /**
         * Replace URL expression, coupled with urlSearch
         */
        get replaceUrlValue() {
            return this._replaceUrlValue;
        }
        set replaceUrlValue(val) {
            this.attr(replace_url_value, val);
        }
        get stringifyFn() {
            return this._stringifyFn;
        }
        set stringifyFn(nv) {
            this._stringifyFn = nv;
        }
        static get UFAttribs() {
            return [url, url_search, replace_url_value];
        }
        attributeChangedCallback(n, ov, nv) {
            switch (n) {
                case url:
                    this['_' + n] = nv;
                    break;
                case url_search:
                    this._urlSearch = nv;
                    break;
                case replace_url_value:
                    this._replaceUrlValue = nv;
                    break;
            }
            if (super.attributeChangedCallback)
                super.attributeChangedCallback(n, ov, nv);
        }
        connectedCallback() {
            this._upgradeProperties([url, 'urlSearch', 'replaceUrlValue', 'stringifyFn']);
            if (super.connectedCallback)
                super.connectedCallback();
        }
        adjustUrl(url) {
            if (this._stringifyFn) {
                url = this._stringifyFn(this);
            }
            else if (this._replaceUrlValue && this._urlSearch) {
                const reg = new RegExp(this._urlSearch);
                url = url.replace(reg, this._replaceUrlValue);
            }
            return url;
        }
    };
}
/**
 * Deep merge two objects.
 * Inspired by Stackoverflow.com/questions/27936772/deep-object-merging-in-es6-es7
 * @param target
 * @param source
 *
 */
function mergeDeep(target, source) {
    if (typeof target !== 'object')
        return;
    if (typeof source !== 'object')
        return;
    for (const key in source) {
        const sourceVal = source[key];
        const targetVal = target[key];
        if (!sourceVal)
            continue; //TODO:  null out property?
        if (!targetVal) {
            target[key] = sourceVal;
            continue;
        }
        switch (typeof sourceVal) {
            case 'object':
                switch (typeof targetVal) {
                    case 'object':
                        mergeDeep(targetVal, sourceVal);
                        break;
                    default:
                        //console.log(key);
                        target[key] = sourceVal;
                        break;
                }
                break;
            default:
                target[key] = sourceVal;
        }
    }
    return target;
}
function observeCssSelector(superClass) {
    const eventNames = ["animationstart", "MSAnimationStart", "webkitAnimationStart"];
    return class extends superClass {
        addCSSListener(id, targetSelector, insertListener) {
            // See https://davidwalsh.name/detect-node-insertion
            if (this._boundInsertListener)
                return;
            const styleInner = /* css */ `
            @keyframes ${id} {
                from {
                    opacity: 0.99;
                }
                to {
                    opacity: 1;
                }
            }
    
            ${targetSelector}{
                animation-duration: 0.001s;
                animation-name: ${id};
            }
            `;
            const style = document.createElement('style');
            style.innerHTML = styleInner;
            const host = getHost(this);
            if (host !== null) {
                host.shadowRoot.appendChild(style);
            }
            else {
                document.body.appendChild(style);
            }
            this._boundInsertListener = insertListener.bind(this);
            const container = host ? host.shadowRoot : document;
            eventNames.forEach(name => {
                container.addEventListener(name, this._boundInsertListener, false);
            });
            // container.addEventListener("animationstart", this._boundInsertListener, false); // standard + firefox
            // container.addEventListener("MSAnimationStart", this._boundInsertListener, false); // IE
            // container.addEventListener("webkitAnimationStart", this._boundInsertListener, false); // Chrome + Safari
        }
        disconnectedCallback() {
            if (this._boundInsertListener) {
                const host = getHost(this);
                const container = host ? host.shadowRoot : document;
                eventNames.forEach(name => {
                    container.removeEventListener(name, this._boundInsertListener);
                });
                // document.removeEventListener("animationstart", this._boundInsertListener); // standard + firefox
                // document.removeEventListener("MSAnimationStart", this._boundInsertListener); // IE
                // document.removeEventListener("webkitAnimationStart", this._boundInsertListener); // Chrome + Safari
            }
            if (super.disconnectedCallback !== undefined)
                super.disconnectedCallback();
        }
    };
}
function createNestedProp(target, pathTokens, val, clone) {
    const firstToken = pathTokens.shift();
    const tft = target[firstToken];
    const returnObj = { [firstToken]: tft ? tft : {} };
    let tc = returnObj[firstToken]; //targetContext
    const lastToken = pathTokens.pop();
    pathTokens.forEach(token => {
        let newContext = tc[token];
        if (!newContext) {
            newContext = tc[token] = {};
        }
        tc = newContext;
    });
    if (tc[lastToken] && typeof (val) === 'object') {
        Object.assign(tc[lastToken], val);
    }
    else {
        if (lastToken === undefined) {
            returnObj[firstToken] = val;
        }
        else {
            tc[lastToken] = val;
        }
    }
    //this controversial line is to force the target to see new properties, even though we are updating nested properties.
    //In some scenarios, this will fail (like if updating element.dataset), but hopefully it's okay to ignore such failures 
    if (clone)
        try {
            Object.assign(target, returnObj);
        }
        catch (e) { }
    ;
}
class Bist extends UrlFormatter(observeCssSelector(XtalStateWatch)) {
    static get is() { return 'bi-st'; }
    constructor() {
        super();
    }
    connectedCallback() {
        this.style.display = 'none';
        this.watch = 'popstate';
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
        return super.observedAttributes.concat(super.UFAttribs);
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
    })();  
        