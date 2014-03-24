#KnowBrain

The KnowBrain (KB) is a self-hosting dropbox like knowledge repository. 
It's using the REST-API for 
- storing (upload, create), 
- sharing,
- (re)structuring hierarchical collections
- searching,
- discussing 
and tagging digital artifacts of the [Social Semantic Server](http://ceur-ws.org/Vol-1026/paper11.pdf)(SSS). 

**Important:**
You need a SSS installation for using the KnowBrain:
- The SSS is available here: https://github.com/learning-layers/SocialSemanticServer
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
* Dieter Theiler, Know-Center, Graz University of Technology, dtheiler@know-center.at
* Dominik Moesslang, Know-Center, Graz University of Technology, dominik.moesslang@student.tugraz.at
