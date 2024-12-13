var i=class{constructor(){this.stateController=globalThis.eleganceStateController;this.renderer=globalThis.eleganceRenderer;console.log("%cElegance router is loading..","font-size: 30px; color: #aaffaa"),this.savedPages=new Map,this.onNavigateCallbacks=[],this.currentPage=window.location.pathname}log(e){console.log(`%c${e}`,"font-size: 15px; color: #aaffaa")}sleep(e){return new Promise(o=>setTimeout(o,e))}async navigate(e,o=!0){if(!e.startsWith("/"))throw new Error("Elegance router can only navigate to local pages.");this.log("Calling onNavigateCallbacks..");for(let a of this.onNavigateCallbacks)a();this.onNavigateCallbacks=[],this.log("Performing state cleanup.."),this.stateController.resetEphemeralSubjects(),this.stateController.cleanSubjectObservers(),this.log(`Navigating to page: ${e}`);let t=this.savedPages.get(e)??await this.getPage(e);if(!t)throw new Error("Failed to fetch page.");o&&history.pushState(null,"",e),this.currentPage=e,this.renderer.renderPage(t)}async getPage(e){if(this.savedPages.has(e))return;if(!e.startsWith("/"))throw new Error("Elegance router can only fetch local pages.");this.log(`Fetching URL: ${e}`);let o=e==="/"?"":"/",t=await fetch(e);if(!t.ok)throw`Could not load page at ${e}, received HTTP response status ${t.status}. ${t.statusText}`;let a=await t.text(),s=new DOMParser().parseFromString(a,"text/html");try{let{page:r}=await import(e+o+"page.js");if(!r)throw new Error(`Page at ${e} could not be loaded.`);return this.addPage(e,r),r}catch(r){this.log(`Could not load the page at ${e}: ${r}`);return}}addPage(e,o){this.log(`Saving page with pathname: ${e}`),this.savedPages.set(e,o)}async prefetch(e){await this.getPage(e)}onNavigate(e){this.log("Adding onNavigateCallback."),this.onNavigateCallbacks.push(e)}setPopState(){window.onpopstate=e=>{e.preventDefault();let o=window.location.origin,t=e.target;if(t.origin!==o||this.currentPage===t.location.pathname)return;let n=window.location.href.replace(window.location.origin,"");this.navigate(n,!1)}}};var l=class{constructor(){console.log("%cElegance hydrator is loading..","font-size: 30px; color: #ffffaa")}log(e){console.log(`%c${e}`,"font-size: 15px; color: #aaffaa;")}hydratePage(e){let o=e.storedEventListeners,t=performance.now();for(let a of o){let n=document.querySelector(`[e-id="${a.eleganceID}"]`);if(!n)throw`No element with e-id: ${a.eleganceID} found when trying to hydrate page.`;if(!(n instanceof HTMLElement))throw"Only HTML Elements may be hydrated.";for(let s of a.eventListeners){let r=s.attributeName.toLowerCase();n[r]=s.eventListener}}this.log(`Finished hydrating in ${Math.round(performance.now()-t)}ms.`)}};(async()=>{let g=n=>({renderingMethod:n.rm,storedEventListeners:n.sels.map(s=>({eleganceID:s.id,eventListeners:s.els.map(r=>({attributeName:r.an,eventListener:r.el}))}))}),e=globalThis.__ELEGANCE_PAGE_INFO__;if(!e)throw alert("Misconfigured Elegance.JS server, check console."),"globalThis.__ELEGANCE_PAGE_INFO__ is not set, is corrupted, or is set inproperly. Make sure your server configuration sets a <script> with this variable.";let o=g(e);if(o.renderingMethod!==1)throw"The SERVER_SIDE_RENDERING client may only be used if the page has been rendered via the SERVER_SIDE_RENDERING renderingMethod.";let t=new l,a=new i;globalThis.eleganceHydrator=t,t.hydratePage(o)})();