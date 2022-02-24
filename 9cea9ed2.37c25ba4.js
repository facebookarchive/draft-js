(window.webpackJsonp=window.webpackJsonp||[]).push([[23],{127:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return l})),n.d(t,"rightToc",(function(){return c})),n.d(t,"default",(function(){return p}));var r=n(2),a=n(6),o=(n(0),n(147)),i={id:"advanced-topics-inline-styles",title:"Complex Inline Styles"},l={id:"advanced-topics-inline-styles",title:"Complex Inline Styles",description:"Within your editor, you may wish to provide a wide variety of inline style",source:"@site/../docs/Advanced-Topics-Inline-Styles.md",permalink:"/docs/advanced-topics-inline-styles",editUrl:"https://github.com/facebook/draft-js/edit/master/docs/../docs/Advanced-Topics-Inline-Styles.md",lastUpdatedBy:"Yangshun Tay",lastUpdatedAt:1576462158,sidebar:"docs",previous:{title:"Custom Block Components",permalink:"/docs/advanced-topics-block-components"},next:{title:"Nested Lists",permalink:"/docs/advanced-topics-nested-lists"}},c=[{value:"Model",id:"model",children:[]},{value:"Overlapping Styles",id:"overlapping-styles",children:[]},{value:"Mapping a style string to CSS",id:"mapping-a-style-string-to-css",children:[]}],s={rightToc:c};function p(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},s,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("p",null,"Within your editor, you may wish to provide a wide variety of inline style\nbehavior that goes well beyond the bold/italic/underline basics. For instance,\nyou may want to support variety with color, font families, font sizes, and more.\nFurther, your desired styles may overlap or be mutually exclusive."),Object(o.b)("p",null,"The ",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"http://github.com/facebook/draft-js/tree/master/examples/draft-0-10-0/rich"}),"Rich Editor")," and\n",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"http://github.com/facebook/draft-js/tree/master/examples/draft-0-10-0/color"}),"Colorful Editor"),"\nexamples demonstrate complex inline style behavior in action."),Object(o.b)("h2",{id:"model"},"Model"),Object(o.b)("p",null,"Within the Draft model, inline styles are represented at the character level,\nusing an immutable ",Object(o.b)("inlineCode",{parentName:"p"},"OrderedSet")," to define the list of styles to be applied to\neach character. These styles are identified by string. (See ",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"/docs/api-reference-character-metadata"}),"CharacterMetadata"),"\nfor details.)"),Object(o.b)("p",null,'For example, consider the text "Hello ',Object(o.b)("strong",{parentName:"p"},"world"),'". The first six characters of\nthe string are represented by the empty set, ',Object(o.b)("inlineCode",{parentName:"p"},"OrderedSet()"),". The final five\ncharacters are represented by ",Object(o.b)("inlineCode",{parentName:"p"},"OrderedSet.of('BOLD')"),". For convenience, we can\nthink of these ",Object(o.b)("inlineCode",{parentName:"p"},"OrderedSet")," objects as arrays, though in reality we aggressively\nreuse identical immutable objects."),Object(o.b)("p",null,"In essence, our styles are:"),Object(o.b)("pre",null,Object(o.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"[\n  [], // H\n  [], // e\n  // ...\n  ['BOLD'], // w\n  ['BOLD'], // o\n  // etc.\n];\n")),Object(o.b)("h2",{id:"overlapping-styles"},"Overlapping Styles"),Object(o.b)("p",null,"Now let's say that we wish to make the middle range of characters italic as well:\nHe",Object(o.b)("em",{parentName:"p"},"llo")," ",Object(o.b)("strong",{parentName:"p"},Object(o.b)("em",{parentName:"strong"},"wo"),"rld"),". This operation can be performed via the\n",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"/docs/api-reference-modifier"}),"Modifier")," API."),Object(o.b)("p",null,"The end result will accommodate the overlap by including ",Object(o.b)("inlineCode",{parentName:"p"},"'ITALIC'")," in the\nrelevant ",Object(o.b)("inlineCode",{parentName:"p"},"OrderedSet")," objects as well."),Object(o.b)("pre",null,Object(o.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"[\n  [], // H\n  [], // e\n  ['ITALIC'], // l\n  // ...\n  ['BOLD', 'ITALIC'], // w\n  ['BOLD', 'ITALIC'], // o\n  ['BOLD'], // r\n  // etc.\n];\n")),Object(o.b)("p",null,"When determining how to render inline-styled text, Draft will identify\ncontiguous ranges of identically styled characters and render those characters\ntogether in styled ",Object(o.b)("inlineCode",{parentName:"p"},"span")," nodes."),Object(o.b)("h2",{id:"mapping-a-style-string-to-css"},"Mapping a style string to CSS"),Object(o.b)("p",null,"By default, ",Object(o.b)("inlineCode",{parentName:"p"},"Editor")," provides support for a basic list of inline styles:\n",Object(o.b)("inlineCode",{parentName:"p"},"'BOLD'"),", ",Object(o.b)("inlineCode",{parentName:"p"},"'ITALIC'"),", ",Object(o.b)("inlineCode",{parentName:"p"},"'UNDERLINE'"),", and ",Object(o.b)("inlineCode",{parentName:"p"},"'CODE'"),". These are mapped to plain CSS\nstyle objects, which are used to apply styles to the relevant ranges."),Object(o.b)("p",null,"For your editor, you may define custom style strings to include with these\ndefaults, or you may override the default style objects for the basic styles."),Object(o.b)("p",null,"Within your ",Object(o.b)("inlineCode",{parentName:"p"},"Editor")," use case, you may provide the ",Object(o.b)("inlineCode",{parentName:"p"},"customStyleMap")," prop\nto define your style objects. (See\n",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"http://github.com/facebook/draft-js/tree/master/examples/draft-0-10-0/color"}),"Colorful Editor"),"\nfor a live example.)"),Object(o.b)("p",null,"For example, you may want to add a ",Object(o.b)("inlineCode",{parentName:"p"},"'STRIKETHROUGH'")," style. To do so, define a\ncustom style map:"),Object(o.b)("pre",null,Object(o.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"import {Editor} from 'draft-js';\n\nconst styleMap = {\n  'STRIKETHROUGH': {\n    textDecoration: 'line-through',\n  },\n};\n\nclass MyEditor extends React.Component {\n  // ...\n  render() {\n    return (\n      <Editor\n        customStyleMap={styleMap}\n        editorState={this.state.editorState}\n        ...\n      />\n    );\n  }\n}\n")),Object(o.b)("p",null,"When rendered, the ",Object(o.b)("inlineCode",{parentName:"p"},"textDecoration: line-through")," style will be applied to all\ncharacter ranges with the ",Object(o.b)("inlineCode",{parentName:"p"},"STRIKETHROUGH")," style."))}p.isMDXComponent=!0},147:function(e,t,n){"use strict";n.d(t,"a",(function(){return d})),n.d(t,"b",(function(){return m}));var r=n(0),a=n.n(r);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=a.a.createContext({}),p=function(e){var t=a.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=p(e.components);return a.a.createElement(s.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},u=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),d=p(n),u=r,m=d["".concat(i,".").concat(u)]||d[u]||b[u]||o;return n?a.a.createElement(m,l(l({ref:t},s),{},{components:n})):a.a.createElement(m,l({ref:t},s))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=u;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:r,i[1]=l;for(var s=2;s<o;s++)i[s]=n[s];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,n)}u.displayName="MDXCreateElement"}}]);