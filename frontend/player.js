import { speak } from "./voicerecognition.js";
let currentIndex = 0;
const audio=document.getElementById("musicplayer");
let volume=0.5;
let playlist=[];
function suffleplaylist(arr){
  for (let i = arr.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));

  // swap
  [arr[i], arr[j]] = [arr[j], arr[i]];
}
return arr
}
export function createplaylist(playlistqueue){
  playlist=suffleplaylist(playlistqueue);
  audio.src="";
  console.log("playlist queue",playlistqueue)
  currentIndex=0;
  playQueue();

}
console.log("myplaylist0",playlist)
function playQueue(){

    if(currentIndex >= playlist.length){

        currentIndex = 0;
        return;
    }
const songKey =
        playlist[currentIndex];

    playmusic(songKey);
}

  audio.onended = () => {

        currentIndex++;

        playQueue();

    };



export function setvolume(value){
  volume = Math.max(0, Math.min(1, value / 100));

  // update currently playing audio
  audio.volume = volume;

}    
console.log(volume);
let currvideo="" 
  const video = document.getElementById("videoplayer");   
export async function playvideo(videoname) {

  const videodiv = document.getElementById("videodiv");

  videodiv.style.display = "block";

  try {

    const res = await fetch(
      `http://127.0.0.1:8000/movie/${videoname}`
    );

    const data = await res.json();

    console.log(data);

    if (data.found && data.file) {
currvideo=videoname;
      const newSrc =
        `../videos/${data.file}`;

      // prevent reloading same video
      if (!video.src.includes(data.file)) {

        video.pause();

        video.src = newSrc;
        video.volume=volume;
        video.onloadedmetadata = async () => {

          video.currentTime =
            data.last_watched || 0;

          try {

            await video.play();
            if(audio.src){
            audio.pause();}

          } catch (err) {

            console.log(err);

          }

        };

      } else {

        // already loaded
        video.play();
        if(audio.src){
            audio.pause();}

      }

    } else {

      console.log("No video found");

    }

  } catch (err) {

    console.log(err);

  }

}

export async function closevideoplayer() {
  // hide the video container
  document.getElementById("videodiv").style.display = "none";

  const video = document.getElementById("videoplayer");

  // log current playback time
  const currenttime=Math.floor(video.currentTime)
  video.pause();

  // STEP 2: detach source WITHOUT load()
  video.removeAttribute("src");

  // STEP 3: hide UI immediately
  document.getElementById("videodiv").style.display = "none";
  // save progress
  try {
    await fetch("http://127.0.0.1:8000/recplayback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movie:currvideo,
        last_watched: currenttime
      })
    });
  } catch (err) {
    console.error(err);
  }
  
}


const thumbnail=document.getElementById("entertainment");
const title=document.getElementById("title");
export async function playmusic(name){
    try{
        const res=await fetch(`http://127.0.0.1:8000/music/${name}`);
        const data=await res.json();

        if(!data.found){
          console.log("Music not found");
          return;
        }

       audio.pause();
       audio.currentTime=0;

      // SET MUSIC FILE
      audio.src = `../music/${data.file}`;
      audio.volume=volume;
      audio.load();

      // RESUME FROM LAST TIME
      audio.onloadedmetadata = async () => {

            try{
                await audio.play();
                video.pause();
            } catch(err){
                console.log(err);
            }

        };
        thumbnail.style.backgroundImage =
            `url('../thumbnails/${data.thumbnail}')`;

        title.innerHTML =
            data.name + "...";

  } catch (err) {

    console.log("Fetch error:", err);

  }

}
export function pausemusic(){
  if(!audio.paused){
    audio.pause();
}
}
export function pausevideo(){
  if(!video.paused){
    video.pause();
  }

}/*
let moviedata={}

    async function loadmoviedata(){
     const response = await fetch(
        "http://127.0.0.1:8000/movie-data"
    );
    moviedata=await response.json();
}
let moviekeys=[]

let index=0
const moviebox=document.getElementById("moviebox");
export async function openvideotube(){
  moviebox.style.display="flex";
  await loadmoviedata();
  moviekeys = Object.keys(moviedata);
  moviekeys = moviekeys.filter(key => key.trim() !== "");
  showmovies();
  setInterval(() => {
    showmovies()
  }, 5000);

}*/
function formatTime(seconds) {

  seconds = Math.floor(seconds);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let result = "";

  if (hrs > 0) {
    result += `${hrs} hour `;
  }

  if (mins > 0) {
    result += `${mins} minute `;
  }

  if (secs > 0 || result === "") {
    result += `${secs} sec`;
  }

  return result.trim();
}/*
function showmovies(){
   if(index>=moviekeys.length){
    index=0;
  }
  const moviename=moviekeys[index]
  const movie =moviedata[moviename]
  console.log(movie)
  document.getElementById("moviethumbnail").style.backgroundImage=`url('../thumbnails/${movie.thumbnail}')`;
  document.getElementById("moviebox").style.backgroundImage=`url('../thumbnails/${movie.thumbnail}')`;
  document.getElementById("vidname").innerHTML=`${moviename.slice(0,30)}...`;
  document.getElementById("watchtime").innerHTML=`Watched: ${formatTime(movie.last_watched)}`;
  document.getElementById("playmovie").addEventListener("click",()=>{
    playvideo(moviename);
  })
  let tok=""
  for (let  token of movie.tokens){
    tok+=`${token} . `

  } 
  document.getElementById("tokens").innerHTML=tok;
 
  index++;
}

*/

export function closevideotube(){
  moviebox.style.display="none";

}
export function continueplaying(){
  if(video.src){
    video.play();
  }
  else{
  audio.play();}
}

