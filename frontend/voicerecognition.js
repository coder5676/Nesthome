import { playmusic, playvideo } from "./player.js";
import { createplaylist } from "./player.js";
import { renderCalendar } from "./calendar.js";
import { showevents } from "./calendar.js";
import { openweatherconsole } from "./script.js";
import { openvideotube } from "./player.js";
import { closevideotube } from "./player.js";
import { closevideoplayer } from "./player.js";
import { pausemusic } from "./player.js";
import { pausevideo,continueplaying,setvolume } from "./player.js";
import { reload } from "./script.js";
import { cityweatherquery } from "./script.js";
import { nightmode,slideshowmode,mainmode } from "./script.js";
import { addEvent } from "./calendar.js";
import { startTimer } from "./script.js";
import { setimages } from "./script.js";
import { removeReminder, snoozeReminder } from "./reminder.js";
const p = document.getElementById("prompt");
const d=document.getElementById("commandarray")
let isListening = false;
const song = new Audio('assis_wakeup.mp3');

// Play the audio
document.addEventListener("mousedown", function(event) {
console.log(event.button);
    if (event.button===1 &&!isListening) {

        event.preventDefault(); // stops page scroll
        isListening = true;
        const recognition = new webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.start();
        song.play();
        p.style.top="0";
        p.innerText = "Listening...";
        d.style.display="flex";

        recognition.onresult = async(event) => {
            const text = event.results[0][0].transcript;
            p.innerText = text;
            console.log(text);
            const response = await fetch("http://127.0.0.1:8000/voice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text
            })
        });
        
        const data = await response.json();
        console.log(data)
        //getting response and manage all functions in a centralized manner.
        managecommands(data)



        };

        recognition.onerror = () => {
            p.innerText = "Error listening";
        };

        recognition.onend = () => {
            console.log("done");

            setTimeout(() => {
         p.style.top="-100%";
           d.style.display="none";
    }, 3000); // waits 1.2 sec before hiding
       
       

        isListening = false;
        };
    }
});
let musicData = {};
let moviedata={};
let imagesdata={};
async function loadMusicData(){

    const response = await fetch(
        "http://127.0.0.1:8000/music-data"
    );

    musicData = await response.json();
}
async function loadmoviedata(){
     const response = await fetch(
        "http://127.0.0.1:8000/movie-data"
    );
    moviedata=await response.json();
}
async function loadimagesdata(){
    const response=await fetch(
        "http://127.0.0.1:8000/images-data"
    )
    imagesdata=await response.json()
}
//speaking agent

export function speak(text){

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "en-IN";

    speech.rate = 1;

    speech.pitch = 1;

    speech.volume = 1;

    speechSynthesis.speak(speech);
}




//commands manager
let playlistqueue = [];
let imagesqueue=[];
export async function managecommands(data){

   if(data.intent==="MUSIC"){

    await loadMusicData();
    console.log(musicData)
const normalize = (s) =>
    (s || "")
        .toLowerCase()
        .trim();
    const songdp =
        normalize(data.name);
    const songname=songdp.replaceAll(" ","");    
console.log(songname)
    // SINGLE SONG
    if(data.playlist === false && songname!==""){
console.log("entered")
        playlistqueue = [];

        for(const key in musicData){

            const song = musicData[key];
            console.log(song.tokens);
             const tokens = song.tokens.map(normalize);
console.log(songname)
console.log(tokens)
            if(tokens.includes(songname)){
                console.log(key);
                speak(`Playing ${songname} from nest music.`);
                playmusic(key);


                return;
            }
        }
    }

    // PLAYLIST
    else if(data.playlist === true && data.type){

        playlistqueue = [];

        const playlistType =
            data.type.toLowerCase();

        for(const key in musicData){

            const song = musicData[key];

            const tokens =
                song.tokens.map(
                    t => t.toLowerCase()
                );

            if(tokens.includes(playlistType)){

                playlistqueue.push(key);
            }
        }
console.log(playlistqueue)
                speak(`Playing ${data.type} playlist from nest music.`);

        createplaylist(playlistqueue);
    }
}
else if(data.intent === "REMINDER"){

    try{

        const response = await fetch(
            "http://127.0.0.1:8000/addreminder",
            {
                method: "POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body: JSON.stringify({

                    title: data.reminder,

                    time: data.time,

                    date: data.date,
                })
            }
        );

        const result = await response.json();

        console.log(result);

        speak(`Got it. I’ll remind you to ${data.title} on ${data.date} at ${data.time}.`)

    }
    catch(err){

        console.log(err);

        speak("Failed to add reminder, try saying correct command again");
    }
}

else if(data.intent==="CALENDAR"){

    renderCalendar();
    showevents();
}
else if(data.intent==="ADDEVENT"){
    addEvent(data)
}
else if(data.intent==="VIDEO"){
    await loadmoviedata();
    const normalize = (s) =>
    (s || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim();
    if(data.type==="show" || data.name===""){
        openvideotube();
        speak("Opening movie section")
    }
    else if(data.name!==""){
        const moviename=data.name.toLowerCase().replace(/\s+/g,"").trim();
        console.log("this movie to play",data.name)
         for(const key in moviedata ){
            const movie = moviedata[key];
            console.log(movie.tokens);
            const tokens = movie.tokens.map(normalize);
            console.log(moviename)
            console.log(tokens)
            if(tokens.includes(moviename)){
                console.log(key)
                playvideo(key);
                speak(`Playing ${key}`)
                return;
            }
        }
      
    }

}
else if(data.intent==="STOP"){
    pausevideo();
    pausemusic();
}
else if(data.intent==="CLOSE"){

    closevideoplayer();
    closevideotube();
}
else if(data.intent==="RELOAD"){
    reload();
}
else if(data.intent==="SNOOZE"){
    snoozeReminder();

}
else if(data.intent==="REMOVE"){
    removeReminder()

}
else if(data.intent==="WEATHER"){
    if(data.city==="none"){
    
    openweatherconsole();
}
    else{
        await cityweatherquery(data.city);
    }
}
else if(data.intent==="DISPLAY"){
mainmode()
}
else if(data.intent === "SLIDESHOW") {

    slideshowmode();

    await loadimagesdata();

    const normalize = (s) =>
        (s || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "");

    const name = normalize(data.name);

    imagesqueue = [];

    for (const key in imagesdata) {

        const image = imagesdata[key];

        const tokens = image.tokens.map(
            t => normalize(t)
        );

        if (tokens.includes(name)) {

            imagesqueue.push(image.file);
        }
    }

    setimages(imagesqueue);
    speak(`Starting slideshow for ${name} images.`)
    console.log(imagesqueue);
}
else if(data.intent==="NIGHTMODE"){
    nightmode()
}
else if(data.intent==="CONTINUE"){
continueplaying();
}
else if(data.intent==="VOLUME"){
setvolume(data.value);
}
else if(data.intent==="TIMER"){
    startTimer(data.time,data.value.toLowerCase())
}
} 



 