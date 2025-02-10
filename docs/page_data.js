let url="/";if (!globalThis.pd) globalThis.pd = {};let pd=globalThis.pd;pd[url]={...pd[url],w:true};pd[url]={...pd[url],state:{hasUserScrolled:{id:0,value:false},interval:{id:1,value:0},globalTicker:{id:2,value:0},}};pd[url]={...pd[url],ooa:[{key:3,attribute:"class",ids:[0],update:(hasUserScrolled) => {
          const defaultClass = "group duration-300 border-b-[1px] hover:border-b-transparent pointer-fine:hover:bg-accent-400 ";
          if (hasUserScrolled) return defaultClass + "border-b-background-800 bg-background-950";
          return defaultClass + "bg-background-900 border-b-transparent";
        }},]};pd[url]={...pd[url],plh:[(state2) => {
    const hasScrolled = state2.subjects.hasUserScrolled;
    window.addEventListener("scroll", () => {
      const pos = {
        x: window.scrollX,
        y: window.scrollY
      };
      if (pos.y > 20) {
        if (hasScrolled.value === true) return;
        state2.set(hasScrolled, true);
      } else {
        if (hasScrolled.value === false) return;
        state2.set(hasScrolled, false);
      }
      state2.signal(hasScrolled);
    });
  },]};