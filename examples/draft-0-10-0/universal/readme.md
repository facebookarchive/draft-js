# Universal rendering

Draft is well suited for universal (isomorphic) rendering contexts:

Here, we have three files:

* editor.js
  A simple draftjs editor exported as `<SimpleEditor />`
* client.js
  A simple clientside entrypoint that clientside renders the index page route's logic into a `#react-content` div.
* index.js
  A simple express server that prerenders a <SimpleEditor /> in the `#react-content` div

you can run this by first building draft-js and then installing this demo's dependencies

```bash
# in draft-js folder
yarn
pushd examples/draft-0-10-0/universal
yarn
```

then, run

`npm run demo`

which will open a server listening on [http://localhost:3003](http://localhost:3003)
