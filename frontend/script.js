import { showevents } from "./calendar.js";
import { speak } from "./voicerecognition.js";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/server-url");
    const data = await res.json();

    console.log("server url:", data.url);

    generateQR(data.url);
  } catch (err) {
    console.log("QR init failed:", err);
  }
});
window.addEventListener("online", () => {

  console.log("Internet connected");

  location.reload();

});

window.addEventListener("offline", () => {

  console.log("Internet disconnected");

});
let curricon=`<i class="fi fi-rr-brightness"></i>`;
const maindiv = document.getElementById("container");
let currcity="";
let currtemp="";
let currhumidity="";
let currdesc="";

let longitude;
let latitude;
const now = new Date();
let ampm;
let slideshowinterval=null;
 // 0–6
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// 🌅 Morning / Afternoon / Evening / Night
let speech=""
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", getlocation);
} else {
  getlocation();
}
let period = "";
function updateClock() {
  const now = new Date();
const day = now.getDay();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  ampm = hours >= 12 ? "PM" : "AM";

  if (hours >= 5 && hours < 12) {
    period = "Morning";
  }
  else if (hours >= 12 && hours < 17) {
    period = "Afternoon";

  }
  else if (hours >= 17 && hours < 19) {
    period = "Evening";
  
  }
  else {
    period = "Night";
    
  }
  // convert 24h → 12h format
  hours = hours % 12 || 12;

  const time = `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes
    }`;
console.log(time)
document.querySelectorAll(".time").forEach((el)=>{
  el.innerText=time
})
  
if(period=="Night"){
curricon=`<i class="fi fi-rr-moon-stars"></i>`;
  document.getElementById("card1").style.backgroundImage=`url("http://127.0.0.1:8000/thumbnails/day-and-night-portrait-background-with-trees-silhouette-free-vector2.jpg")`
document.getElementById("forecast").style.backgroundColor="black";
document.getElementById("hourly").style.backgroundColor="black";
document.getElementById("div1").style.backgroundColor="black";
document.getElementById("weathericon").style.backgroundColor="black";


}
else{
curricon=`<i class="fi fi-rr-brightness"></i>`;

  document.getElementById("card1").style.backgroundImage=`url("http://127.0.0.1:8000/thumbnails/day-and-night-portrait-background-with-trees-silhouette-free-vector.jpg")`
document.getElementById("forecast").style.backgroundColor="dodgerblue";
document.getElementById("hourly").style.backgroundColor="dodgerblue";
document.getElementById("div1").style.backgroundColor="dodgerblue";
document.getElementById("weathericon").style.backgroundColor="dodgerblue";


}
  // Date

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  // Day name
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];


  // Update DOM
 document.querySelectorAll(".greetings").forEach(el=>{
      el.innerHTML=`Good ${period}`;
    })
  document.querySelectorAll(".day").forEach(el => {
    el.innerHTML = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} • ${weekdays[day]}`;
  })
}
// update every second
setInterval(updateClock, 1000);



async function getlocation() {
  if (!navigator.geolocation) {
    console.log("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const { latitude, longitude } = coords;

      getweatherbylocation(latitude, longitude);
    },
    (error) => {
      console.error(`Geolocation error (${error.code}): ${error.message}`);
    },
    {
      enableHighAccuracy: true,   // better GPS precision
      timeout: 5000,              // avoids hanging too long
      maximumAge: 0               // forces fresh location
    }
  );
}





function weathericon(description) {
  const desc = ["clear sky", "few clouds", "scattered clouds", "broken clouds", "shower rain", "rain", "thunderstorm", "snow", "mist", "overcast clouds", "light rain", "moderate rain", "heavy intensity rain", "haze", "light intensity shower rain","dust"];
  const descicon = [curricon, `<i class="fi fi-tr-cloud-sun"></i>`, '<i class="fi fi-rr-clouds-sun"></i>', '<i class="fi fi-tr-clouds"></i>', '<i class="fi fi-tr-cloud-showers-heavy"></i>', '<i class="fi fi-ts-umbrella"></i>', '<i class="fi fi-tr-thunderstorm"></i>', '<i class="fi fi-rr-snowflakes"></i>', '<i class="fi fi-rr-smog"></i>', '<i class="fi fi-ts-clouds"></i>', '<i class="fi fi-tr-cloud-rain"></i>', '<i class="fi fi-rs-cloud-hail-mixed"></i>', '<i class="fi fi-rr-cloud-hail"></i>', '<i class="fi fi-rr-cloud-hail"></i>', '<i class="fi fi-ts-cloud-showers-heavy"></i>','<i class="fi fi-rr-sun-dust"></i>'];

  const position = desc.indexOf(description);
  return descicon[position];
}


function desc(description) {
  const quote = [" it's a nice weather outside.", "Clouds are beautiful outside", "Don't forget your umbrella", "Winds are speedy today", "Look plants can dance too.", "Weather is getting watery.", "Avoid going out it's lightning.", "Nice day for a snowman.", "Drive safe low visibility", "It could rain just wait", "Nice time for a tea", "Outside is beautiful in rain.", "Heavy rain avoid going out today", "It may be foggy outside", "Raining slowly carry an umbrella.","Wear a mask while going outside."];
  const desc = ["clear sky", "few clouds", "scattered clouds", "broken clouds", "shower rain", "rain", "thunderstorm", "snow", "mist", "overcast clouds", "light rain", "moderate rain", "heavy intensity rain", "haze", "light intensity shower rain","dust"];
  const position = desc.indexOf(description);
  return quote[position];
};

const apikey = "771268cf58226d55a8385e574cac8de9";
/*get weather by location*/
async function getweatherbylocation(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`;
    const url2 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`;
    const response = await fetch(url);
    const response2 = await fetch(url2);
    var data = await response.json();
    var data2 = await response2.json();
    console.log(data2);
    console.log(data)
    setdetails(data2);
    setdata(data);
    currtemp=Math.round(data2.main.temp);
  currcity=data2.name;
  currdesc=data2.weather[0].main;
  currhumidity=data2.main.humidity;
  }
  catch (err) {
    document.getElementById("temp").innerHTML = "🤕";
    console.log(err);
  }
}


/*getting weather by city name*/

async function getweatherbycity(cityname) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${apikey}&units=metric`;
    const url2 = `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${apikey}&units=metric`;
    const response = await fetch(url);
    const response2 = await fetch(url2);
    var data = await response.json();
    var data2 = await response2.json();
    setdetails(data2)
    setdata(data)
currtemp=Math.round(data2.main.temp);
  currcity=data2.name;
   currdesc=data2.weather[0].main;
  currhumidity=data2.main.humidity;

  }
  catch (err) {
    document.getElementById("temp").innerHTML = "🤕";
    document.getElementById("location").innerHTML = "City not found..";
    console.log(err)


  }
}

