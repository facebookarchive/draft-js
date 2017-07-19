# Draft.js Weekly 07/14/17

Agenda Items:

* Intros for new folks
* Update on automated PR syncing between Github and Facebook
  * Working as of today!
* Bug fixes - fix typing into text node containing tab
  * Merged on Github as https://github.com/facebook/draft-js/commit/5863399a3a1bcbbe9b090249504a70496a7af7cc

PRs to consider:

* 1285 (https://github.com/facebook/draft-js/pull/1285) - 'Added support for the `compositionUpdate` event'
    * This is only for Android, but we don't want to browser sniff if we can help it
    * Also events vary by keyboard so we can't sniff for that
    * Concern: composition events are different in each browser/OS combination, and we want to avoid breaking them
    * At very least we would want to manually test across different browsers/OS, with IME and different languages
    * If it falls back to 'compositionUpdate' instead of falling back to 'beforeInput' that is a smaller change
    * Another complication; the 'beforeInput' event is “normalized” in React.
        * Another potential fix; change the 'beforeInput' in React to fire based on 'compositionUpdate'.
        * Might eventually pull this code from React into Draft
    * Would merge if:
        * we manually test across OS/browsers
        * fall back to 'compositionUpdate'
        * test internally on FB employees for a week or so
* (for next week) 927 (https://github.com/facebook/draft-js/pull/927) - don't merge sequential unstyled tags
* (for next week) 1170 (https://github.com/facebook/draft-js/pull/1170) - updates syntax in docs, just need to get CI passing. Not sure why it failed.
    * Will follow up soon
* (from last week)
    * 1190 (https://github.com/facebook/draft-js/pull/1190) - selection.extend is called on selection without ranges
        * No response to comments last week
        * Pinged the PR and issue again to see if anyone is interested in debugging Chrome issue




