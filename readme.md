# Devlopment of Api's

## Server
This code is completed using node.js as backend environment using javascript and express.js for api developement and uuid for unique id generation.
The endpoints for the project is exposed on PORT 3000 on docker.
To build using docker use command:

```
docker build -t fetch-assignment .
```

to  bind docker Container to PORT 3000 use command:

```
docker run -d -p 3000:3000 fetch-assignment
```

To run code without docker make sure to install nodejs and  go to root of project code where package.json resides and run commands:

for installing dependencies:
```
npm install 
```

for running project:
``` 
node index.js
```

to run tests:

```
npm test
```

## Running a client

we can use curl CLI to test the output
to test the POST receipts/process endpoint use:

```
curl -X POST -d <receipt_object> -H "Content-Type: application/json" "http://localhost:3000/receipts/process"
```
where receipt_object needs to substitued by real receipt object

example:
```
curl -X POST -d '{
  "retailer": "Target",
  "purchaseDate": "2022-01-01",
  "purchaseTime": "13:01",
  "items": [
    {
      "shortDescription": "Mountain Dew 12PK",
      "price": "6.49"
    },{
      "shortDescription": "Emils Cheese Pizza",
      "price": "12.25"
    },{
      "shortDescription": "Knorr Creamy Chicken",
      "price": "1.26"
    },{
      "shortDescription": "Doritos Nacho Cheese",
      "price": "3.35"
    },{
      "shortDescription": "   Klarbrunn 12-PK 12 FL OZ  ",
      "price": "12.00"
    }
  ],
  "total": "35.35"
}' -H "Content-Type: application/json" "http://localhost:3000/receipts/process"
```


to test the GET /receipts/:id/points endpoint use :

```
curl http://localhost:3000/receipts/<id>/points
```
