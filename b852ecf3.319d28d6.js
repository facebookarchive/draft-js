(window.webpackJsonp=window.webpackJsonp||[]).push([[29],{132:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return c})),n.d(t,"metadata",(function(){return i})),n.d(t,"rightToc",(function(){return l})),n.d(t,"default",(function(){return b}));var r=n(2),a=n(6),o=(n(0),n(147)),c={id:"api-reference-editor-change-type",title:"EditorChangeType"},i={id:"api-reference-editor-change-type",title:"EditorChangeType",description:"EditorChangeType",source:"@site/../docs/APIReference-EditorChangeType.md",permalink:"/docs/api-reference-editor-change-type",editUrl:"https://github.com/facebook/draft-js/edit/master/docs/../docs/APIReference-EditorChangeType.md",lastUpdatedBy:"Yangshun Tay",lastUpdatedAt:1575407386,sidebar:"docs",previous:{title:"Editor Component",permalink:"/docs/api-reference-editor"},next:{title:"EditorState",permalink:"/docs/api-reference-editor-state"}},l=[{value:"Values",id:"values",children:[{value:"<code>adjust-depth</code>",id:"adjust-depth",children:[]},{value:"<code>apply-entity</code>",id:"apply-entity",children:[]},{value:"<code>backspace-character</code>",id:"backspace-character",children:[]},{value:"<code>change-block-data</code>",id:"change-block-data",children:[]},{value:"<code>change-block-type</code>",id:"change-block-type",children:[]},{value:"<code>change-inline-style</code>",id:"change-inline-style",children:[]},{value:"<code>move-block</code>",id:"move-block",children:[]},{value:"<code>delete-character</code>",id:"delete-character",children:[]},{value:"<code>insert-characters</code>",id:"insert-characters",children:[]},{value:"<code>insert-fragment</code>",id:"insert-fragment",children:[]},{value:"<code>redo</code>",id:"redo",children:[]},{value:"<code>remove-range</code>",id:"remove-range",children:[]},{value:"<code>spellcheck-change</code>",id:"spellcheck-change",children:[]},{value:"<code>split-block</code>",id:"split-block",children:[]},{value:"<code>undo</code>",id:"undo",children:[]}]}],d={rightToc:l};function b(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},d,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("p",null,Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/facebook/draft-js/blob/master/src/model/immutable/EditorChangeType.js"}),"EditorChangeType"),"\nis an enum that lists the possible set of change operations that can be handled\nthe Draft model. It is represented as a Flow type, as a union of strings."),Object(o.b)("p",null,"It is passed as a parameter to ",Object(o.b)("inlineCode",{parentName:"p"},"EditorState.push"),", and denotes the type of\nchange operation that is being performed by transitioning to the new\n",Object(o.b)("inlineCode",{parentName:"p"},"ContentState"),"."),Object(o.b)("p",null,"Behind the scenes, this value is used to determine appropriate undo/redo\nhandling, spellcheck behavior, and more. Therefore, while it is possible to\nprovide an arbitrary string value as the ",Object(o.b)("inlineCode",{parentName:"p"},"changeType")," parameter here, you should\navoid doing so."),Object(o.b)("p",null,"We highly recommend that you install ",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"http://flowtype.org"}),"Flow")," to perform\nstatic typechecking on your project. Flow will enforce the use of an appropriate\n",Object(o.b)("inlineCode",{parentName:"p"},"EditorChangeType")," value."),Object(o.b)("h2",{id:"values"},"Values"),Object(o.b)("h3",{id:"adjust-depth"},Object(o.b)("inlineCode",{parentName:"h3"},"adjust-depth")),Object(o.b)("p",null,"The ",Object(o.b)("inlineCode",{parentName:"p"},"depth")," value of one or more ",Object(o.b)("inlineCode",{parentName:"p"},"ContentBlock")," objects is being changed."),Object(o.b)("h3",{id:"apply-entity"},Object(o.b)("inlineCode",{parentName:"h3"},"apply-entity")),Object(o.b)("p",null,"An entity is being applied (or removed via ",Object(o.b)("inlineCode",{parentName:"p"},"null"),") to one or more characters."),Object(o.b)("h3",{id:"backspace-character"},Object(o.b)("inlineCode",{parentName:"h3"},"backspace-character")),Object(o.b)("p",null,"A single character is being backward-removed."),Object(o.b)("h3",{id:"change-block-data"},Object(o.b)("inlineCode",{parentName:"h3"},"change-block-data")),Object(o.b)("p",null,"The ",Object(o.b)("inlineCode",{parentName:"p"},"data")," value of one or more ",Object(o.b)("inlineCode",{parentName:"p"},"ContentBlock")," objects is being changed."),Object(o.b)("h3",{id:"change-block-type"},Object(o.b)("inlineCode",{parentName:"h3"},"change-block-type")),Object(o.b)("p",null,"The ",Object(o.b)("inlineCode",{parentName:"p"},"type")," value of one or more ",Object(o.b)("inlineCode",{parentName:"p"},"ContentBlock")," objects is being changed."),Object(o.b)("h3",{id:"change-inline-style"},Object(o.b)("inlineCode",{parentName:"h3"},"change-inline-style")),Object(o.b)("p",null,"An inline style is being applied or removed for one or more characters."),Object(o.b)("h3",{id:"move-block"},Object(o.b)("inlineCode",{parentName:"h3"},"move-block")),Object(o.b)("p",null,"A block is being moved within the ",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/facebook/draft-js/blob/master/src/model/immutable/BlockMap.js"}),"BlockMap"),"."),Object(o.b)("h3",{id:"delete-character"},Object(o.b)("inlineCode",{parentName:"h3"},"delete-character")),Object(o.b)("p",null,"A single character is being forward-removed."),Object(o.b)("h3",{id:"insert-characters"},Object(o.b)("inlineCode",{parentName:"h3"},"insert-characters")),Object(o.b)("p",null,"One or more characters is being inserted at a selection state."),Object(o.b)("h3",{id:"insert-fragment"},Object(o.b)("inlineCode",{parentName:"h3"},"insert-fragment")),Object(o.b)("p",null,'A "fragment" of content (i.e. a\n',Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"https://github.com/facebook/draft-js/blob/master/src/model/immutable/BlockMap.js"}),"BlockMap"),")\nis being inserted at a selection state."),Object(o.b)("h3",{id:"redo"},Object(o.b)("inlineCode",{parentName:"h3"},"redo")),Object(o.b)("p",null,"A redo operation is being performed. Since redo behavior is handled by the\nDraft core, it is unlikely that you will need to use this explicitly."),Object(o.b)("h3",{id:"remove-range"},Object(o.b)("inlineCode",{parentName:"h3"},"remove-range")),Object(o.b)("p",null,"Multiple characters or blocks are being removed."),Object(o.b)("h3",{id:"spellcheck-change"},Object(o.b)("inlineCode",{parentName:"h3"},"spellcheck-change")),Object(o.b)("p",null,"A spellcheck or autocorrect change is being performed. This is used to inform\nthe core editor whether to try to allow native undo behavior."),Object(o.b)("h3",{id:"split-block"},Object(o.b)("inlineCode",{parentName:"h3"},"split-block")),Object(o.b)("p",null,"A single ",Object(o.b)("inlineCode",{parentName:"p"},"ContentBlock")," is being split into two, for instance when the user\npresses return."),Object(o.b)("h3",{id:"undo"},Object(o.b)("inlineCode",{parentName:"h3"},"undo")),Object(o.b)("p",null,"An undo operation is being performed. Since undo behavior is handled by the\nDraft core, it is unlikely that you will need to use this explicitly."))}b.isMDXComponent=!0},147:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return u}));var r=n(0),a=n.n(r);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=a.a.createContext({}),b=function(e){var t=a.a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=b(e.components);return a.a.createElement(d.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},h=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,c=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),p=b(n),h=r,u=p["".concat(c,".").concat(h)]||p[h]||s[h]||o;return n?a.a.createElement(u,i(i({ref:t},d),{},{components:n})):a.a.createElement(u,i({ref:t},d))}));function u(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,c=new Array(o);c[0]=h;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:r,c[1]=i;for(var d=2;d<o;d++)c[d]=n[d];return a.a.createElement.apply(null,c)}return a.a.createElement.apply(null,n)}h.displayName="MDXCreateElement"}}]);