/*content of wemass remote js(not minified)*/
(function () {
  const
    windowTop=window.top,
    permutiveProjectId = "<PROJECT_ID>",
    permutiveProjectId = "<PUBLIC_API_KEY>",
    permutiveExtraConfig = {};
  let
    logLog=()=>{},
    checkPurposes = () => {
      if (windowTop["__cmp"] || windowTop["__tcfapi"]) {
        if (!windowTop.__wmass["consentData"])
          windowTop.__wmass["consentData"] = {};
          /**
           * purpose 1 permite llamar al Script del CMP
           */
        let 
          minPurposesV1 =[],
          minPurposesV2=["1","3"], 
          consento=windowTop.__wmass["consentData"];
        if (windowTop["__tcfapi"]) {
          tcfVersion = 2;
          let setTCFData = (tcData, success) => {
            if (success) {
              let {
                eventStatus,
                tcString,
                listenerId,
                gdprApplies
              }=tcData;
              logLog(`TCF v2 eventListener executed, eventStatus: ${eventStatus}`);
              logLog(`TCF v2 tcdataString disponible: ${tcString}`);
              if ( preciseTypeOf(tcString) === "string" && tcString.length > 0) {
                consento["getTCData"] = tcData;
                windowTop["__tcfapi"]('removeEventListener', 2, (success) => {
                  if (success) {
                    logLog("TCF v2 event removed");
                  }
                }, listenerId);
                init(true);
              }
            } else logLog({tcData,success});
          };
          windowTop["__tcfapi"]('addEventListener', 2, setTCFData);
        } else if (windowTop["__cmp"]) {
          tcfVersion = 1;
          if (!consento["getConsentData"])
            windowTop["__cmp"]("getConsentData", null, consentData => {
              consento["getConsentData"] = consentData;
              init(true);
            });
          if (!consento["getVendorConsents"])
            windowTop["__cmp"]("getVendorConsents", null, consentData => {
              consento["getVendorConsents"] = consentData;
              init(true);
            });
        }
      }
    },
    preciseTypeOf = (obj, options) => {
      var type, stamp = Object.prototype.toString.call(obj);

      options = options || {};

      if (!type && obj === undefined) type = 'undefined';
      if (!type && obj === null) type = 'null';

      if (!type && obj.constructor && typeof obj.constructor.isBuffer == 'function' && obj.constructor.isBuffer(obj)) type = 'buffer';

      if (!type && typeof window == 'object' && obj === window) type = 'global';
      if (!type && typeof global == 'object' && obj === global) type = 'global';

      if (!type && typeof obj == 'number' && isNaN(obj)) type = 'nan';
      if (!type && typeof obj == 'object' && stamp == '[object Number]' && isNaN(obj)) type = 'nan';

      if (!type && typeof obj == 'object' && stamp.substr(-6) == 'Event]') type = 'event';
      if (!type && stamp.substr(0, 12) == '[object HTML') type = 'html';
      if (!type && stamp.substr(0, 12) == '[object Node') type = 'html';

      // last resort
      if (!type) type = stamp.match(/\[object\s*([^\]]+)\]/)[1].toLowerCase();

      // be even more precise by reporting "instance of" names
      // Note: only check objects that were created by constructors
      if (type == 'object' && options.pojoOnly && obj.constructor) {
        // some constructors don't have names
        type = obj.constructor.name || 'unknown';

        // preserve `object` response for POJOs
        if (type == 'Object') type = 'object';
      }

      return type;
    },
    initDMP = (permutiveDocument, permutiveObject, projectId, publicKey, permutiveConfig) => {
      window.top.__wmass.dmp = window.top.__wmass.dmp || {};
      let
        permutiveScript = permutiveDocument.createElement("script"),
        permutiveMethods = ["addon", "identify", "track", "trigger", "query", "segment", "segments", "ready", "on", "once", "user", "consent"];
      //setting permutive methods
      if (!permutiveObject) {
        permutiveObject = permutiveObject || {};
        window.permutive = permutiveObject;
        permutiveObject.q = [];
        permutiveObject.config = permutiveConfig || {};
        permutiveObject.config.projectId = projectId;
        permutiveObject.config.apiKey = publicKey;
        permutiveObject.config.environment = permutiveObject.config.environment || "production";
        for (var contador = 0; c < permutiveMethods.length; c++) {
          var permutiveMethod = permutiveMethod[contador];
          permutiveObject[permutiveMethod] = function (n) {
            return function () {
              var o = Array.prototype.slice.call(arguments, 0);
              permutiveObject.q.push({
                functionName: n,
                arguments: o
              })
            }
          }(permutiveMethod)
        }
      }

      //cloning methods in wemass object
      for (var pMethod of permutiveMethods) {
        if (!window.top.__wmass.dmp[pMethod] && window.permutive[pMethod]) {
          /*cloning all permutive methods*/
          window.top.__wmass.dmp[pMethod] = window.permutive[pMethod];
        }
      }
      permutiveScript.setAttribute("async", "async");
      permutiveScript.setAttribute("src", `https://cdn.permutive.com/${projectId}-web.js`);
    }

  /*Here will be all the custom modifications of the publisher*/


  //initializing __wmass object
  window.top.__wmass = window.top.__wmass || {};
  window.top.__wmass.bff = window.top.__wmass.bff || [];

  if (!window.top.__wmass.hasOwnProperty("initDmp")) {
    window.top.__wmass.initDmp = (dmpData = {}) => {
      if (preciseTypeOf(dmpData) === "object") {
        let {
          permutive: {
            projectId = permutiveProjectId,
            publicKey = permutiveProjectId,
            config = permutiveExtraConfig
          } = {}
        } = dmpData;
        if (preciseTypeOf(projectId) === "string" && projectId.length > 0 && preciseTypeOf(publicKey) === "string" && publicKey.length > 0) {
          //preventing invalid config to be sent
          if (preciseTypeOf(config) !== "object")
            config = {};
          initDMP(window.top.document, window.top.permutive, projectId, publicKey, config);
        }
      }
      //only one DMP Initialization per page
      window.top.__wmass.initDmp = () => {};
    };
  }
  if (preciseTypeOf(window.top.__wmass.bff) === "array" && window.top.__wmass.bff.length > 0) {
    //executing the buffered functions
    for (let bufferedFunction of window.top.__wmass.bff) {
      if (preciseTypeOf(bufferedFunction) === "function")
        bufferedFunction();
    }
    __wmass.initDmp();
  }
  if (preciseTypeOf(window.top.__wmass.bff) !== "object") {
    //converting the buffer to a object with a push funcion that executes the parameter inmediatly.
    window.top.__wmass.bff = {
      push: function (instruction) {
        if (preciseTypeOf(instruction) === "function")
          instruction();
      }
    };
  }

})();