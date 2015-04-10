/**
* Code contributed to the Learning Layers project
* http://www.learning-layers.eu
* Development is partly funded by the FP7 Programme of the European Commission under
* Grant Agreement FP7-ICT-318209.
* Copyright (c) 2014, Graz University of Technology - KTI (Knowledge Technologies Institute).
* For a list of contributors see the AUTHORS file at the top-level directory of this distribution.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var sSDisc = new SSDisc();

function SSDisc(){

  this.typeDisc      = "disc";
  this.nameSpaceDisc = "/disc/";
  
  this.iconDisc      = "styles/images/used/comments.png";
  
  this.isTypeDisc = function(type){
    return jSGlobals.equals(type, this.typeDisc);
  };
  
	this.getDiscByTargetUri = function (discs, targetUri){

		if(
				jSGlobals.isEmpty(discs)||
				jSGlobals.isEmpty(targetUri)){
			return null;
		}

		for(var counter = 0; counter < jSGlobals.arrayLength(discs); counter++){

			if(discs[counter].entity === targetUri){
				return discs[counter];
			}
		}

		return null;
	};

  this.isNotDisc = function(uri){
    return !this.isDisc(uri);
  };

	this.isDisc = function(uri){
    return jSGlobals.contains(uri, this.nameSpaceDisc);
	};
	
	this.sortDiscsByLabel = function(discs){
		
		if(jSGlobals.isEmpty(discs)){
			return new Array();
		}
		
		var resultDiscs = new Array();
    var addedUris   = new Array();
		var labels      = new Array();
		var counter     = -1;
    var discsCount  = jSGlobals.arrayLength(discs);
		
		for(counter = 0; counter < discsCount; counter++){
			jSGlobals.addArrayItem(labels, discs[counter].label);
		}
		
		labels = jSGlobals.sortStringArray(labels, jSGlobals.sortAsc);
		
		for(counter = 0; counter < discsCount; counter++){
      
			for(var innerCounter = 0; innerCounter < discsCount; innerCounter++){
				
				if(
            jSGlobals.equals              (labels[counter],      discs[innerCounter].label) &&
            jSGlobals.containsNotArrayItem(addedUris,            discs[innerCounter].id)){
          
          jSGlobals.addArrayItem(addedUris,   discs[innerCounter].id);
          jSGlobals.addArrayItem(resultDiscs, discs[innerCounter]);
        }
      }
    }
		
		return resultDiscs;
	};
};