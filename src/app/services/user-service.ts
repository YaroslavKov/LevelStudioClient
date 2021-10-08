import {Injectable} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {GetTokenRequest, RefreshTokenRequest} from "../interfaces/ServiceModels/TokenModels";
import {HttpClient} from "./Clients/HttpClient";//"@angular/common/http"
import {RegistrationModel} from "../interfaces/ServiceModels/AccountModels";

@Injectable()
export class UserService {

    private httpOptions: any;

    constructor(private http: HttpClient) {
        this.httpOptions = {
            headers: new HttpHeaders({'Content-Type': 'application/json'})
        };
    }

    public async loginRequest(tokenRequest: GetTokenRequest) {
        return this.http.postRequest(`${environment.baseServerUrl}/token/`, JSON.stringify(tokenRequest), this.httpOptions);
    }

    public async refreshTokenRequest(refreshRequest: RefreshTokenRequest) {
        return this.http.postRequest(`${environment.baseServerUrl}/token/refresh/`, JSON.stringify(refreshRequest), this.httpOptions);
    }

    public async signUpRequest(accountData: RegistrationModel) {
        return this.http.postRequest(`${environment.baseServerUrl}/account/register/`, JSON.stringify(accountData), this.httpOptions);
    }
}
