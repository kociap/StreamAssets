let requestPromise = (() => {
    return function(requestData) {
        if(!requestData.hasOwnProperty('uri')) {
            return Promise.reject('Missing required parameter: uri');
        }

        if(!requestData.hasOwnProperty('method')) {
            return Promise.reject('Missing required parameter: method');
        }

        let request = new XMLHttpRequest();
        let promise = new Promise((resolve, reject) => {
            request.onreadystatechange = () => {
                if(request.readyState === request.DONE) { 
                    if(request.status >= 200 && request.status < 300) {
                        if(!requestData.hasOwnProperty('json') || !requestData['json']) {
                            resolve(request.response);
                        } else {
                            resolve(JSON.parse(request.response));
                        }
                    } else {
                        reject({ status: request.status, response: request.response });
                    }
                }
            };
        });

        request.open(requestData.method, requestData.uri);
        if(requestData.hasOwnProperty('headers')) {
            for(let key in requestData['headers']) {
                request.setRequestHeader(key, requestData['headers'][key]);
            }
        }

        request.send((requestData.hasOwnProperty('data') ? requestData['data'] : null));

        return promise;
    }
})();