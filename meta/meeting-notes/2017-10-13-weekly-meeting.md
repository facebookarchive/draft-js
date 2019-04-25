# Draft.js Weekly 10/13/17

* * Idea: Highlight broken/invalid text in red (Sophie's comments below:)
    * bad things happen when we get text in a DraftEditorLeaf span that's outside the innermost one
    * in particular, when text content is a sibling of the inner span here, it looks like it's real text but draft doesn't handle it properly
    * idea: CSS to make it bright red
    * so that people are more likely to notice if certain keyboard shortcuts, for example, cause the text to get out of sync with draft
    * they'll complain "hey, whenever I do this really weird thing, I get red text" and then we'll have a good avenue to say "…well yeah. don't do that. also maybe we'll fix it"
    * -> Maybe try this for one FB use case first and see how it goes? Or land under a GK and enable within FB?


* One World for continuous testing
    * Notes on setting this up within FB
    * Might be useful as regression tests
        * Could still add regression tests that don't use live browser
    * What about for React?
        * Dan and Nate and Brendan are looking at this with 3rd party extensions, like Saucelabs
            * Problem; some of our fixtures are hard to write automated test for. Some bugs in the past related to setting the value correctly, but looking visually it wasn't showing up. Hard to catch this with automated test.
* Consider adding Jest tests for PRs that pass tests but would break everything
* Tests are awesome. :| Let's add more. :D
