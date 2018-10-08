import {IDataState} from "./state";
import {IPost, ITopic} from "../../../../faq-site-shared/models";

export const setTopics = (state: IDataState, payload: ITopic[]) => {
    state.topics = payload;
};

export const setQuillContents = (state: IDataState, payload: object[]) => {
    state.quillContents = payload;
};