// helper: most common weather
function mostCommon(arr) {
  const freq = {};
  let max = 0;
  let res = arr[0];

  for (const item of arr) {
    freq[item] = (freq[item] || 0) + 1;

    if (freq[item] > max) {
      max = freq[item];
      res = item;
    }
  }

  return res;
}
function dayname(datestr) {
  const date = new Date(datestr);

  return date.toLocaleDateString("en-US", {
    weekday: "long"
  });

}
function setdata(data) {
  const grouped = {};
  const todayForecast = [];
  // 1. Group by date
  for (let i = 0; i < data.list.length; i++) {
    const item = data.list[i];

    const date = new Date(item.dt * 1000)
      .toISOString()
      .split("T")[0];

    if (!grouped[date]) {
      grouped[date] = {
        time: [],
        temps: [],
        weather: []
      };
    }

    grouped[date].temps.push(item.main.temp);
    grouped[date].weather.push(item.weather[0].description);
  }

  for (let i = 0; i < 8; i++) {
    const item = data.list[i];

    const date = new Date(item.dt * 1000);

    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    todayForecast.push({
      time: `${hours}:00 ${ampm}`,
      temp: item.main.temp,
      weather: item.weather[0].description
    });
  }

  // 2. Convert to final array
  const result = [];

  for (let date in grouped) {
    const temps = grouped[date].temps;

    const avgTemp =
      temps.reduce((sum, t) => sum + t, 0) / temps.length;

    result.push({
      day: dayname(date),
      avgTemp: Number(avgTemp.toFixed(1)),
      weather: mostCommon(grouped[date].weather)
    });
  }

  let html = "";
  for (let i = 0; i < result.length; i++) {
    html += `
   
    <div><h5>${result[i].day}</h5>
                    <h2 class="temp" id="temp">${Math.round(result[i].avgTemp)}°</h2>
                    <p style="color:black;font-size:30px">${weathericon(result[i].weather)}</p>
                </div>`

  }

  document.getElementById("forecast").innerHTML =html;

  let html2 = ""
  for (let i = 0; i < todayForecast.length; i++) {
    html2 += `<div>
    <h3>${todayForecast[i].time}</h3>
    <h2>${Math.round(todayForecast[i].temp)}°</h2>
    <h3 style="font-size:30px">${weathericon(todayForecast[i].weather)}</h3>
</div>`
  }
  document.getElementById("hourly").innerHTML = html2;
}
function convert(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
}
let fg="";
function setdetails(data) {

  const description = data.weather[0].description;
  fg = "humidity is " + data.main.humidity + "% with " + data.weather[0].description;
  
  document.querySelectorAll(".temp").forEach(el => {
    el.innerHTML = Math.round(data.main.temp) + "°";
  });
  document.querySelectorAll(".city").forEach(
    el => {
      el.innerHTML = data.name + " .• " + data.sys.country;
    }
  )
  document.querySelectorAll(".desc").forEach(
    el => {
      el.innerHTML = data.weather[0].main;
    }
  )


  document.getElementById("feels").innerHTML = "Feels Like " + Math.round(data.main.feels_like) + "°";
  document.getElementById("hilo").innerHTML = "Low .• " + Math.round(data.main.temp_min) + "°" + " | " + "High .• " + Math.round(data.main.temp_max) + "°";
  document.getElementById("desc2").innerHTML = desc(description) + ". " + fg;

  document.querySelectorAll(".ic").forEach(el => {
    el.innerHTML = weathericon(description)

  });
  document.getElementById("h").innerHTML = `<i class="fi fi-rr-mountains"></i> ${data.main.humidity} %`;
  document.getElementById("w").innerHTML = `<i class="fi fi-rr-fan"></i> ${data.wind.speed} km/h`;
  document.getElementById("v").innerHTML = `<i class="fi fi-rr-car-alt"></i> ${data.visibility} m`;
  document.getElementById("day").innerHTML = convert(data.sys.sunrise);
  document.getElementById("night").innerHTML = convert(data.sys.sunset);
 


}

 

