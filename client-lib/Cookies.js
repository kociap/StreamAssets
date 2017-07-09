class Cookies {
    static set(key, value, maxAge, domain, path) {
        let cookieString = encodeURIComponent(key) + '=' + encodeURIComponent(value);
        if(maxAge) {
            if(maxAge.constructor === String) {
                cookieString += ';expires=' + maxAge;
            } else if(maxAge.constructor === Number) {
                cookieString += ';max-age=' + String(maxAge);
            } else if(maxAge.constructor === Date) {
                cookieString += ';expires=' + maxAge.toUTCString();
            }
        }

        if(domain) {
            cookieString += ';domain=' + domain;
        }

        if(path) {
            cookieString += ';path=' + path;
        }

        document.cookie = cookieString;
    }

    static remove(key) {
        if(Cookies.hasKey(key)) {
            document.cookie = encodeURIComponent(key) + '=placeholder; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        }
    }

    static get(key) {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:" + encodeURIComponent(key) + "=)([^;]+).*"), "$1")) || null;
    }

    static hasKey(key) {
        return (new RegExp('(' + encodeURIComponent(key) + ')' + "{1}\=")).test(document.cookie);
    }

    static keys() {
        let cookiesKeys = document.cookie.replace(/([^=;]+)\=[^=;]+/g, '$1').split(';');
        for(let i = 0; i < cookiesKeys; ++i) {
            cookiesKeys[i] = decodeURIComponent(cookiesKeys[i]);
        }
        return cookiesKeys;
    }
}