[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/bi-st)


Take 2:

```html
<html>
    <head>
        <iframe sandbox="..." id=Walmart src=blank.html></iframe>
        <iframe sandbox="..." id=Target src=blank.html></iframe>
    </head>
    <body>
        <input data-st=draft.key>
        <bi-st history-keeper=Walmart debug><script nomodule> 
        ({
            '[data-st]':{
                onPopState: ({bist, el}) =>{
                    el.value = bist.pullFromPath(el.dataset.st, 'Volt ikh mit dir gefloygn vu du vilst', ['input']);
                },
                on:{
                    input: ({event, bist}) => bist.merge(event.target.dataset.st, event.target.value, 'push');
                }
            }
        })
        </script></bi-st>
        <my-custom-element>
            #ShadowDOM
                <input data-st-1=draft.val data-st-2=draft.key>
                <bi-st history-keeper=Target><script nomodule>
                '[data-st-1]':{
                    onPopState: ({bist, el}) =>{
                        el.value = bist.pullFromPath(el.dataset.st1, 'Volt ikh mit dir gefloygn vu du vilst', ['input']); //fires event 'input' after populating from history and disabled removed?
                    },
                    on:{
                        input: ({event, bist}) => bist.merge(event.target.dataset.st, event.target.value, 'push');
                    }
                }
                </script></bi-st>
                <bi-st history-keeper=Wegmans>
                    <template>
                        <!-- Gets added to head, left there -- not in RAM so who cares? -->
                        <iframe sandbox="..." id=Wegmans src=blank.html></iframe>
                    </template>
                    <script nomodule>
                    '[data-st-2]':{
                        onPopState: ({bist, el}) =>{
                            el.title = bist.pullFromPath(el.dataset.st2, 'Volt ikh mit dir gefloygn vu du vilst', ['input']); //fires event input after populating from history
                        },
                        on:{
                            input: ({event, bist}) => bist.merge(event.target.dataset.st, event.target.value, 'push');
                        }
                    }
                    </script>
                </bi-st>
        </my-custom-element>
    </body>
</html>
```



<a href="https://nodei.co/npm/bi-st/"><img src="https://nodei.co/npm/bi-st.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/bi-st">

# bi-st

