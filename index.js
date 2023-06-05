const express = require("express");
const app = express();
const port = 3001;
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const lookup = {};
app.use(bodyParser.json());
app.post("/receipts/process", (req, res) => {
  const receipt = req.body;
  if (!isValidReceipt(receipt)) {
    return res.status(400).json({ error: "The receipt is invalid" });
  }
  const id = uuidv4();
  lookup[id] = receipt;

  return res.json({ id });
});

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

function isValidReceipt(receipt) {
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

  if (typeof receipt.total !== "string" || !totalPattern.test(receipt.total)) {
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

function getAlphaNumericCount(str) {
  const alphanumericChars = str.match(/[a-zA-Z0-9]/g);
  return alphanumericChars ? alphanumericChars.length : 0;
}
function getRoundDollarAmount(total) {
  const roundedTotal = Math.round(parseFloat(total));
  if (total == roundedTotal) return 1;
  return 0;
}
function getmultiple(total) {
  if (total % 0.25 === 0) return 1;
  return 0;
}
function itemcount(items) {
  return parseInt(items.length / 2);
}
function trimmedLengthPoints(item) {
  const trimmedLength = item.shortDescription.trim().length;

  let pointsEarned = 0;
  if (trimmedLength % 3 === 0) {
    pointsEarned = Math.ceil(parseInt(item.price) * 0.2);
  }
  return pointsEarned;
}
function purchaseDatePoints(purchaseDate) {
  const day = parseInt(purchaseDate.split("-")[2]);

  if (day % 2 === 1) return 1;
  return 0;
}
function purchaseTimePoints(purchaseTime) {
  const purchaseHour = parseInt(purchaseTime.split(":")[0]);
  if (purchaseHour >= 14 && purchaseHour <= 16) return 1;
  return 0;
}

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
