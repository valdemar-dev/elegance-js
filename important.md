## TODO
### Renaming
    - createPageInfo.ts is a silly name.
    - ./src/server/render|router|state.ts all conflict with other ones.
### QOL
    - rm ./dist on build in not bad way.

## Optimization
    - Only include elements in client that are used, maybe save few KB.

## Notes
    ### Router
    take the fetched html page, find the client declaration, add it to head if it is not already there
    take the script tag that defines page information (use custom attr)
    determine what to do
    fetch the page

## Handy Dandy
line count: find ./src -name '*.ts' | xargs wc -l
