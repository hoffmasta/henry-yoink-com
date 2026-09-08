//TODO add passing periods
function getDay() {
    let nowThing = getScheduleNow()

    let dateText = (nowThing.getMonth() + 1) + "/" + nowThing.getDate() + "/" + nowThing.getFullYear() 
    if (specialSchedules[dateText]) return dateText
const day = getScheduleNow().getDay()
switch(day) {
    case 1:
    case 2:
    case 4:
        return "mtth"
    case 3:
        return "w"
    case 5:
        return "f"
}
}
function timeControls() {
    const text = document.getElementById("prompt")

    text.innerHTML = "No WiFi, clown"
    
let times = getTimes()
function getTimes() {
    return getScheduleForDate(getScheduleNow()) || {}
}

function ParseTime(TimeString) {
    let [startTime,endTime] = TimeString.split("-")
    
    let [startHr,startMin,startSec = 0] = startTime.split(":")
    let [endHr,endMin,endSec = 0] = endTime.split(":")
    const start = getScheduleNow()
    start.setHours(startHr,startMin,startSec,0)
    const end = getScheduleNow()
    end.setHours(endHr,endMin,endSec,0)
    return [start,end]
}
function IsNow(TimeString) {
    if (!TimeString)  {
        // console.warn("Not a string lol")
        return false
    }
   
    const now = getScheduleNow()
    const [start,end] = ParseTime(TimeString)
    if (TimeString == '12:39-1:09') {
        console.log(now,start,end)
    }
    if (now > start && now < end) return true
    return false
}
function getRawToStart(TimeString) {
    const now = getScheduleNow()
    const [start,end] = ParseTime(TimeString)
    const difference = start - now

    return difference
}
function getTimeToStart(TimeString) {
    const now = getScheduleNow()
    const [start,end] = ParseTime(TimeString)
    const difference = start - now
    const milliseconds = Math.floor(difference)
    const seconds = Math.floor(difference / 1000)
    const minutes = Math.floor(difference / (1000 * 60))
    const hours = Math.floor(difference / (1000 * 60 * 60))

    return [hours % 24,minutes % 60,seconds % 60,milliseconds % 1000]
}
function getTimeTo(TimeString) {
    const now = getScheduleNow()
    const [start,end] = ParseTime(TimeString)
    const difference = end - now
    const milliseconds = Math.floor(difference)
    const seconds = Math.floor(difference / 1000)
    const minutes = Math.floor(difference / (1000 * 60))
    const hours = Math.floor(difference / (1000 * 60 * 60))

    return [hours % 24,minutes % 60,seconds % 60,milliseconds % 1000]
}
let suggestedPeriod = false
const copyNothingPrompts = [
    "Nothing to See Here",
    "No Classes Soon",
    "School is Not in Session",
    "Enjoy your Free Time"
]
let selectedCopyNothingPrompt = null
let wasOutsideCopyScheduleWindow = false
function getSuggestedPeriod() {
    for (let period in times) {
        if (IsNow(times[period])) return period
    }
    return false
}
function isOutsideScheduleWindow() {
    const periods = Object.values(times)
    if (periods.length === 0) return true

    const starts = periods.map(period => ParseTime(period)[0].getTime())
    const ends = periods.map(period => ParseTime(period)[1].getTime())
    const now = getScheduleNow().getTime()
    const twoHours = 2 * 60 * 60 * 1000

    return now <= Math.min(...starts) - twoHours || now >= Math.max(...ends) + twoHours
}
function getNextCopySchoolDate() {
    const candidate = new Date(getScheduleNow())
    for (let daysAhead = 0; daysAhead < 366; daysAhead += 1) {
        const schedule = getScheduleForDate(candidate)
        if (schedule && Object.keys(schedule).length > 0) {
            if (daysAhead > 0 || getScheduleNow().getTime() < Math.min(...Object.values(schedule).map(period => ParseTime(period)[0].getTime()))) {
                return candidate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                })
            }
        }
        candidate.setDate(candidate.getDate() + 1)
    }
    return "the next school day"
}
function showNothing() {
    const dayType = getSpecialDayType(getScheduleNow())
    if (!selectedCopyNothingPrompt) {
        const randomIndex = Math.floor(Math.random() * copyNothingPrompts.length)
        selectedCopyNothingPrompt = copyNothingPrompts[randomIndex]
    }
    suggestedPeriod = false
    title.innerText = ""
    text.dataset.before = dayType || selectedCopyNothingPrompt
    text.innerText = ""
    text.dataset.after = `School will be back on ${getNextCopySchoolDate()}`
}
let tries = 0
let broke = false
function getClosest() {
    let leastTime = 0
    let leastTimeIdx = false
    for (let period in times) {
        let time = getRawToStart(times[period])
        if (time <= leastTime) {
            leastTimeIdx = period
        }

    }
    return leastTimeIdx
}
let passing = false
function loop() {
    if (Object.keys(times).length === 0) return
    if (isOutsideScheduleWindow()) {
        if (!wasOutsideCopyScheduleWindow) {
            showNothing()
            wasOutsideCopyScheduleWindow = true
        }
        return
    }
    wasOutsideCopyScheduleWindow = false
    selectedCopyNothingPrompt = null

    if (!suggestedPeriod) suggestedPeriod = getSuggestedPeriod()

    let now = IsNow(times[suggestedPeriod])

    if (!now) {
        suggestedPeriod = getClosest()
        times = getTimes()

        if (tries >= 10 || broke) {
            broke = true
            // clearInterval(interval)
            title.innerText = "Bork"
            text.dataset.before = "Nothing to see here"
            text.dataset.after = "Move along"
            text.innerText = "Bozo Clown"
            
            return
        }
        broke = false
        tries += 1
        return
    }
    tries = 0
    let time = getTimeTo(times[suggestedPeriod])
    if (passing) {
        time = getTimeToStart(times[suggestedPeriod])
    }

    displayTime(time)
    titleUpdate(time)
}
function FormatTime(Time) {
    let [hrs,mins,secs,mils] = Time
    if (mins < 10 && hrs > 0) {
        mins = "0" + mins
    }
    let unit = ""
    if (mils < 100) {
        mils = "0" + mils
    }
    if (mils < 10) {
        mils = "0" + mils
    }
    if (secs < 10) {
        secs = "0" + secs
    }
    if (hrs <= 0) {
        hrs = ""
        unit = ""
    } else {
        hrs = hrs + ":"
    }
    return [hrs,mins,secs,mils,unit]
}
function displayTime(Time) {
    let [hrs,mins,secs,mils,unit] = FormatTime(Time)
    const dayType = getSpecialDayType(getScheduleNow())
    text.dataset.before = "You Have"
    text.innerText = `${hrs}${mins}:${secs}:${mils} ${unit}`
    const specialLabel = dayType ? ` (${dayType})` : ""
    text.dataset.after = `Until ${periodText(suggestedPeriod)}${specialLabel}`
}
function titleUpdate(time) {
    if (!times[suggestedPeriod]) return
    const [hrs,mins,secs] = time
    
    title.innerText = `${hrs}${mins}:${secs}`
}
// let interval = setInterval(titleUpdate,100)
console.log(times)
titleUpdate()
return loop
}
