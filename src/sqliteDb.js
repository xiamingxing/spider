"use strict";

import fs from "fs";

import path from "path";

import Promise from "promise";

import sqlite3 from "sqlite3";

import config from "../conf/db";

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
    let _sqlite3 = config.debug ? sqlite3.verbose() : sqlite3,
        _dbpath = path.resolve(config.path);

    if (!global.cache[_dbpath]) {

        if (await checkDbfile(_dbpath)){
            global.cache[_dbpath] = new _sqlite3.Database(_dbpath);
        }
        else {
            throw new Error("can`t find" + _dbpath);
        }
    }

    return global.cache[_dbpath];
}

module.exports = getSqliteDb();