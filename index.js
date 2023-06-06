const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const lookup = {};
app.use(bodyParser.json());

/**
 * POST /receipts/process
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} - response object
 */

app.post("/receipts/process", (req, res) => {
    const receipt = req.body;
    if (!isValidReceipt(receipt)) {
        return res.status(400).json({ error: "The receipt is invalid" });
    }
    const id = uuidv4();
    lookup[id] = receipt;
    return res.json({ id });
});

/**
 * GET /receipts/:id/points
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} - response object
 */

app.get("/receipts/:id/points", (req, res) => {
    const { id } = req.params;
    if (id in lookup) {
        const receipt = lookup[id];
        const points = calculatePoints(receipt);
        return res.json({ points });
    } else {
        return res.status(404).json({ error: "No receipt found for that ID" });
    }
});

/**
 * Checks if receipt is valid
 * @param {Object} receipt - receipt object
 * @returns {boolean} - true if receipt is valid, false otherwise
 */

function isValidReceipt(receipt) {
    // creating regular expressions for fields

    // const retailerPattern = new RegExp("^\\S+$");

    const dateRegex = new RegExp(
        "^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$"
    );
    const timeRegex = new RegExp(
        "^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$"
    );
    const totalPattern = new RegExp("\\d+\\.\\d{2}");
    const shortDescriptionPattern = new RegExp("^[\\w\\s\\-]+$");
    const pricePattern = new RegExp("^\\d+\\.\\d{2}$");

    // validating fields if they exist and are of the correct type
    if (typeof receipt.retailer !== "string") {
        return false;
    }

    if (
        typeof receipt.purchaseDate !== "string" ||
        !dateRegex.test(receipt.purchaseDate)
    ) {
        return false;
    }

    if (
        typeof receipt.purchaseTime !== "string" ||
        !timeRegex.test(receipt.purchaseTime)
    ) {
        return false;
    }

    if (!Array.isArray(receipt.items) || receipt.items.length < 1) {
        return false;
    }

    if (
        typeof receipt.total !== "string" ||
        !totalPattern.test(receipt.total)
    ) {
        return false;
    }

    receipt.items.forEach((item) => {
        if (
            typeof item.shortDescription !== "string" ||
            !shortDescriptionPattern.test(item.shortDescription)
        ) {
            return false;
        }

        if (typeof item.price !== "string" || !pricePattern.test(item.price)) {
            return false;
        }
    });

    return true;
}

/**
 * Get alphanumeric count
 * @param {String} str - string to count
 * @returns {Number} count - alphanumeric count
 */

function getAlphaNumericCount(str) {
    const alphanumericChars = str.match(/[a-zA-Z0-9]/g);
    return alphanumericChars ? alphanumericChars.length : 0;
}

/**
 * Get round dollar amount
 * @param {String} total - total amount
 * @returns {Number} count - 1 if total is round dollar amount, 0 otherwise
 */

function getRoundDollarAmount(total) {
    const roundedTotal = Math.round(parseFloat(total));
    if (total == roundedTotal) return 1;
    return 0;
}

/**
 * Get if it is multiple of 0.25
 * @param {String} total - total amount
 * @returns {Number} count - 1 if total is multiple of 0.25, 0 otherwise
 */

function getmultiple(total) {
    if (total % 0.25 === 0) return 1;
    return 0;
}
/**
 * Get item count
 * @param {Array} items - items array
 * @returns {Number} - pair item count
 */

function itemcount(items) {
    return parseInt(items.length / 2);
}

/**
 * Get trimmed length points
 * @param {Object} item - item object
 * @returns {Number} pointsEarned - points earned
 * @description
 * 1. Trim the shortDescription
 * 2. If the trimmed length is divisible by 3, then pointsEarned = Math.ceil(price * 0.2)
 * 3. Return pointsEarned
 */

function trimmedLengthPoints(item) {
    const trimmedLength = item.shortDescription.trim().length;
    let pointsEarned = 0;
    if (trimmedLength % 3 === 0) {
        pointsEarned = Math.ceil(parseInt(item.price) * 0.2);
    }
    return pointsEarned;
}

/**
 * Get purchase date points
 * @param {String} purchaseDate - purchase date
 * @returns {Number} pointsEarned - points earned
 * @description
 * 1. Get the day from the purchaseDate
 * 2. If the day is odd, then  pointsEarned = 1 else pointsEarned = 0
 * 3. Return pointsEarned
 */

function purchaseDatePoints(purchaseDate) {
    const day = parseInt(purchaseDate.split("-")[2]);
    if (day % 2 === 1) return 1;
    return 0;
}

/**
 * Get purchase time points
 * @param {String} purchaseTime - purchase time
 * @returns {Number} pointsEarned - points earned
 * @description
 * 1. Get the hour from the purchaseTime
 * 2. If the hour is between 2pm and 4pm, then pointsEarned = 1
 *    else pointsEarned = 0
 * 3. Return pointsEarned
 */

function purchaseTimePoints(purchaseTime) {
    const purchaseHour = parseInt(purchaseTime.split(":")[0]);
    if (purchaseHour >= 14 && purchaseHour <= 16) return 1;
    return 0;
}

/**
 * Calculate points
 * @param {Object} receipt - receipt object
 * @returns {Number} points - points earned
 * @description
 * 1. Get the alphanumeric count of the retailer and add it to points
 * 2. Get the round dollar amount points and add it to points
 * 3. Get the multiple of 0.25 points and add it to points
 * 4. Get the item count points and add it to points
 * 5. For each item in the items array, get the trimmed length points and add it to points
 * 6. Get the purchase date points and add it to points
 * 7. Get the purchase time points and add it to points
 * 8. Return points
 *
 */

function calculatePoints(receipt) {
    let points = 0;
    points += getAlphaNumericCount(receipt.retailer);
    points += getRoundDollarAmount(receipt.total) * 50;
    points += getmultiple(receipt.total) * 25;
    points += itemcount(receipt.items) * 5;
    receipt.items.forEach((item) => {
        points += trimmedLengthPoints(item);
    });
    points += purchaseDatePoints(receipt.purchaseDate) * 6;
    points += purchaseTimePoints(receipt.purchaseTime) * 10;
    return points;
}

app.listen(port, () => {
    console.log(`fetch app listening on port ${port}`);
});

module.exports = app;
