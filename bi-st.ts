import {XtallatX} from 'xtal-latx/xtal-latx.js';
import {XtalStateWatch} from 'xtal-state/xtal-state-watch.js';
import {define} from 'xtal-latx/define.js';
import {observeCssSelector} from 'xtal-latx/observeCssSelector.js';
import {createNestedProp} from 'xtal-latx/createNestedProp.js';

interface IRule{
    onPopState: (bist: Bist, el: HTMLElement) => void;
    on: {[key: string]: (e: Event, bist: Bist)};
}

export class Bist extends observeCssSelector(XtalStateWatch){
    static get is(){return 'bi-st';}
    constructor(){
        super();
        this.watch = 'popstate';
    }
    _script!: HTMLScriptElement;

    connectedCallback() {
        this.style.display = 'none';
        this.getElement('_script', t => t.querySelector('script')!);
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
    regListener(target: HTMLElement){
        //TODO:  optimize
        for(const sel in this._rules){
            if(target.matches(sel)){
                const rule = this._rules[sel];
                
                if(rule.onPopState){
                    this.addEventListener('history-changed', e =>{
                        rule.onPopState(this, target);
                    })
                }
                if(rule.on){
                    for(const t in rule.on){
                        const eR = rule.on[t];
                        const _t = this;
                        target.addEventListener(t, e=>{
                            eR(e, _t);
                        })
                    }
                }
            }
        }
        
    }
}
define(Bist);