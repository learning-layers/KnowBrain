#Data Layer Integration branch

This branch demonstrates a way of integrating the data layer of [Bits and Pieces](https://github.com/learning-layers/BitsAndPieces) (BnP) into the KnowBrain.

##Changes

Apart from external libraries the following files have been added:

* `js/app/data` contains files of the BnP data layer. 
* `js/app/service` contains the service adapter for the Social Semantic Server.
* `js/app/modules/data/data.js`, anchor for the integration

These files of the KB have had to be changed:

* `js/app/modules/collection/collectionModule.js`
* `js/app/modules/collection/context.tpl.html`

See a comparison of this branch with the point where it diverged from master [here](https://github.com/learning-layers/KnowBrain/compare/c01b2821ab7c95c921b133e360a2c19afb14418a...data-layer-integration).

##Further TODOs

* Generally modules which make service calls (eg. `modelsModule.js`, `chatModule.js`,...) are good candidates to transform into the data layer since these modules handle data aspects of the application. However, the KB code base needs further decoupling to fully integrate with the data layer, see below.
* The service calls should be aggregated into `SocialSemanticService.js`.

##Problems

* KnowBrain is not leveraging the semantics of the SSS data on a technical level as the BnP data layer does. So for the integration it is necessary to remove semantics from the entities of the data layer before they can go into KB's logic. This results in computational overhead.
* KnowBrain follows a vertical separation of concerns into modules. Modules contain models, controllers, views, etc. BnP follows a horizontal separation into layers of service, data and presentation concerns. So on an architectural level the two systems are incompatible.

#KnowBrain

The KnowBrain (KB) is a self-hosting dropbox like knowledge repository. 
It's using the REST-API for 
- storing (upload, create), 
- sharing,
- (re)structuring hierarchical collections
- searching,
- discussing 
and tagging digital artifacts of the [Social Semantic Server](http://ceur-ws.org/Vol-1026/paper11.pdf) (SSS). 

**Important:**
You need a SSS installation for using the KnowBrain:
- The SSS: https://github.com/learning-layers/SocialSemanticServer
- Installation: http://developer.learning-layers.eu/documentation/social-semantic-server/setup/
- REST-API: http://developer.learning-layers.eu/documentation/social-semantic-server/rest-api/

##How to Get the Source Code

You can check out the code, as follows:

`$git clone https://github.com/learning-layers/KnowBrain.git`

##Installation
Follow these 3 small steps:

1) Deploy the KnowBrain source into an ordinary webserver e.g apache (htdocs) 

2) Edit the REST-API script links in the KB index.html file:

* social server globals
* social server connector wrappers
* social server connectors
* social server entities

3) now you should be able to reach the SSS and login to the KB (open index.html in a modern web-browser)

**Please note:** 
This is an early Version. It's functions have only been tested in Google Chrome browser.

##Contact:
* Dieter Theiler, Know-Center, Graz University of Technology, dtheiler@tugraz.at
* Dominik Moesslang, Know-Center, Graz University of Technology, dominik.moesslang@student.tugraz.at
