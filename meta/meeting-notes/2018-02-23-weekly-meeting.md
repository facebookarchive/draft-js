# Draft.js Weekly 02/08/18

* DELAYED until next week: Demo of new filesize tracking courtesy of  Alan Norbauer
    * in https://github.com/facebook/draft-js/pull/1644

* Update from Twitter team
    * Working on integrating Draft into their composer, no changes yet
    * They have a prototype on mobile, iOS is ok except for autocorrect
    * on Android there are some keyboards that don't accept any input from users. Major issues needing fixed.
* Looking into Chrome 65 issue, where mouse movement triggers composition events
    * https://github.com/facebook/draft-js/issues/1657
* Update coming next time about tree block data structure support
* Isaac and Sophie discussing mobile support
    * Sophie: preventing/controlling events seems to not work on android
    * Isaac: yea, that might be the direction to go in, since android and now Chrome don't have consistent event systems
    * Overall consensus - if Twitter folks can put in effort, we support rearchiteture of Draft.js to better support mobile web.
