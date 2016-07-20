"use strict";

import path from "path";

import fs from "fs";

import chalk from "chalk";

import moment from "moment";

const logPath = path.resolve(path.dirname(__dirname), "log");

const logStyle = {
    "success": "green",
    "warn": "red",
    "default": "green"
};

/**
 *
 * @param filename
 * @param data
 */
function writeLog(filename, data) {
    let fileFullPath = path.join(logPath, filename);

    fs.exists(fileFullPath, err => {
        if (err) {
            fs.appendFile(fileFullPath, data);
        }
        else {
            fs.writeFile(fileFullPath, data);
        }
    });
}

/**
 *
 * @param type
 */
function output(type) {
    let style = logStyle[type] || logStyle.default;

    if (typeof chalk[style] !== "function") {
        style = "green";
    }

    console.log.apply(console, Array.prototype.slice.call(arguments, 1).map(item => {
        return chalk[style](JSON.stringify(item));
    }));

    writeLog(`${moment().format("L").replace(/\//ig, "-")}.${type}.log`, Array.prototype.slice.call(arguments, 1).map(item => {
        return JSON.stringify(item);
    }).join("\t") + "\n");
}

/**
 * @param arguments
 */
function successLog() {
    output.apply(null, ["success", moment().format()].concat(Array.prototype.slice.call(arguments, 0)));
}

/**
 * @param arguments
 */
function warnLog() {
    output.apply(null, ["warn", moment().format()].concat(Array.prototype.slice.call(arguments, 0)));
}

module.exports = {output, successLog, warnLog};