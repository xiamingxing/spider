"use strict";

import fs from "fs";

import path from "path";

import Promise from "promise";

import sqlite3 from "sqlite3";

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
                    else {
                        resolve(filepath);
                    }
                });
            }
        });
    });
}

/**
 *
 * @param sqliteDb
 * @param statement
 */
async function createTable(sqliteDb, statement) {
    await sqliteDb.run(statement);
}

/**
 *
 * @param config
 * @returns {*}
 */
async function getSqliteDb(config) {
    let sqlite3Cls = config.debug ? sqlite3.verbose() : sqlite3,
        dbpath = path.resolve(config.dbPath),
        sqliteDb = global.cache[dbpath];

    if (!sqliteDb) {

        if (await checkDbfile(dbpath)) {
            sqliteDb = new sqlite3Cls.Database(dbpath);
        }
        else {
            throw new Error("can`t find" + dbpath);
        }
    }

    await createTable(sqliteDb, config.tableStatement);

    return global.cache[dbpath] = sqliteDb;
}

module.exports = {getSqliteDb};