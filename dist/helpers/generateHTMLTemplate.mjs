var n=r=>{if(typeof r=="string"||typeof r=="number")return r;if(typeof r!="function")throw"Cannot render non-functional elements.";let i=r(),t="";if(t+=`<${i.tag}`,Object.hasOwn(i,"getOptions")){let s=i.getOptions();for(let[c,e]of Object.entries(s))t+=` ${c}="${e}"`}if(!i.children)return t+="/>",t;t+=">";for(let s of i.children)t+=n(s);return t+=`</${i.tag}>`,t},f=({pageURL:r,head:i,renderingMethod:t,serverData:s=null,addPageScriptTag:c=!0})=>{let e='<meta name="viewport" content="width=device-width, initial-scale=1.0">';switch(t){case 1:e+='<script src="/client_ssr.js" defer="true"></script>';break;case 2:e+='<script src="/client_ssg.js" defer="true"></script>';break;case 3:e+='<script src="/client_csr.js" defer="true"></script>';break}c&&(e+=`<script type="module" src="${r===""?"":"/"}${r}/page.js" defer="true"></script>`);let o=i()();for(let E of o.children)e+=n(E);return s&&(e+=s),e};export{f as generateHTMLTemplate};