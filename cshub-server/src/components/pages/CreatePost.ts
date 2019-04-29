import {Request, Response} from "express";

import {app} from "../../";
import logger from "../../utilities/Logger";

import {CreatePost, CreatePostCallback, SubmitPostResponse} from "../../../../cshub-shared/src/api-calls";
import {getTopicFromHash} from "../../../../cshub-shared/src/utilities/Topics";

import {validateMultipleInputs} from "../../utilities/StringUtils";
import {generateRandomTopicHash, getTopicTree} from "../../utilities/TopicsUtils";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {checkTokenValidity} from "../../auth/AuthMiddleware";

app.post(CreatePost.getURL, (req: Request, res: Response) => {

    const submitPostRequest: CreatePost = req.body as CreatePost;

    const userObj = checkTokenValidity(req);

    const inputsValidation = validateMultipleInputs({
        input: submitPostRequest.postTitle,
        validationObject: {
            minlength: 4,
            maxlength: 50
        }
    }, {input: submitPostRequest.postTopicHash}, {input: submitPostRequest.isIndex});

    if (inputsValidation.valid && userObj.valid) {
        const topics = getTopicTree();
        topics
            .then((topics) => {
                if (topics === null) {
                    logger.error(`No topics found`);
                    res.sendStatus(500);
                } else {
                    query(`
                      SELECT id
                      FROM posts
                      WHERE title = ?
                    `, submitPostRequest.postTitle)
                        .then((result: DatabaseResultSet) => {
                            if (result.getLength() > 0) {
                                res.status(409).json(new CreatePostCallback(SubmitPostResponse.TITLEALREADYINUSE));
                            } else {
                                return true;
                            }
                        })
                        .then((canContinue: boolean) => {
                            if (canContinue) {
                                return query(`
                                  SELECT id
                                  FROM posts
                                  WHERE isIndex = 1
                                    AND topic = (SELECT id FROM topics WHERE hash = ?)
                                `, submitPostRequest.postTopicHash);
                            }
                        })
                        .then((isIndexResult) => {
                            if (typeof isIndexResult === "undefined" || (isIndexResult.getLength() > 0 && submitPostRequest.isIndex)) {
                                res.status(409).json(new CreatePostCallback(SubmitPostResponse.ALREADYHASINDEX));
                            } else {
                                return generateRandomTopicHash();
                            }
                        })
                        .then((topicHash) => {
                            if (typeof topicHash !== "undefined") {
                                const requestTopic = getTopicFromHash(submitPostRequest.postTopicHash, topics);

                                query(`
                                  INSERT INTO posts
                                  SET topic   = ?,
                                      author  = ?,
                                      title   = ?,
                                      hash    = ?,
                                      isIndex = ?
                                `, requestTopic.id, userObj.tokenObj.user.id, submitPostRequest.postTitle, topicHash, submitPostRequest.isIndex ? 1 : 0)
                                    .then((insertEdit: DatabaseResultSet) => {
                                        res.status(201).json(new CreatePostCallback(SubmitPostResponse.SUCCESS, topicHash));
                                    })
                                    .catch((err) => {
                                        logger.error(`Inserting into db failed`);
                                        logger.error(err);
                                        res.status(500).send();
                                    });
                            }
                        })
                        .catch(err => {
                            logger.error(`Submitting post failed`);
                            logger.error(err);
                            res.status(500).send();
                        });
                }
            });
    } else if (!inputsValidation.valid) {
        res.status(400).json(new CreatePostCallback(SubmitPostResponse.INVALIDINPUT));
    } else if (!userObj.valid) {
        res.sendStatus(401);
    }

});
