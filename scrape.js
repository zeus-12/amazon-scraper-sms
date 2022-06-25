//Packages
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

//dummy values
const fromNumber = 9876543210
const toNumber = 1234567890

const url ="https://www.amazon.in/Apple-MacBook-Chip-13-inch-512GB/dp/B08N5WRWNW/ref=sr_1_3?keywords=m1+macbook+pro&qid=1656149178&sprefix=m1+macbok%2Caps%2C293&sr=8-3"
const product = { name: "", price: "", link: "" };
const moneyLimit = 75000

//Set interval
const handle = setInterval( scrape , 20000);

async function scrape() {
  const { data } = await axios.get(url);

  //Load up the html
  const $ = cheerio.load(data);
  const item = $("div#dp-container");

  //Extracting the required data
  product.name = $(item).find("h1 span#productTitle").text().trim();
  product.link = url;
  const price = $(item)
    .find("span .a-price-whole")
    .first()
    .text()
    .replace(/[,.]/g, "");
  const priceNum = parseInt(price);
  product.price = priceNum;
  
  //Send an SMS
  if (priceNum && priceNum < moneyLimit) {
    client.messages
      .create({
        body: `The price of ${product.name} went below ${price}. Purchase it at ${product.link}`,
        from: fromNumber,
        to: toNumber,
      })
      .then((message) => {
        console.log(message);
        clearInterval(handle);
      });
  }
}

scrape();
