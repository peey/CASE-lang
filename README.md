# Compass And StraightEdge (CASE) Lang

See `test/programs/*.case` and `test/specs/Programs.spec.js` for examples of how to write programs.

Setup using `npm install`.

Run `npm run test` to see it in action. If there's an issue with phantomjs, connect to the port which `karma` outputs (usually 9876) from your browser, e.g. `localhost:9876` to see the tests run. Otherwise they'll timeout.

This is what a successful test run would look like:

![](https://i.imgur.com/tSZlqOO.png)

Note that if you connect via a browser, the test runner would still wait upto 60s for phantomjs to respond even though tests have finished running in your browser.

## Major Todos
 - A GUI
 - Solve the phantomjs quirk. It's because I need to provide reference output files to phantomjs so that it can make sure that the AST is correctly built (see `tests/programs/*.case.json`).
