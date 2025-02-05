let url="/";if (!globalThis.pd) globalThis.pd = {};let pd=globalThis.pd;pd[url]={...pd[url],w:true};pd[url]={...pd[url],state:{}};pd[url]={...pd[url],ooa:[{key:3,attribute:"class",ids:[0],update:(hasUserScrolled) => {
          const defaultClass = "group duration-300 border-b-[1px] hover:border-b-transparent pointer-fine:hover:bg-accent-400 ";
          if (hasUserScrolled) return defaultClass + "border-b-background-800 bg-background-950";
          return defaultClass + "bg-background-900 border-b-transparent";
        }},]};