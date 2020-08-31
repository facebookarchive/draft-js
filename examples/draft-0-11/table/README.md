This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Developer Manual

A custom block like [TeX editor](https://github.com/facebook/draft-js/tree/master/examples/draft-0-10-0/tex)

### create

```js
const contentStateWithEntity = contentState.createEntity(
    'TABLE',
    'IMMUTABLE',
    {
        row, column, caption, cell, // data
    },
)
``` 
Where `data` field is created with reactstrap [Modal](https://reactstrap.github.io/components/modals/)
 nested with [Form](https://reactstrap.github.io/components/form/).
 
TODO Form Validation

### edit

Refer to [javascript.info/focus-blur#tasks](https://javascript.info/focus-blur#tasks)

## User Manual

In the project directory, you can run:

### `yarn`

Installs the node_modules required and

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.
