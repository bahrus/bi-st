# bi-st

bi-st **bi**nds elements to the history.**st**ate object.  Its purpose is take the long, drawn-out markup [seen here](https://github.com/bahrus/purr-sist#example-3----time-travel-support-aka-back-button), and roll it up into a nice compact sushi roll.  

Syntax:

```html
<input data-st="draft.key">

<bi-st level="global"><script nomodule>
({
    '[data-st]':{
        onPopState: ({bist, el}) =>{
            el.value = bist.pullFromPath(el.dataset.st);
        },
        on:{
            input: ({event, bist}) =>{
                bist.mergePush(event.target.dataset.st, event.target.value);
            }
        }
    }
})
</script></bi-st>
<p-d on="history-changed" to="{histEvent: tbd}"></p-d>
<purr-sist write>
```
