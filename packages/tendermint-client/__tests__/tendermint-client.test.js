'use strict';

const tendermintClient = require('..');
const assert = require('assert').strict;

assert.strictEqual(tendermintClient(), 'Hello from tendermintClient');
console.info("tendermintClient tests passed");
