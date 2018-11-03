# bi-st

bi-st **bi**nds elements to the history.**st**ate object.  Its purpose is take the long, drawn-out unambiguously unidirectional markup [seen here](https://github.com/bahrus/purr-sist#example-3----time-travel-support-aka-back-button), and roll it up into a nice compact sushi roll.  To help visualize this analogy, see Figure 1 below.  

![test](https://media.giphy.com/media/RO023EYTyk5yg/giphy.gif "Figure 1")


Syntax:

```html
<input data-st="draft.key">

<bi-st level="global"><script nomodule>
({
    '[data-st]':{
        onPopState: ({bist, el}) =>{
            el.value = bist.pullFromPath(el.dataset.st, 'Volt ikh mit dir gefloygn vu du vilst');
        },
        on:{
            input: ({event, bist}) =>{
                bist.merge(event.target.dataset.st, event.target.value, 'push');
            }
        }
    }
})
</script></bi-st>
<p-d on="history-changed" to="{histEvent:detail.value}"></p-d>
<purr-sist write></purr-sist>
```
