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
var sSTagAssFrequEntity = new SSTagAssFrequEntity();

function SSTagAssFrequEntity(){
  
  this.sortTagsByFrequencyByFrequency = function(tagsByFrequency){
		
		if(jSGlobals.isEmpty(tagsByFrequency)){
			return new Array();
		}
		
		var resultTagsByFrequency = new Array();
		var frequencies           = new Array();
		var counter               = -1;
		
		for(counter = 0; counter < jSGlobals.arrayLength(tagsByFrequency); counter++){
			jSGlobals.addArrayItem(frequencies, tagsByFrequency[counter].frequ);
		}
		
		frequencies = jSGlobals.sortIntArray(frequencies, jSGlobals.sortDesc);
		
		for(counter = 0; counter < jSGlobals.arrayLength(frequencies); counter++){
      
			for(var innerCounter = 0; innerCounter < jSGlobals.arrayLength(tagsByFrequency); innerCounter++){
				
				if(jSGlobals.equals(tagsByFrequency[innerCounter].frequ, frequencies[counter])){
					
					if(jSGlobals.arrayLength(resultTagsByFrequency) === 0){
            
						jSGlobals.addArrayItem(resultTagsByFrequency, tagsByFrequency[innerCounter]);
						break;
					}
					
					if(jSGlobals.getLastArrayItem(resultTagsByFrequency).label !== tagsByFrequency[innerCounter].label){
						
						jSGlobals.addArrayItem (resultTagsByFrequency, tagsByFrequency[innerCounter]);
						break;
					}
				}
			}
		}
		
		return resultTagsByFrequency;
	};
  
  this.getLabels = function(tagAssFrequ){
    
		var result = new Array();
    
		for(var counter = 0; counter < jSGlobals.arrayLength(tagAssFrequ); counter++){
			result.push(tagAssFrequ[counter].label);
		}
    
		return result;
	};
  
  this.getDistinctTagLabels = function(tagAssFrequ){
    
		var result = new Array();
    
		for(var counter = 0; counter < jSGlobals.arrayLength(tagAssFrequ); counter++){
      
      if(jSGlobals.containsArrayItem(tagAssFrequ[counter].label)){
        continue;
      }
      
			result.push(tagAssFrequ[counter].label);
		}
    
		return result;
	};
  
  this.getFrequentDistinctTagLabels = function(tagAssFrequ, minFrequ){
    
    var result = new Array();
    
    if(jSGlobals.isEmpty(tagAssFrequ)){
      return result;
    }
		
		for(var counter = 0; counter < jSGlobals.arrayLength(tagAssFrequ); counter++){
			
			if(
					tagAssFrequ[counter].frequ >= minFrequ &&
					jSGlobals.containsNotArrayItem(result, tagAssFrequ[counter].label)){
        
        jSGlobals.addArrayItem(result, tagAssFrequ[counter].label);
			}
		}
		
		return result;
  };
};