var GenerateMetadata = /* @__PURE__ */ ((GenerateMetadata2) => {
  GenerateMetadata2[GenerateMetadata2["ON_BUILD"] = 1] = "ON_BUILD";
  GenerateMetadata2[GenerateMetadata2["PER_REQUEST"] = 2] = "PER_REQUEST";
  return GenerateMetadata2;
})(GenerateMetadata || {});
var RenderingMethod = /* @__PURE__ */ ((RenderingMethod2) => {
  RenderingMethod2[RenderingMethod2["SERVER_SIDE_RENDERING"] = 1] = "SERVER_SIDE_RENDERING";
  RenderingMethod2[RenderingMethod2["STATIC_GENERATION"] = 2] = "STATIC_GENERATION";
  RenderingMethod2[RenderingMethod2["CLIENT_SIDE_RENDERING"] = 3] = "CLIENT_SIDE_RENDERING";
  return RenderingMethod2;
})(RenderingMethod || {});
export {
  GenerateMetadata,
  RenderingMethod
};
