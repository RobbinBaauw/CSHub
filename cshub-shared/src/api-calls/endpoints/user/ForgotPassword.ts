import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";

export enum ForgotPasswordResponseTypes {
    CHANGED,
    INVALIDINPUT,
}

export class ForgotPasswordCallback {
    constructor(public response: ForgotPasswordResponseTypes) {}
}

export class ForgotPassword implements IApiRequest<ForgotPasswordCallback> {
    public static getURL: string = Requests.FORGOTPASSWORD;
    public URL: string = ForgotPassword.getURL;

    constructor(public password: string, public hash: number, public accId: number) {}
}
