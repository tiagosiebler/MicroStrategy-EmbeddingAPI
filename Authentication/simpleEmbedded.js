var baseURL = "http://aps-tsiebler-vm:8080/11.1GALibrary";
var postData = {
  username: "administrator",
  password: ""
};

// Make a request and return a promise resolving with a response header
function getXHRRequestPromise(url, body, authToken, method, desiredHeader) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    // so the session cookie is included
    xhr.withCredentials = true;
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader("Accept", "application/json");
    if (authToken) {
      xhr.setRequestHeader("X-MSTR-AuthToken", authToken);
    }
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 2) {
        return reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }

      console.log("getXHRRequestPromise response headers: ", xhr.getAllResponseHeaders());
      if (desiredHeader) {
        return resolve(xhr.getResponseHeader(desiredHeader));
      }

      return resolve(xhr.getAllResponseHeaders());
    };
    xhr.send(JSON.stringify(body));
  });
};

function identityTokenExample() {
  console.log("identityTokenExample()");
  var apiURL = baseURL + '/api/';

  // Write a javascript call that returns a Promise. This Promise should resolve with the x-mstr-identityToken
  return getXHRRequestPromise(apiURL + 'auth/login', postData, null, 'POST', 'x-mstr-authToken')
    .then(authToken => {
      console.log("getLoginToken() Got auth token: ", authToken);
      return authToken;
    })
    .then(authToken => {
      if (!authToken) throw Error('authToken request failed');
      console.log("Calling auth/identityToken...");
      return getXHRRequestPromise(apiURL + 'auth/identityToken', null, authToken, 'POST', 'x-mstr-identitytoken');
    })
    .then(identityToken => {
      if (!identityToken) throw Error('identityToken request failed');

      console.log("getXHRIdentityToken() should have identity token now: ", identityToken);
      return identityToken;
    })
    .catch(e => {
      console.error("identityTokenExample failed: ", e);
    })
};

// this simply passes authentication credentials to the api/auth/login endpoint, requesting an auth token for the session
function standardAuthExample() {
  console.log("getLoginToken()");
  // Write a javascript call that returns a Promise. This Promise should contain the x-mstr-identityToken
  return getXHRRequestPromise(baseURL + '/api/' + 'auth/login', postData, null, 'POST', 'x-mstr-authToken')
    .then((authToken) => {
      console.log("getLoginToken() Got auth token: ", authToken);
      return authToken;
    })
    .catch(e => {
      debugger;
    });
}

var dossier1, dossier2;
var filters = {
  d1: {},
  d2: {}
};

function load() {
  var container2 = document.getElementById("dossier2");
  var url = baseURL + "/app/B19DEDCC11D4E0EFC000EB9495D0F44F/72A59F1C4A776D49E4DC11AB4569A4EF";

  microstrategy.dossier.create({
      url: url,
      enableResponsive: true,
      placeholder: document.getElementById("dossier1"),
      enableCustomAuthentication: true,
      // customAuthenticationType: microstrategy.dossier.CustomAuthenticationType.AUTH_TOKEN,
      // getLoginToken: standardAuthExample
      customAuthenticationType: microstrategy.dossier.CustomAuthenticationType.IDENTITY_TOKEN,
      getLoginToken: identityTokenExample
    })
    .then(dossierReference => (dossier1 = dossierReference).getFilterList())
    .then(filterList => filters.d1 = filterList);
};
