function getNowTime() {
    let nowTimestamp = Date.now();
    return getTimeByTimestamp(nowTimestamp);
}

function getTimeByTimestamp(timestamp) {
    var date = new Date(timestamp);
    let timeText = [date.getHours(), date.getMinutes()].map(x => {return ('0' + x).slice(-2)}).join(':');
    return timeText;
}

function getSeatingsCountEmoji(number) {
    let emoji = number;
    switch(number) {
        case 0: emoji = "0️⃣"; break;
        case 1: emoji = "1️⃣"; break;
        case 2: emoji = "2️⃣"; break;
        case 3: emoji = "3️⃣"; break;
        case 4: emoji = "4️⃣"; break;
        case 5: emoji = "5️⃣"; break;
        case 6: emoji = "6️⃣"; break;
        case 7: emoji = "7️⃣"; break;
        case 8: emoji = "8️⃣"; break;
        case 9: emoji = "9️⃣"; break;
        case 10: emoji = "🔟"; break;
    }
    return emoji;
}

module.exports = {
    getNowTime,
    getTimeByTimestamp,
    getSeatingsCountEmoji
};
