POTENTIAL:
    - fix race condition fetching in Links()
    - get into image opts?

CANNED: 
    - deprecate SOA, change to ELOA
        - stupid, all OA's are separate for optimization

TODO:
    - typescript autocopmlete and typings for elements, make options {} good-ier
    - state signal self, not controller signals state
    - make non children elements, that take in children, actually work
        - basically set element.children = null on childrenless elements so that they're rendered properly
    - fix links breaking on hot-reload
    - scrollintoview when clicking on hash
    - code cleanup
    - rewrite client
        - there's some weird shit with this, i need to make it more optimized
          no abstraction though, obviously
    - make watch server url configurable.
    - write documentation (OMEGALUL)

DONE: 
    - only send watch-mode code in watch-mode
    - optimize page-data
    - multi-page components that maintain state.
    - give each OA a ref to the pd[] that they belong to
    - run built page.js files through esbuild on compile
    - mount hooks
    - remove type from soa's for browser
    - modify observe() to take in multiple values
    - add some shit so you can't just >>>> in content
    - renderer fuckery??? i think issues with ",>'. !!!escape all these
    - layouts with <bp="key"> tags

