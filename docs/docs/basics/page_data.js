let url="/docs/basics";globalThis.pd||(globalThis.pd={});let pd=globalThis.pd;pd[url]={w:!0,state:[{id:0,value:function(r,n){(e=>{const i=new URL(e.currentTarget.href),a=globalThis.__ELEGANCE_CLIENT__,o=a.sanitizePathname(i.pathname),l=a.sanitizePathname(window.location.pathname);if(o===l)return i.hash===window.location.hash?e.preventDefault():void 0;e.preventDefault(),a.navigateLocally(i.href)})(n,...r.getAll([]))}},{id:1,value:1}],soa:[{id:0,type:1,key:0,attribute:"onclick"},{id:0,type:1,key:1,attribute:"onclick"},{id:0,type:1,key:3,attribute:"onclick"},{id:0,type:1,key:4,attribute:"onclick"},{id:0,type:1,key:5,attribute:"onclick"},{id:0,type:1,key:6,attribute:"onclick"},{id:0,type:1,key:7,attribute:"onclick"}],ooa:[{key:2,attribute:"innerText",ids:[1],update:t=>{const r=Math.floor(t/60/60),n=Math.floor(t/60%60),e=t%60;return`${r}h:${n}m:${e}s`}}],lh:[{fn:t=>(()=>{const r=Array.from(document.querySelectorAll("a[prefetch]")),n=[];for(const e of r){const i=e.getAttribute("prefetch"),a=new URL(e.href);switch(i){case"load":__ELEGANCE_CLIENT__.fetchPage(a);break;case"hover":const o=()=>{__ELEGANCE_CLIENT__.fetchPage(a)};e.addEventListener("mouseenter",o),n.push({el:e,fn:o});break}}return()=>{for(const e of n)e.el.removeEventListener("mouseenter",e.fn)}})(t,...t.getAll([void 0])),bind:""},{fn:t=>((r,n)=>{let e;return e=setInterval(()=>{n.value++,n.signal()},1e3),()=>{clearInterval(e),n.value=1}})(t,...t.getAll([1])),bind:"1"}]};
