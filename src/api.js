"use strict";

import request from "request";

import Promise from "promise";

import EventEmitter from "events";

import {successLog, warnLog} from "./log";

/**
 * 超时时间
 * @type {number}
 */
const timeout = 3000;

/**
 *
 * @param timeout
 * @returns {*}
 */
function timerDown(timeout) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject("已超时");
        }, timeout);
    });
}

/**
 *
 * @param url
 * @returns {*}
 */
function get(url) {
    return new Promise((resolve, reject) => {
        request.get(url, {encoding: "utf8"}, (err, req, body) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(JSON.parse(body));
            }
        });
    });
}

/**
 *
 * @param url
 * @returns {*}
 */
function fecthData(url) {
    return Promise.race([get(url), timerDown(timeout)]);
}

export default class ApiPromise extends EventEmitter {

    /**
     *
     * @param conf
     */
    constructor(conf) {
        super(conf);
        this.conf = Object.assign({}, conf);
    }

    /**
     *
     * @returns {*}
     */
    fetchUserid() {
        return fecthData(this.conf["getUserInfo"])
            .then(res => {
                return res["_id"];
            });
    }

    /**
     *
     * @param id
     * @returns {*}
     */
    fetchPublicPost(id) {
        return fecthData(this.conf["getPublicPostByUserid"].replace("{userid}", id));
    }

    /**
     *
     * @param id
     * @returns {*}
     */
    fetchStudyPost(id) {
        return fecthData(this.conf["getStudyPostByUserid"].replace("{userid}", id));
    }

    /**
     * runTasks
     */
    runTasks() {
        var self = this;

        successLog("api任务开始");

        return Promise
            .all([
                self.fetchUserid()
                    .then(this.fetchUserid.bind(this)),
                self.fetchUserid()
                    .then(this.fetchStudyPost.bind(this))
            ])
            .then(res => {
                successLog("fetchPublicPost:", res[0]);
                successLog("fetchStudyPost:", res[1]);
            })
            .catch(err => {
                warnLog(err);
            })
            .finally(() => {
                successLog("api任务结束");
            });
    }
}