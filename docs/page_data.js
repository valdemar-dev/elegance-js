let url="/";globalThis.pd||(globalThis.pd={});let pd=globalThis.pd;pd[url]={w:!0,state:[{id:0,value:function(t,n){(e=>{const r=new URL(e.currentTarget.href),o=globalThis.__ELEGANCE_CLIENT__,i=o.sanitizePathname(r.pathname),l=o.sanitizePathname(window.location.pathname);if(i===l)return r.hash===window.location.hash?e.preventDefault():void 0;e.preventDefault(),o.navigateLocally(r.href)})(n,...t.getAll([]))}},{id:1,value:!1}],soa:[{id:0,type:1,key:2,attribute:"onclick"},{id:0,type:1,key:3,attribute:"onclick"},{id:0,type:1,key:4,attribute:"onclick"}],ooa:[{key:1,attribute:"class",ids:[1],update:a=>{console.log("change nigga");const t="group duration-300 border-b-[1px] hover:border-b-transparent pointer-fine:hover:bg-accent-400 ";return a?t+"border-b-background-800 bg-background-950":t+"bg-background-900 border-b-transparent"}}],plh:[()=>{const a=Array.from(document.querySelectorAll("a[prefetch]")),t=[];for(const n of a){const e=n.getAttribute("prefetch"),r=new URL(n.href);switch(e){case"load":__ELEGANCE_CLIENT__.fetchPage(r);break;case"hover":const o=()=>{__ELEGANCE_CLIENT__.fetchPage(r)};n.addEventListener("mouseenter",o),t.push({el:n,fn:o});break}}return()=>{for(const n of t)n.el.removeEventListener("onmouseenter",n.fn)}},function(t){return((n,e)=>{const r=()=>{if({x:window.scrollX,y:window.scrollY}.y>20){if(e.value===!0)return;e.value=!0,e.signal()}else{if(e.value===!1)return;e.value=!1,e.signal()}};return window.addEventListener("scroll",r),()=>{window.removeEventListener("scroll",r)}})(t,...t.getAll([1]))}]};
