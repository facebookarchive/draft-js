# Changelog

Notable changes to Draft.js will be documented in this file.

Changes to `src` are live in production on facebook.com at the time of release.

## 0.11.4 (January 7th, 2020)

### Added
* Add Section and Article to DefaultBlockRenderMap (#2212) (Tarun047 in e20f79f)

### Changed
* Add rules to .flowconfig for flow strict rules (#2288) (Kevin Chavez in f223799)
* Update website's yarn version to 0.11.3 (Kevin Chavez in efcaf42)
* Prettify docs files (#2275) (Yangshun Tay in 6fc9964)
* Remove Jest auto mocking (#2279) (Yangshun Tay in 817e371)
* Add myself to get TravisCI emails (Kevin Chavez in f4167fe)
* Unit tests for isHTMLBRElement (Claudio Procida in bb81765)
* Remove niveditc from Travis CI email (Nivedita Chopra in 7721805)
* Create CNAME (#2276) (Yangshun Tay in 92680be)
* Upgrade to Docusaurus 2 (#2268) (Yangshun Tay in 5b10191)
* move alex to dev dependencies (#2272) (Ilya in b889d5d)
* Improve docs syntax and formatting (#2267) (Yangshun Tay in 9b4a628)

### Fixed
* fix(chore): fixes webpack-stream error with missing catch var declaration (#2291) (Claudio Procida in 4252469)
* IE could not display composer when opening or creating a new group chat from the chat create view (Jainil Parekh in 64b51df)
* Fix DOMObserver mutation data for IE (#2285) (Jainil Parekh in afb708f)
* Added tests and fixed IE IndexSizeError trying to get a range from a selection when there is not one (#2271) (Lauren Wyatt in aa55de2)
* Fix scroll behavior when node has tab chars (#2256) (cdr in 5d37c03)
* Fix docs links in readme (#2284) (Lucas Cordeiro in 3b6d231)
* Fix isHTMLBRElement test (#2278) (Yangshun Tay in 0603772)
* Fix `isHTMLBRElement` check (Jack Armstrong in e869fcb)
* Fix typing Chinese in Edge (#2082) (#2088) (Robbert Brak in 8c0727e)
* Fix Travis website deployment (#2274) (Yangshun Tay in 861aab8)
* getEntityKeyForSelection.js (Kevin Chavez in c07a404)

## 0.11.3 (December 2nd, 2019)

### Added
* Take over enhancements to render Draft.js in an iframe (#1938) (Claudio Procida in dceddf5)
* Implement click listener for editor wrapper (#2230) (Max Vyz in 8f77aa3)
* Add linting for insensitive and inconsiderate language (#2223) (Claudio Procida in 5dd99d3)

### Changed
* Updates to Prettier 1.19.1 (#2265) (Claudio Procida in abcbe20)
* Bump mixin-deep from 1.3.1 to 1.3.2 in /examples/draft-0-10-0/universal (#2259) (dependabot[bot] in 37d281b)
* Upgrade dependencies in /website (#2263) (Kevin Chavez in 0b57720)
* Update dependencies in examples/draft-0-10-0/universal (#2257) (Kevin Chavez in ae2dd14)
* Update dependencies in examples/draft-0-10-0/playground (#2258) (Kevin Chavez in 11bc5d8)
* Prettify files rest of non-intern files in html/ (George Zahariev in 6217dc8)
* add flow declaration in editOnBeforeInput-test.js (Frank Thompson in 0601090)
* Bump lodash.merge from 4.6.1 to 4.6.2 in /website (#2241) (dependabot[bot] in 177db5e)
* Defaulting to createEmpty if block map is empty in createWithContent (Fixes issue #2226) (#2240) (David Fuentes in c42662e)
* Bump handlebars from 4.1.1 to 4.5.1 in /examples/draft-0-10-0/playground (#2242) (dependabot[bot] in 2a761af)
* Suppress non-synced files in www for 0.111 (Jordan Brown in 4bca140)
* Upgrade more deps. (#2239) (Kevin Chavez in a477e83)
* Bump lodash.template from 4.4.0 to 4.5.0 in /examples/draft-0-10-0/playground (#2236) (dependabot[bot] in 0e03745)
* Bump mixin-deep from 1.3.1 to 1.3.2 in /website (#2234) (dependabot[bot] in 78f20cc)
* Bump lodash from 4.17.11 to 4.17.15 in /website (#2233) (dependabot[bot] in da1ab7c)
* Updated browser icons in README (#2238) (SuNNjek in 6ed6ed4)
* Bump mixin-deep from 1.3.1 to 1.3.2 in /examples/draft-0-10-0/playground (#2235) (dependabot[bot] in 2744ff7)
* Upgrade 8 dependencies (including jest, @babel/core, etc). (#2237) (Kevin Chavez in 46103ac)
* Upgrades ESLint and related plugins/configs. (#2231) (Kevin Chavez in 53d2a63)

### Fixed
* fix wrong property access in convertFromHTMLToContentBlocks (Frank Thompson in 7d26fab)
* Fix draftjs type error for event (Jack Armstrong in e7ae2e7)
* fix decorator handling in editOnBeforeInput (Frank Thompson in 1452b87)
* fixes #304, kudos to @andpor (#2197) (Ante Beslic in 2908035)
* Fix playground example import (#2220) (Ryan Lee in 778e88d)
* Fix React warnings (#2221) (Alan Norbauer in 2595016)

### Meta
* deploy v112 to www (Daniel Sainati in ae542b7)

## 0.11.2 (September 30th, 2019)

### Changed

* Upgrade to Flow strict-local (generatedunixname89002005287564 in 0c92bf7)
* chore(website): updates stylesheet for 0.11.1 (#2188) (Claudio Procida in 543df66)
* Prepare 0.11.1 (#2186) (Claudio Procida in 3adf593)

### Fixed

* fix(selection): Returns previous selection if either leaf is null (#2189) (Claudio Procida in fe68e43)

## 0.11.1 (September 19th, 2019)

### Added
* Support post processor on paste entities. (Tee Xie in 3043573)
* Adding 'preserveSelectionOnBlur' prop (#2128) (Matthew Holloway in db792ef)

### Changed
* Reaping draft_segmented_entities_behavior (Mohamed Moussa in cd4adaa)
* Make insertIntoList strict-local (Kevin Chavez in db64f93)
* Adopt Contributor Covenant (Paul O'Shannessy in 2c61167)
* Flowify editOnKeyDown.js (Kevin Chavez in 8473e41)
* (Flowify) decodeInlineStyleRanges.js (Kevin Chavez in 20a619c)
* Flowify editOnInput.js (Kevin Chavez in 594a14f)
* Flowify editOnBlur.js (Kevin Chavez in 6972278)
* updated function description for onEditInput event handler function (#2132) (Mukesh Soni in 14349f1)
* updated hastext method to not account for zero space width chars (#2163) (Ajith V in 85aa3a3)
* Encode non-ASCII characters in all snapshot tests (Daniel Lo Nigro in 734bd82)
* @flow -> @flow-strict for html/shared (Runjie Guan in 0375c0e)
* Revert D16421104: [rfc][draft-js] catch errors when encoding entity map (Frank Thompson in 8e9cabf)
* catch errors when encoding entity map (Frank Thompson in 259d122)
* Revert D16362778: [rfc][draftjs] catch errors when encoding entity map (Frank Thompson in 96e7f25)
* catch errors when encoding entity map (Frank Thompson in c0e911c)
* Flow-type DataTransfer.js (Kevin Chavez in ed09f78)
* All these modules can actually be strict (Kevin Chavez in bc716b2)

### Fixed
* convertFromHTML breaks after converting \n string, issue #1822 (#1823) (Sannikov in 9246cc7)
* Fixes HTML importer to make image entity immutable (#2184) (Claudio Procida in b858f43)
* Fixing js example and cleaning up one sentence (#2172) (Liz LeCrone in 819f58c)
* Reaping draft_killswitch_allow_nontextnodes (generatedunixname89002005287564 in 0e2e9a7)
* Fix for workchat composer cursor jumping (Jainil Parekh in aed35d2)
* Fix various grammatical errors (#2158) (Jordan Lee in 1ff8c8c)
* Composer: Not assuming element has leaves (Nitzan Raz in ce8bdd0)
* Update jsfiddle links with recent versions of the Draft and React (#2145) (Günay Mert Karadoğan in 22b7599)
* Changes reference to BSD license to MIT (#2130) (claudiopro in 4064cae)
* Updates CHANGELOG for v0.11.0 (#2052) (Claudio Procida in 973f7ff)
* Fixed a bug causing block data being over-written when pasted. (Tee Xie in 82e2135)
* Merge pull request #2113 from danielo515/patch-1 (Claudio Procida in 0e88544)
* Update ShipIt Sync (Claudio Procida in 0f138d1)

## 0.11.0 (July 9th, 2019)

### Added
* Adds support for nullish coalescing operator (#2076) (Claudio Procida in 96c7221)
* Add import statements for hooks-example in README (#2075) (Bennett in 943f6dc)
* Unit tests for DraftStringKey (Claudio Procida in 978ad6b)
* Adding Hooks in docs (#2004) (Charles ⚡ in f9f5fd6)
* Exports `isSoftNewlineEvent` as static method of `KeyBindingUtil` (Kevin Hawkinson in aede823)
* Add live demo to README.md (#1907) (PLa in 6db3726)
* added highlighting (`<mark>` tag) to draft js html to content block converter (Isaiah Solomon in 37f2f2a)
* Relicense under MIT and remove patents grant (#1967) (Claudio Procida in 585af35)
* Ctrl-K at end of line should delete newline (Sophie Alpert in 6455493)
* Add type annotations to `React.Component` classes in html/shared (Paco Estevez Garcia in 2e3a181)
* Add return type annotation to `addEmojiInput` (Sam Goldman in 280d242)
* Unstyle empty list item on Enter key (#769) (Eric Biewener in a0267a9)
* Allow Option+Space to be handled on OSX Chrome (#1254) (Colin Jeanne in 022bcf7)
* Added information about nature of block keys (#1892) (Prateek Nayak in 8ad59c4)
* Add flow to files (Nivedita Chopra in d87e093)
* Docs: add explicit deprecation notes to Entity methods (#1787) (vinogradov in cc6b897)
* Clarifies editor example, changes height to min-height (#1889) (Claudio Procida in 67d6fda)
* Improves editor overview example with min height and border (#1887) (Claudio Procida in b8862fd)
* Adds iframed editor example (#1879) (Claudio Procida in 8d5cbbe)
* Perform untab on backspace for nested items (Nivedita Chopra in 0688fa3)
* Support custom block rendering (Nivedita Chopra in fbe2267)
* Updates favicons and launcher icons with Draftjs logo (#1872) (Claudio Procida in d9c9d40)
* Merge successive non-leaf blocks resulting from tab (Nivedita Chopra in fbd18ce)
* Merge successive non-leaf blocks resulting from untab (Nivedita Chopra in 36e588a)
* Unnest the first non-leaf child (Nivedita Chopra in 0cb3804)
* Implement untab operations (Nivedita Chopra in 77e6844)
* added favicon (#1871) (saranshkataria in b9dd551)
* Add Algolia search (#1864) (Yangshun Tay in 1bf2145)
* `KeyBindingUtil`: add `usesMacOSHeuristics` method (#869) (William Boman in 98e7730)
* Export `RawDraftContentState` publicly (#1841) (Cédric Messiant in c6ff39d)
* Implement moveChildUp operation for untab (Nivedita Chopra in e145a2a)
* Allow insertion at a specific point for updateParentChild (Nivedita Chopra in 6b83312)
* Implement onTab in NestedRichTextEditorUtil (Nivedita Chopra in 8d3cfba)
* Add utilty methods for creating a new parent & updating node to become sibling's child (Nivedita Chopra in 6f73657)
* Add utility methods for parent-child & sibling pointer updates (Nivedita Chopra in 0cb80b7)
* Warn visibly when extensions break Draft (Sophie Alpert in c0fb6a8)
* Add data structure invariants for tree data (Nivedita Chopra in ad4f64f)
* Add Draft.js logo to header (Joel Marcey in 0ce20bc)
* Enable deprecated-type rule in www (George Zahariev in dc9fa27)
* Add different counter-style for ordered lists based on their depth (Noam Elboim in d2a3ae8)
* Finish modernizing `convertFromHTMLToContentBlocks` - max nesting bug fix (Noam Elboim in 06c0ee6)
* Finish modernizing `convertFromHTMLToContentBlocks` - upgrade draft-js internals (Noam Elboim in d24b802)
* Finish modernizing `convertFromHTMLToContentBlocks` - nesting bug fix (Noam Elboim in 49bdd85)
* Add docs about `DraftDecoratorComponentProps` (Flarnie Marchan in 7fddfcd)
* Add list block `onTab` test (il kwon Sim in 102701c)
* Integrating experiments on playground (mitermayer in b6ae887)
* Add clarifying comments to `getRemovalRange` (Flarnie Marchan in 28cb4a3)
* Adding Rich Editor to the playground (mitermayer in 227d125)
* Allow indentation beyond one level deeper than block above. (Eric Biewener in 73e5a9c)
* Enabling a GK manager for the plaground (mitermayer in 8eea2c2)
* Bundle size stats (Alan in 5ffce3d)
* Clear block type when pressing backspace (Sophie Alpert in 6a1e2b0)
* added favicon to website (Michael Baldwin in 6cc2d85)
* expose start/end positions of a decorated component within a contentBlock (Matthew Mans in 3a3d34b)
* Add draft js playground (Julian Krispel-Samsel in 18fdffb)


### Changed
* Moves test for legacy convertFromHTMLToContentBlocks out of OSS repo (Claudio Procida in 5eb49b1)
* Removes legacy convertFromHTMLToContentBlocks from OSS repo (Claudio Procida in a7d955e)
* Renames convertFromHTMLToContentBlocks2 to convertFromHTMLToContentBlocks (Claudio Procida in d08399b)
* Removes all resolved uses of convertFromHTMLToContentBlocks_DEPRECATED (Claudio Procida in ec43403)
* draft-js: clean up useless divs from HTML when pasting content (Daniel Quadros de Miranda in 0f5427a)
* docs: remove --save flag (#2008) (Mounish Sai in f92d4b1)
* Rename DraftEditorBlock to EditorBlock (#2002) (Umang Galaiya in 8514b57)
* Removes unnecessary eslint disable rules (Claudio Procida in 1ba0764)
* Upgrades react-scripts to ^1.1.5 (#2042) (Claudio Procida in 71ef373)
* Upgrades docusaurus (#2039) (Claudio Procida in 21753fa)
* Removes unused gulp-browserify-thin (#2032) (Claudio Procida in fc3549a)
* Upgrades @babel/core, babel-preset-fbjs, and gulp-util (#2028) (Claudio Procida in 68196f6)
* Deploy 0.94 to www (George Zahariev in 6183935)
* deploy 0.93 (Daniel Sainati in 3400cda)
* Normalize case in `convertFromHTMLToContentBlocks` variable names (Claudio Procida in b4183b1)
* Cleans up and refreshes generated website resources (#1998) (Claudio Procida in bd799f5)
* Upgrades Draft to React 16.8 ⚛️ (#1996) (claudiopro in a97ed7e)
* Adds email notifications for TravisCI builds (#1990) (Claudio Procida in a4cc10d)
* Upgrades flow-bin to 0.91.0 and mutes fbjs joinClasses error � (#1989) (Claudio Procida in e8a281c)
* Update to 0.92.0 (Paco Estevez Garcia in c022efb)
* Update webpack-dev-server & babel version in TeX examples (#1981) (Nivedita Chopra in a3a3585)
* Remove `componentWillReceiveProps` usages in examples (#1952) (Deep in 363f66e)
* Upgrade to Gulp 4 (fixes build) (#1957) (Kevin Chavez in 85ad25c)
* Kill permanent permanently. (Andrey Sukhachev in 236270a)
* Deploy Flow v0.85 to www (Sam Goldman in 744af91)
* flow 0.84 www deploy (Avik Chaudhuri in 59dd225)
* Bring back the ariaOwneeID prop. (#1883) (Andrea Fercia in ce7f677)
* Add Node.js version 10 for CI (#1909) (noelyoo in 4a9a6a8)
* Refactor buffer constructor (#1912) (noelyoo in 11d7379)
* Update Advanced-Topics-Inline-Styles.md (#1902) (Yao Bin in 0b7ec2a)
* Remove flow typing for DraftEntity mock (#1891) (Nivedita Chopra in 75aa88a)
* Flow strict for some files (Nivedita Chopra in bbd3ef1)
* Update documentation concerning immutable updates (#1884) (Connor Jennings in c336ae2)
* Update docs to ensure kebab menu shows subheads (#1885) (Connor Jennings in 2ff0c7e)
* Support npm version 6.x (#1866) (Yangshun Tay in 724fdc6)
* Remove unused var in BlockTree (#1859) (Nivedita Chopra in 0a45fcd)
* Update jest version to latest (#1858) (Nivedita Chopra in b962974)
* Update Advanced-Topics-Entities.md (#1767) (alaoui abdellah in d40ff40)
* Update link to code of conduct (#1855) (Nivedita Chopra in 8c373b6)
* var => const on remaining file (Nivedita Chopra in 022798c)
* Update prettier version to 1.13.6 (#1854) (Nivedita Chopra in e2c24cf)
* Remove Flow Strict Local from files with future sketchy-null errors after bug fix (George Zahariev in c5b785a)
* Remove non-leaf blocks in tree => raw conversion (Nivedita Chopra in f5b2acb)
* Update Docusaurus to 1.3.3 (#1797) (Yangshun Tay in d6a0ac0)
* modify docs overview url (#1802) (Shubham Tiwari in 9f86efb)
* v0.79.1 in www (Panagiotis Vekris in 93a90a9)
* Remove gating on draft_non_native_insertion_forces_selection (Sophie Alpert in 1a5b27a)
* 5/n Disable forward delete across blocks when nested blocks are enabled (Flarnie Marchan in 0600549)
* 3/n Splitting PR #1828: updates to the Rich Text Editor example (#1828) (mitermayer in e98e91e)
* 2/n splitting PR #1828: updating `removeRangeFromContentState` (#1828) (mitermayer in a399e43)
* 1/n splitting PR #1828: Initial forking of `RichTextEditorUtil` (#1828) (mitermayer in 328ddc6)
* Warn if `moveSelectionForward/Backward` called with non-collapsed selection (Flarnie Marchan in 99eca6b)
* codemod jasmine -> jest in html/shared (Aaron Abramov in 7f9299d)
* Remove logo from background circle (#1800) (Paul O’Shannessy in 47ae65a)
* var => const on test files (Nivedita Chopra in 0f58b64)
* Migrate to Docusaurus - Attempt #2 (Noam Elboim in 710919b)
* Remove old decorator fingerprint logic (Sophie Alpert in b2f6ed0)
* Use strict-local in as many files as possible (Miorel Palii in 3798902)
* Pass eventTimeStamp to `handleKeyPress` to allow tracking (Flarnie Marchan in 0ecf9a6)
* Pass synthetic event to `handleBeforeInput` callback (Flarnie Marchan in b86b5ce)
* `React.Element<any>` / `React.Element<*>` -> `React.Node` as much as possible (Miorel Palii in a1f4593)
* Change remaining vars to let/const (Nivedita Chopra in 8de2db9)
* Removed `@providesModule` tags and dependencies from draft-js (Rubén Norte in ee2e9c8)
* Add `@providesModule` back to draft-js modules (Ashley Watkins in 05b2b4c)
* Add common Flow type for decorator components (Ashley Watkins in 8000486)
* Add `@providesModule` back to draft-js modules (Rubén Norte in 4c4465f)
* Removed `@providesModule` tag from non-generated files in html/shared directories (1/1) (Rubén Norte in 293f262)
* 2/n Remove last vestiges of cWU (Flarnie Marchan in e954091)
* 1/n Move `blockSelect` flag out of cWU (Flarnie Marchan in 0f6199d)
* Upgrade to Flow v0.68.0 (Sam Goldman in a99f51e)
* Strict-ify files that can be strict-ified with no additional changes (Miorel Palii in 22f9c52)
* rename-unsafe-lifecycles (Brian Vaughn in 8b3e8c9)
* Refactor `convertFromHTMLtoContentBlocks` (Nicolas Champsavoir in 732b69d)
* Making gkx overwrittable (mitermayer in 7495adf)
* 2/n Do update `blockSelectEvents` flag, during render (Flarnie Marchan in e571268)
* 1/n remove GK on `flushSync` (Flarnie Marchan in 4241f43)
* Playground - Making sure blockMap should always visible by default (mitermayer in 7eb2a50)
* Move uglifyjs-webpack-plugin to devDependencies (Thibaud Colas in 4de1345)
* Making a more sane .gitignore (mitermayer in f4bc3a7)
* Examples cleanup (Ken Hibino in 67f3586)
* Ensure selection collapses if user tries to replace with matching text (Brian Ng in 084bdb6)
* Move `_latestEditorState` assignment back to commit phase (Sophie Alpert in 04c2b9c)
* Remove Node 6 from engines list in package.json (Thibaud Colas in 584d849)
* Update `_latestEditorState` in render too (Flarnie Marchan in 90a8f22)
* Widen logging and add stack trace for IE selection bug (Flarnie Marchan in a6317e6)
* Match block and inline examples for consistency. (cbeninati in e65a8e6)
* Bundle size stats + Misc changes (Alan Norbauer in 0a1f981)
* Remove `componentWillUpdate` under GK (Flarnie Marchan in 7885959)
* try disabling 'blockSelectEvents' flag (Flarnie Marchan in d144883)
* Update site footer from 2017 -> 2018 (Michael Chen in 558352c)
* Make the Flow type of `CompositeDraftDecorator`'s constructor more strict (Steven Luscher in a894030)
* Deprecated the coarse `onArrowUp` et al key handler props on `DraftEditor.react` to make it possible to produce editor commands from these keys (Steven Luscher in dc5ca7f)
* Wrap Draft handlers in `flushControlled` instead of `flushSync` (Andrew Clark in cda13cb)
* Update docs/APIReference-Editor.md (Sai Kishore Komanduri in 27a5f10)
* Bumping internal flow version (mitermayer in 342a51a)
* Switch from `DraftFeatureFlags` to gkx() (Sophie Alpert in 07eb9c4)
* Add `flushSync` to Draft.js for *only* GK folks (Flarnie Marchan in 26040e5)

### Fixed
* Fixed drag and drop `.length` error (#2117) (job in 2487e7d)
* Fix broken id anchor (#2095) (Sajad Torkamani in eddcc55)
* Typo corrected - Overview.md (#2089) (Jonathan Erlich in 87a812d)
* fix: set to nested list items to right depth (Kevin Li in 12c4480)
* fix(styles): avoid permanently accumulating attribute styles (Kevin Li in 7cfb055)
* Fixes runtime error when cutting empty selection at the end of the content (Claudio Procida in 23fc70f)
* Fixing major Android editing issues (#2035) (Fabio M. Costa in 634bd29)
* Fix broken link in Overview.md (#2062) (seojeee in e8e0bcf)
* Fix failing `DraftStringKey` test (#2064) (Claudio Procida in fe4e266)
* Fixes require order lint issues /2 (Claudio Procida in 76e121e)
* Fixes require order lint issues (Claudio Procida in e2c5357)
* Fix the issue of draft JS does not do copy and paste correctly with custom entities. (Tee Xie in d09ef3e)
* fix typo in README.md (#2055) (Tanner Eustice in 75a89ff)
* rename `*.test.js` to `*-test.js` to match naming convention (Aaron Abramov in dc58df8)
* Convert some of draftjs' `ReactDOM.findDOMNode` to refs (#2051) (Dennis Wilkins in 1fae34f)
* Correct warning condition (#2049) (Ben Gardner in ffd8f59)
* Fix npm run dev (#2030) (Fabio M. Costa in 3c01ef6)
* Specify correct type of `joinClasses` (George Zahariev in 7b9a7e1)
* Restores flow error suppression for fbjs@1.0.0 (#2014) (Claudio Procida in 6a26a82)
* Fix leading line feed conversion (Guillaume Aubert in 5081c87)
* Handles `<br>` tags in refactored HTML converter (Claudio Procida in fdf63aa)
* Typo fix in code comment (#1997) (Deniz Susman in e84e757)
* Fix bad destructuring when content block key has a `-` (#1995) (Jan Karlo Dela Cruz in c21a9f7)
* Fix typo in code comment for DraftEditor (#1991) (Deniz Susman in 7167210)
* Fixes lint warnings in `convertFromHTMLToContentBlocks2` tests (Claudio Procida in e942ee9)
* Update fbjs to 1.0.0 to fix ReDos Vulnerability (#1978) (Anthony Muscat in 9b2a366)
* Normalize copyright headers to BSD + patents grant and drop the year (#1964) (Claudio Procida in 642aa11)
* Fixes flow error (#1962) (Claudio Procida in fb7882b)
* Remove unused suppression comments from www as of v0.89 (Gabe Levi in 8dd6dda)
* Add correct type annotations to DraftEditor.react.js (Paco Estevez Garcia in 83edf02)
* Fix `$FlowFixMe` type not working for CI builds of draft-js (Paco Estevez Garcia in 81f92ee)
* Annotate exports codemod on html/shared (Paco Estevez Garcia in 7cb10f9)
* Revert D13097194: [codemod][types-first] Add type annotations to html/shared (Craig Phillips in 010fce7)
* Add type annotations to html/shared (Paco Estevez Garcia in 6f4102d)
* Fix all 'curly' violations (Paul O'Shannessy in ab199ef)
* Fix tex and universal examples crash because of different React versions (#1756) (#1931) (Thibaud Colas in 7dddded)
* Fix typo (#1913) (noelyoo in 1d3c77f)
* Fixes some drag-n-drop problems (#1599) (Denis Oblogin in 20a0f73)
* Bug/1668 (#1691) (Alexis H in 1d2d854)
* Fix SelectionState’s `hasEdgeWithin` (#1811) (Andrew Branch in 7666e95)
* Fix drop issue (#1725) (LaySent in 800d6b5)
* fixes #868 (#1878) (Julian Krispel in 6ba124c)
* Fix check for tree blocks (Nivedita Chopra in 690f7ef)
* Fix bug in merge blocks (Nivedita Chopra in 7daa87e)
* Fix raw to tree conversion (Nivedita Chopra in 8ac1922)
* Bug Fix - Remove deleted block from its parent's children (Nivedita Chopra in 02e0e00)
* Fix small typo (#1865) (Valentin Hervieu in 8bb9c6c)
* Fix paste handling for images with `role="presentation"` (Jainil Parekh in 6df3808)
* Minor fix in entities docs (#1534) (Alastair Hole in 9f0d115)
* Fixes incorrect docs, see #1497 (#1837) (Matt Greenfield in a18b6fe)
* Fixes warning for missing keys in example color controls (#1853) (Claudio Procida in 4a5ad07)
* Fix Lint errors for type imports (Nivedita Chopra in e6c693c)
* Fix Travis breakage caused due to unimported `idx` module (Nivedita Chopra in 3306ddf)
* Fix `DraftTreeAdapter` to respect the tree invariants (Nivedita Chopra in 39be488)
* Inline call to `gkx` to combat fatal in `ContentState` (Steven Luscher in a6c9ffd)
* Handle ReactDOM type errors (Ashley Watkins in 9130859)
* Fix tree invariants test (#1836) (Nivedita Chopra in 05208a8)
* Fix unlucky failures in character replacement (Sophie Alpert in ae25b8f)
* Regression test for bug with nested block and deleting (Flarnie Marchan in 2d7ad18)
* Tree Data - Fix for backspace at the start of a nested block (Nivedita Chopra in cf48f77)
* Tree Data - Don't update pointers if range is within the same block (Nivedita Chopra in f3d3490)
* Fix Draft input cursor jumping to the end (Dan Abramov in 37dadd3)
* Fix tests to be independent on the implementation of invariant (Matthew McKeen in 81cc54b)
* Re-apply order-requires linter on html/shared/ (Dave Alongi in 0bb8d76)
* Auto-fix `prefer-const` ESLint rule (3/n) (Miorel Palii in bf1a028)
* Auto-fix all auto-fixable eqeqeq problems (Miorel Palii in eea70f4)
* Fixing Docusaurus migration issues (Noam Elboim in 72ad814)
* Fix block tree before/after comparison (Sophie Alpert in fa88ee1)
* Fixed license, Flow and lint issues in draft-js (Rubén Norte in 3e9ff8e)
* Actually for real fix the flow type of decorator props (Flarnie Marchan in 7e1a107)
* Workaround for BlockNode variance issue caused by flow transform (#1621) (Bob Ippolito in 1d77500)
* Revert "rename-unsafe-lifecycles" (mitermayer in 6eec8f9)
* Fix typo (Aditya Bhardwaj in 6ef6c66)
* Website: Fixed code highlight (Marcelo Jorge Vieira in 04c667c)
* Fixing tex example (Guilherme Miranda in 900ef76)
* Fix typo (Thomas Broadley in 35b3605)
* Fixing master (mitermayer in 4c12ead)
* Fix Linux keyboard shortcuts (Thomas Nardone in f6fbf1c)
* fix typo in changelog (Flarnie Marchan in 93bc209)

### Meta
* Add issue triage guidelines to CONTRIBUTING.md (#1896) (Nivedita Chopra in 7df9eb9)
* Add meeting notes for 10/12 (#1901) (Nivedita Chopra in 9a96ab0)
* Add meeting notes from 9/7 (#1862) (Nivedita Chopra in b8ea228)
* Change oncall to draft_js (Nivedita Chopra in fbc8a0c)
* Update biweekly sync meeting notes from February 2018 (Flarnie Marchan in 1ef4044)
* Update weekly meeting notes from Oct. 2017 - Jan. 2018 (Flarnie Marchan in 7017825)


## 0.10.5 (January 19th, 2018)

### Added
* Add support for `ariaDescribedBy` prop, for better a11y. (Suraj Karnati in
  [a6af3e15](https://github.com/facebook/draft-js/commit/a6af3e15120e74c8797c5670f5bb63cb45c49a32))
* Add support for `ariaLabelledBy` prop, for better a11y. ([@jackyho112](https://github.com/jackyho112)
  in [#1519](https://github.com/facebook/draft-js/pull/1519))

### Changed
* Cause editor to break out of code block when user enters two blank lines. (Hanzhi Zhang
  in [548fd5d1](https://github.com/facebook/draft-js/commit/548fd5d1b1c31b7b4c79cd70b101fae69d522b3f))

### Fixed
* Preserve list indentation when copying and pasting from one Draft.js editor
  into another. ([@GordyD](https://github.com/GordyD) in [#1605](https://github.com/facebook/draft-js/pull/1605))
* Fix `cannot read property 'update' of undefined` error that was thrown when
  typing same character into selection that starts with that character. ([@existentialism](https://github.com/existentialism) in
  [#1512](https://github.com/facebook/draft-js/pull/1512))
* Fix `encodeRawBlocks` to handle non-contiguous entities. Entities should
  always be contiguous, and cover one sequential range of characters. However,
  in cases where entityState is corrupted to include non-contiguous entities,
  `encodeRawBlocks` would improperly process the entities in that case. (Frank
  Thompson in [0059dd46](https://github.com/facebook/draft-js/commit/0059dd46f4d23af7d9803316aa93d8deddb5e8ae))
* Updated CSS for DraftEditorPlaceholder to support multiline placeholder (Gaurav Vaish in
  [c38b0285](https://github.com/facebook/draft-js/commit/c38b028513214416d66a3fdf191745dfde04ed2b)
* Fix issue where typing at the end of a link caused the link to continue. (Ian
  Jones in
  [d16833b3](https://github.com/facebook/draft-js/commit/d16833b3dae77ccf13e3af7f5e42c8131b0d1d2c))
* Fix regression of bug where clicking a link caused the focus to move but the
selection state was not cleared, leading to a 'node not found' error.
  ([@flarnie](https://github.com/flarnie)
  in [55316176](https://github.com/facebook/draft-js/commit/553161761903bed7fad971d73e1fe04bb0ff360e))
* Loosen Flow type definition for DraftBlockType to allow user-defined custom
  block types. ([@mitermayer](https://github.com/mitermayer)
  in [#1480](https://github.com/facebook/draft-js/pull/1480))

## 0.10.4 (October 24th, 2017)

### Added
* Expose `onRightArrow` and `onLeftArrow` props to allow handling keyboard
  events when right or left arrow is pressed.
  ([@eessex](https://github.com/eessex)
  in [#1384](https://github.com/facebook/draft-js/pull/1384))
* Expose Draft.css as default CSS export in package.json for use by CSS
  preprocessors. ([@darobin](https://github.com/darobin )
  in [#566](https://github.com/facebook/draft-js/pull/566))

### Changed
* Change 'lookUpwardForInlineStyle' from O(n^2) to O(n), improving performance.
  :) ([@Lemmih](https://github.com/Lemmih)
  in [#1429](https://github.com/facebook/draft-js/pull/1429))

### Fixed
* Fix bug where editors inside draggable parent were broken for Safari.
  ([@mattkrick](https://github.com/mattkrick) in
  [#1326](https://github.com/facebook/draft-js/pull/1326))
* Stop pulling in Enzyme as production dependency. D'oh.
  ([@flarnie](https://github.com/flarnie) in
  [#1415](https://github.com/facebook/draft-js/pull/1415))
* Fix `TypeError: Cannot read property 'nodeType' of undefined` error where
  `anchorNode` was `undefined`.
  ([@tleunen](https://github.com/tleunen) in
  [#1407](https://github.com/facebook/draft-js/pull/1407))
* Fix error thrown when callback tries to `focus` on editor after it has been
  unmounted.  ([@mattkrick](https://github.com/mattkrick) in
  [#1409](https://github.com/facebook/draft-js/pull/1409))
* Fix bug where selecting a single character then typing it doesn't replace it.
  ([@karanjthakkar](https://github.com/karanjthakkar) in
  [#719](https://github.com/facebook/draft-js/pull/719))
* Clear the block type when backspacing at the start of the first block with
  rich text utils.  ([@jvaill](https://github.com/jvaill) in
  [#748](https://github.com/facebook/draft-js/pull/748))

## 0.10.3 (September 28th, 2017)

### Added
* Allow React 16.\* as peer dependency. ([@nikgraf](https://github.com/nikgraf)
  in [#1385](https://github.com/facebook/draft-js/pull/1385))

### Fixed
* Fixed bug where using a custom block type without overriding the default block
  map threw an error. ([@southerncross](https://github.com/southerncross) in
  [#1302](https://github.com/facebook/draft-js/pull/1302))
* Update dependency on `fbjs` to get fix for bug where `focus()` caused
  unexpected scroll ([@flarnie](https://github.com/flarnie) in
  [#1401](https://github.com/facebook/draft-js/pull/1401))

## 0.10.2

### Added
* Added support for `aria-controls` in draft.js ([@jessebeach](https://github.com/jessebeach) in [7f0cab28](https://github.com/facebook/draft-js/commit/7f0cab28386ec4bde8ec6289377bff9e53cd019b))

### Changed
* Change `aria-owns` to `aria-controls` in draft.js. ([@jessebeach](https://github.com/jessebeach) in [7f0cab28](https://github.com/facebook/draft-js/commit/7f0cab28386ec4bde8ec6289377bff9e53cd019b))
  * Deprecates support of `ariaOwns` and `ariaOwneeID` props.
* Deprecate use of `ariaHasPopup` prop in draft.js. `ariaExpanded` should be used instead if an input is showing a dropdown with options.([@jessebeach](https://github.com/jessebeach) in [744e9b4e](https://github.com/facebook/draft-js/commit/744e9b4eb4810797a93c66591fea6f9cac533b4b))
* Pasting an `img` no longer inserts the `src` by default; now inserts image emoji if no decorator is used. ([@aadsm](https://github.com/aadsm) in [0b22d713](https://github.com/facebook/draft-js/commit/0b22d713d556ccc4820850099ad6231493b3f7aa) and [@flarnie](https://github.com/flarnie) in [1378](https://github.com/facebook/draft-js/pull/1378))

### Fixed

* Fix issue where selection state was not cleared on blur and refocus of the
  editor. ([@sophiebits](https://github.com/sophiebits) in
  [19b9b1c5](https://github.com/facebook/draft-js/commit/19b9b1c5007bcb3a4111ea31f8d9a8cda629a1ff))
* Fix issue where pasting code into code block defaulted to plain text, and
  styles were dropped from pasted blocks in general.
  ([@bumbu](https://github.com/bumbu) in
  [e8d10112](https://github.com/facebook/draft-js/commit/e8d101121fb9dd9203a46d899124a7be4b0b2936))
* Fix issue where Flow was not running with some 'import' statements ([@flarnie](https://github.com/flarnie) & [@yuku-t](https://github.com/yuku-t) in [#1263](https://github.com/facebook/draft-js/pull/1262))
* Fix bug where Draft threw when two keys were pressed at same time in React 16 async mode ([@sophiebits](https://github.com/sophiebits) in [1c6a49b8](https://github.com/facebook/draft-js/commit/1c6a49b8801183fe0c29458626c0b5dbe1238e59))
* Fix recent Chrome bug where tab causes error ([@sophiebits](https://github.com/sophiebits) in [5863399a](https://github.com/facebook/draft-js/commit/5863399a3a1bcbbe9b090249504a70496a7af7cc))
* Fix "Refs must have owner" error when multiple copies of React are used ([@mks11](https://github.com/mks11) in [#925](https://github.com/facebook/draft-js/pull/925))
* Fix issue where AT could treat 'return' as submit in Draft ([@jessebeach](https://github.com/jessebeach) in [#1295](https://github.com/facebook/draft-js/pull/1295))
* Don't allow `aria-expanded` to be true unless the aria role is combobox ([@jessebeach](https://github.com/jessebeach) in [3494d45d](https://github.com/facebook/draft-js/commit/3494d45d32b64d6e82e4b3e8fcade6a2b5c6bd46))
* Fix pesky "This Selection object doesn't have any Ranges" bug ([@sophiebits](https://github.com/sophiebits) in [96688e10](https://github.com/facebook/draft-js/commit/96688e10b22a778c76e03009da4b9f3d05eba5f7) and [036e3a84](https://github.com/facebook/draft-js/commit/036e3a848e3593c97f4c3011e1ddc045e128a7af))
* Fix bug where pasting `img` with large data URL source could crash editor ([@aadsm](https://github.com/aadsm) in [0b22d713](https://github.com/facebook/draft-js/commit/0b22d713d556ccc4820850099ad6231493b3f7aa))

## 0.10.1

### Added

* Support UMD in dist output format (#1090)
* Expose textDirectionality prop
* Expose props disabling auto-correct, auto-complete, auto-capitalize
* Add `editorKey` prop for SSR
* Pass `block` to `customStyleFn` callback
* Added `moveAtomicBlock` to `AtomicBlockUtils`

### Fixed

* Fix some cases of "Failed to execute 'setStart' on 'Range" bug (#1162)
* Fix Chrome text deletion bug (#1155)
* Pass fresh editorState to edit handlers (#1112 and #1113)
* Fix for text insertion bugs in Android 5.1
* Correctly delete immutable and segmented entity content when at the edge of a
  selection
  * Fix bug where all text except first letter was dropped in IE11
  * Fix bug where starting new line incorrectly toggled inline style
  * Fix 'getRangeClientRects' to work around [webkit selection bounding rect
    bug](https://www.youtube.com/watch?v=TpNzVH5jlcU)

## 0.10.0 (Dec. 16, 2016)

### Added

* Add improved API for entity manipulation to contentState
* Add deprecation warnings to old Entity module API
* Add image support to convertFromHTML
* Add option of 'aliasedElements' in block render map

### Changed

* This version supports both the old and new Entity API; we
  are deprecating the Entity module in favor of
  using contentState. See [the migration guide.](https://draftjs.org/docs/v0-10-api-migration.html#content)

### Fixed

* Fix bug where block data was not removed when deleting atomic block
* Fix bug preventing pasting from clipboard
* Fix dead key deletion and deletion in 2-Set Korean
* Fix ContentState.createFromBlockArray to allow taking an empty array
* Improve typing in Korean on Windows

## 0.9.1 (September 16, 2016)

### Added

* `customStyleFn` for more control over inline style ranges

### Fixed

* Update Flow version
* Fix flow error in DraftEditorDragHandler

## 0.9.0 (September 13, 2016)

### Changed

* Return 'handled' or 'not-handled' from cancellable handlers callback
  * Boolean return value is deprecated
* Expand and update documentation

### Fixed

* Fix selection of atomic block when it is the last block
* Preserve the depth of custom block types when converting to raw
* Stop mutating component children when creating blocks with wrapper elements

## 0.8.1 (August 12, 2016)

### Fixed

* Include `object-assign` in npm dependencies
* Include `babel-core` in npm dependencies of tex example

## 0.8.0 (August 8, 2016)

### Added

* `customStyleFn` for more control over inline style ranges
* Uses `internalClipboard` for Safari
* Metadata for `ContentBlock` objects
* `convertFromHTMLToContentBlocks`:
  * Support for `mailto` protocol for links
  * Support "unset" inline styles
* Run ESLint on examples


### Changed

* Removed redundant ESLint module in TeX example
* Update Travis CI config for readability, Node v4 requirements, and pruning/updating npm dependencies
* Use `immutable` ~3.7.4 to avoid Flow errors in updated versions
* Modify `getSelectionOffsetKeyForNode` to search for nested offset-annotated nodes
* Upgrade eslint to 3.0.1, use fbjs config
* Update to Flow 0.28
* Jest
  * Update to 12.1.1
  * Replaced `jest.fn().mockReturnValue(x)` with `jest.fn(() => x)`
* Remove extra spaces from the text decoration style
* No longer using `nullthrows` for `blockRenderMap`
* `convertFromHTMLToContentBlocks`:
  * Improved variable names in `joinChunks`
  * Additional whitelisted entities such as `className`, `rel`, `target`, `title`

### Fixed

* Fix bug where placeholder text was not being erased in Chrome
* Fix bug where double click link in Firefox broke selection
* Kill iOS tooltips
* removed unnecessary `undefined` checks on `DraftEditorLeaf`
* `convertFromHTMLToContentBlocks`:
  * Preserve pasted block type on paste
  * Strip XML carriage returns and zero-width spaces
  * `getBlockMapSupportedTags()` will always return a valid array of tags
* Documentation fixes

## 0.7.0 (May 3, 2016)

### Added

* `blockRenderMap`: A map that allows configuration for the DOM elements and
wrapper components to render, keyed by block type
  * Includes configurability of element-to-block-type paste processing

### Changed

* Update to Jest 11.0.2

### Fixed

* Change deletion behavior around `atomic` blocks to avoid DOM selection errors
* Properly apply entities across multiple blocks in
* Improve placeholder behavior for a11y
* Properly remove and modify entity ranges during spellcheck changes
* Match Chrome `<textarea>` behavior during <kbd>cmd</kbd>+<kbd>backspace</kbd>
command at visual line-start

## 0.6.0 (April 27, 2016)

### Added

* `ContentState.getFirstBlock()` convenience method

### Changed

* <kbd>return</kbd> key handling now goes through command flow to enable easier
custom `'split-block'` handling.
* `convertFromRaw` now returns a `ContentState` object instead of an
`Array<ContentBlock>`

## 0.5.0 (April 12, 2016)

### Fixed

* <kbd>option</kbd>+<kbd>spacebar</kbd> no longer incorrectly scrolls browser in Chrome OSX
* Cursor behavior when adding soft newlines

### Added

* `AtomicBlockUtils`, a utility module to simplify adding `atomic` blocks to
an `EditorState`

### Changed

* The `media` block type is now `atomic`, to better represent that this type
is not just intended for photos and videos

## 0.4.0 (April 6, 2016)

### Fixed

* Avoid clearing inline style override when setting block type or depth

### Added

* `editable` field for custom block component configuration
* Default key binding support for <kbd>Ctrl</kbd>+<kbd>M</kbd> (`split-block`)

### Changed

* Always wrap custom block components, based on block type
  * Includes `data-editor`, `data-offset-key`, `data-block` in block props
* Replace `onPasteRawText` prop with `handlePastedText`

## 0.3.0 (March 22, 2016)

### Fixed

* Properly extract custom inline styles for `convertToRaw`
* Fix internal paste behavior to better handle copied custom blocks

### Added

* Export `getVisibleSelectionRect`
* Export `convertFromHTML`
* Export `DraftEditorBlock`

## 0.2.2 (March 9, 2016)

### Fixed

* Build before publish to get the warning suppression in place correctly

## 0.2.1 (March 9, 2016)

### Added

* React 15 RC as peer/dev dependency, provide `suppressContentEditableWarning`

## 0.2.0 (March 8, 2016)

### Added

* Move `white-space: pre-wrap` into inline style to resolve insertion issues
* `handleDrop` prop method for `Editor` to allow manual drop management
* `decoratedText` prop for decorator components
* `getVisibleSelectionRect`, to provide Rect for DOM selection
* Export `KeyBindingUtil` and `getDefaultKeyBinding`

### Fixed

* Triple-clicks followed by block type changes now only affect first block
* `DraftEditorLeaf` now re-renders correctly when its styles change
* Backspace behavior within empty code blocks

## 0.1.0 (February 22, 2016)

* Initial public release
