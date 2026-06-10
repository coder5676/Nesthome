import { speak } from "./voicerecognition.js";
  let currentDate = new Date();

  export function renderCalendar(){
      let dayvalue=document.getElementById("d1").innerHTML;
      speak(`Today is ${dayvalue}`);
    document.getElementById("calendardiv").style.display="flex";
setTimeout(() => {
        document.getElementById("calendardiv").style.display="none";

},10000);
const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const day=new Date();
let date=day.getDate();
let month=months[day.getMonth()];
document.getElementById("dter").innerHTML=date;
document.getElementById("monther").innerHTML=month;




  
    
  }
 
export async function showevents() {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const normalizedToday =
    today.toLowerCase().trim();

  const res = await fetch("http://127.0.0.1:8000/calendardata");

  const mydata = await res.json();

  let html = "";
  let html2=`<p style="background-color:rgb(0,92,255);color:white;width:fit-content;align-self:flex-start">Events for today.</p>`;

  // LOOP THROUGH OBJECT
  for (let title in mydata) {

    const event = mydata[title];

    if (event.date.toLowerCase().trim() === normalizedToday) {

      html += `
        <div>
        <h6>This event is set for today only.</h6>
          <h4>${title}</h4>
          <h5>Event Timing: 12:00 AM to 11:59 PM</h5>
        </div>
      `;
      html2+=`<p id="evname"> ${title}</p>

      `
    }
  }
document.getElementById("evcal2").innerHTML=html2;
  document.getElementById("events").innerHTML = html;
}
function alreadyCleaned(calendarData) {

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const event of Object.values(calendarData)) {

    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    // found old event → cleanup not done yet
    if (eventDate < today) {
      removeOldEvents()
    }
  }

  // no old events found
  return true;
}

export async function removeOldEvents() {
  try {
    const res = await fetch("http://127.0.0.1:8000/calendardata");
    const data = await res.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedData = {};
    if (!alreadyCleaned(data)){
    for (const [eventName, details] of Object.entries(data)) {

      // parse "16 May 2026"
      const eventDate = new Date(details.date);
      if (eventDate >= today) {
        updatedData[eventName] = details;
      }
    }

    // send cleaned json back
    await fetch("http://127.0.0.1:8000/update-calendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    console.log("Old events removed");}

  } catch (err) {
    console.log(err);
  }
}


 
export async function addEvent(data){
removeOldEvents();
speak(`Alright, adding event ${data.name} on ${data.date}`)
    const response = await fetch(
        "http://127.0.0.1:8000/calendaraddevent",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: data.name,
                date: data.date
            })
        }
    );

    const newdata = await response.json();

    console.log(newdata);
    
}

//make server to recieve files mvies videos and images for slideshow 
//manage z indexes properly.
