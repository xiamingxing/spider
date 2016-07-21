"use strict";

import SpiderPromise from "./spider";

import ApiPromise from "./api";

import Analyzer from "./analyzer";

import config from "../conf/source";

import apiConfig from "../conf/api";

function start(){
    new SpiderPromise(config).runTasks();
    new ApiPromise(apiConfig).runTasks();
    new Analyzer().runTasks();
}

start();