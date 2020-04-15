require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

const app = express();

// we need to do this is order to serve our static files
app.use(express.static("public"));

// We tell the app to use body-parser in oder to access the the post request body
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function (req, res) {
  const fname = req.body.fname;
  const lname = req.body.lname;
  const email = req.body.email;
  console.log(fname + " " + lname + " " + email);

  // we create a object to save the date enter in the form
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: fname,
          LNAME: lname,
        },
      },
    ],
  };

  // we convert the data in order to be able to post it to the Mailchip API
  const jsonData = JSON.stringify(data);
  // API end point - we replace usX for us19 to match the number on oir API KEY
  const url =
    "https://us19.api.mailchimp.com/3.0/lists/" + process.env["LISTID"];

  const options = {
    method: "POST",
    auth: process.env["APIKEY"],
  };

  const request = https.request(url, options, function (response) {
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }

    response.on("data", function (data) {
      console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();
});

// route to hanle the post request from the failure page to redirect to the home page
app.post("/failure", function (req, res) {
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function (req, res) {
  console.log("Server is running on port 3000");
});
