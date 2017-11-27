# Draft.js Weekly 09/22/17

* Better test coverage for Draft and browser changes
    * Interesting issue: “`focus()` cause unexpected scroll” on Chrome 61 only (https://github.com/facebook/draft-js/issues/1381)
    * How to catch/prevent this next time?
    * Only mention of this breaking change is one bullet at very end of Chrome 61 blog post: https://blog.chromium.org/2017/08/chrome-61-beta-javascript-modules.html
    * Maybe integration/webdriver tests on Chrome Canary, Firefox Nightly, etc.
    * See if current webdriver tests cover it
    * Also look into external services, esp. for mobile

* Update: Entities, RTL still somewhat broken in Android
