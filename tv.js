import { playmusic,playvideo } from "./player.js";
import {speak} from "./voicerecognition.js"
const menu = ["videos", "music", "photos"];
let selmenu = 0;
let currmaxlength = 0; // IMPORTANT: must be > 0
let index = 0;
let moviearr={};
let musicarr={};
let imagesarr={};
let currmovie="";
let currmusic="";
const musicthumbnail=["wolfgang-hasselmann-nGtKRIcOXqI-unsplash.jpg","sarvesh-phansalkar-lUYibzci_aU-unsplash.jpg","ruedi-haberli-ZcVd6rcHSbg-unsplash.jpg","peter-thomas-ZIfKCrvR81I-unsplash.jpg","nir-himi-UbIvR3B4NJ8-unsplash.jpg","nir-himi-qNk8jYhsljc-unsplash.jpg","nico-ruge-E4HyfQR387I-unsplash.jpg","maximilian-bungart-7JY7eaRChXk-unsplash.jpg","marek-piwnicki-NwZmYW5ETnE-unsplash.jpg","marc-julien-Nq1W3c8add4-unsplash.jpg","liana-s-k7RLGSA471U-unsplash.jpg","krists-luhaers-xS_9-CLMZAQ-unsplash.jpg","krists-luhaers-e_z1BLzRbS8-unsplash.jpg","doncoombez-UNeHrHb7eII-unsplash.jpg","declan-sun-qnxteyXSLuk-unsplash.jpg","caleb-sebastian-ZZFPtxgDSbY-unsplash.jpg",
  "arnaud-girault-kDXPmsjlms0-unsplash.jpg","anthony-robinson-ofc0E7YqnRY-unsplash.jpg"];
const moviebox=document.getElementById("moviebox");
const movthumbnail=document.getElementById("moviethumbnail");
window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
}, true); // IMPORTANT: capture phase = true


const bgthumbnail=document.getElementById("moviebox");
const topheading=document.getElementById("g1");
const movname=document.getElementById("g2");
const movtokens=document.getElementById("g4");
const vdtop=document.getElementById("a1");
const mustop=document.getElementById("a2");
const imgtop=document.getElementById("a3");

export async function init() {

    await createmoviearr();
    await createmusicarr();
    await createimagesarr();
moviebox.style.display="flex";
    updateUI();
}
let num=0;

function updateUI() {
  console.log("MENU:", menu[selmenu], "INDEX:", index);
  if(moviearr.length === 0) return;
  if(menu[selmenu]==="videos"){
    currmusic="";
    currmovie=moviearr[index][0];
    currmaxlength=moviearr.length;
    vdtop.style.backgroundColor="white";
    vdtop.style.color="black";
    mustop.style.backgroundColor="transparent";
    mustop.style.color="white";
    imgtop.style.backgroundColor="transparent";
    imgtop.style.color="white";

    
    bgthumbnail.style.backgroundImage=`url('http://127.0.0.1:8000/thumbnails/${moviearr[index][1].thumbnail}')`;
    movthumbnail.style.backgroundImage=`url('http://127.0.0.1:8000/thumbnails/${moviearr[index][1].thumbnail}')`;

    topheading.innerText="Home Movies";
    movname.innerText=`${(moviearr[index][0]).slice(0,30)}...`;
    let tokenmov="";
    for (let token in moviearr[index][1].tokens){
        tokenmov+=` ${moviearr[index][1].tokens[token]} |`

    }
    movtokens.innerText=`You can play this video using :${tokenmov}`;


  }
  else if(menu[selmenu]==="music"){
    if(musicarr.length === 0) return;
    currmovie="";
    currmusic=musicarr[index][0];
    currmaxlength=musicarr.length;
    vdtop.style.backgroundColor="transparent";
    vdtop.style.color="white";
    mustop.style.backgroundColor="white";
    mustop.style.color="black";
    imgtop.style.backgroundColor="transparent";
    imgtop.style.color="white";
     if(musicarr[index][1].thumbnail==="none" ){
          if(num>=musicthumbnail.length){
            num=0;
          }
          bgthumbnail.style.backgroundImage=`url('http://127.0.0.1:8000/images/${musicthumbnail[num]}')`
          movthumbnail.style.backgroundImage=`url('http://127.0.0.1:8000/images/${musicthumbnail[num]}')`
          num+=1;
        }
        else{
    bgthumbnail.style.backgroundImage=`url('http://127.0.0.1:8000/thumbnails/${musicarr[index][1].thumbnail}')`;
    movthumbnail.style.backgroundImage=`url('http://127.0.0.1:8000/thumbnails/${musicarr[index][1].thumbnail}')`;
        }
    topheading.innerText="Home Music";
    movname.innerText=`${(musicarr[index][0]).slice(0,30)}...`;
    let tokenmus="";
    for (let token in musicarr[index][1].tokens){
        tokenmus+=` ${musicarr[index][1].tokens[token]} |`

    }
    movtokens.innerText=`You can play this song using :${tokenmus}`;
  }
  else if(menu[selmenu]==="photos"){
    if(imagesarr.length === 0) return;
    currmovie="";
    currmusic="";
    currmaxlength=imagesarr.length;
vdtop.style.backgroundColor="transparent";
    vdtop.style.color="white";
    mustop.style.backgroundColor="transparent";
    mustop.style.color="white";
    imgtop.style.backgroundColor="white";
    imgtop.style.color="black";
   
    bgthumbnail.style.backgroundImage=`url('http://127.0.0.1:8000/images/${imagesarr[index][1].file}')`;
    movthumbnail.style.backgroundImage=`url('http://127.0.0.1:8000/images/${imagesarr[index][1].file}')`;

    topheading.innerText="Home Photos";
    movname.innerText=`${(imagesarr[index][0]).slice(0,30)}...`;
    let tokenimg="";
    for (let token in imagesarr[index][1].tokens){
        tokenimg+=`${imagesarr[index][1].tokens[token]} |`
    }
    movtokens.innerText=`You can set a slideshow by saying :${tokenimg}`;

  }
}

export function play(){
    if(currmovie && !currmusic){
        playvideo(currmovie);
        
    }
    else if(currmusic && !currmovie){
        playmusic(currmusic);
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
