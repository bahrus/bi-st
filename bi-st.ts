import {mergeDeep} from 'trans-render/mergeDeep.js';
import {getWinCtx} from 'xtal-state/xtal-state-api.js';
import {XtalStateWatch} from 'xtal-state/xtal-state-watch.js';
import {define} from 'trans-render/define.js';
import {observeCssSelector} from 'xtal-element/observeCssSelector.js';
import {createNestedProp} from 'xtal-element/createNestedProp.js';
import {UrlFormatter} from 'xtal-state/url-formatter.js';

interface IRule{
    onPopState: (bist: Bist, el: HTMLElement) => void;
    on: {[key: string]: (e: Event, bist: Bist) => void};
}

export class Bist extends UrlFormatter(observeCssSelector(XtalStateWatch)){
    static get is(){return 'bi-st';}
    constructor(){
        super();
        
    }
    _script!: HTMLScriptElement;

    connectedCallback() {
        this.style.display = 'none';
        this.watch = 'popstate';
        //if(this._disabled) return;
        this.getElement('_script', t => t.querySelector('script')!);
        super.connectedCallback();
        getWinCtx(this, this.level).then(win =>{
            this.addEventListener('history-changed', this.histChgListener);
            const w = (<any>win) as Window;
            if((<any>win).history.state !== null){
                this.sync(w)
            }
            
        })

    }


    onPropsChange(){
        return true;
    }

    static get observedAttributes(){
        return super.observedAttributes.concat(super.UFAttribs);
    }

    getElement(fieldName: string, getter: (t: Bist) => HTMLElement){
        (<any>this)[fieldName] = getter(this);
        if(!(<any>this)[fieldName]){
            setTimeout(() =>{
                this.getElement(fieldName, getter);
            }, 50);
            return;
        }
        this.evaluateCode(this._script);
    }
    _rules!: {[key: string] : IRule};
    evaluateCode(scriptElement: HTMLScriptElement) {
        //this.attachBehavior(XtallatX)
        this._rules = eval(scriptElement.innerHTML);
        const sel = Object.keys(this._rules).join(',');
        this.addCSSListener(Bist.is, sel, this.insertListener);
    }
    insertListener(e: Event){
        if ((<any>e).animationName === Bist.is) {
            const target = e.target;
            setTimeout(() =>{
                this.regListener(target as HTMLElement);
            }, 0)
        }
    }
    histChgListener(e: Event){
        this.sync(this._window);
    }
    sync(win: Window){
        this.value = win.history.state;
        this.de('sync-history',{
            value: this.value
        }, true);
    }
    regListener(target: HTMLElement){
        //TODO:  optimize
        // if(!this._window){
        //     setTimeout(() => this.regListener(target), 50);
        //     return;
        // }
        for(const sel in this._rules){
            if(target.matches(sel)){
                const rule = this._rules[sel];
                
                if(rule.onPopState){
                    this.addEventListener('history-changed', e =>{
                        rule.onPopState(this, target);
                    });
                    if(this._window.history.state !== null){
                        rule.onPopState(this, target);
                    }
                }
                if(rule.on){
                    for(const t in rule.on){
                        const eR = rule.on[t];
                        const _t = this;
                        target.addEventListener(t, e=>{
                            eR(e, _t);
                        });
                    }
                }
            }
        }
        
    }
    value: any;
    merge(path: string, val: any, cmd:string){
        const h = this._window.history;
        const state = h.state || {};
        const hist = Object.assign({}, state);
        const newObj = {};
        createNestedProp(newObj, path.split('.'), val, true);
        mergeDeep(state, newObj);
        this.value = state;
        this.de('sync-history',{
            value: state
        }, true);
        const url = this.adjustUrl(this._url);
        (<any>h)[cmd + 'State'](state, '', url);
    }

    pullFromPath(path: string, def: string){
        let context = this._window.history.state;
        if(context === null) return def;
        const pathTokens = path.split('.');
        for(let i = 0, ii = pathTokens.length; i < ii; i++){
            const token = pathTokens[i];
            context = context[token];
            if(context === null || context === undefined){
                return def;
            } 
        }
        
        return context;        
    }

    //TODO share with new mixin from xtal-state-commit
    _url!: string;
    get url(){
        return this._url;
    }
    set url(v){
        this._url = v;
    }
}
define(Bist);