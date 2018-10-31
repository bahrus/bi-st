# bi-st

bi-st (pronounced "beast") binds elements to the history.state object.  It's purpose is take the long drawn-out markup [seen here](https://github.com/bahrus/purr-sist#example-3----time-travel-support-aka-back-button), and roll it up into a nice compact sushi roll.  It uses a css like structure, and will likely adopt Houdini when support is more widespread.

Syntax:

```html
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

<input data-st="draft.key">
```
