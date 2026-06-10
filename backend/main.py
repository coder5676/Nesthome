import json
import os
from fastapi import FastAPI,Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from intentrecognition import intentrecogniton
from datetime import datetime, timedelta
from fastapi import UploadFile, File, Form
import shutil
import socket
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Robust Directory Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)

VIDEOS_DIR = os.path.join(ROOT_DIR, "videos")
MUSIC_DIR = os.path.join(ROOT_DIR, "music")
DATA_DIR = os.path.join(ROOT_DIR, "data")
IMAGES_DIR=os.path.join(ROOT_DIR,"slideshowimages")
THUMBNAILS_DIR=os.path.join(ROOT_DIR,"thumbnails")

# Create data directory if it doesn't exist
os.makedirs(DATA_DIR, exist_ok=True)

MOVIEJSON = os.path.join(DATA_DIR, "movies.json")
MUSICJSON = os.path.join(DATA_DIR, "music.json")
CALENDAR_FILE = os.path.join(DATA_DIR, "calendarEvents.json")
REMINDER_FILE = os.path.join(DATA_DIR, "reminders.json")
IMAGESJSON=os.path.join(DATA_DIR,"images.json")

app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="slideshowimages")
app.mount("/thumbnails", StaticFiles(directory=THUMBNAILS_DIR), name="thumbnails")
app.mount("/musicfolder", StaticFiles(directory=MUSIC_DIR), name="music")
app.mount("/videos",StaticFiles(directory=VIDEOS_DIR),name="videos")
# --- Safe File Data Bootstrapping ---
def load_json_file(path):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {}
    return {}




# --- Core Health Endpoints ---
@app.get("/")
def home():
    return {"message": "FastAPI Nest Hub server running"}

@app.get("/status")
def status():
    return {"status": "ok"}


# --- Media Logic ---
class WatchData(BaseModel):
    movie: str
    last_watched: float

#@app.get("/movie/{name}")
#def get_movie(name: str):
    #movies = load_json_file(MOVIEJSON)
   # movie = movies.get(name)
   # if movie:
    #    return {
    #        "found": True,
    #        "name": name,
      #      "file": movie.get("file"),
     #       "last_watched": movie.get("last_watched", 0)
    #    }
   # return {"found": False, "error": "Movie not found"}
@app.get("/movie/{name}")
def get_movie(name: str):

    movies = load_json_file(MOVIEJSON)

    movie = movies.get(name)

    if movie:
        return {
            "found": True,
            "file": movie.get("file"),
            "last_watched": movie.get("last_watched", 0),
            "thumbnail": movie.get("thumbnail", ""),
            "tokens": movie.get("tokens", [])
        }

    return {
        "found": False
    }
@app.post("/recplayback")
def rec_watched(data: WatchData):
    movies = load_json_file(MOVIEJSON)

    movies.setdefault(data.movie, {})
    movies[data.movie]["last_watched"] = data.last_watched

    with open(MOVIEJSON, "w", encoding="utf-8") as f:
        json.dump(movies, f, indent=2)

    return {"success": True}

@app.get("/music/{name}")
def get_music(name: str):
    music_data = load_json_file(MUSICJSON)
    song = music_data.get(name)
    if song:
        return {
            "found": True,
            "name": name,
            "file": song.get("file"),
            "thumbnail": song.get("thumbnail"),
            "tokens":song.get("tokens",[]) ,
        }
    return {"found": False, "error": "Music not found"}


# --- Calendar Logic ---
class Event(BaseModel):
    title: str
    date: str  

@app.get("/calendardata")
def get_calendar_data():
    return load_json_file(CALENDAR_FILE)

