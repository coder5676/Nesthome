let activeReminder = null;

let reminderAudio = null;
// CHECK REMINDERS
export async function checkReminders() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/showreminders"
        );

        const reminders = await response.json();

        const now = new Date();

        // CURRENT TIME
        let hours = now.getHours();

        const minutes = String(
            now.getMinutes()
        ).padStart(2, "0");

        const ampm =
            hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;

        const currentTime =
            `${hours}:${minutes} ${ampm}`;

        // CURRENT DATE
        const months = [
            "january","february","march",
            "april","may","june",
            "july","august","september",
            "october","november","december"
        ];

        const currentDate =
            `${now.getDate()} ${months[now.getMonth()]}`;

        // LOOP REMINDERS
        for (const title in reminders) {

            const reminder = reminders[title];

            if (reminder.completed === true) {
                continue;
            }

            // normalize time
            let reminderTime =
                reminder.time
                    .replace(/\./g, "")
                    .toUpperCase()
                    .trim();

            // 12 PM → 12:00 PM
            if (!reminderTime.includes(":")) {

                reminderTime =
                    reminderTime.replace(
                        " ",
                        ":00 "
                    );
            }

            const reminderDate =
                reminder.date
                    .toLowerCase()
                    .trim();

            // MATCH
            if (
                reminderTime === currentTime &&
                reminderDate === currentDate
            ) {

                activeReminder = title;

                console.log("🔔 Reminder:", title);

                const alert =
                    new Audio("reminderaudio.mp3");
                    alert.loop=true;
                document.getElementById("reminderbox").style.display="flex"; 
                document.getElementById("remtitle").innerText=title;   
                alert.play();

                break;
            }
        }

    }
    catch(err) {

        console.log(err);
    }
}


// REMOVE REMINDER
export async function removeReminder() {

    if (!activeReminder) {
        return;
    }
 if (reminderAudio) {
            reminderAudio.pause();
            reminderAudio.currentTime = 0;
            reminderAudio = null;
        }
    try {

        await fetch(
            "http://127.0.0.1:8000/updatereminder",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({

                    title: activeReminder,

                    action: "remove"
                })
            }
        );

        console.log("Reminder removed");

        document.getElementById(
            "reminderpopup"
        ).style.display = "none";

        activeReminder = null;
                document.getElementById("reminderbox").style.display="none";    

    }
    catch(err) {

        console.log(err);
    }
}


// SNOOZE REMINDER
export async function snoozeReminder() {

    if (!activeReminder) {
        return;
    }
     if (reminderAudio) {
            reminderAudio.pause();
            reminderAudio.currentTime = 0;
            reminderAudio = null;
        }

    try {

        await fetch(
            "http://127.0.0.1:8000/updatereminder",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({

                    title: activeReminder,

                    action: "snooze"
                })
            }
        );

        console.log("Reminder snoozed");

        document.getElementById(
            "reminderpopup"
        ).style.display = "none";

        activeReminder = null;
                document.getElementById("reminderbox").style.display="none";    

    }
    catch(err) {

        console.log(err);
    }
}


// AUTO CHECK
setInterval(checkReminders, 10000);