HelloNg
=======

faich Fiadh fiú fogh feum!

This is no finished product!

This is kind of "HelloLDAP, part 2", an elaboration on using @ngrx/store.
I also exchanged BS4 for angular material.


Best viewed in the latest Chrome browser with enabled experimental web flag:

 - PointerEvents: have not yet arrived in FF
 - ResizeObserver: ditto, and experimental in Chrome


Installation
------------

For the client install angular-cli as described on their page and then perform the usual
"npm install" chore.

Since we are using HelloLDAP's server, perform its installation inside a Python virtual
environment as well.


Run
---

Go to HelloLDAP and start its server with:

    serve -vv


Then come back to HelloNg and start the development server:

    ng serve --proxy-config proxy.conf.json

Navigate your browser to http://localhost:4200. N.b. that we are proxying all API calls through to the
HelloLDAP server.
