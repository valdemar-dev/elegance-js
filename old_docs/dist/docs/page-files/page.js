export const __ELEGANCE_JS_PAGE_MARKER__ = 'MARKED';
globalThis.__SERVER_CURRENT_STATE_ID__||(globalThis.__SERVER_CURRENT_STATE_ID__=0);var D=globalThis.__SERVER_CURRENT_STATE_ID__,S=(e,n)=>{let o={id:D+=1,value:e,type:1,bind:n?.bind};return globalThis.__SERVER_CURRENT_STATE__.push(o),o},w=({eventListener:e,dependencies:n=[],params:o})=>{let t=n.map(c=>({id:c.id,bind:c.bind})),i="[";for(let c of t)i+=`{id:${c.id}`,c.bind&&(i+=`,bind:${c.bind}`),i+="},";i+="]";let g={id:D+=1,type:1,value:new Function("state","event",`(${e.toString()})({ event, ...${JSON.stringify(o||{})} }, ...state.getAll(${i}))`)};return globalThis.__SERVER_CURRENT_STATE__.push(g),g};var T=e=>{let n=e.fn.toString(),o=(e.deps||[]).map(c=>({id:c.id,bind:c.bind})),t="[";for(let c of o)t+=`{id:${c.id}`,c.bind&&(t+=`,bind:${c.bind}`),t+="},";t+="]";let g=e.fn.constructor.name==="AsyncFunction"?`async (state) => await (${n})(state, ...state.getAll(${t}))`:`(state) => (${n})(state, ...state.getAll(${t}))`;globalThis.__SERVER_CURRENT_LOADHOOKS__.push({fn:g,bind:e.bind||""})};T({fn:()=>{let e=Array.from(document.querySelectorAll("a[prefetch]")),n=[];for(let o of e){let t=o.getAttribute("prefetch"),i=new URL(o.href);switch(t){case"load":client.fetchPage(i);break;case"hover":let g=()=>{client.fetchPage(i)};o.addEventListener("mouseenter",g),n.push({el:o,fn:g});break}}return()=>{for(let o of n)o.el.removeEventListener("mouseenter",o.fn)}}});var q=w({eventListener:e=>{let n=new URL(e.event.currentTarget.href),o=globalThis.client,t=o.sanitizePathname(n.pathname),i=o.sanitizePathname(window.location.pathname);if(t===i)return n.hash===window.location.hash?e.event.preventDefault():void 0;e.event.preventDefault(),o.navigateLocally(n.href)}}),y=(e,...n)=>{if(!e.href)throw"Link elements must have a HREF attribute set.";if(!e.href.startsWith("/"))throw'Link elements may only navigate to local pages. "/"';return a({...e,onClick:q},...n)};var U=(...e)=>body({class:"bg-background-900 text-text-50 font-inter select-none text-text-50"},...e);var _=(e,n)=>({type:2,initialValues:e.map(t=>t.value),update:n,refs:e.map(t=>({id:t.id,bind:t.bind}))});var G=e=>{let n=[],o=e.length,t=0,i=new Set(["if","else","for","while","function","return","class","const","let","var","interface","extends","implements","export","import","from"]),g=new Set(["+","-","*","/","%","=",">","<","!","&","|","^","~","?",":"]),c=new Set([";",",",".","(",")","{","}","[","]"]),A=(r=1)=>t+r<o?e[t+r]:"",I=r=>{let d=t;for(;t<o&&r(e[t]);)t++;return e.slice(d,t)},z=r=>{let d=e[t++];for(;t<o&&e[t]!==r;)e[t]==="\\"?(d+=e[t++],t<o&&(d+=e[t++])):d+=e[t++];return t<o&&(d+=e[t++]),d},F=()=>{let r=t;for(t+=2;t<o&&e[t]!==`
`;)t++;return e.slice(r,t)},K=()=>{let r=t;for(t+=2;t<o&&!(e[t]==="*"&&A()==="/");)t++;return t<o&&(t+=2),e.slice(r,t)};for(;t<o;){let r=e[t],d=t;if(/\s/.test(r)){let u=I(x=>/\s/.test(x));n.push({type:"",value:u,position:d});continue}if(r==="/"){if(A()==="/"){let u=F();n.push({type:"text-gray-400",value:u,position:d});continue}else if(A()==="*"){let u=K();n.push({type:"text-gray-400",value:u,position:d});continue}}if(r==='"'||r==="'"){let u=z(r);n.push({type:"text-green-200",value:u,position:d});continue}if(/\d/.test(r)){let u=I(x=>/[\d\.]/.test(x));n.push({type:"text-blue-400",value:u,position:d});continue}if(/[a-zA-Z_$]/.test(r)){let u=I(W=>/[a-zA-Z0-9_$]/.test(W)),x="text-orange-300";i.has(u)?x="text-amber-100 font-semibold":(u==="true"||u==="false")&&(x="text-blue-200");let E=t;for(;E<o&&/\s/.test(e[E]);)E++;E<o&&e[E]==="("&&(x="text-red-300"),n.push({type:x,value:u,position:d});continue}if(g.has(r)){let u=r;t++,t<o&&g.has(e[t])&&(u+=e[t++]),n.push({type:"",value:u,position:d});continue}if(c.has(r)){n.push({type:"text-gray-400",value:r,position:d}),t++;continue}n.push({type:"",value:r,position:d}),t++}return n},J=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),M=e=>G(e).map(o=>o.type===""?o.value:`<span class="${o.type}">${J(o.value)}</span>`).join("");var H=S(!1),O=S(0),Z=w({dependencies:[H,O],eventListener:async(e,n,o)=>{let g=e.event.currentTarget.children.item(0).innerText;await navigator.clipboard.writeText(g),o.value!==0&&clearTimeout(o.value),n.value=!0,n.signal();let c=window.setTimeout(()=>{n.value=!1,n.signal()},3e3);o.value=c}}),V=e=>(T({bind:e,deps:[O,H],fn:(n,o,t)=>()=>{clearTimeout(o.value),t.value=!1,t.signal()}}),div({class:_([H],n=>"fixed z-50 shadow-lg rounded-sm duration-200 bottom-4 px-4 py-2 w-max bg-background-950 "+(n?"right-8":"right-0 translate-x-full"))},h1({class:"font-mono uppercase"},"copied to clipboard"))),Q=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;"),m=(e,n=!0)=>div({class:`bg-background-950 hover:cursor-pointer p-2 rounded-sm
            border-[1px] border-background-800 w-max my-3 max-w-full
            overflow-scroll`,onClick:Z},pre({},n?M(e):Q(e)));var P=(e,...n)=>{if(e.id===void 0)throw"Breakpoints must set a name attribute.";let o=e.id;return delete e.id,div({bp:o,...e},...n)};var B=()=>header({class:"sticky z-10 lef-0 right-0 top-0 text-text-50 font-inter overflow-hidden duration-300 border-b-[1px] border-b-transparent"},div({class:"group duration-300 border-b-[1px] hover:border-b-transparent pointer-fine:hover:bg-accent-400 border-b-background-800 bg-background-950"},div({class:"max-w-[1200px] w-full mx-auto flex pr-2 px-3 sm:px-5 sm:min-[calc(1200px+1rem)]:px-0"},div({class:"flex min-w-max w-full items-center z-10"},y({href:"/",class:"flex items-center gap-1 h-full"},p({class:"font-niconne pointer-fine:group-hover:text-background-950 font-bold text-xl sm:text-3xl relative top-0 z-20 duration-300 pointer-events-none",innerText:"Elegance"}),p({innerText:"JS",class:"font-bold pointer-fine:group-hover:text-background-950 relative top-0 text-xl sm:text-3xl z-10 text-accent-400 duration-300 pointer-events-none"}))),div({class:"flex py-2 sm:py-4 flex relative items-center justify-end w-full"},y({prefetch:"hover",class:"z-10 text-xs uppercase font-bold px-4 py-2 rounded-full duration-300 bg-accent-400 text-primary-900 pointer-fine:group-hover:bg-background-950 pointer-fine:group-hover:text-accent-400 group-hover:hover:bg-text-50 group-hover:hover:text-background-950",href:"/docs",innerText:"Docs"})))));globalThis.__SERVER_CURRENT_LAYOUT_ID__||(globalThis.__SERVER_CURRENT_LAYOUT_ID__=1);var X=globalThis.__SERVER_CURRENT_LAYOUT_ID__,j=e=>{let n=globalThis.__SERVER_CURRENT_LAYOUTS__;if(n.has(e))return n.get(e);let o=X++;return n.set(e,o),o};var R=j("docs-layout"),N=S(0,{bind:R});T({deps:[N],bind:R,fn:(e,n)=>{let o=localStorage.getItem("time-on-page");o&&(n.value=parseInt(o),n.signal());let t;t=setInterval(()=>{n.value++,n.signal()},1e3);let i=()=>{localStorage.setItem("time-on-page",`${n.value}`)};return window.addEventListener("beforeunload",i),()=>{window.removeEventListener("beforeunload",i),i(),clearInterval(t)}}});var v=(e,n)=>y({class:"text-sm font-normal flex flex-col gap-2 opacity-80 hover:opacity-60 duration-200",innerText:n,href:e,prefetch:"hover"}),ee=()=>nav({class:"w-1/5"},ul({class:"flex flex-col gap-4"},li({},h2({class:"text-lg font-semibold"},"Quick Nav"),span({class:"text-xs opacity-75"},"Elapsed: ",span({class:"font-mono",innerText:_([N],e=>{let n=Math.floor(e/60/60),o=Math.floor(e/60%60),t=e%60;return`${n}h:${o}m:${t}s`})}))),li({class:"flex flex-col gap-1"},h4({class:"text-base font-medium",innerText:"The Basics"}),ol({class:"pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"},v("/docs/basics#preamble","Preamble"),v("/docs/basics#how-elegance-works","How Elegance Works"),v("/docs/basics#installation","Installation"),v("/docs/basics#your-first-page","Your First Page"))),li({class:"flex flex-col gap-1"},h4({class:"text-base font-medium",innerText:"Concepts"}),ol({class:"pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"},v("/docs/concepts#elements","Elements"),v("/docs/concepts#object-attributes","Object Attributes"))),li({class:"flex flex-col gap-1"},h4({class:"text-base font-medium",innerText:"Page Files"}),ol({class:"pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"},v("/docs/page-files#state","State"),v("/docs/page-files#load-hooks","Load Hooks"),v("/docs/page-files#event-listeners","Event Listeners"),v("/docs/page-files#layouts","Layouts"))),li({class:"flex flex-col gap-1"},h4({class:"text-base font-medium",innerText:"Compilation"}),ol({class:"pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"},v("/docs/compilation#options","Compilation Options"))))),$=(...e)=>div({class:"h-screen overflow-clip"},B(),V(R),div({class:"max-w-[1200px] h-full w-full mx-auto flex pt-8 px-3 sm:px-5 sm:min-[calc(1200px+1rem)]:px-0"},ee(),article({class:"h-full w-full overflow-y-scroll pb-[250px] pl-6 ml-6"},P({id:R},...e))));var l=e=>span({class:"font-mono select-text"},e);var k=(e,n)=>h2({class:"text-3xl font-semibold mb-4",id:n,innerText:e});var s=(...e)=>p({class:"opacity-80"},...e);var C=()=>div({class:"my-20"},[]);var h=e=>h3({class:"text-lg font-medium mb-1",innerText:e});var f=()=>div({class:"my-10"},[]);var L=e=>span({class:"text-xs opacity-60",innerText:e});var te=`
