var l=e=>function(){let t={};for(let n of Object.keys(e)){let s=e[n];typeof s=="function"?n.startsWith("on")?t[n]=s:t[n]=s():t[n]=s}return t},i=e=>(t,...n)=>{let s=l(t);return()=>({tag:e,getOptions:s,children:n})},c=e=>(...t)=>()=>({tag:e,getOptions:()=>({}),children:t}),d=e=>t=>{let n=l(t);return()=>({tag:e,getOptions:n,children:[]})},m=["abbr","b","bdi","bdo","cite","code","dfn","em","i","kbd","mark","rp","rt","ruby","s","samp","small","strong","sub","sup","u","wbr"],g=["area","base","br","col","embed","hr","img","input","link","meta","source","track"],p=["a","address","article","aside","audio","blockquote","body","button","canvas","caption","colgroup","data","datalist","dd","del","details","dialog","div","dl","dt","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","html","iframe","ins","label","legend","li","main","map","meter","nav","noscript","object","ol","optgroup","option","output","p","picture","pre","progress","q","section","select","summary","table","tbody","td","template","textarea","tfoot","th","thead","time","title","tr","ul","video","span"],r={},o={},a={};for(let e of p)r[e]=i(e);for(let e of m)o[e]=c(e);for(let e of g)a[e]=d(e);var u={...r,...o,...a};export{u as allElements,a as childrenlessElements,l as createElementOptions,r as elements,o as optionlessElements};
