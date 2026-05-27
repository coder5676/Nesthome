import re
from datetime import datetime, timedelta
def intentrecogniton(text):

    text = text.lower()

    if "weather" in text or "temperature" in text:
        city="none"
        match = re.search(
            r"(?:weather|temperature)\s+in\s+([a-zA-Z ]+)",
            text
        )

        if match:
            city = match.group(1).strip()
            city=city.split()[0]  

        return {
            "intent": "WEATHER",
            "city": city
        }
    
    elif "reminder" in text or "remainder" in text:
    # convert to lowercase
        text = text.lower()

        # remove unwanted words
        text = re.sub(
            r"\b(set an reminder|reminder|add a reminder|add an reminder|set a reminder|for|on|at)\b",
            "",
            text
        )

        # normalize spaces
        text = " ".join(text.split())

        # ---------------- TIME ----------------
        time_match = re.search(
            r'(\d{1,2}(:\d{2})?\s?(a\.?m\.?|p\.?m\.?))',
            text,
            re.I
        )

        time = time_match.group(1) if time_match else None

        # ---------------- DATE ----------------
        date_match = re.search(
        r'\b(\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december))\b',
        text,
        re.I
    )

        date = date_match.group(1) if date_match else None

        # ---------------- REMINDER NAME ----------------
        name = text

        if time:
            name = name.replace(time, "")

        if date: 
            name = name.replace(date, "")

        name = name.replace('"', "").strip()

        # remove extra spaces again
        name = " ".join(name.split())

        # ---------------- AM / PM ----------------
        dn = ""

        if time:
            if "am" in time.replace(".", ""):
                dn = "AM"

            elif "pm" in time.replace(".", ""):
                dn = "PM"

        # ---------------- FINAL OUTPUT ----------------
        result = {
            "intent":"REMINDER",
            "reminder": name,
            "time": time,
            "date": date,
        }

        return result


    elif "calendar" in text or " date " in text or " day " in text:
        return {
            "intent":"CALENDAR"
        }
    elif "snooze" in text:
        return{
            "intent":"SNOOZE"
        }
    elif "remove" in text:
        return{
            "intent":"REMOVE"
        }
    elif ("music" in text or "song" in text or "songs" in text or "playlist" in text) and "stop" not in text:
        # play sad song playlist.
        # play tumse hi song.
        # play party playlist.
        # play music
        # play songs
        # play song
        playlists = ["sad", "party", "romantic", "lofi", "workout", "devotional","relaxing","english","hindi","chill","bollywood","bhakti","murlikidhun"]
        text=text.lower()
        for playlist in playlists:
            if playlist in text:
                return{
                "intent": "MUSIC",
                "name": None,
                "playlist": True,
                "type": playlist
                }
        song_name = (
        text.replace("play", "")
            .replace("songs", "")
            .replace("song","")
            .replace("music", "")
            .strip()
        )

        return {
            "intent": "MUSIC",
                "name": song_name,
                "playlist": False,
                "type": None
        }    

    elif ("movie" in text or "video" in text or "movies" in text) and ("event" not in text):
        text=text.lower()
        if ("open" in text):
            return {
                "intent":"VIDEO",
                "type":"show"
            }
        # play "movie name" video.
        moviename=(
        text.replace("play ","")
            .replace("movie","")
            .replace("video","")).strip()
        
        return {
            "intent":"VIDEO",
            "name":moviename,
            "type":None
        } 

    elif (
        "night mode" in text or
        "nightmode" in text or 
        "disturb" in text or
        "sleep" in text
    ):
        return {
            "intent":"NIGHTMODE"
        }


    elif ("slideshow"in text or
          
        "slide show" in text or
        "picture" in text
    ):
        #set a slideshow of family photos/images
        name=(text.replace("set ","")
              .replace("a ","")
              .replace("slideshow ","")
              .replace("slide ","")
              .replace("show ","")

              .replace("of ","")
              .replace(" photos","")
              .replace(" photo","")
              .replace(" images","")
              .replace(" image",""))
              
        return{
            "intent":"SLIDESHOW",
            "name":name
        }
    elif ("display" in text):
        return {
            "intent":"DISPLAY"
        }
    elif "stop" in text:
        return{
            "intent":"STOP"
        }
    elif "close" in text:
        return{
            "intent":"CLOSE"
        }    
    elif "reload" in text:
        return {
            "intent":"RELOAD"
        }
    elif "timer" in text:
        #start a timer for 20 minutes
        x=(text.replace("start ","")
           .replace("a ","")
           .replace("timer ","")
           .replace("for ","").replace("set ",""))
        
        part = x.split(" ")
        time=int(part[0])
        value=part[1]
        return{
            "intent":"TIMER",
            "time":time,
            "value":value
        }
    elif "event" in text:
        #add an event "pay tax" on 25 june 2026
        newtext=(text.replace("add","")
        .replace("an ","")
        .replace("a ","")
        .replace("event ","")
        .replace("on ","")
        .replace("for ","")
        )
        date="none"
        newtext = " ".join(newtext.split())
        date_match = re.search(
        r'(\d{1,2}\s+[a-zA-Z]+\s+\d{4})',
        newtext
        )
        if date_match:
           date = date_match.group(1)
        elif "today" in newtext:
            date = datetime.now().strftime("%d %B %Y")
        elif "tomorrow" in newtext:
            date = (
                datetime.now() + timedelta(days=1)
            ).strftime("%d %B %Y")     

        else:
            date = datetime.now().strftime("%d %B %Y")
        event_name=newtext        
        if date_match:
           event_name = newtext.replace(date, "").replace('"', "").strip()
        event_name = (
        event_name
        .replace("today", "")
        .replace("tomorrow", "")
        .replace('"', "")
        .strip()
        )   
        event_name = " ".join(event_name.split())
        return {
            "intent":"ADDEVENT",
            "name":event_name,
            "date":date
        }
    elif text=="continue":
        return {
            "intent":"CONTINUE"
        }
    elif "volume" in text:
        value=(text.replace("volume ",""))
        intvalue=int(value.strip())
        return {
            "intent":"VOLUME",
            "value":intvalue
        }
    

    else:
        print("cant understand")

print(intentrecogniton("set a reminder wake up at 10 a.m. for 26 may") )        


     