createLoadHook({
    fn: () => {
        console.log("The page has loaded!");
    },
});
`,ne=`
const counter = createState(0);

createLoadHook({
    deps: [counter],
    fn: (state, counter) => {
        const timer = setInterval(() => {
            counter.value++;
            counter.signal();
        }, 100);

        return () => {
            // Begone, timer!
            clearInterval(timer);
        }
    },
});
`,oe=`
const layout = createLayout("epic-layout");

createLoadHook({
    bind: layout,
    fn: () => {
        alert("epic layout was just rendered")

        return () => {
            alert ("epic layout is no longer with us :(")
        };
    },
})
`,ae=`
const superEpicState = createState("MMMMMMM STATE");
`,re=`
{
    type: ObjectAttributeType.STATE,
    id: 0,
    value: "MMMMMMM STATE", 
    bind: undefined,
}
`,se=`
const isUsingDarkMode = createState(false);

div ({
    class: observe(
        [isUsingDarkMode],
        (value) => value ? "bg-black" : "bg-white",
    ),
})
`,ie=`
const docsLayout = createLayout("docs-layout");

const timeSpentOnPage = createState(0, {
    bind: docsLayout
});
`,le=`
const handleClick = createEventListener({
    eventListener: (params: SetEvent<MouseEvent, HTMLDivElement>) => {
        console.log(params.event);
        console.log(params.event.currentTarget);
    },
});

