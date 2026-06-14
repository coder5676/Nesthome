export function openyoutube(query){
document.getElementById("player").style.display="flex";
searchVideo(query);
}

export function closeyoutubeplayer(){
document.getElementById("player").style.display="none";
 if (player) {

        player.stopVideo();

    }

}
document.getElementById("search").addEventListener("click",()=>{
    const query=document.getElementById("searchinput").value;
    searchVideo(query);
})
const API_KEY = "AIzaSyDVWr-_ul0jtaq9nKpgmLDafRuCc_ClBc0";

    let player;
    let videoqueue=[];
    let currentindex=0;

    window.onYouTubeIframeAPIReady=function () {

      player = new YT.Player("youtubeplayer", {
        height: "100%",
        width: "100%",
        videoId: "",
        playerVars: {
          autoplay: 1,
          playsinline: 1
        },
        events: {
            onReady: onPlayerReady,
            onError:onPlayerError
        }
      });

    }

    async function searchVideo(query) {
      if (!query) return;
      currentindex=0;
      videoqueue=[];

      const url =
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&videoEmbeddable=true` +
        `&maxResults=20&q=${encodeURIComponent(query)}` +
        `&key=${API_KEY}`;

      try {

        const response = await fetch(url);

        const data = await response.json();

        console.log(data);

        if (!data.items || data.items.length === 0) {

          alert("No videos found");
          return;

        }
            videoqueue = data.items.map(
            item => item.id.videoId
        );
if (!player) {
    console.log("Player not ready yet");
    return;
}
        playcurrentvideo();

      } catch (error) {

        console.error(error);

      }

    }
    function onPlayerReady() {

    // Data saver quality
    player.setPlaybackQuality("small");

}
function playcurrentvideo() {

    if (currentindex >= videoqueue.length) {

        console.log("No playable videos left");
        return;

    }

    const videoId = videoqueue[currentindex];

    console.log("Trying:", videoId);

    player.loadVideoById(videoId);

}
function onPlayerError(event) {

    console.log("Video failed:", videoqueue[currentindex]);

    currentindex++;

    playcurrentvideo();

}

