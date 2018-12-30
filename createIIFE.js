//@ts-check
const jiife = require('jiife');
const xl = 'node_modules/xtal-latx/';
const xs = 'node_modules/xtal-state/';
const api = [xl + 'define.js', xl + 'xtal-latx.js', xl + 'getHost.js', xs + 'xtal-state-api.js'];
const common = api.concat([xs + 'xtal-state-base.js']);
const xsDep = [xs + 'xtal-state-watch.js', xs + 'url-formatter.js'];
jiife.processFiles(common.concat(xsDep, xl +'mergeDeep.js', xl + 'observeCssSelector.js', xl + 'createNestedProp.js', 'bi-st.js'), 'dist/bi-st.iife.js');





