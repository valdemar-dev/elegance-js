globalThis.__SERVER_CURRENT_STATE_ID__||(globalThis.__SERVER_CURRENT_STATE_ID__=0);var D=globalThis.__SERVER_CURRENT_STATE_ID__;var S=(e,n)=>{let o={id:D++,value:e,type:1,bind:n?.bind};return globalThis.__SERVER_CURRENT_STATE__.push(o),o},_=({eventListener:e,dependencies:n=[],params:o})=>{let t=n.map(v=>({id:v.id,bind:v.bind})),r="[";for(let v of t)r+=`{id:${v.id}`,v.bind&&(r+=`,bind:${v.bind}`),r+="},";r+="]";let g={id:D++,type:1,value:new Function("state","event",`(${e.toString()})({ event, ...${JSON.stringify(o||{})} }, ...state.getAll(${r}))`)};return globalThis.__SERVER_CURRENT_STATE__.push(g),g};var T=e=>{let n=e.fn.toString(),o=(e.deps||[]).map(r=>({id:r.id,bind:r.bind})),t="[";for(let r of o)t+=`{id:${r.id}`,r.bind&&(t+=`,bind:${r.bind}`),t+="},";t+="]",globalThis.__SERVER_CURRENT_LOADHOOKS__.push({fn:`(state) => (${n})(state, ...state.getAll(${t}))`,bind:e.bind||""})};T({fn:()=>{let e=Array.from(document.querySelectorAll("a[prefetch]")),n=[];for(let o of e){let t=o.getAttribute("prefetch"),r=new URL(o.href);switch(t){case"load":client.fetchPage(r);break;case"hover":let g=()=>{client.fetchPage(r)};o.addEventListener("mouseenter",g),n.push({el:o,fn:g});break}}return()=>{for(let o of n)o.el.removeEventListener("mouseenter",o.fn)}}});var q=_({eventListener:e=>{let n=new URL(e.event.currentTarget.href),o=globalThis.client,t=o.sanitizePathname(n.pathname),r=o.sanitizePathname(window.location.pathname);if(t===r)return n.hash===window.location.hash?e.event.preventDefault():void 0;e.event.preventDefault(),o.navigateLocally(n.href)}}),y=(e,...n)=>{if(!e.href)throw"Link elements must have a HREF attribute set.";if(!e.href.startsWith("/"))throw'Link elements may only navigate to local pages. "/"';return a({...e,onClick:q},...n)};var U=(...e)=>body({class:"bg-background-900 text-text-50 font-inter select-none text-text-50"},...e);var w=(e,n)=>({type:2,initialValues:e.map(t=>t.value),update:n,refs:e.map(t=>({id:t.id,bind:t.bind}))});var G=e=>{let n=[],o=e.length,t=0,r=new Set(["if","else","for","while","function","return","class","const","let","var","interface","extends","implements","export","import","from"]),g=new Set(["+","-","*","/","%","=",">","<","!","&","|","^","~","?",":"]),v=new Set([";",",",".","(",")","{","}","[","]"]),A=(s=1)=>t+s<o?e[t+s]:"",I=s=>{let c=t;for(;t<o&&s(e[t]);)t++;return e.slice(c,t)},z=s=>{let c=e[t++];for(;t<o&&e[t]!==s;)e[t]==="\\"?(c+=e[t++],t<o&&(c+=e[t++])):c+=e[t++];return t<o&&(c+=e[t++]),c},F=()=>{let s=t;for(t+=2;t<o&&e[t]!==`
`;)t++;return e.slice(s,t)},K=()=>{let s=t;for(t+=2;t<o&&!(e[t]==="*"&&A()==="/");)t++;return t<o&&(t+=2),e.slice(s,t)};for(;t<o;){let s=e[t],c=t;if(/\s/.test(s)){let d=I(x=>/\s/.test(x));n.push({type:"",value:d,position:c});continue}if(s==="/"){if(A()==="/"){let d=F();n.push({type:"text-gray-400",value:d,position:c});continue}else if(A()==="*"){let d=K();n.push({type:"text-gray-400",value:d,position:c});continue}}if(s==='"'||s==="'"){let d=z(s);n.push({type:"text-green-200",value:d,position:c});continue}if(/\d/.test(s)){let d=I(x=>/[\d\.]/.test(x));n.push({type:"text-blue-400",value:d,position:c});continue}if(/[a-zA-Z_$]/.test(s)){let d=I(W=>/[a-zA-Z0-9_$]/.test(W)),x="text-orange-300";r.has(d)?x="text-amber-100 font-semibold":(d==="true"||d==="false")&&(x="text-blue-200");let E=t;for(;E<o&&/\s/.test(e[E]);)E++;E<o&&e[E]==="("&&(x="text-red-300"),n.push({type:x,value:d,position:c});continue}if(g.has(s)){let d=s;t++,t<o&&g.has(e[t])&&(d+=e[t++]),n.push({type:"",value:d,position:c});continue}if(v.has(s)){n.push({type:"text-gray-400",value:s,position:c}),t++;continue}n.push({type:"",value:s,position:c}),t++}return n},J=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),O=e=>G(e).map(o=>o.type===""?o.value:`<span class="${o.type}">${J(o.value)}</span>`).join("");var H=S(!1),M=S(0),Z=_({dependencies:[H,M],eventListener:async(e,n,o)=>{let g=e.event.currentTarget.children.item(0).innerText;await navigator.clipboard.writeText(g),o.value!==0&&clearTimeout(o.value),n.value=!0,n.signal();let v=window.setTimeout(()=>{n.value=!1,n.signal()},3e3);o.value=v}}),V=e=>(T({bind:e,deps:[M,H],fn:(n,o,t)=>()=>{clearTimeout(o.value),t.value=!1,t.signal()}}),div({class:w([H],n=>"fixed z-50 shadow-lg rounded-sm duration-200 bottom-4 px-4 py-2 w-max bg-background-950 "+(n?"right-8":"right-0 translate-x-full"))},h1({class:"font-mono uppercase"},"copied to clipboard"))),Q=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;"),h=(e,n=!0)=>div({class:`bg-background-950 hover:cursor-pointer p-2 rounded-sm
            border-[1px] border-background-800 w-max my-3 max-w-full
            overflow-scroll`,onClick:Z},pre({},n?O(e):Q(e)));var j=(e,...n)=>{if(e.id===void 0)throw"Breakpoints must set a name attribute.";let o=e.id;return delete e.id,div({bp:o,...e},...n)};var P=()=>header({class:"sticky z-10 lef-0 right-0 top-0 text-text-50 font-inter overflow-hidden duration-300 border-b-[1px] border-b-transparent"},div({class:"group duration-300 border-b-[1px] hover:border-b-transparent pointer-fine:hover:bg-accent-400 border-b-background-800 bg-background-950"},div({class:"max-w-[1200px] w-full mx-auto flex pr-2 px-3 sm:px-5 sm:min-[calc(1200px+1rem)]:px-0"},div({class:"flex min-w-max w-full items-center z-10"},y({href:"/",class:"flex items-center gap-1 h-full"},p({class:"font-niconne pointer-fine:group-hover:text-background-950 font-bold text-xl sm:text-3xl relative top-0 z-20 duration-300 pointer-events-none",innerText:"Elegance"}),p({innerText:"JS",class:"font-bold pointer-fine:group-hover:text-background-950 relative top-0 text-xl sm:text-3xl z-10 text-accent-400 duration-300 pointer-events-none"}))),div({class:"flex py-2 sm:py-4 flex relative items-center justify-end w-full"},y({prefetch:"hover",class:"z-10 text-xs uppercase font-bold px-4 py-2 rounded-full duration-300 bg-accent-400 text-primary-900 pointer-fine:group-hover:bg-background-950 pointer-fine:group-hover:text-accent-400 group-hover:hover:bg-text-50 group-hover:hover:text-background-950",href:"/docs",innerText:"Docs"})))));globalThis.__SERVER_CURRENT_LAYOUT_ID__||(globalThis.__SERVER_CURRENT_LAYOUT_ID__=1);var X=globalThis.__SERVER_CURRENT_LAYOUT_ID__,B=e=>{let n=globalThis.__SERVER_CURRENT_LAYOUTS__;if(n.has(e))return n.get(e);let o=X++;return n.set(e,o),o};var R=B("docs-layout"),N=S(0,{bind:R});T({deps:[N],bind:R,fn:(e,n)=>{let o=localStorage.getItem("time-on-page");o&&(n.value=parseInt(o),n.signal());let t;t=setInterval(()=>{n.value++,n.signal()},1e3);let r=()=>{localStorage.setItem("time-on-page",`${n.value}`)};return window.addEventListener("beforeunload",r),()=>{window.removeEventListener("beforeunload",r),r(),clearInterval(t)}}});var f=(e,n)=>y({class:"text-sm font-normal flex flex-col gap-2 opacity-80 hover:opacity-60 duration-200",innerText:n,href:e,prefetch:"hover"}),ee=()=>nav({class:"w-1/5"},ul({class:"flex flex-col gap-4"},li({},h2({class:"text-lg font-semibold"},"Quick Nav"),span({class:"text-xs opacity-75"},"Elapsed: ",span({class:"font-mono",innerText:w([N],e=>{let n=Math.floor(e/60/60),o=Math.floor(e/60%60),t=e%60;return`${n}h:${o}m:${t}s`})}))),li({class:"flex flex-col gap-1"},h4({class:"text-base font-medium",innerText:"The Basics"}),ol({class:"pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"},f("/docs/basics#preamble","Preamble"),f("/docs/basics#how-elegance-works","How Elegance Works"),f("/docs/basics#installation","Installation"),f("/docs/basics#your-first-page","Your First Page"))),li({class:"flex flex-col gap-1"},h4({class:"text-base font-medium",innerText:"Concepts"}),ol({class:"pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"},f("/docs/concepts#elements","Elements"),f("/docs/concepts#object-attributes","Object Attributes"))),li({class:"flex flex-col gap-1"},h4({class:"text-base font-medium",innerText:"Page Files"}),ol({class:"pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"},f("/docs/page-files#state","State"),f("/docs/page-files#load-hooks","Load Hooks"),f("/docs/page-files#event-listeners","Event Listeners"),f("/docs/page-files#layouts","Layouts"))),li({class:"flex flex-col gap-1"},h4({class:"text-base font-medium",innerText:"Compilation"}),ol({class:"pl-2 ml-2 border-l-[1px] border-background-600 flex flex-col gap-2"},f("/docs/compilation#options","Compilation Options"))))),$=(...e)=>div({class:"h-screen overflow-clip"},P(),V(R),div({class:"max-w-[1200px] h-full w-full mx-auto flex pt-8 px-3 sm:px-5 sm:min-[calc(1200px+1rem)]:px-0"},ee(),article({class:"h-full w-full overflow-y-scroll pb-[250px] pl-6 ml-6"},j({id:R},...e))));var l=e=>span({class:"font-mono select-text"},e);var k=(e,n)=>h2({class:"text-3xl font-semibold mb-4",id:n,innerText:e});var i=(...e)=>p({class:"opacity-80"},...e);var C=()=>div({class:"my-20"},[]);var u=e=>h3({class:"text-lg font-medium mb-1",innerText:e});var m=()=>div({class:"my-10"},[]);var L=e=>span({class:"text-xs opacity-60",innerText:e});var te=`
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
`,pe=`
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
`,de=`
const superAwesomeLayoutID  = createLayout("super-awesome-layout");
`,ue=`
const superAwesomeLayoutID = createLayout("super-awesome-layout");