div ({
    onClick: handleClick,
});
`,ce=`
const counter = createState(0);

const handleClick = createEventListener({
    dependencies: [counter],
    eventListener: (params, counter) => {
        counter++;
        counter.signal();
    },
});
`,de=`
const reference = createReference();

createEventListener({
    params: {
        someElementReference: reference,
        pageCompiledAt: new Date(),
    },

    eventListener: (params) => {
        console.log("i am now aware of: ", params.someElementReference);
        console.log("This page was originally compiled at: ", pageCompiledAt);
    },
});
`,pe=`
const superAwesomeLayoutID  = createLayout("super-awesome-layout");
`,ue=`
const superAwesomeLayoutID = createLayout("super-awesome-layout");

const SuperAwesomeLayout = (...children: Child[]) => div ({
    style: "background-color: #000; color: #fff",
},
    ...children
);
`,he=`
const superAwesomeLayoutID = createLayout("super-awesome-layout");

const SuperAwesomeLayout = (...children: Child[]) => div ({
    style: "background-color: #000; color: #fff",
},
    Breakpoint ({
        id: superAwesomeLayoutID
    },
        ...children
    ),
);
`,dt=()=>head({},link({rel:"stylesheet",href:"/index.css"}),title("Hi There!")),pt=U($(k("State","state"),L("Available Via: elegance-js/server/state"),s("State is, simply put, a collection of variables.",br(),"You initialize it on the server using the ",l("createState()")," function."),m(ae),f(),h("Usage"),s("The ",l("createState()")," function takes in two values.",br(),"The initial value of the state, and an options object.",br(),"The options object may currently only define a bind to the state (more on this later)",br(),br(),"The function stores the created state in the servers current state store,",br(),"so that upon completion of compilation, it may be serialized into page_data."),f(),h("Return Value"),s("The return value of ",l("createState()")," is a State ",y({href:"/docs/concepts#object-attributes",class:"border-b-2"},"Object Attribute, "),br(),"which you can use to refer back to the created state."),m(re),m(se),s("Many functions like load hooks, event listeners, and observe, take in optional SOAs."),f(),h("Bind"),s("State, in the browser, is kept in the global ",l("pd")," object, and indexed via pathnames.",br(),"All state for the pathname ",l("/recipes/apple-pie")," will be in ",l('pd["/recipes/apple-pie"]'),br(),br(),"However, in some scenarios you may want to reference the same state on multiple pages. ",br(),"For this, you may ",b("bind "),"the state to a ",y({href:"/docs/page-files#layouts",class:"border-b-2"},"Layout."),br(),br(),"Then, the state will go into ",l("pd[layout_id]"),", instead of the pathname of the page."),m(ie),f(),h("Important Considerations"),s("State persists it's value during page navigation.",br(),"Meaning if you want it to reset it's value, you must do so yourself."),C(),k("Load Hooks","load-hooks"),L("Available Via: elegance-js/server/loadHook"),br(),br(),h("Basic Usage"),s("Load hooks are functions that are called on the initial page load, and subsequent navigations.",br(),"A load hook is registered using the ",l("createLoadHook()")," function."),m(te),f(),h("Cleanup Function"),s("The return value of a load hook is referred to as a cleanup function.",br(),"It is called whenever the load hook goes out of scope.",br(),br(),"You'll want to do things like ",l("clearInterval() & element.removeEventListener()"),br()," here, so you don't get any unintended/undefined behavior."),m(ne),f(),h("Load Hook Scope"),s("The scope of a load hook is either the page it is on, or the layout it is bound to.",br(),"If a load hook is bound to layout, it is called when that layout first appears.",br(),"Subsequently, its cleanup function will get called once it's bound layout no longer exists on the page.",br(),br(),"To bind a load hook to a layout, use the ",l("bind")," attribute, and pass in a ",y({href:"/docs/page-files#layouts",class:"border-b-2"},"Layout ID"),m(oe)),f(),h("Important Considerations"),s("It's important to note that the load hook function body exists in ",br(),b("browser land ")," not server land. Therefore the code is ",b("untrusted.")),C(),k("Event Listener","event-listeners"),L("Available Via: elegance-js/server/createState"),br(),br(),h("Basic Usage"),s("Event listeners are a type of state, that you can create with the",br(),l("createEventListener()")," function."),m(le),s("This function returns an SOA, which can then be put on any event listener option of an element.",br(),br(),"The eventListener parameter of ",l("createEventListener()")," takes in two types values.",br(),"First, a params object, which by default contains the native event which was triggered."),f(),h("Dependencies"),s("The second parameter, is a spread parameter, containing the dependencies of the event listener."),m(ce),f(),h("Extra Params"),s("You may also extend the params object parameter of the event listener,",br(),"With the ",l("params")," attribute.",br(),br(),"This is handy for when you need to pass some value to the client, ",br(),"that is not necessarily a state variable, but it can change per compilation."),m(de),f(),h("Important Considerations"),s("It's important to note that the event listener function body exists in ",br(),b("browser land ")," not server land. Therefore the code is ",b("untrusted.")),C(),k("Layouts","layouts"),L("Available Via: elegance-js/server/layout"),br(),br(),s("A layout is a section of a page that is not re-rendered between",br(),"page navigations, to pages that share the same layout order.",br(),br(),"Instead, the layouts ",b("children")," are replaced.",br(),br(),"This has a few advantages. The main one being, that since the elements themselves,",br(),"are not re-rendered, they maintain things like their hover state."),f(),h("Basic Usage"),s("Layouts work a bit differently in Elegance than you may perhaps be used to.",br(),"For example, in Next.JS, layouts are ",b("inherited "),"to every subsequent page.",br(),br(),"So a layout defined at ",l("/")," would apply to ",b("every")," single page.",br(),"Which you may think is nice and saves time, but almost always I find myself in a situation",br(),"where I want a layout for every page of a given depth, except one.",br(),br(),"And then, I have to either move the special page one depth upward",br(),"or the others one-depth downward.",br(),br(),"Conversly, layouts in Elegance are ",b("not "),"inherited, and are are ",b("opt-in."),br(),br(),"To create a layout, use the ",l("createLayout()")," function, and pass in a name.",br(),"The name is used so any subsequent calls to this function by other pages will get the same ID."),m(pe),s("This layout ID can then be passed to state, load hooks, etc."),f(),h("Breakpoints"),s("Creating the actual layout element is simple.",br(),"Just make a function that takes in child elements, and have it return some kind of simple layout."),m(ue),s("Then, wrap the children with the built-in ",l("Breakpoint()")," element."),m(he),f(),h("Important Considerations"),s("The ",l("Breakpoint()")," element is the one that gets replaced",br(),"when navigating within any given layout.",br(),br(),"All sibling and parent elements stay untouched.",br(),br(),"Also note, that in complex pages where there are multiple nested layouts,",br(),"the one that has its children replaced, is the layout that is ",b("last shared."),br(),br(),b("For example:"),br(),"Page 1 Layouts: A,B,C,D,E",br(),"Page 2 Layouts: A,B,D,C,E",br(),"In this instance, the ",b("B")," layout is the last shared layout.")));export{dt as metadata,pt as page};