//landscapemode

export function landscapemode(){
  document.getElementById("")
}
export function reload(){
  location.reload()
}
export async function cityweatherquery(city){
 
   await getweatherbycity(city);
   openweatherconsole();
  setTimeout(() => {
    getlocation();
  }, 11000);

}


const alert=new Audio("timer.mp3");
export function startTimer(time, unit) {
  
document.getElementById("tagtop").innerHTML=`Going off in ${time} ${unit}`
let totalSeconds = 0;
time=Number(time);
unit=String(unit).toLowerCase();
  if (unit === "seconds" || unit ==="second") {
    totalSeconds = time;

  } else if (unit === "minutes" || unit==="minute") {
    totalSeconds = time * 60;

  } else if (unit === "hours" || unit==="hour") {
    totalSeconds = time * 60 * 60;
  }
  document.getElementById("timer").style.display="flex";

  const interval = setInterval(() => {

    const hours = String(
      Math.floor(totalSeconds / 3600)
    ).padStart(2, "0");

    const minutes = String(
      Math.floor((totalSeconds % 3600) / 60)
    ).padStart(2, "0");

    const seconds = String(
      totalSeconds % 60
    ).padStart(2, "0");
document.getElementById("timertime").innerHTML=`${hours}:${minutes}:${seconds}`

    totalSeconds--;

    if (totalSeconds < 0) {
      clearInterval(interval);
      document.getElementById("timertime").innerHTML=`Done`
      alert.play();
      setTimeout(() => {
        document.getElementById("timer").style.display="none";
      }, 30000);
    }

  }, 1000);
 


}
export function generateQR(text) {
  const el = document.getElementById("qrcode");

  if (!el) {
    console.log("QR container not found");
    return;
  }

  if (!text) {
    console.log("QR text is empty");
    return;
  }

  el.innerHTML = "";

  new QRCode(el, {
    text: text,
    width: 300,
    height: 300,
    colorDark: "#ffffff",
    colorLight: "#00000000"
  });
}

