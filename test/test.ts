/**
 * Modify this to run whatever basic usage of Elegance you want to test.
 * It's not actual testing, it's more like sanity-testing.
 */
import { allElements, } from "../src/elements/element_list";
import { compileEntireProject, compileStaticPageToDisk, generatePageCompilationContext, generatePageDataScript, serializeElement, setCompilerOptions, } from "../src/compilation/compiler";

(async () => {
    setCompilerOptions({
        pagesDirectory: "./test_pages",
        outputDirectory: ".elegance",
    });

    await compileEntireProject();
})();
