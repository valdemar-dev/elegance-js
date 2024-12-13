var i=({storedEventListeners:n,renderingMethod:r})=>{let t=n.map(e=>`{id:${e.eleganceID},els:[${e.eventListeners.map(s=>s)}]}`);return`{rm:${r},sels:[${t}]}`};export{i as createPageInfo};
