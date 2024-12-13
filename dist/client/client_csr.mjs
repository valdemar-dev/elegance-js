var T=["a","abbr","address","article","aside","b","body","blockquote","button","canvas","cite","code","colgroup","data","del","details","dfn","div","dl","dt","em","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","header","hr","i","iframe","img","input","ins","kbd","label","legend","li","main","map","mark","menu","menuitem","meter","nav","object","ol","optgroup","option","output","p","pre","progress","q","section","select","small","span","strong","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","tr","u","ul","var","video","details","datalist"],v=["audio","base","br","col","embed","link","meta","noscript","source","track","wbr","area","command","picture","progress","html","head"],j=["title","template"],p=(l,e,t)=>(...n)=>{let r={},s=[];return e&&n.length>0&&typeof n[0]=="object"?(r=n[0],t&&n.length>1&&(s=n.slice(1))):t&&n.length>0&&(s=n),()=>({tag:l,getOptions:r?()=>{let i={};for(let o of Object.keys(r)){let a=r[o];if(typeof a!="function"){i[o]=a;continue}if(o.startsWith("on")){i[o]=a;continue}i[o]=a()}return i}:()=>({}),children:s})};globalThis._e={...T.reduce((l,e)=>(l[e]=p(e,!0,!0),l),{}),...j.reduce((l,e)=>(l[e]=p(e,!1,!0),l),{}),...v.reduce((l,e)=>(l[e]=p(e,!0,!1),l),{})};var g=class{constructor(){this.stateController=globalThis.eleganceStateController;this.renderer=globalThis.eleganceRenderer;console.log("%cElegance router is loading..","font-size: 30px; color: #aaffaa"),this.savedPages=new Map,this.onNavigateCallbacks=[],this.currentPage=window.location.pathname}log(e){console.log(`%c${e}`,"font-size: 15px; color: #aaffaa")}sleep(e){return new Promise(t=>setTimeout(t,e))}async navigate(e,t=!0){if(!e.startsWith("/"))throw new Error("Elegance router can only navigate to local pages.");this.log("Calling onNavigateCallbacks..");for(let r of this.onNavigateCallbacks)r();this.onNavigateCallbacks=[],this.log("Performing state cleanup.."),this.stateController.resetEphemeralSubjects(),this.stateController.cleanSubjectObservers(),this.log(`Navigating to page: ${e}`);let n=this.savedPages.get(e)??await this.getPage(e);if(!n)throw new Error("Failed to fetch page.");t&&history.pushState(null,"",e),this.currentPage=e,this.renderer.renderPage(n)}async getPage(e){if(this.savedPages.has(e))return;if(!e.startsWith("/"))throw new Error("Elegance router can only fetch local pages.");this.log(`Fetching URL: ${e}`);let t=e==="/"?"":"/",n=await fetch(e);if(!n.ok)throw`Could not load page at ${e}, received HTTP response status ${n.status}. ${n.statusText}`;let r=await n.text(),i=new DOMParser().parseFromString(r,"text/html");try{let{page:o}=await import(e+t+"page.js");if(!o)throw new Error(`Page at ${e} could not be loaded.`);return this.addPage(e,o),o}catch(o){this.log(`Could not load the page at ${e}: ${o}`);return}}addPage(e,t){this.log(`Saving page with pathname: ${e}`),this.savedPages.set(e,t)}async prefetch(e){await this.getPage(e)}onNavigate(e){this.log("Adding onNavigateCallback."),this.onNavigateCallbacks.push(e)}setPopState(){window.onpopstate=e=>{e.preventDefault();let t=window.location.origin,n=e.target;if(n.origin!==t||this.currentPage===n.location.pathname)return;let s=window.location.href.replace(window.location.origin,"");this.navigate(s,!1)}}};var m=l=>l.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();var d=class{constructor(){console.log("%cElegance renderer is loading..","font-size: 30px; color: #ffffaa"),this.renderTime=0,this.onRenderFinishCallbacks=[]}log(e){console.log(`%c${e}`,"font-size: 15px; color: #aaffaa;")}getDomTree(e){let t=[],n=e;for(;n;)t.push(`${n.tagName}`),n=n.parentElement;return t.reverse().join(" -> ")}getPageRenderTime(){return this.renderTime}onRenderFinish(e){this.log("Added render callback."),this.onRenderFinishCallbacks.push(e)}renderPage(e){let t=performance.now();this.log("Starting render.."),this.log("Emptying previous onRenderFinishCallbacks.."),this.onRenderFinishCallbacks=[];let n=document.createDocumentFragment(),r=globalThis.__ELEGANCE_SERVER_DATA__,s=globalThis.eleganceRouter,i=globalThis.eleganceStateController;if(!s)throw"Cannot render page without router.";if(!i)throw"Cannot render page without stateController.";let o=e({router:s,state:i,renderer:this,serverData:r?r.data:void 0}),a=this.createElement(o,n,!0),c=performance.now()-t;if(this.log(`Page fully rendered after: ${c}ms`),!a)throw"The first element of a page may never be null.";n.appendChild(a),document.documentElement.replaceChild(a,document.body),this.renderTime=c,this.log("Calling on render finish callbacks..");for(let u of this.onRenderFinishCallbacks)u();s.setPopState()}buildElement(e){if(typeof e=="string")return e;if(e instanceof Promise)throw"Asynchronous elements are not supported, consider using a suspense element.";if(Array.isArray(e))throw"Array elements are not supported.";if(typeof e!="function")throw`Cannot build a non-functional element, got ${e}.`;return e()}assignPropertyToHTMLElement(e,t,n){if(!(e instanceof HTMLElement))throw new Error(`Provided elementInDocument is not a valid HTML element. Got: ${e}.`);if(t==="style"&&typeof n=="object"){Object.assign(e.style,n);return}else if(t.toLowerCase()in e&&t.startsWith("on")){e[t.toLowerCase()]=n;return}else if(t in e){e[t]=n;return}else if(t==="class"){e.className=n;return}else if(typeof n=="function"){e.setAttribute(m(t),n());return}e.setAttribute(m(t),n)}processElementOptions(e,t,n){if(!Object.hasOwn(e,"getOptions"))return;let r=e,s=r.getOptions();if(s){for(let i in s)if(Object.hasOwn(s,i)){let o=s[i];if(Object.hasOwn(o,"ids")&&Object.hasOwn(o,"update")&&Object.hasOwn(o,"scope")){if(n)continue;this.processOptionAsObserver(o,t,r,i)}this.assignPropertyToHTMLElement(t,i,o)}}}anyToString(e){if(typeof e=="function")return e.toString();if(e instanceof Promise)return"Promise { <state> }";if(e===null)return"null";if(e===void 0)return"undefined";if(typeof e=="number"||typeof e=="string"||typeof e=="boolean")return JSON.stringify(e);if(Array.isArray(e))return`[${e.map(t=>this.anyToString(t)).join(", ")}]`;if(typeof e=="object"){let t=e.constructor.name;return t!=="Object"?`${t} { ${Object.entries(e).map(([n,r])=>`${n}: ${this.anyToString(r)}`).join(", ")} }`:`{ ${Object.entries(e).map(([n,r])=>`${n}: ${this.anyToString(r)}`).join(", ")} }`}return String(e)}createElement(e,t,n){let r;if(typeof e=="boolean")return null;try{r=this.buildElement(e)}catch(i){throw`Failed to build element ${this.anyToString(e)}. Encountered an error: ${i}`}if(typeof r=="string"){let i=document.createTextNode(r);return t.appendChild(i),i}let s=document.createElement(r.tag);if(this.processElementOptions(r,s,!1),n){let i=r.children.length;for(let o=0;o<i;o++){let a=r.children[o];a&&this.createElement(a,s,!0)}}if(t.appendChild(s),r.onMount){let i=e;r.onMount({builtElement:r,elementInDocument:s,buildableElement:i})}return s}updateElement(e,t){let n=this.buildElement(t),r=e.parentElement;if(!r){let o=this.getDomTree(e);throw`Cannot update element ${e.tagName}, since it does not have a parent. Dom Tree: ${o}`}if(typeof n=="string"){let o=document.createTextNode(n);return r.replaceChild(e,o),o}let s=document.createElement(n.tag);this.processElementOptions(n,s,!1);let i=n.children.length;for(let o=0;o<i;o++){let a=n.children[o];a&&this.createElement(a,s,!0)}return e.parentElement.replaceChild(s,e),s}processOptionAsObserver(e,t,n,r){let{ids:s,scope:i,update:o}=e,a=[],c=globalThis.eleganceStateController;for(let u=0;u<s.length;u++){let h=s[u],E=i==="local"?c.get(h):c.getGlobal(h);a.push(E.get());let y=async w=>{a[u]=w,this.assignPropertyToHTMLElement(t,r,o(...a))};E.observe(y)}this.assignPropertyToHTMLElement(t,r,o(...a))}};var S=l=>{let e;return t=>{clearTimeout(e),e=setTimeout(()=>{t()},l)}};var f=class{constructor(e,t,n=!1,r=null,s="",i=1,o=!1){this.enforceRuntimeTypes=n,this.observers=[],this.value=e,this.initialValue=structuredClone(e),this.id=t,this.pathname=s,this.scope=i,this.resetOnPageLeave=o,r&&(this.debounce=S(r))}observe(e){if(typeof e!="function")throw new Error("The provided callback function must be a function.");if(e.length!==1)throw new Error("The callback function must take one parameter (new value of the subject).");this.observers.push({callback:e})}signal(){let e=async()=>{let t=this.get();for(let n of this.observers)n.callback(t)};this.debounce?this.debounce(e):e()}set(e){if(this.enforceRuntimeTypes&&typeof e!=typeof this.value)throw`Type of new value: ${e} (${typeof e}) does not match the type of this subject's value ${this.value} (${typeof this.value}).`;this.value=e}add(e){if(!Array.isArray(this.value))throw"The add method of a subject may only be used if the subject's value is an Array.";this.value.push(e)}remove(e){if(!Array.isArray(this.value))throw"The remove method of a subject may only be used if the subject's value is an Array.";let t=this.value.indexOf(e);if(!t)throw`Element ${e} does not exist in this subject, therefore it cannot be removed.`;this.value.splice(t,1)}reset(){this.value=this.initialValue}get(){return this.value}getInitialValue(){return this.initialValue}},b=class{constructor(){this.subjectStore=[]}create(e,{id:t,enforceRuntimeTypes:n=!0,debounceUpdateMs:r,resetOnPageLeave:s=!1}){let i=this.subjectStore.find(a=>a.pathname===window.location.pathname&&a.id===t);if(i)return console.info(`%cSubject with ID ${t} already exists, therefore it will not be re-created.`,"font-size: 12px; color: #aaaaff"),i;let o=new f(e,t,n,r,window.location.pathname,1,s);return this.subjectStore.push(o),o}createGlobal(e,{id:t,enforceRuntimeTypes:n=!0,debounceUpdateMs:r,resetOnPageLeave:s=!1}){let i=this.subjectStore.find(a=>a.scope===2&&a.id===t);if(i)return console.info(`%cGlobal Subject with ID ${t} already exists, therefore it will not be re-created.`,"font-size: 12px; color: #aaaaff"),i;let o=new f(e,t,n,r,"",2,s);return this.subjectStore.push(o),o}getGlobal(e){let t=this.subjectStore.find(n=>n.scope===2&&n.id===e);if(!t)throw new Error(`Could not find a global subject with the ID of ${e}.`);return t}get(e){let t=this.subjectStore.find(n=>n.pathname===window.location.pathname&&n.id===e);if(!t)throw new Error(`Could not find a subject with the ID of ${e} in the page ${window.location.pathname}`);return t}observe(e,t,n=1){n===1?this.get(e).observe(t):this.getGlobal(e).observe(t)}resetEphemeralSubjects(){this.subjectStore=this.subjectStore.filter(e=>e.resetOnPageLeave===!1)}cleanSubjectObservers(){for(let e of this.subjectStore)e.observers=[]}};(async()=>{let l=c=>({renderingMethod:c.rm,storedEventListeners:c.sels?.map(u=>({eleganceID:u.id,eventListeners:u.els.map(h=>({attributeName:h.an,eventListener:h.el}))}))}),e=globalThis.__ELEGANCE_PAGE_INFO__;if(!e)throw alert("Misconfigured Elegance.JS server, check console."),"globalThis.__ELEGANCE_PAGE_INFO__ is not set, is corrupted, or is set inproperly. Make sure your server configuration sets a <script> with this variable.";if(l(e).renderingMethod!==3)throw"The CLIENT_SIDE_RENDERING client may only be used if the page has been rendered via the CLIENT_SIDE_RENDERING renderingMethod.";let n=document.querySelectorAll('script[type="module"]'),r=Array.from(n).find(c=>c.src.includes("/page.js"));if(!r)throw new Error("Failed to mount elegance. No page script found.");let s=await import(r.src);if(!s.page)throw new Error("Page script does not export page function.");let i=new d,o=new b,a=new g;globalThis.eleganceRouter=a,globalThis.eleganceStateController=o,globalThis.eleganceRenderer=i,a.addPage(window.location.pathname,s.page),i.renderPage(s.page)})();