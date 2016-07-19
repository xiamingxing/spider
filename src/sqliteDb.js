'use strict';

import fs from "fs";

import path from "path";

import Promise from "promise";

import sqlite3 from "sqlite3";

import config from "../conf/db"

/**
 * 
 * @type {*}
 */
global.cache = Object.assign({}, global.cache);

/**
 *
 * @param filepath
 * @returns {*}
 */
function checkDbfile(filepath) {
    return new Promise((resolve, reject) => {
        fs.exists(filepath, isExists => {
            if (isExists) {
                resolve(filepath);
            }
            else {
                fs.writeFile(filepath, "", err => {
                    if (err) {
                        reject(err);
                    }
                    else{
                        resolve(filepath);
                    }
                });
            }
        });
    });
}

/**
 *
 * @returns {*}
 */
async function getSqliteDb() {
    let _sqlite3 = config.debug ? sqlite3.verbose() : sqlite3;

    config.path = path.resolve(config.path);

    if (!global.cache[config.path]) {

        if (await (checkDbfile(config.path))){
            global.cache[config.path] = new _sqlite3.Database(config.path);
        }
    }

    return global.cache[config.path];
}

module.exports = getSqliteDb()