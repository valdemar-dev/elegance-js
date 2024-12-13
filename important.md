## TODO
### Renaming
    - createPageInfo.ts is a silly name.
    - ./src/server/render|router|state.ts all conflict with other ones.
### QOL
    - rm ./dist on build in not bad way.

## Optimization
    - Only include elements in client that are used, maybe save few KB.

## Handy Dandy
line count: find ./src -name '*.ts' | xargs wc -l
