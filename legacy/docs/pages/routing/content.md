# Routing
Routing in this context, refers to how *pathnames* in a given URL to your page resolve to a file.  
We've opted for fs-based routing, as we believe this is the simplest and most effective form of routing.  

## How File System Based Routing Works
Let's take a URL. Something like: **https://localhost:3000/recipes/cake**.  
The *pathname* from this URL is **/recipes/cake**    

When someone tries to make a *request* to this page, the Elegance web server will try  
to map this pathname based on *subfolder names* of your pages directory.    

So, if you have a file:
`/pages/recipes/cake/page.ts` 
The web-server will show that page.