const heading=["WEATHER","CALENDAR","EVENT","MOVIES","TIMER","REMINDER","PICTURE FRAME","CONNECT","NIGHT MODE","Display"]
const imagearr=["sad-female-character-standing-rain_132971-163.avif","img2.webp","img4.webp","kung-fu-panda-po-jungle-staff-desktop-wallpaper-cover.jpg","timer.gif","mario.jpeg","wall5.webp","ai.gif","woman-sleeping-in-bedroom-vector.jpg","mg3.avif"]
const prompts=["What is the weather in delhi.","What is the day today","Add an event 'Go Cycling' for 23 june 2026","Play 'Kung Fu Panda 3' movie","Add a timer for 20 minutes","Add a reminder 'watch movie' at 6 pm for today.","Set a slideshow of family photos.","Connect to my device.","Turn on night mode.","Turn on display mode"]
const calinfo=document.getElementById("calinfo");
const caltext=document.getElementById("caltext");
const calheading=document.getElementById("calheading");
const rnimg=document.getElementById("rnimg");
let index=0;

function setanimaitononscreen(){
 if (index == 1) {

    document.getElementById("d1").style.display = "block";
    document.getElementById("rnimg").style.display="none";

}
else if (index == 2) {

    document.getElementById("evcal2").style.display = "flex";
    document.getElementById("d1").style.display = "none";
    document.getElementById("rnimg").style.display="none";

    showevents();

}
else if(index==7){
  document.getElementById("qrcode").style.display="flex";
    document.getElementById("rnimg").style.display="none";

  
}
else {

    document.getElementById("d1").style.display = "none";
    document.getElementById("evcal2").style.display = "none";
  document.getElementById("qrcode").style.display="none";
    document.getElementById("rnimg").style.display="flex";



}
  calinfo.style.backgroundImage=`url(http://127.0.0.1:8000/thumbnails/${imagearr[index]})`;
  rnimg.style.backgroundImage=`url(http://127.0.0.1:8000/thumbnails/${imagearr[index]})`;

  caltext.innerHTML=prompts[index];
  calheading.innerHTML=heading[index];
  document.getElementById("jht").innerHTML=`Command ${index+1} out of 10.`
  index++;

  if (index >= heading.length) {
    index = 0;
  }
}
setanimaitononscreen();
setInterval(() => {
  setanimaitononscreen()
}, 10000);


//slideshow function
let slideshowarr=[]
let index2=0

export function setimages(slideshowlist){
slideshowarr=slideshowlist;
index2=0
}
if(!slideshowinterval){
slideshowinterval=setInterval(() => {

    setslideshow();

}, 60000);
}
function setslideshow(){
   if(slideshowarr.length === 0){
        return;
    }
  if(index2>=slideshowarr.length){
    index2=0;
  }
  document.body.style.backgroundImage=`url(http://127.0.0.1:8000/images//${slideshowarr[index2]})`;

 // document.getElementById("container2img").src=`http://127.0.0.1:8000/images/${slideshowarr[index2]}`;

  index2++;
}

export function nightmode(){
  document.getElementById("container3").style.display="flex";
  document.getElementById("container2").style.display="none";
  document.getElementById("container1").style.display="flex";

clearInterval(slideshowinterval);

    slideshowinterval = null;
    index2=0;
    slideshowarr=[]
}
export function slideshowmode(){
    document.getElementById("container2").style.display="flex";
  document.getElementById("container3").style.display="none";
  document.getElementById("container1").style.display="none";

}

export function mainmode(){
  document.getElementById("container1").style.display="flex";
document.body.style.backgroundImage="";
    document.getElementById("container3").style.display="none";
  document.getElementById("container2").style.display="none";
  clearInterval(slideshowinterval);

    slideshowinterval= null;
    index2=0;
    slideshowarr=[]
}
export function openweatherconsole() {
  if(!currcity){
   speak("Weather data is still loading.");
   return;
}
  speak(`Today’s weather in ${currcity} is ${currtemp} degree celcius, ${currdesc} with humidity of ${currhumidity} percent.`)
  document.getElementById("weatherapp").style.display = "flex";
  document.getElementById("div1").style.width="100%";
  document.getElementById("maintemp").classList.remove("simpletext");

  document.getElementById("maintemp").classList.add("fullscreentext");

  document.getElementById("div2").style.display = "none";
  document.getElementById("topbar1").style.display = "none";
  document.getElementById("forecast").style.display = "none";

  setTimeout(() => {
    document.getElementById("maintemp").classList.add("simpletext");
  document.getElementById("div1").style.width="50%";

    document.getElementById("div2").style.display = "flex";
    document.getElementById("topbar1").style.display = "flex";
    document.getElementById("forecast").style.display = "flex";
  }, 3000);
  setTimeout(() => {
    document.getElementById("weatherapp").style.display = "none";
    getlocation();
  }, 12000);
}

document.getElementById("card1").addEventListener("click", () => {
  openweatherconsole();
})
