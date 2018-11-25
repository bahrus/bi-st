# bi-st

bi-st **bi**nds elements to the window.history.**st**ate object.  Its purpose is to take the long, drawn-out unambiguously unidirectional markup [seen here](https://github.com/bahrus/purr-sist#example-3----time-travel-support-aka-back-button), and roll it up into a nice compact sushi roll.  To help visualize this analogy, see Figure 1 below.  

![](https://media.giphy.com/media/RO023EYTyk5yg/giphy.gif "Figure 1")


**Figure 1**

What we get is more compact and more flexible, which is good, but less clearly unidirectional, and a little less declarative, which, in my book, is not so good.  

## Syntax:

The syntax for binding a UI element is shown below.

```html
<input data-st="draft.key">

<bi-st level="global"><script nomodule>
({
    '[data-st]':{
        onPopState: ({bist, el}) =>{
            el.value = bist.pullFromPath(el.dataset.st, 'Volt ikh mit dir gefloygn vu du vilst');
        },
        on:{
            input: ({event, bist}) => bist.merge(event.target.dataset.st, event.target.value, 'push');
        }
    }
})
</script></bi-st>
<p-d on="sync-history" to="{histEvent:detail.value}"></p-d>
<purr-sist write></purr-sist>
```

The demo shown here [link forthcoming] does the following:

1.  Allows the user to enter arbitary key value pairs into an object.
2.  The data the user enters is put into history.state.
3.  History.state is persisted to a remote datastore.

The total number of lines of markup is only slightly fewer than the example shown [here (view source)](https://bahrus.github.io/purr-sist-demos/Example3.html), that does the same thing without the benefit of this component.  However, as a page increases in complexity, with large numbers of UI elements, this component should help significantly reduce the amount of boilerplate.

##  What's so great about history.state?

One of the trappings of a component library, like Vueactulitymber, is that each such library ships with a state manager / render binding.  But what if you want to combine components together using different libraries?  A tempting choice is to say "use Redux, or MobX, or RxJs, or CycleJS" to unify the state management.  But this tends to enforce a "library / framework" choice of its own.  For small applications / teams this may be fine, but what if you are working with a large application, that spans multiple generations of component libraries, involving loosely coupled teams?

Why not use the platform, and utilize something that will forevermore (?) ship with every browser?  That supports time travel, and routing?


