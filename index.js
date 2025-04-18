import express from "express";
import axios from "axios";
// import bodyParser from "body-parser";


const app = express();
const port = 3000;
const lat = 6.235062;
const lon = 80.052930;
const appid = "ee3afac96399903db306493fb534dca2";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const date = new Date();
const today = date.getDate() + " " + monthNames[date.getMonth()];


app.use(express.static("public"));
// app.use(bodyParser.urlencoded({ extended: true }));


function unixTimeConvert(timestamp){
    const d = new Date(timestamp * 1000);
    const hour = d.getHours();
    const minit = d.getMinutes();
    
    const timeFormat = hour + ":" + minit;
    console.log("time format:",timeFormat);
    return timeFormat;
}


// current weather forcast
app.get("/", async (req, res) => {
    const URL1 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appid}&units=metric`;
    const URL2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${appid}&units=metric&cnt=6`;
    try{
        const response1 = await axios.post(URL1);
        const response2 = await axios.post(URL2);


        const sunTime = {
            sunrise: unixTimeConvert(response1.data.sys.sunrise),
            sunset: unixTimeConvert(response1.data.sys.sunset)
        }
        console.log("sun time:",sunTime);
        

        res.render("index.ejs", {
            content: response1.data,
            hourly: response2.data,
            sunTime: sunTime,
            date: today
        });
        
    }
    catch (error) {
        res.render("index.ejs", { content: JSON.stringify(error.response1.data), hourly: JSON.stringify(error.hourly.data) });
    }

});


app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`);
});