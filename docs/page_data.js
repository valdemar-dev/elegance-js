let url="/";globalThis.pd||(globalThis.pd={});let pd=globalThis.pd;pd[url]={state:{navigate:{id:0,value:(t,e)=>{let r=new URL(e.currentTarget.href),a=globalThis.__ELEGANCE_CLIENT__,l=a.sanitizePathname(r.pathname),n=a.sanitizePathname(window.location.pathname);if(l===n)return r.hash===window.location.hash?e.preventDefault():void 0;e.preventDefault(),a.navigateLocally(r.href)}},hasUserScrolled:{id:1,value:!1},interval:{id:2,value:0},globalTicker:{id:3,value:0},urmom:{id:4,value:"hi"}},soa:[{id:0,type:1,key:2,attribute:"onclick"},{id:0,type:1,key:3,attribute:"onclick"}],ooa:[{key:1,attribute:"class",ids:[1],update:t=>{let e="group duration-300 border-b-[1px] hover:border-b-transparent pointer-fine:hover:bg-accent-400 ";return t?e+"border-b-background-800 bg-background-950":e+"bg-background-900 border-b-transparent"}}],plh:[()=>{let t=Array.from(document.querySelectorAll("a[prefetch]")),e=[];for(let r of t){let a=r.getAttribute("prefetch"),l=new URL(r.href);switch(a){case"load":__ELEGANCE_CLIENT__.fetchPage(l);break;case"hover":let n=()=>{__ELEGANCE_CLIENT__.fetchPage(l)};r.addEventListener("mouseenter",n),e.push({el:r,fn:n});break}}return()=>{for(let r of e)r.el.removeEventListener("onmouseenter",r.fn)}},t=>{let e=t.subjects.hasUserScrolled,r=()=>{if({x:window.scrollX,y:window.scrollY}.y>20){if(e.value===!0)return;e.value=!0,t.signal(e)}else{if(e.value===!1)return;e.value=!1,t.signal(e)}};return window.addEventListener("scroll",r),()=>window.removeEventListener("scroll",r)}]};
