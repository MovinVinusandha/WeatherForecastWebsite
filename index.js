import 'dotenv/config'
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";


const app = express();
const port = 3000;
const appid = process.env.APPID;

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const date = new Date();
const today = date.getDate() + " " + monthNames[date.getMonth()];


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


let lat = 6.235062;
let lon = 80.052930;

let response1 = '';
let response2 = '';
let response3 = '';
let sunTime = '';


function unixTimeConvert(timestamp){
    const d = new Date(timestamp * 1000);
    const hour = d.getHours();
    const minit = d.getMinutes();
    
    const timeFormat = hour + ":" + minit;
    console.log("time format:",timeFormat);
    return timeFormat;
}

// geting current location using user public ip address
async function currentLocation(getIp){
    let ip = getIp;
    
    // If you are using localhost, change its IP address to a real IP address
    if (ip == "::1"){
        ip = "157.245.55.252"   // put your actual ip address
    }
    
    const ipLocationURL = `https://get.geojs.io/v1/ip/geo/${ip}.json`;

    response3 = await axios.post(ipLocationURL);
    lat = response3.data.latitude
    lon = response3.data.longitude
}


// current weather forcast
app.get("/", async (req, res) => {

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    currentLocation(ip);

    const URL1 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appid}&units=metric`;
    const URL2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appid}&units=metric&cnt=6`;
    
    try{
        response1 = await axios.post(URL1);
        response2 = await axios.post(URL2);


        sunTime = {
            sunrise: unixTimeConvert(response1.data.sys.sunrise),
            sunset: unixTimeConvert(response1.data.sys.sunset)
        }
        


        res.render("index.ejs", {
            content: response1.data,
            hourly: response2.data,
            sunTime: sunTime,
            date: today
        });
        
    }
    catch (error) {
        res.render("index.ejs", { content: JSON.stringify(error.response1), hourly: JSON.stringify(error.hourly) });
    }

});


// find specific location weather forcast
app.post("/find", async (req, res) => {
    let request = req.body.city

    if (request){
        const URL = `http://api.openweathermap.org/geo/1.0/direct?q=${request}&limit=4&appid=${appid}`;
        
        try{
            response3 = await axios.get(URL);
            const Data = response3.data;


            res.render("index.ejs", {
            content: response1.data,
            hourly: response2.data,
            sunTime: sunTime,
            date: today,

            citys: Data,
            });

        
        }catch (err){
            console.log(err);
        };

    }else{
        res.redirect("/");
    };

});


app.post("/coordinate", async (req, res) => {

    lat = req.body.lat;
    lon = req.body.lon;

    res.redirect("/");
});


app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`);
});