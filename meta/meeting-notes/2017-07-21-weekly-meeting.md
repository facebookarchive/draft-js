# Draft.js Weekly 07/21/17

Agenda Items:

* Intros
* Minor release soon? We have a couple of bug fixes and the 'ariaMultiline' prop.
* look at PRs
* 'good first bug' issues for new folks?

PRs to consider:

* 1170 (https://github.com/facebook/draft-js/pull/1170) - updates syntax in docs, just need to get CI passing. Not sure why it failed.
    * Why is CI failing here?
      * @spicyj figured it out - Might need to revert to a version of React before flat bundles
      * Could open an issue to fix website so that it works with flat bundles
* Next steps for ungating fix for https://github.com/facebook/draft-js/issues/1020#issuecomment-316620738
    * https://github.com/facebook/draft-js/blob/master/src/component/handlers/edit/editOnFocus.js#L37-L39
    * Chrome version should be out within next month: https://www.chromium.org/developers/calendar
* (from last week)
    * PRs close to merging but need a bit more, ongoing dialog:
        * 1190 (https://github.com/facebook/draft-js/pull/1190) - selection.extend is called on selection without ranges
            * Should we bump priority of this?
            * https://our.intern.facebook.com/intern/tasks/?t=18541443
            * opened internal task for following up on this
        * 1285 (https://github.com/facebook/draft-js/pull/1285) - 'Added support for the `compositionUpdate` event'
            * @flarnie is going to follow up on this

Action Items:

* Fix up and merge this: https://github.com/facebook/draft-js/pull/1285 (flarnie, tagging Chang + Draft_js for review)
* also fix up and merge this: https://github.com/facebook/draft-js/pull/1170
* Find and share some good-first-bugs and share with new maintainers (@flarnie)
* Next week look at open issues (all maintainers)
