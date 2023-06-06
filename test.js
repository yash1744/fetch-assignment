const chai = require("chai");
const chaiHttp = require("chai-http");
const { v4: uuidv4 } = require("uuid");
const app = require("./index");
chai.use(chaiHttp);
const expect = chai.expect;

/**
 * create three receipts which of two are provided in the assignment
 * and one is invalid
 */

const receipt1 = {
    retailer: "Target",
    purchaseDate: "2022-01-01",
    purchaseTime: "13:01",
    items: [
        {
            shortDescription: "Mountain Dew 12PK",
            price: "6.49"
        },
        {
            shortDescription: "Emils Cheese Pizza",
            price: "12.25"
        },
        {
            shortDescription: "Knorr Creamy Chicken",
            price: "1.26"
        },
        {
            shortDescription: "Doritos Nacho Cheese",
            price: "3.35"
        },
        {
            shortDescription: "   Klarbrunn 12-PK 12 FL OZ  ",
            price: "12.00"
        }
    ],
    total: "35.35"
};

const receipt2 = {
    retailer: "M&M Corner Market",
    purchaseDate: "2022-03-20",
    purchaseTime: "14:33",
    items: [
        {
            shortDescription: "Gatorade",
            price: "2.25"
        },
        {
            shortDescription: "Gatorade",
            price: "2.25"
        },
        {
            shortDescription: "Gatorade",
            price: "2.25"
        },
        {
            shortDescription: "Gatorade",
            price: "2.25"
        }
    ],
    total: "9.00"
};

const invalidReceipt = {};

/**
 * receiptId1 and receiptId2 are used to store id's of the valid receipts
 */

let receiptId1;
let receiptId2;

/**
 * Test cases for the API
 */

describe("fetch assignment API", () => {

    /**
     * Test cases for POST /receipts/process
     * 1. should return a receipt ID for receipt1
     * 2. should return a receipt ID for receipt2
     * 3. should return an error for invalid receipt
     */

    describe("POST /receipts/process", () => {
        it("should return a receipt ID for receipt1", (done) => {
            chai.request(app)
                .post("/receipts/process")
                .send(receipt1)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property("id");
                    receiptId1 = res.body.id;
                    done();
                });
        });
        it("should return a receipt ID for receipt2", (done) => {
            chai.request(app)
                .post("/receipts/process")
                .send(receipt2)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property("id");
                    receiptId2 = res.body.id;
                    done();
                });
        });
        it("should return an error for invalid receipt", (done) => {
            chai.request(app)
                .post("/receipts/process")
                .send(invalidReceipt)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property("error");
                    done();
                });
        });
    });

    /**
     * Test cases for GET /receipts/:id/points
     * 1. should return correct points for receipt1
     * 2. should return correct points for receipt2
     * 3. should return an error for an invalid receipt ID
     */

    describe("GET /receipts/:id/points", () => {
        it("should return correct points for receipt1", (done) => {
            chai.request(app)
                .get(`/receipts/${receiptId1}/points`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property("points");
                    expect(res.body.points).to.equal(28);
                    done();
                });
        });
        it("should return correct points for receipt2", (done) => {
            chai.request(app)
                .get(`/receipts/${receiptId2}/points`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property("points");
                    expect(res.body.points).to.equal(109);
                    done();
                });
        });

        it("should return an error for an invalid receipt ID", (done) => {
            const invalidReceiptId = uuidv4();
            chai.request(app)
                .get(`/receipts/${invalidReceiptId}/points`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property("error");
                    done();
                });
        });
    });
});
