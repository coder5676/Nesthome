const menu = ["videos", "music", "photos"];
let selmenu = 0;
let currmaxlength = 5; // IMPORTANT: must be > 0
let index = 0;
let moviearr={};
let musicarr={};
let imagesarr={};
window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
}, true); // IMPORTANT: capture phase = true

const moviethumbnail=document.getElementById("movimg");
const bgthumbnail=document.getElementById("moviebox");
const topheading=document.getElementById("g1");
const movname=document.getElementById("g2");
const movtokens=document.getElementById("g4");
const vdtop=document.getElementById("a1");
const mustop=document.getElementById("a2");
const imgtop=document.getElementById("a3");
const usertxt=document.getElementById("g3");
async function init() {

    await createmoviearr();
    await createmusicarr();
    await createimagesarr();

    updateUI();
}

init();
function updateUI() {
  console.log("MENU:", menu[selmenu], "INDEX:", index);
  if(menu[selmenu]==="videos"){
    currmaxlength=moviearr.length;
    vdtop.style.backgroundColor="white";
    vdtop.style.color="black";
    mustop.style.backgroundColor="transparent";
    mustop.style.color="white";
    imgtop.style.backgroundColor="transparent";
    imgtop.style.color="white";

    moviethumbnail.style.backgroundImage=`url('../thumbnails/${moviearr[index][1].thumbnail}')`;
    bgthumbnail.style.backgroundImage=`url('../thumbnails/${moviearr[index][1].thumbnail}')`;
    topheading.innerText="Home Movies";
    usertxt.innerText="Ask to play this video using";
    movname.innerText=`${(moviearr[index][0]).slice(0,30)}...`;
    let tokenmov="";
    for (let token in moviearr[index][1].tokens){
        tokenmov+=` ${moviearr[index][1].tokens[token]} .`

    }
    movtokens.innerText=tokenmov;


  }
  else if(menu[selmenu]==="music"){
    currmaxlength=musicarr.length;
    vdtop.style.backgroundColor="transparent";
    vdtop.style.color="white";
    mustop.style.backgroundColor="white";
    mustop.style.color="black";
    imgtop.style.backgroundColor="transparent";
    imgtop.style.color="white";
    usertxt.innerText="Ask to play this music using";
    moviethumbnail.style.backgroundImage=`url('../thumbnails/${musicarr[index][1].thumbnail}')`;
    bgthumbnail.style.backgroundImage=`url('../thumbnails/${musicarr[index][1].thumbnail}')`;
    topheading.innerText="Home Music";
    movname.innerText=`${(musicarr[index][0]).slice(0,30)}...`;
    let tokenmus="";
    for (let token in musicarr[index][1].tokens){
        tokenmus+=` ${musicarr[index][1].tokens[token]} .`

    }
    movtokens.innerText=tokenmus;
  }
  else if(menu[selmenu]==="photos"){
    currmaxlength=imagesarr.length;
vdtop.style.backgroundColor="transparent";
    vdtop.style.color="white";
    mustop.style.backgroundColor="transparent";
    mustop.style.color="white";
    imgtop.style.backgroundColor="white";
    imgtop.style.color="black";
    usertxt.innerText="Ask to set a slideshow using";
 moviethumbnail.style.backgroundImage=`url('../slideshowimages/${imagesarr[index][1].file}')`;
    bgthumbnail.style.backgroundImage=`url('../slideshowimages/${imagesarr[index][1].file}')`;
    topheading.innerText="Home Photos";
    movname.innerText=`${(imagesarr[index][0]).slice(0,30)}...`;
    let tokenimg="";
    for (let token in imagesarr[index][1].tokens){
        tokenimg+=` ${imagesarr[index][1].tokens[token]} .`

    }
    movtokens.innerText=tokenimg;

  }
}

// prevent default right click menu
const prev=document.getElementById("prevbutton");
const next=document.getElementById("nextbutton");
document.addEventListener("mousedown", function(event) {

    // LEFT CLICK → BACK
    if (event.button === 0) {
        next.style.backgroundColor="rgba(0, 0, 0, 0.427)";
        next.style.color="white";
prev.style.backgroundColor="white";
        prev.style.color="black";
        if (index === 0) {
            if (selmenu > 0) {
                selmenu -= 1;
                index = 0;
                console.log("Menu back:", menu[selmenu]);
            }
            updateUI();
            return;
        }

        index -= 1;
        console.log("Item left:", index);
        updateUI();
    }

    // RIGHT CLICK → NEXT
  else if (event.button === 2) {

    prev.style.backgroundColor = "rgba(0, 0, 0, 0.427)";
    prev.style.color = "white";

    next.style.backgroundColor = "white";
    next.style.color = "black";

    // FIX HERE
    if (index >= currmaxlength) {

        if (selmenu < menu.length - 1) {
            selmenu += 1;
            index = 0;

            console.log("Menu next:", menu[selmenu]);
        }

        updateUI();
        return;
    }

    index += 1;

    console.log("Item right:", index);

    updateUI();
}

});

async function createmoviearr(){
 try {
        const res = await fetch("http://127.0.0.1:8000/movie-data");

        if (!res.ok) {
            throw new Error("Failed to fetch movie data");
        }

        const data = await res.json();

        moviearr=Object.entries(data);

  

    } catch (error) {
        console.error("Movie fetch error:", error);
    }
}
async function createmusicarr(){
try {
        const res = await fetch("http://127.0.0.1:8000/music-data");

        if (!res.ok) {
            throw new Error("Failed to fetch movie data");
        }

        const data = await res.json();

        musicarr=Object.entries(data);


    } catch (error) {
        console.error("Movie fetch error:", error);
    }
}
async function createimagesarr(){
try {
        const res = await fetch("http://127.0.0.1:8000/images-data");

        if (!res.ok) {
            throw new Error("Failed to fetch movie data");
        }

        const data = await res.json();

        imagesarr=Object.entries(data);

        // example
     
    } catch (error) {
        console.error("Movie fetch error:", error);
    }

}