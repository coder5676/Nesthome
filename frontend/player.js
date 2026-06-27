
let currentIndex = 0;

  // get audio/video here

let audio=document.getElementById("musicplayer"); 

let volume=0.5;
let playlist=[];
function suffleplaylist(arr){
  let copy = [...arr];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
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
  video.volume=volume;

}    
console.log(volume);



let currvideo=""; 
const video = document.getElementById("videoplayer");
let prevvideo="";




export async function playvideo(videoname) {

  try {

    // stop music
    audio.pause();
if (currvideo) {

      await closevideoplayer();

    }
    // fetch movie info
    const res = await fetch(
      `http://127.0.0.1:8000/movie/${encodeURIComponent(videoname)}`
    );

    const data = await res.json();

    if (!data.found) {

      console.log("Video not found");
      return;

    }

    currvideo = videoname;

console.log(video.duration,data.last_watched  );
    // load source
    video.src =
      `http://127.0.0.1:8000/videos/${encodeURIComponent(data.file)}`;

    video.volume = volume;

    document.getElementById("videodiv").style.display = "block";

    // wait metadata
    video.onloadedmetadata = () => {
     
      video.currentTime=data.last_watched || 0;
    };

    // wait until browser is ready
   video.onseeked = async () => {

  try {

    await video.play();

  } catch(err) {

    console.log(err);

  }

};

  } catch(err) {

    console.log(err);

  }

}


export async function closevideoplayer() {

  const video = document.getElementById("videoplayer");

  // log current playback time
  let currenttime=Math.floor(video.currentTime)
  
  if(video.currentTime >= video.duration - 1) {
    currenttime = 0;
}
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
       if (currvideo){
        await closevideoplayer()
       }
       audio.currentTime=0;

      // SET MUSIC FILE
      audio.src = `http://127.0.0.1:8000/musicfolder/${data.file}`;
     
      audio.load();

      // RESUME FROM LAST TIME
      audio.onloadedmetadata = async () => {

            try{
              audio.volume = volume;
                await audio.play();
               
            } catch(err){
                console.log(err);
            }

        };
     
        thumbnail.style.backgroundImage =
            `url('http://127.0.0.1:8000/thumbnails/${data.thumbnail}')`;
           
document.getElementById("songimg").style.backgroundImage=`url('http://127.0.0.1:8000/thumbnails/${data.thumbnail}')`;
        title.innerHTML =
            data.name.slice(0,36) + "...";

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

}


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