bi-st **bi**nds elements to the window.history.**st**ate object.  Its purpose is to take the long, drawn-out 99% unambiguously unidirectional markup [seen here](https://github.com/bahrus/purr-sist#example-a1----time-travel-support-aka-back-button), and roll it up into a nice compact sushi roll.  To help visualize this analogy, see Figure 1 below.  

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

The demo shown [here](https://bahrus.github.io/bi-st-demos/index.html) does the following:

1.  Allows the user to enter arbitary key value pairs into an object.
2.  The data the user enters is put into history.state.
3.  History.state is persisted to a remote datastore.

The total number of lines of markup is [only slightly fewer](https://bahrus.github.io/bi-st-demos/index.htm) than the example shown [here (view source)](https://bahrus.github.io/purr-sist-demos/Example3.html), that does the same thing without the benefit of this component.  In particular, the number of lines drops from 129 lines to 110 lines.  


However, as a page increases in complexity, with large numbers of UI elements, this component should help significantly reduce the amount of boilerplate.  Markup shown below.

##  What's so great about history.state?

One of the trappings of a component library, like Vueactulitymber, is that each such library ships with a state manager / render binding.  But what if you want to combine components together using different libraries?  A tempting choice is to say "use Redux, or MobX, or RxJs, or CycleJS" to unify the state management.  But this tends to enforce a "library / framework" choice of its own.  For small applications / teams this may be fine, but what if you are working with a large application, that spans multiple generations of component libraries, involving loosely coupled teams?

Why not use the platform, and utilize something that will forevermore (?) ship with every browser?  That supports time travel, and routing?

It should be noted that AMP components (like amp-bind) seem to ba based on the same principle.


```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Example 1</title>
</head>

<body>
    <div style="display:flex;flex-direction: column">

        <!-- Parse the address bar -->
        <xtal-state-parse disabled="3" parse="location.href" level="global" 
            with-url-pattern="id=(?<storeId>[a-z0-9-]*)">
        </xtal-state-parse>

        <!-- If no id found in address bar, "pass-down (p-d)" message to purr-sist-myjson writer 
            and xtal-state-update history initializer  to  create a new record ("session") 
            in both history and remote store -->
        <p-d on="no-match-found" to="purr-sist-myjson[write],xtal-state-update[init]" prop="new" val="target.noMatch" m="2" skip-init></p-d>

        <!-- If id found in address bar, pass it to 
            the persistence reader if history is null -->
        <p-d on="match-found" if="[data-history-was-null]" to="purr-sist-myjson[read]" prop="storeId" val="target.value.storeId" m="1" skip-init></p-d>

        <!-- If id found in address bar, pass it to the 
            persistence writer whether or not history is null -->
        <p-d on="match-found" to="purr-sist-myjson[write]" prop="storeId" 
            val="target.value.storeId" m="1" skip-init></p-d>

       <!-- Read stored history.state from remote database if 
            id found in address bar and history starts out null -->
        <purr-sist-myjson read disabled></purr-sist-myjson>

        <!-- If persisted history.state found, repopulate history.state-->
        <p-d on="value-changed" to="history" prop="target.value"></p-d>
        <xtal-state-update init rewrite level="global"></xtal-state-update>

        <!-- ==========================  UI Input Fields ===================================-->
        <!-- Manage binding between global history.state and UI elements -->
        <bi-st disabled id="bist" level="global" url-search="(?<store>(.*?))" replace-url-value="?id=$<store>"><script nomodule >({
            '[data-st]': {
                onPopState: (bist, el) => {
                    el.value = bist.pullFromPath(el.dataset.st, el.value);
                },
                on: {
                    input: (event, bist ) => bist.merge(event.target.dataset.st, event.target.value, 'push'),
                }
            },
            '[insert]':{
                on:{
                    click: (event, bist) => bist.merge('submitted', event.target.obj, 'push'),
                }
            }
        })</script></bi-st>
        <p-d on="history-changed" to="purr-sist-myjson" prop="newVal" val="target.value" m="1"></p-d>

        <!-- Add a new key (or replace existing one) -->
        <input type="text" disabled placeholder="key" data-st="draft.key">
        <!-- Pass key to aggregator that creates key / value object -->
        <p-d on="input" to="aggregator-fn" prop="key" val="target.value" m="1"></p-d>

        <!-- Edit (JSON) value -->
        <textarea disabled placeholder="value (JSON optional)" data-st="draft.value"></textarea>
        <!-- Pass (JSON) value to key / value aggregator -->
        <p-d on="input" prop="val" val="target.value"></p-d>
        <!-- ============================  End UI Input fields =============================== -->

        <!-- Combine key / value fields into one object -->
        <aggregator-fn><script nomodule>
            fn = ({ key, val }) => {
                if (key === undefined || val === undefined) return null;
                try {
                    return { [key]: JSON.parse(val) };
                } catch (e) {
                    return { [key]: val };
                }
            }
        </script></aggregator-fn>
        <!-- Pass Aggregated Object to button's "obj" property -->
        <p-d on="value-changed" to="button" prop="obj" val="target.value" m="1"></p-d>

        <button insert>Insert Key/Value pair</button>        

        <!-- Persist history.state to remote store-->
        <purr-sist-myjson write></purr-sist-myjson>

        <!-- Pass store ID up one element so xtal-state-update knows how to update the address bar -->
        <p-u on="new-store-id" to="bist" prop="url"></p-u>

        <!-- Pass persisted object to JSON viewer -->
        <p-d on="value-changed" prop="input"></p-d>
        <xtal-json-editor options="{}" height="300px"></xtal-json-editor>

        <!-- Reload window to see if changes persist -->
        <button onclick="window.location.reload()">Reload Window</button>

        <script src="https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/purr-sist@0.0.36/dist/purr-sist-myjson.iife.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/p-d.p-u@0.0.100/dist/p-all.iife.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/xtal-json-editor@0.0.29/xtal-json-editor.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/aggregator-fn@0.0.15/dist/aggregator-fn.iife.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/xtal-state@0.0.67/dist/xtal-state-update.iife.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/xtal-state@0.0.67/dist/xtal-state-parse.iife.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/bi-st@0.0.2/dist/bi-st.iife.js"></script>
    </div>
</body>
</html>
```