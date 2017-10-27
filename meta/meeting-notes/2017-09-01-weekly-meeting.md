# Draft.js Weekly 09/01/2017

Agenda Items:
* Intros
* Upcoming stuff:
    * WIP - Hack-a-month to support richer features in Draft.js (internal only please)
        * Big refactors are scary - how to approach this?
            * Taking lessons from React; incremental upgrade path
            * React had a good test suite; when you fix a bug, add a test
                * With Draft some parts are almost impossible to test
                * Put things behind a feature flag initially
                * Similar to getting Draft into comments
                    * Did many experiments, took forever
                    * bifurcate and some people get new, some people get old
                    * obsessively look through flytrap
                    * when things broke, people reported it
                    * eventually it was not breaking so badly, could ship it
                    * DOM Selection state is hard to test
            * Every feature we add would have a test
            * QA contractors
            *

* Gaps in flow coverage could be good-first-bug issues

Action Items:
* Make some good-first-bug issues
    *  for flow coverage
    * and unit tests
    * should we have a flow-typed directory
