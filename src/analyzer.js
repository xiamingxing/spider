"use strict";

import EventEmitter from "events";

import fs from "fs";

import path from "path";

import Promise from "promise";

import {getSqliteDb} from "./sqliteDb";


/**
 *
 * @param dirPath
 * @returns {*}
 */
function readDir(dirPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(files.map(file=> {
                    return path.resolve(dirPath, file);
                }));
            }
        });
    });
}

/**
 *
 * @param filepath
 * @returns {*}
 */
function readFile(filepath) {
    return new Promise((resolve, reject) => {
        fs.exists(filepath, isExists => {
            if (isExists) {
                fs.readFile(filepath, (err, content) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(content.toString());
                    }
                });
            }
            else {
                reject(`${filepath} not found\n`);
            }
        });
    });
}

/**
 *
 * @param filePath
 * @returns {*}
 */
function rmFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}

/**
 *
 * @param content
 * @returns {*}
 */
function formatSql(content = "") {
    return content.replace(/"/ig, "").split("\n").map(line => {
        return line.split("\t");
    });
}

/**
 *
 * @param db
 * @param record
 * @returns {*}
 */
function insertSingleRecord(db, tableName, record) {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO " + tableName + "(time, msg, content) VALUES (?, ?, ?);", Object.assign(["", "", ""], record), function(err){
            if (err) {
                reject(err);
            }
            else {
                resolve(this.lastID);
            }
        });
    });
}


/**
 *
 * @param db
 * @param tableName
 * @returns {Function}
 */
function genInsertSqlFunc(db, tableName) {
    return function (records = []) {
        return Promise.all(records.map(record => {
            return insertSingleRecord(db, tableName, record);
        }));
    };
}

/**
 *
 * @param db
 * @param tableName
 * @param filePath
 * @returns {*}
 */
function analysisFile(db, tableName, filePath) {
    return readFile(filePath)
        .then(formatSql)
        .then(genInsertSqlFunc(db, tableName))
        .then(res => {
            rmFile(filePath);
            return res;
        });
}

/**
 *
 * @param db
 * @param tableName
 * @returns {Function}
 */
function genAllFilesAnalysisFunc(db, tableName) {
    return function (files) {
        return Promise.all(files.map((file => {
            return analysisFile(db, tableName, file);
        })));
    };
}

export default class Analyzer extends EventEmitter {

    /**
     *
     * @param conf
     */
    constructor(conf) {
        super();
        this.conf = Object.assign({
            "tableName": "log_record",
            "tableStatement": "CREATE TABLE IF NOT EXISTS log_record  (id INTEGER PRIMARY KEY AUTOINCREMENT, time CHAR(50) NOT NULL, msg CHAR(50) NOT NULL,  content TEXT);",
            "logPath": "./log",
            "debug": false,
            "dbPath": "./data/sqlite.db"
        }, conf);
    }

    /**
     *
     * @returns {*}
     */
    async runTasks() {
        return readDir(path.resolve(this.conf["logPath"]))
            .then(genAllFilesAnalysisFunc(await getSqliteDb(this.conf), this.conf["tableName"]))
            .then(res => {
                console.log(res);
            });
    }
}