import {IApiRequest} from "../../models";
import {Requests} from "../Requests";

export enum PostSettingsEditType {
    HIDE,
    FAVORITE,
    WIP
}

export class PostSettingsCallback {
}

export class PostSettings implements IApiRequest {
    public static getURL: string = Requests.POSTSETTINGS;
    public URL: string = PostSettings.getURL;

    constructor(postHash: number, editType: PostSettingsEditType) {
        this.URL = this.URL.replace(/:hash/, postHash.toString());
        this.URL = this.URL.replace(/:action/, PostSettingsEditType[editType].toLowerCase());
    }
}
