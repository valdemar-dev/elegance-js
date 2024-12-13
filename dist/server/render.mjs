var f=r=>r.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();var h=["clientOnly"],c=class{constructor(e,n){this.currentElementIndex=0;this.HTMLString="";this.eventListenerStore=[];this.router=e,this.stateController=n,this.renderTime=0,this.onRenderFinishCallbacks=[]}log(e){console.log(`%c${e}`,"font-size: 15px; color: #aaffaa;")}getOption(e,n){let t=n.find(([o])=>o===e);return t?t[1]:null}serializeEventHandler(e,n,t){let o=this.eventListenerStore.find(s=>s.eleganceID===t);o||(o={eleganceID:t,eventListeners:[]},this.eventListenerStore.push(o));let l=n.toString(),i=`{an:"${e}",el:${l.replace(/\s+/g,"")}}`;o.eventListeners.push(i),console.log(`Serialized attribute ${e} for element with id: ${t}. Set to string ${l}`)}renderElement(e){if(typeof e=="string"||typeof e=="number"||typeof e=="boolean")return this.HTMLString+=`${e}`;if(typeof e!="function")throw"Elements must be either a string, number or function.";let n=e(),t=null,o=Object.entries(n.getOptions());this.getOption("clientOnly",o)===!0&&console.log("CLIENT ONLY"),this.HTMLString+=`<${n.tag}`;for(let[i,s]of o){if(h.includes(i)){console.log("reserved attr");continue}if(!i.startsWith("on")){this.HTMLString+=` ${f(s)}="${s}"`;continue}t||(t=this.currentElementIndex++,this.HTMLString+=` e-id=${t}`),this.serializeEventHandler(i,s,t)}if(!n.children){this.HTMLString+="/>";return}this.HTMLString+=">";for(let i of n.children)this.renderElement(i);this.HTMLString+=`</${n.tag}>`}async renderPage(e){let n=e({router:this.router,renderer:this,state:this.stateController});this.renderElement(n)}};var u=class{constructor(){}};var d=class{constructor(){}create(){}createGlobal(){}};var m=["a","abbr","address","article","aside","b","body","blockquote","button","canvas","cite","code","colgroup","data","del","details","dfn","div","dl","dt","em","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","header","hr","i","iframe","img","input","ins","kbd","label","legend","li","main","map","mark","menu","menuitem","meter","nav","object","ol","optgroup","option","output","p","pre","progress","q","section","select","small","span","strong","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","tr","u","ul","var","video","details","datalist"],p=["audio","base","br","col","embed","link","meta","noscript","source","track","wbr","area","command","picture","progress","html","head"],b=["title","template"],g=(r,e,n)=>(...t)=>{let o={},l=[];return e&&t.length>0&&typeof t[0]=="object"?(o=t[0],n&&t.length>1&&(l=t.slice(1))):n&&t.length>0&&(l=t),()=>({tag:r,getOptions:o?()=>{let i={};for(let s of Object.keys(o)){let a=o[s];if(typeof a!="function"){i[s]=a;continue}if(s.startsWith("on")){i[s]=a;continue}i[s]=a()}return i}:()=>({}),children:l})};globalThis._e={...m.reduce((r,e)=>(r[e]=g(e,!0,!0),r),{}),...b.reduce((r,e)=>(r[e]=g(e,!1,!0),r),{}),...p.reduce((r,e)=>(r[e]=g(e,!0,!1),r),{})};var E=async r=>{if(!r)throw"No Page Provided.";if(typeof r!="function")throw"Page must be a function.";let e=new d,n=new u,t=new c(n,e);return await t.renderPage(r),{bodyHTML:t.HTMLString,storedEventListeners:t.eventListenerStore}};export{E as serverSideRenderPage};