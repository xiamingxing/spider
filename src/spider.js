'use strict';

import request from "request";

import Promise from "promise";

import EventEmitter from "events";

import fs from "fs";

import path from "path";

import cheerio from "cheerio";

import {exec} from "shelljs";

import {successLog, warnLog} from "./log"

/**
 * 数据存储路径
 * @type {string}
 */
const dataPath = path.resolve(path.dirname(__dirname), 'data');

/**
 * 日志存储路径
 * @type {string}
 */
const logPath = path.resolve(path.dirname(__dirname), 'log');

/**
 *
 * @param url
 * @returns {*}
 */
function crawleWebpage(url) {
    return new Promise((resolve, reject) => {
        request.get(url, {encoding: "utf8"}, (err, req, body) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(body);
            }
        });
    })
}

/**
 *
 * @param content
 * @param filter
 * @returns {*}
 */
function convertWebpage(content, filter) {
    let $ = cheerio.load(content);
    $(filter.orgin).text(filter.target);
    return $.html();
}

/**
 *
 * @param key
 * @param filedata
 * @returns {*}
 */
function saveToLocal(filepath, filedata) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filepath, filedata, err => {
            if (err) {
                reject(err)
            }
            else {
                resolve(filepath);
            }
        });
    });
}

/**
 *
 * @param key
 * @returns {*}
 */
function generateLocalPath(key) {
    return path.join(dataPath, key + "_" + new Date().getFullYear() + '.html');
}

/**
 *
 * @returns {*}
 */
function generateLogPath() {
    return path.join(logPath, new Date().getFullYear() + '.json');
}


export default class SpiderPromise extends EventEmitter {
    /**
     *
     * @param conf
     */
    constructor(conf) {
        super();
        this.conf = Object.assign({}, conf);
    }

    /**
     *
     * @param config
     * @returns {*}
     */
    excuteTask(config) {
        return crawleWebpage(config.url)
            .then(content => {
                return convertWebpage(content, config.filter);
            })
            .then(filedata => {
                return saveToLocal(generateLocalPath(config.key), filedata);
            })
            .then(filepath => {
                config.filepath = filepath;
                return config;
            });

    }

    /**
     * runTasks
     */
    runTasks() {
        let self = this;

        successLog("spider任务开始");

        return Promise.
            all(this.conf.tasks.map(item => {
                return self.excuteTask(item);
            }))
            .then(res => {
                return saveToLocal(generateLogPath(), JSON.stringify(res));
            })
            .then(filepath => {
                successLog("task run complete!")
                exec('cat ' + filepath);
            })
            .catch(err => {
                warnLog("task run fail!");
                warnLog(err);
            })
            .finally(() =>{
                successLog("spider任务结束");
            });
    }
}


