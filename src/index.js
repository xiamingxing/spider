'use strict';

import "babel-core/register"

import "babel-polyfill"

import path from "path";

import SpiderPromise from "./spider"

import ApiPromise from "./api"

import SqliteDb from "./sqliteDb"

import config from "../conf/source"

import apiConfig from "../conf/api"


function start(){
    new SpiderPromise(config).runTasks();
    new ApiPromise(apiConfig).runTasks();
    // SqliteDb.run(`show tables;`, function () {
    //     console.log(arguments);
    // })
}

start();