let url="/docs/basics";globalThis.pd||(globalThis.pd={});let pd=globalThis.pd;pd[url]={w:!0,state:[{id:0,value:function(i,t){(e=>{const a=new URL(e.currentTarget.href),r=globalThis.__ELEGANCE_CLIENT__,o=r.sanitizePathname(a.pathname),c=r.sanitizePathname(window.location.pathname);if(o===c)return a.hash===window.location.hash?e.preventDefault():void 0;e.preventDefault(),r.navigateLocally(a.href)})(t,...i.getAll([]))}},{id:1,value:1},{id:2,value:function(i,t){(async e=>{const r=e.currentTarget.children.item(0);await navigator.clipboard.writeText(r.innerText)})(t,...i.getAll([]))}}],soa:[{id:0,type:1,key:0,attribute:"onclick"},{id:0,type:1,key:1,attribute:"onclick"},{id:0,type:1,key:3,attribute:"onclick"},{id:0,type:1,key:4,attribute:"onclick"},{id:0,type:1,key:5,attribute:"onclick"},{id:0,type:1,key:6,attribute:"onclick"},{id:0,type:1,key:7,attribute:"onclick"},{id:2,type:1,key:9,attribute:"onclick"},{id:2,type:1,key:10,attribute:"onclick"},{id:2,type:1,key:11,attribute:"onclick"},{id:2,type:1,key:12,attribute:"onclick"}],ooa:[{key:2,attribute:"innerText",ids:[1],update:n=>{const i=Math.floor(n/60/60),t=Math.floor(n/60%60),e=n%60;return`${i}h:${t}m:${e}s`}}],lh:[{fn:n=>(()=>{const i=Array.from(document.querySelectorAll("a[prefetch]")),t=[];for(const e of i){const a=e.getAttribute("prefetch"),r=new URL(e.href);switch(a){case"load":__ELEGANCE_CLIENT__.fetchPage(r);break;case"hover":const o=()=>{__ELEGANCE_CLIENT__.fetchPage(r)};e.addEventListener("mouseenter",o),t.push({el:e,fn:o});break}}return()=>{for(const e of t)e.el.removeEventListener("mouseenter",e.fn)}})(n,...n.getAll([void 0])),bind:""},{fn:n=>((i,t)=>{let e;return e=setInterval(()=>{t.value++,t.signal()},1e3),()=>{clearInterval(e),t.value=1}})(n,...n.getAll([1])),bind:"1"}]};