@app.post("/calendaraddevent")
def add_calendar_event(event: Event):
    data = load_json_file(CALENDAR_FILE)
    
    data[event.title] = {
        "date": event.date,
    }

    with open(CALENDAR_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    return {"success": True, "message": "Event added"}

#--remove older events---
@app.post("/update-calendar")
async def update_calendar(request: Request):
    data = await request.json()
    with open(CALENDAR_FILE, "w",encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    return {"success": True}
# --- Reminder Logic ---
class Remevent(BaseModel):
    title: str  # Fixed missing title attribute
    time: str
    date: str 
    completed: bool=False

@app.get("/showreminders")
def show_reminders():
    return load_json_file(REMINDER_FILE)

@app.post("/addreminder")  # Converted to POST to accept request body natively
def add_reminder(event: Remevent):
    data = load_json_file(REMINDER_FILE)
    clean_time = (
        event.time
        .replace(".", "")
        .upper()
    )
    data[event.title] = {
        "time": clean_time,
        "date": event.date,
        "completed":event.completed
    }

    # Fixed path error (now writes safely back to REMINDER_FILE)
    with open(REMINDER_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    return {"success": True, "message": "Reminder added"}


class UpdateReminder(BaseModel):

    title: str
    action: str   # snooze or remove

@app.post("/updatereminder")
def update_reminder(event: UpdateReminder):

    data = load_json_file(REMINDER_FILE)

    if event.title not in data:

        return {
            "success": False,
            "message": "Reminder not found"
        }

    reminder = data[event.title]

    # REMOVE REMINDER
    if event.action.lower() == "remove":

       del data[event.title]

    # SNOOZE REMINDER
    elif event.action.lower() == "snooze":

        current_year = datetime.now().year

        # normalize google speech time
        clean_time = (
            reminder["time"]
            .replace(".", "")
            .upper()
        )

        dt_string = (
            f"{reminder['date']} "
            f"{current_year} "
            f"{clean_time}"
        )

        # supports both:
        # 10 PM
        # 10:30 PM
        try:

            reminder_datetime = datetime.strptime(
                dt_string,
                "%d %B %Y %I:%M %p"
            )

        except:

            reminder_datetime = datetime.strptime(
                dt_string,
                "%d %B %Y %I %p"
            )

        # add 10 minutes
        reminder_datetime += timedelta(minutes=10)

        # update time
        reminder["time"] = reminder_datetime.strftime("%I:%M %p").lstrip("0")

        # update date
        reminder["date"] = reminder_datetime.strftime("%d %B")

    # save updated json
    with open(REMINDER_FILE, "w", encoding="utf-8") as f:

        json.dump(data, f, indent=4)

    return {
        "success": True,
        "message": "Reminder updated"
    }
class speech(BaseModel):
    text:str
@app.post("/voice")
async def voice(request:Request):
    data = await request.json()

    text = data["text"]

    result = intentrecogniton(text)

    return result


@app.get("/music-data")
def get_music_data():
    return load_json_file(MUSICJSON)

@app.get("/movie-data")
def get_moviedata():
   return load_json_file(MOVIEJSON)
@app.get("/images-data")
def get_slideshowdata():
    return load_json_file(IMAGESJSON)
@app.post("/addmovie")
async def add_movie(
    file: UploadFile = File(...),
    title: str = Form(...),
    thumbnail: str = Form(""),
    tokens: str = Form("")
):

    os.makedirs(VIDEOS_DIR, exist_ok=True)

    filepath = os.path.join(VIDEOS_DIR, file.filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    movies = load_json_file(MOVIEJSON)

    movies[title] = {
        "file": file.filename,
        "last_watched": 0,
        "thumbnail": thumbnail,
        "tokens": [
            token.strip().lower()
            for token in tokens.split(",")
            if token.strip()
        ]
    }

    with open(MOVIEJSON, "w", encoding="utf-8") as f:
        json.dump(movies, f, indent=4)

    return {
        "success": True,
        "message": "Movie added"
    }


# -------- ADD SONG --------
@app.post("/addsong")
async def add_song(
    file: UploadFile = File(...),
    title: str = Form(...),
    thumbnail: str = Form(""),
    tokens: str = Form("")
):

    os.makedirs(MUSIC_DIR, exist_ok=True)

    filepath = os.path.join(MUSIC_DIR, file.filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    music = load_json_file(MUSICJSON)

    music[title] = {
        "file": file.filename,
        "thumbnail": thumbnail,
        "tokens": [
            token.strip().lower()
            for token in tokens.split(",")
            if token.strip()
        ]
    }

    with open(MUSICJSON, "w", encoding="utf-8") as f:
        json.dump(music, f, indent=4)

    return {
        "success": True,
        "message": "Song added"
    }


# -------- ADD IMAGE --------
@app.post("/addimage")
async def add_image(
    file: UploadFile = File(...),
    title: str = Form(...),
    tokens: str = Form("")
):

    os.makedirs(IMAGES_DIR, exist_ok=True)

    filepath = os.path.join(IMAGES_DIR, file.filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    images = load_json_file(IMAGESJSON)

    images[title] = {
        "file": file.filename,
        "tokens": [
            token.strip().lower()
            for token in tokens.split(",")
            if token.strip()
        ]
    }

    with open(IMAGESJSON, "w", encoding="utf-8") as f:
        json.dump(images, f, indent=4)

    return {
        "success": True,
        "message": "Image added"
    }


def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    ip = s.getsockname()[0]
    s.close()
    return ip

@app.get("/server-url")
def server_url():
    ip = get_local_ip()
    return {"url": f"http://{ip}:8000"}

#const formData = new FormData();

#formData.append("file", fileInput.files[0]);
#formData.append("title", "Kung Fu Panda 3");
#formData.append("tokens", "kungfupanda,panda,kungfu");

#await fetch("http://127.0.0.1:8000/addmovie", {
 #   method: "POST",
  #  body: formData
#});
