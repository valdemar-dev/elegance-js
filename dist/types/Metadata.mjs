// src/types/Metadata.ts
var GenerateMetadata = /* @__PURE__ */ ((GenerateMetadata2) => {
  GenerateMetadata2[GenerateMetadata2["ON_BUILD"] = 1] = "ON_BUILD";
  GenerateMetadata2[GenerateMetadata2["PER_REQUEST"] = 2] = "PER_REQUEST";
  return GenerateMetadata2;
})(GenerateMetadata || {});
var CacheSSRResultHTML = /* @__PURE__ */ ((CacheSSRResultHTML2) => {
  CacheSSRResultHTML2[CacheSSRResultHTML2["NO"] = 0] = "NO";
  CacheSSRResultHTML2[CacheSSRResultHTML2["YES"] = 1] = "YES";
  return CacheSSRResultHTML2;
})(CacheSSRResultHTML || {});
export {
  CacheSSRResultHTML,
  GenerateMetadata
};
