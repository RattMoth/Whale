The overall design of the games:

Mostly we are dealing with [SPAs](https://en.wikipedia.org/wiki/Single-page_application) which use a light amount of non-frameworked javascript and standard html/css.

The server side is broken up into two parts:

  * A data aggregator that assembles stocks and quotes, placing them into the database

  * A flask server for serving these cached assets

Most of this is based on Brooks' [Plan one to throw away](http://wiki.c2.com/?PlanToThrowOneAway) design along with [Tracer Bullets](https://flylib.com/books/en/1.315.1.25/1/) from Hunt & Thomas.

This is to find the right [Product/Market Fit](https://en.wikipedia.org/wiki/Product/market_fit) based on Andreesseen and Reid.

These games are ultimately simple with information gathering in them in order to get the right set of customers to do the right set of things
