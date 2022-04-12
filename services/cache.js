const util = require('util');
const redis = require('redis');
const keys = require('../config/keys');
const mongoose = require('mongoose');
const { mongo } = require('mongoose');

const redisUrl = keys.redisUrl;

const client = redis.createClient(redisUrl);

client.on("error", function (err) {
    console.log("Error " + err);
});


client.hget = util.promisify(client.hget);

//get mongoose execution funtion
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
};

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }
    //get key
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    console.log("KEY", this.hashKey);

    const cacheValue = await client.hget(this.hashKey, key);
    console.log("cacheValue", cacheValue);

    if (cacheValue) {
        const doc = JSON.parse(cacheValue);
        //if doc is an array, map and parse individual docs
        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
    }

    //exec query
    const result = await exec.apply(this, arguments);
    client.hset(this.hashKey, key, JSON.stringify(result), "EX", 10);
    console.log("Result", new this.model(result));
    return result;
};

function clearHash(key) {
    client.del(JSON.stringify(key));
}

module.exports = {
    clearHash
};