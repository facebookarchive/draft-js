# Draft.js Weekly 2/10/17

* (again) Can we transfer the draftjs.com (http://draftjs.com/) domain to daniel lo nigro? (question for isaac?)
    * (https://github.com/facebook/draft-js/issues/317)
* API Breaking Changes: when would we make them?
    * For comparison, React's guidelines (https://facebook.github.io/react/contributing/design-principles.html#stability) are:
        * Usually they avoid changing APIs and core behaviors
        * Changes will have a clear, and preferably automated, migration path
        * When deprecating a pattern, these steps will be followed:
            * Support both initially, with deprecation warnings
            * Test the change internally first at FB
            * See if it makes sense internally before adding to open source
            * Deprecate with warnings in one version, then fully break in the next major version
            * Write a codemod if there is repetetive manual work to upgrade
    * **After agreeing on a policy we will post this**
    * Proposal: Similar approach to React, but automated upgrade less important because fewer callsites
* Meeting notes go up on github now! Flarnie will sanitize and post them after the weekly meeting.
    * Someone should update our 'contributing' document to mention the meeting notes, like React's docs: https://facebook.github.io/react/contributing/how-to-contribute.html#meeting-notes
* Upcoming release of v0.11.0@next
* Tool for debugging/understanding events: https://dvcs.w3.org/hg/d4e/raw-file/tip/key-event-test.html

**Last Week's Action Items:**

* DONE: See how React.js, Relay, and Redux surfaces their roadmaps (Flarnie)
* DONE: Releasing roadmap

**Action items for next week:**

* Post statement about policy for API breaking changes (Flarnie)
