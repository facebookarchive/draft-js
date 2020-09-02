# Draft.js Weekly 02/08/18

* Intros - welcome to Twitter web team! 🎉
* Discussion:
    * Twitter team planning to try Draft.js for their Web UIs
        * We can commit to regularly merge their PRs
        * TODO: get a list of their github handles, to respond to their PRs in particular.
        * Their discussion items:
            * They will use it on mobile
            * It will take a while to go public, they will focus on quality
            * Asking about test coverage
                * We need more :)
            * What will the flow be?
                * internal PR and review
                * Should they write a feature flag into their code
                * TODO: send them a link to the file with feature flags changes recently
            * Mobile bugs
                * using default android keyboard and pressing space
                * MS swift keyboard
                * other major issues?
                    * Sophie - Right now Draft.js keeps state of DOM and editor in sync
                        * it does this by listening to each event, then updating internal state
                        * in some cases Draft.js will call event.preventDefault on event, and in others we allow native event to happen
                            * Doesn't happen much but we try to allow it when we can. Spellcheck is an example.
                        * the issue is on Android, they don't send input events for a lot of the things that you would want them for. They only send a single input event, not keypress, not beforeInput, etc. and input event doesn't have keycode. Only way to figure out what happened is look at DOM and diff, figure out what changed.
                        * So far we have not implemented anything like that, because all other browsers do sent useful events and it's a big refactor.
                        * It would be possible, but a substantial amount of work. Needs to be done to support Android.
                        * Seems to be a challenge of contenteditable on any framework.
                    * Twitter lead -
                        * They want to go in this direction, happy we are supportive.
                    * Sophie
                        * She can talk more about how this could work.
                    * Twitter lead -
                        * Where does FB fallback to textarea?
                    * Sophie
                        * Depends. Recently decided to exclude iOS and using Chinese/Japanese bc of IME bugs in iOS.
                        * Depends on your users and features. Doesn't matter that much for that case.
                    * Twitter lead -
                        * Problems with some languages - on desktop or mobile web? Facebook only uses it on desktop right?
                    * Sophie
                        * Generally right, only desktop.
                    * Twitter lead -
                        * Do you think it's a big problem with IME?
                    * Sophie
                        * We do have some problems with IME in IE, up to IE 11 but Edge is ok.
                        * That's similar to what happens on android, where it doesn't send the events we need.
                        * Right now we exclude cjk languages from getting Draft input on IE. IE is a small fraction for us.
                    * Twitter lead -
                        * Long term tehy would like to see Draft.js be configurable, in terms of decreasing the bundle size. It's a hard thing to do.
                        * One concern is the size.
                    * Alan
                        * Do you have specific goals, how small would it be if it wasn't a problem?
                    * Twitter lead -
                        * 70k is a little big
                        * They don't use immutable-js, they don't care about “large error maps”
                        * old compose bundle was ~30k gzipped
                        * importing draft.js increases to ~90kb
                    * Flarnie
                        * More details on the approach proposed?
                    * Sophie
                        * Could do everything that way
                    * More about how we can do this?
                        * Could do it incrementally - Twitter team has done similar things with their previous editor
                        * Do we rewrite or incrementally
                    * How to work through this?
                        * Sophie - start with a meeting to walk through how it works, Sophie can give that
                        * We will follow up via email about the

*Action Items:*

* Put out internal task to refactor https://github.com/facebook/draft-js/blob/master/src/model/encoding/convertFromHTMLToContentBlocks.js (Flarnie)
* Get list of Twitter team github handles (Flarnie)
* Set up meeting with Twitter folks to explain Draft architecture (Sophie)
* Email about next steps (Sophie and/or Flarnie)