const SuperAwesomeLayout = (...children: Child[]) => div ({
    style: "background-color: #000; color: #fff",
},
    ...children
);
`,be=`
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
`,pt=U($(k("State","state"),L("Available Via: elegance-js/server/state"),i("State is, simply put, a collection of variables.",br(),"You initialize it on the server using the ",l("createState()")," function."),h(ae),m(),u("Usage"),i("The ",l("createState()")," function takes in two values.",br(),"The initial value of the state, and an options object.",br(),"The options object may currently only define a bind to the state (more on this later)",br(),br(),"The function stores the created state in the servers current state store,",br(),"so that upon completion of compilation, it may be serialized into page_data."),m(),u("Return Value"),i("The return value of ",l("createState()")," is a State ",y({href:"/docs/concepts#object-attributes",class:"border-b-2"},"Object Attribute, "),br(),"which you can use to refer back to the created state."),h(re),h(se),i("Many functions like load hooks, event listeners, and observe, take in optional SOAs."),m(),u("Bind"),i("State, in the browser, is kept in the global ",l("pd")," object, and indexed via pathnames.",br(),"All state for the pathname ",l("/recipes/apple-pie")," will be in ",l('pd["/recipes/apple-pie"]'),br(),br(),"However, in some scenarios you may want to reference the same state on multiple pages. ",br(),"For this, you may ",b("bind "),"the state to a ",y({href:"/docs/page-files#layouts",class:"border-b-2"},"Layout."),br(),br(),"Then, the state will go into ",l("pd[layout_id]"),", instead of the pathname of the page."),h(ie),m(),u("Important Considerations"),i("State persists it's value during page navigation.",br(),"Meaning if you want it to reset it's value, you must do so yourself."),C(),k("Load Hooks","load-hooks"),L("Available Via: elegance-js/server/loadHook"),br(),br(),u("Basic Usage"),i("Load hooks are functions that are called on the initial page load, and subsequent navigations.",br(),"A load hook is registered using the ",l("createLoadHook()")," function."),h(te),m(),u("Cleanup Function"),i("The return value of a load hook is referred to as a cleanup function.",br(),"It is called whenever the load hook goes out of scope.",br(),br(),"You'll want to do things like ",l("clearInterval() & element.removeEventListener()"),br()," here, so you don't get any unintended/undefined behavior."),h(ne),m(),u("Load Hook Scope"),i("The scope of a load hook is either the page it is on, or the layout it is bound to.",br(),"If a load hook is bound to layout, it is called when that layout first appears.",br(),"Subsequently, its cleanup function will get called once it's bound layout no longer exists on the page.",br(),br(),"To bind a load hook to a layout, use the ",l("bind")," attribute, and pass in a ",y({href:"/docs/page-files#layouts",class:"border-b-2"},"Layout ID"),h(oe)),m(),u("Important Considerations"),i("It's important to note that the load hook function body exists in ",br(),b("browser land ")," not server land. Therefore the code is ",b("untrusted.")),C(),k("Event Listener","event-listeners"),L("Available Via: elegance-js/server/createState"),br(),br(),u("Basic Usage"),i("Event listeners are a type of state, that you can create with the",br(),l("createEventListener()")," function."),h(le),i("This function returns an SOA, which can then be put on any event listener option of an element.",br(),br(),"The eventListener parameter of ",l("createEventListener()")," takes in two types values.",br(),"First, a params object, which by default contains the native event which was triggered."),m(),u("Dependencies"),i("The second parameter, is a spread parameter, containing the dependencies of the event listener."),h(ce),m(),u("Extra Params"),i("You may also extend the params object parameter of the event listener,",br(),"With the ",l("params")," attribute.",br(),br(),"This is handy for when you need to pass some value to the client, ",br(),"that is not necessarily a state variable, but it can change per compilation."),h(pe),m(),u("Important Considerations"),i("It's important to note that the event listener function body exists in ",br(),b("browser land ")," not server land. Therefore the code is ",b("untrusted.")),C(),k("Layouts","layouts"),L("Available Via: elegance-js/server/layout"),br(),br(),i("A layout is a section of a page that is not re-rendered between",br(),"page navigations, to pages that share the same layout order.",br(),br(),"Instead, the layouts ",b("children")," are replaced.",br(),br(),"This has a few advantages. The main one being, that since the elements themselves,",br(),"are not re-rendered, they maintain things like their hover state."),m(),u("Basic Usage"),i("Layouts work a bit differently in Elegance than you may perhaps be used to.",br(),"For example, in Next.JS, layouts are ",b("inherited "),"to every subsequent page.",br(),br(),"So a layout defined at ",l("/")," would apply to ",b("every")," single page.",br(),"Which you may think is nice and saves time, but almost always I find myself in a situation",br(),"where I want a layout for every page of a given depth, except one.",br(),br(),"And then, I have to either move the special page one depth upward",br(),"or the others one-depth downward.",br(),br(),"Conversly, layouts in Elegance are ",b("not "),"inherited, and are are ",b("opt-in."),br(),br(),"To create a layout, use the ",l("createLayout()")," function, and pass in a name.",br(),"The name is used so any subsequent calls to this function by other pages will get the same ID."),h(de),i("This layout ID can then be passed to state, load hooks, etc."),m(),u("Breakpoints"),i("Creating the actual layout element is simple.",br(),"Just make a function that takes in child elements, and have it return some kind of simple layout."),h(ue),i("Then, wrap the children with the built-in ",l("Breakpoint()")," element."),h(be),m(),u("Important Considerations"),i("The ",l("Breakpoint()")," element is the one that gets replaced",br(),"when navigating within any given layout.",br(),br(),"All sibling and parent elements stay untouched.",br(),br(),"Also note, that in complex pages where there are multiple nested layouts,",br(),"the one that has its children replaced, is the layout that is ",b("last shared."),br(),br(),b("For example:"),br(),"Page 1 Layouts: A,B,C,D,E",br(),"Page 2 Layouts: A,B,D,C,E",br(),"In this instance, the ",b("B")," layout is the last shared layout.")));export{pt as page};
