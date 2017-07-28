# Draft.js Weekly 07/07/17

Agenda Items:

* Goal: Review/close 30 PRs by end of the half.
    * Review 3 every Friday
    * Close or import at least 2 by Monday
    * If no problems are caused by following Friday, include in a minor release or patch.
* Update on automated PR syncing between Github and Facebook
  * Almost finished setting this up
* Onboarding new internal maintainers
* New logging of internal use of Draft - it's widely used :)

PRs to consider:

* 1190 (https://github.com/facebook/draft-js/pull/1190) - selection.extend is called on selection without ranges
    * Commented with requirements to merge, following up in a week
    * “Selection code is the scariest part of this whole codebase, I think... This doesn't even surprise me that this bug exists.” - Isaac
    * Might close https://github.com/facebook/draft-js/pull/1203 in favor of #1190 but it's in IE11, so we are following up with our contacts at MS
* (for next week) 1170 (https://github.com/facebook/draft-js/pull/1170) - updates syntax in docs, just need to get CI passing. Not sure why it failed.
* (for next week) 927 (https://github.com/facebook/draft-js/pull/927) - don't merge sequential unstyled tags




