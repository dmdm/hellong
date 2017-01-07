import {Injectable} from '@angular/core';


// a. This should be dynamically set according to environment
// b. Configure angular-cli server to proxy API calls to our Python server
//    N.b. This *"§$ node-proxy fails to connect to IPv6! --> So configure your server to listen on IPv4.
const baseUrl = 'http://localhost:4200/api/v1';


@Injectable()
export class RcService {

    appTitle = 'helloNg';

    urls = {
        login: baseUrl + '/login',
    };

    constructor() {
    }

}
