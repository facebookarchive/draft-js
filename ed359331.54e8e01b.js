(window.webpackJsonp=window.webpackJsonp||[]).push([[34],{140:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return o})),n.d(t,"rightToc",(function(){return d})),n.d(t,"default",(function(){return l}));var a=n(2),r=n(6),c=(n(0),n(147)),i={id:"api-reference-entity",title:"Entity"},o={id:"api-reference-entity",title:"Entity",description:"Entity is a static module containing the API for creating, retrieving, and",source:"@site/../docs/APIReference-Entity.md",permalink:"/docs/api-reference-entity",editUrl:"https://github.com/facebook/draft-js/edit/master/docs/../docs/APIReference-Entity.md",lastUpdatedBy:"Yangshun Tay",lastUpdatedAt:1576462158,sidebar:"docs",previous:{title:"CharacterMetadata",permalink:"/docs/api-reference-character-metadata"},next:{title:"SelectionState",permalink:"/docs/api-reference-selection-state"}},d=[{value:"Overview",id:"overview",children:[]},{value:"Methods",id:"methods",children:[{value:"<code>create</code> <em>(Deprecated in favour of contentState.createEntity)</em>",id:"create-deprecated-in-favour-of-contentstatecreateentity",children:[]},{value:"<code>add</code> <em>(Deprecated in favour of contentState.addEntity)</em>",id:"add-deprecated-in-favour-of-contentstateaddentity",children:[]},{value:"<code>get</code> <em>(Deprecated in favour of contentState.getEntity)</em>",id:"get-deprecated-in-favour-of-contentstategetentity",children:[]},{value:"<code>mergeData</code> <em>(Deprecated in favour of contentState.mergeEntityData)</em>",id:"mergedata-deprecated-in-favour-of-contentstatemergeentitydata",children:[]},{value:"<code>replaceData</code> <em>(Deprecated in favour of contentState.replaceEntityData)</em>",id:"replacedata-deprecated-in-favour-of-contentstatereplaceentitydata",children:[]}]}],b={rightToc:d};function l(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(c.b)("wrapper",Object(a.a)({},b,n,{components:t,mdxType:"MDXLayout"}),Object(c.b)("p",null,Object(c.b)("inlineCode",{parentName:"p"},"Entity")," is a static module containing the API for creating, retrieving, and\nupdating entity objects, which are used for annotating text ranges with metadata.\nThis module also houses the single store used to maintain entity data."),Object(c.b)("p",null,"This article is dedicated to covering the details of the API. See the\n",Object(c.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/advanced-topics-entities"}),"advanced topics article on entities"),"\nfor more detail on how entities may be used."),Object(c.b)("p",null,"Please note that the API for entity storage and management has changed recently;\nfor details on updating your application\n",Object(c.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/v0-10-api-migration#content"}),"see our v0.10 API Migration Guide"),"."),Object(c.b)("p",null,"Entity objects returned by ",Object(c.b)("inlineCode",{parentName:"p"},"Entity")," methods are represented as\n",Object(c.b)("a",Object(a.a)({parentName:"p"},{href:"https://github.com/facebook/draft-js/blob/master/src/model/entity/DraftEntityInstance.js"}),"DraftEntityInstance")," immutable records. These have a small set of getter functions and should\nbe used only for retrieval."),Object(c.b)("h2",{id:"overview"},"Overview"),Object(c.b)("p",null,Object(c.b)("em",{parentName:"p"},"Methods")),Object(c.b)("ul",{class:"apiIndex"},Object(c.b)("li",null,Object(c.b)("a",{href:"#create"},Object(c.b)("pre",null,"create(...): DraftEntityInstance"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#add"},Object(c.b)("pre",null,"add(instance: DraftEntityInstance): string"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#get"},Object(c.b)("pre",null,"get(key: string): DraftEntityInstance"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#mergedata"},Object(c.b)("pre",null,"mergeData(...): DraftEntityInstance"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#replacedata"},Object(c.b)("pre",null,"replaceData(...): DraftEntityInstance")))),Object(c.b)("h2",{id:"methods"},"Methods"),Object(c.b)("h3",{id:"create-deprecated-in-favour-of-contentstatecreateentity"},Object(c.b)("inlineCode",{parentName:"h3"},"create")," ",Object(c.b)("em",{parentName:"h3"},"(Deprecated in favour of ",Object(c.b)("a",Object(a.a)({parentName:"em"},{href:"/docs/api-reference-content-state#createentity"}),Object(c.b)("inlineCode",{parentName:"a"},"contentState.createEntity")),")")),Object(c.b)("pre",null,Object(c.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"create(\n  type: DraftEntityType,\n  mutability: DraftEntityMutability,\n  data?: Object\n): string\n")),Object(c.b)("p",null,"The ",Object(c.b)("inlineCode",{parentName:"p"},"create")," method should be used to generate a new entity object with the\nsupplied properties."),Object(c.b)("p",null,"Note that a string is returned from this function. This is because entities\nare referenced by their string key in ",Object(c.b)("inlineCode",{parentName:"p"},"ContentState"),". The string value should\nbe used within ",Object(c.b)("inlineCode",{parentName:"p"},"CharacterMetadata")," objects to track the entity for annotated\ncharacters."),Object(c.b)("h3",{id:"add-deprecated-in-favour-of-contentstateaddentity"},Object(c.b)("inlineCode",{parentName:"h3"},"add")," ",Object(c.b)("em",{parentName:"h3"},"(Deprecated in favour of ",Object(c.b)("a",Object(a.a)({parentName:"em"},{href:"/docs/api-reference-content-state#addentity"}),Object(c.b)("inlineCode",{parentName:"a"},"contentState.addEntity")),")")),Object(c.b)("pre",null,Object(c.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"add(instance: DraftEntityInstance): string\n")),Object(c.b)("p",null,"In most cases, you will use ",Object(c.b)("inlineCode",{parentName:"p"},"Entity.create()"),". This is a convenience method\nthat you probably will not need in typical Draft usage."),Object(c.b)("p",null,"The ",Object(c.b)("inlineCode",{parentName:"p"},"add")," function is useful in cases where the instances have already been\ncreated, and now need to be added to the ",Object(c.b)("inlineCode",{parentName:"p"},"Entity")," store. This may occur in cases\nwhere a vanilla JavaScript representation of a ",Object(c.b)("inlineCode",{parentName:"p"},"ContentState")," is being revived\nfor editing."),Object(c.b)("h3",{id:"get-deprecated-in-favour-of-contentstategetentity"},Object(c.b)("inlineCode",{parentName:"h3"},"get")," ",Object(c.b)("em",{parentName:"h3"},"(Deprecated in favour of ",Object(c.b)("a",Object(a.a)({parentName:"em"},{href:"/docs/api-reference-content-state#getentity"}),Object(c.b)("inlineCode",{parentName:"a"},"contentState.getEntity")),")")),Object(c.b)("pre",null,Object(c.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"get(key: string): DraftEntityInstance\n")),Object(c.b)("p",null,"Returns the ",Object(c.b)("inlineCode",{parentName:"p"},"DraftEntityInstance")," for the specified key. Throws if no instance\nexists for that key."),Object(c.b)("h3",{id:"mergedata-deprecated-in-favour-of-contentstatemergeentitydata"},Object(c.b)("inlineCode",{parentName:"h3"},"mergeData")," ",Object(c.b)("em",{parentName:"h3"},"(Deprecated in favour of ",Object(c.b)("a",Object(a.a)({parentName:"em"},{href:"/docs/api-reference-content-state#mergeentitydata"}),Object(c.b)("inlineCode",{parentName:"a"},"contentState.mergeEntityData")),")")),Object(c.b)("pre",null,Object(c.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"mergeData(\n  key: string,\n  toMerge: {[key: string]: any}\n): DraftEntityInstance\n")),Object(c.b)("p",null,"Since ",Object(c.b)("inlineCode",{parentName:"p"},"DraftEntityInstance")," objects are immutable, you cannot update an entity's\nmetadata through typical mutative means."),Object(c.b)("p",null,"The ",Object(c.b)("inlineCode",{parentName:"p"},"mergeData")," method allows you to apply updates to the specified entity."),Object(c.b)("h3",{id:"replacedata-deprecated-in-favour-of-contentstatereplaceentitydata"},Object(c.b)("inlineCode",{parentName:"h3"},"replaceData")," ",Object(c.b)("em",{parentName:"h3"},"(Deprecated in favour of ",Object(c.b)("a",Object(a.a)({parentName:"em"},{href:"/docs/api-reference-content-state#replaceentitydata"}),Object(c.b)("inlineCode",{parentName:"a"},"contentState.replaceEntityData")),")")),Object(c.b)("pre",null,Object(c.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"replaceData(\n  key: string,\n  newData: {[key: string]: any}\n): DraftEntityInstance\n")),Object(c.b)("p",null,"The ",Object(c.b)("inlineCode",{parentName:"p"},"replaceData")," method is similar to the ",Object(c.b)("inlineCode",{parentName:"p"},"mergeData")," method, except it will\ntotally discard the existing ",Object(c.b)("inlineCode",{parentName:"p"},"data")," value for the instance and replace it with\nthe specified ",Object(c.b)("inlineCode",{parentName:"p"},"newData"),"."))}l.isMDXComponent=!0},147:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return f}));var a=n(0),r=n.n(a);function c(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){c(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},c=Object.keys(e);for(a=0;a<c.length;a++)n=c[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(a=0;a<c.length;a++)n=c[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var b=r.a.createContext({}),l=function(e){var t=r.a.useContext(b),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=l(e.components);return r.a.createElement(b.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},u=r.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,c=e.originalType,i=e.parentName,b=d(e,["components","mdxType","originalType","parentName"]),p=l(n),u=a,f=p["".concat(i,".").concat(u)]||p[u]||s[u]||c;return n?r.a.createElement(f,o(o({ref:t},b),{},{components:n})):r.a.createElement(f,o({ref:t},b))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var c=n.length,i=new Array(c);i[0]=u;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o.mdxType="string"==typeof e?e:a,i[1]=o;for(var b=2;b<c;b++)i[b]=n[b];return r.a.createElement.apply(null,i)}return r.a.createElement.apply(null,n)}u.displayName="MDXCreateElement"}}]);