(window.webpackJsonp=window.webpackJsonp||[]).push([[24],{128:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return a})),n.d(t,"metadata",(function(){return c})),n.d(t,"rightToc",(function(){return s})),n.d(t,"default",(function(){return p}));var o=n(2),r=n(6),i=(n(0),n(147)),a={id:"advanced-topics-block-components",title:"Custom Block Components"},c={id:"advanced-topics-block-components",title:"Custom Block Components",description:"Draft is designed to solve problems for straightforward rich text interfaces",source:"@site/../docs/Advanced-Topics-Block-Components.md",permalink:"/docs/advanced-topics-block-components",editUrl:"https://github.com/facebook/draft-js/edit/master/docs/../docs/Advanced-Topics-Block-Components.md",lastUpdatedBy:"Claudio Procida",lastUpdatedAt:1571742808,sidebar:"docs",previous:{title:"Custom Block Rendering",permalink:"/docs/advanced-topics-custom-block-render-map"},next:{title:"Complex Inline Styles",permalink:"/docs/advanced-topics-inline-styles"}},s=[{value:"Custom Block Components",id:"custom-block-components",children:[]},{value:"Defining custom block components",id:"defining-custom-block-components",children:[]},{value:"Recommendations and other notes",id:"recommendations-and-other-notes",children:[]}],l={rightToc:s};function p(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(i.b)("wrapper",Object(o.a)({},l,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("p",null,"Draft is designed to solve problems for straightforward rich text interfaces\nlike comments and chat messages, but it also powers richer editor experiences\nlike ",Object(i.b)("a",Object(o.a)({parentName:"p"},{href:"https://www.facebook.com/notes/"}),"Facebook Notes"),"."),Object(i.b)("p",null,"Users can embed images within their Notes, either loading from their existing\nFacebook photos or by uploading new images from the desktop. To that end,\nthe Draft framework supports custom rendering at the block level, to render\ncontent like rich media in place of plain text."),Object(i.b)("p",null,"The ",Object(i.b)("a",Object(o.a)({parentName:"p"},{href:"https://github.com/facebook/draft-js/tree/master/examples/draft-0-10-0/tex"}),"TeX editor"),"\nin the Draft repository provides a live example of custom block rendering, with\nTeX syntax translated on the fly into editable embedded formula rendering via the\n",Object(i.b)("a",Object(o.a)({parentName:"p"},{href:"https://khan.github.io/KaTeX/"}),"KaTeX library"),"."),Object(i.b)("p",null,"A ",Object(i.b)("a",Object(o.a)({parentName:"p"},{href:"https://github.com/facebook/draft-js/tree/master/examples/draft-0-10-0/media"}),"media example")," is also\navailable, which showcases custom block rendering of audio, image, and video."),Object(i.b)("p",null,"By using a custom block renderer, it is possible to introduce complex rich\ninteractions within the frame of your editor."),Object(i.b)("h2",{id:"custom-block-components"},"Custom Block Components"),Object(i.b)("p",null,"Within the ",Object(i.b)("inlineCode",{parentName:"p"},"Editor")," component, one may specify the ",Object(i.b)("inlineCode",{parentName:"p"},"blockRendererFn")," prop.\nThis prop function allows a higher-level component to define custom React\nrendering for ",Object(i.b)("inlineCode",{parentName:"p"},"ContentBlock")," objects, based on block type, text, or other\ncriteria."),Object(i.b)("p",null,"For instance, we may wish to render ",Object(i.b)("inlineCode",{parentName:"p"},"ContentBlock")," objects of type ",Object(i.b)("inlineCode",{parentName:"p"},"'atomic'"),"\nusing a custom ",Object(i.b)("inlineCode",{parentName:"p"},"MediaComponent"),"."),Object(i.b)("pre",null,Object(i.b)("code",Object(o.a)({parentName:"pre"},{className:"language-js"}),"function myBlockRenderer(contentBlock) {\n  const type = contentBlock.getType();\n  if (type === 'atomic') {\n    return {\n      component: MediaComponent,\n      editable: false,\n      props: {\n        foo: 'bar',\n      },\n    };\n  }\n}\n\n// Then...\nimport {Editor} from 'draft-js';\nclass EditorWithMedia extends React.Component {\n  ...\n  render() {\n    return <Editor ... blockRendererFn={myBlockRenderer} />;\n  }\n}\n")),Object(i.b)("p",null,"If no custom renderer object is returned by the ",Object(i.b)("inlineCode",{parentName:"p"},"blockRendererFn")," function,\n",Object(i.b)("inlineCode",{parentName:"p"},"Editor")," will render the default ",Object(i.b)("inlineCode",{parentName:"p"},"EditorBlock")," text block component."),Object(i.b)("p",null,"The ",Object(i.b)("inlineCode",{parentName:"p"},"component")," property defines the component to be used, while the optional\n",Object(i.b)("inlineCode",{parentName:"p"},"props")," object includes props that will be passed through to the rendered\ncustom component via the ",Object(i.b)("inlineCode",{parentName:"p"},"props.blockProps")," sub property object. In addition,\nthe optional ",Object(i.b)("inlineCode",{parentName:"p"},"editable")," property determines whether the custom component is\n",Object(i.b)("inlineCode",{parentName:"p"},"contentEditable"),"."),Object(i.b)("p",null,"It is strongly recommended that you use ",Object(i.b)("inlineCode",{parentName:"p"},"editable: false")," if your custom\ncomponent will not contain text."),Object(i.b)("p",null,"If your component contains text as provided by your ",Object(i.b)("inlineCode",{parentName:"p"},"ContentState"),", your custom\ncomponent should compose an ",Object(i.b)("inlineCode",{parentName:"p"},"EditorBlock")," component. This will allow the\nDraft framework to properly maintain cursor behavior within your contents."),Object(i.b)("p",null,"By defining this function within the context of a higher-level component,\nthe props for this custom component may be bound to that component, allowing\ninstance methods for custom component props."),Object(i.b)("h2",{id:"defining-custom-block-components"},"Defining custom block components"),Object(i.b)("p",null,"Within ",Object(i.b)("inlineCode",{parentName:"p"},"MediaComponent"),", the most likely use case is that you will want to\nretrieve entity metadata to render your custom block. You may apply an entity\nkey to the text within a ",Object(i.b)("inlineCode",{parentName:"p"},"'atomic'")," block during ",Object(i.b)("inlineCode",{parentName:"p"},"EditorState")," management,\nthen retrieve the metadata for that key in your custom component ",Object(i.b)("inlineCode",{parentName:"p"},"render()"),"\ncode."),Object(i.b)("pre",null,Object(i.b)("code",Object(o.a)({parentName:"pre"},{className:"language-js"}),"class MediaComponent extends React.Component {\n  render() {\n    const {block, contentState} = this.props;\n    const {foo} = this.props.blockProps;\n    const data = contentState.getEntity(block.getEntityAt(0)).getData();\n    // Return a <figure> or some other content using this data.\n  }\n}\n")),Object(i.b)("p",null,"The ",Object(i.b)("inlineCode",{parentName:"p"},"ContentBlock")," object and the ",Object(i.b)("inlineCode",{parentName:"p"},"ContentState")," record are made available\nwithin the custom component, along with the props defined at the top level. By\nextracting entity information from the ",Object(i.b)("inlineCode",{parentName:"p"},"ContentBlock")," and the ",Object(i.b)("inlineCode",{parentName:"p"},"Entity")," map, you\ncan obtain the metadata required to render your custom component."),Object(i.b)("p",null,Object(i.b)("em",{parentName:"p"},"Retrieving the entity from the block is admittedly a bit of an awkward API,\nand is worth revisiting.")),Object(i.b)("h2",{id:"recommendations-and-other-notes"},"Recommendations and other notes"),Object(i.b)("p",null,"If your custom block renderer requires mouse interaction, it is often wise\nto temporarily set your ",Object(i.b)("inlineCode",{parentName:"p"},"Editor")," to ",Object(i.b)("inlineCode",{parentName:"p"},"readOnly={true}")," during this\ninteraction. In this way, the user does not trigger any selection changes within\nthe editor while interacting with the custom block. This should not be a problem\nwith respect to editor behavior, since interacting with your custom block\ncomponent is most likely mutually exclusive from text changes within the editor."),Object(i.b)("p",null,"The recommendation above is especially important for custom block renderers\nthat involve text input, like the TeX editor example."),Object(i.b)("p",null,"It is also worth noting that within the Facebook Notes editor, we have not\ntried to perform any specific SelectionState rendering or management on embedded\nmedia, such as rendering a highlight on an embedded photo when selecting it.\nThis is in part because of the rich interaction provided on the media\nitself, with resize handles and other controls exposed to mouse behavior."),Object(i.b)("p",null,"Since an engineer using Draft has full awareness of the selection state\nof the editor and full control over native Selection APIs, it would be possible\nto build selection behavior on static embedded media if desired. So far, though,\nwe have not tried to solve this at Facebook, so we have not packaged solutions\nfor this use case into the Draft project at this time."))}p.isMDXComponent=!0},147:function(e,t,n){"use strict";n.d(t,"a",(function(){return d})),n.d(t,"b",(function(){return u}));var o=n(0),r=n.n(o);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},i=Object.keys(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=r.a.createContext({}),p=function(e){var t=r.a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},d=function(e){var t=p(e.components);return r.a.createElement(l.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},m=r.a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,a=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),d=p(n),m=o,u=d["".concat(a,".").concat(m)]||d[m]||b[m]||i;return n?r.a.createElement(u,c(c({ref:t},l),{},{components:n})):r.a.createElement(u,c({ref:t},l))}));function u(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,a=new Array(i);a[0]=m;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:o,a[1]=c;for(var l=2;l<i;l++)a[l]=n[l];return r.a.createElement.apply(null,a)}return r.a.createElement.apply(null,n)}m.displayName="MDXCreateElement"}}]);