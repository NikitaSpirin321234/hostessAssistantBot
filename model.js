const {
    getNowTime,
    getTimeByTimestamp,
    getSeatingsCountEmoji
} = require("./helper.js");

const { Markup } = require('telegraf');

class MainModel {
    zones = [
        new Zone(1, 1, [], '1 зал', '1 зал'),
        new Zone(2, 2, [], '1-я пол. 2-го', '1-я половина 2-го'),
        new Zone(3, 2, [], '2-я пол. 2-го', '2-я половина 2-го'),
        new Zone(4, 3, [], '3 нач.', '3 начало'),
        new Zone(5, 3, [], '3 сер.', '3 середина'),
        new Zone(6, 3, [], '3 кон.', '3 конец'),
        new Zone(7, 4, [], '4 зал', '4 зал'),
        new Zone(8, 5, [], '1-я пол. 5-го', '1-я половина 5-го'),
        new Zone(9, 5, [], '2-я пол. 5-го', '2-я половина 5-го'),
        new Zone(10, 6, [], '6 зал', '6 зал'),
    ]

    lastMessage = null

    constructor() {}

    getLastMessage() { return this.lastMessage }
    setLastMessage(lastMessage) { this.lastMessage = lastMessage }

    getCountAllSeatings() {
        let seatingsCount = 0;
        this.zones.forEach((zone) => {
            seatingsCount += zone.getSeatingsCount();
        })
        return seatingsCount;
    }  

    addSeatingInZone(zoneIndex, username, changeTimestamp) {
        let zone = this.getZoneByIndex(zoneIndex);
        zone.addSeating(username, changeTimestamp);
    }

    deleteSeatingInZone(zoneIndex, timestamp) {
        let zone = this.getZoneByIndex(zoneIndex);
        return zone.deleteSeatingByTimestamp(timestamp);
    }

    setSeatingMessageInZone(zoneIndex, timestamp, message) {
        let zone = this.getZoneByIndex(zoneIndex);
        zone.setSeatingMessage(timestamp, message);
    }

    deleteSeatingByMessageID(messageID) {
        let zones = this.zones;
        for(let i = 0; i < zones.length; i++) {
            let zone = zones[i];
            let seatings = zone.getSeatings();
            let deletedSeating = seatings.find((seating) => {
                if(seating.message && seating.message.message_id === messageID) {
                    return true;
                } else {
                    return false;
                }
            })

            if(deletedSeating) {
                return zone.deleteSeatingByMessageID(messageID);
            }    
        }

        return false;
    }

    getZoneByIndex(findedZoneIndex) {
        let zones = this.zones;
        for(let i = 0; i < zones.length; i++) {
            let zone = zones[i];
            let zoneIndex = zone.getIndex();
            if(zoneIndex === findedZoneIndex) {
                return zone;
            }
        }
    }

    getKeyboardItemByZoneIndex(zoneIndex) {
        let zone = this.getZoneByIndex(zoneIndex);
        return zone.getKeyboardItem();
    }

    getInlineKeyboard() {
        let inlineKeyboard = Markup.inlineKeyboard([
            [this.getKeyboardItemByZoneIndex(1)],
            [this.getKeyboardItemByZoneIndex(2), this.getKeyboardItemByZoneIndex(3)],
            [this.getKeyboardItemByZoneIndex(4), this.getKeyboardItemByZoneIndex(5), this.getKeyboardItemByZoneIndex(6)],
            [this.getKeyboardItemByZoneIndex(7)],
            [this.getKeyboardItemByZoneIndex(8), this.getKeyboardItemByZoneIndex(9)],
            [this.getKeyboardItemByZoneIndex(10)],
        ]).oneTime();
    
        return inlineKeyboard;
    }
}

class Zone {
    constructor(index, hallNumber, seatings, name, fullname) {
        this.index = index;
        this.hallNumber = hallNumber;
        this.seatings = seatings;
        this.name = name;
        this.fullname = fullname;
    }

    getIndex() {return this.index }

    getSeatings() { return this.seatings }

    getSeatingsCount() { return this.seatings.length };

    getSeatingByTimestamp(timestamp) { return this.seatings.find((seating) => seating.timestamp === timestamp) }

    addSeating(username, changeTimestamp) {
        let seating = {
            timestamp: changeTimestamp,
            username: username
        }
        this.seatings.push(seating);
    }

    setSeatingMessage(timestamp, message) {
        let seating = this.seatings.find((seating) => seating.timestamp === timestamp);
        seating.message = message;
    }

    deleteSeatingByTimestamp(timestamp) {
        let deleteIndex = this.seatings.findIndex((seating) => seating.timestamp === timestamp);
        if(deleteIndex !== -1) {
            let deletedTimestamp = this.seatings[deleteIndex].timestamp;
            this.seatings.splice(deleteIndex, 1);

            let countAllSeatings = mainModel.getCountAllSeatings();
            console.log(`${getNowTime()}: deleteSeatingByTimestamp(${this.fullname}), time - ${getTimeByTimestamp(deletedTimestamp)}, количество столов - ${countAllSeatings}`);
            return true;
        } else {
            return false;
        }
    }

    deleteSeatingByMessageID(messageID) {
        let deleteIndex = this.seatings.findIndex((seating) => {
            if(seating.message && seating.message.message_id === messageID) return true;
            else return false
        });
        let deletedTimestamp = this.seatings[deleteIndex].timestamp;
        if(deleteIndex !== -1) {
            this.seatings.splice(deleteIndex, 1);
            let countAllSeatings = mainModel.getCountAllSeatings();
            console.log(`${getNowTime()}: deleteSeatingByMessageID(${this.fullname}), time - ${getTimeByTimestamp(deletedTimestamp)}, количество столов - ${countAllSeatings}`);
            return true;
        } else {
            return false;
        }
    }

    getKeyboardItem() {
        let seatingsCount = this.getSeatingsCount();
        let text = this.name + " " + getSeatingsCountEmoji(seatingsCount);

        if(this.index === 2 || this.index === 3) {
            text = "     " + text + "     ";
        }

        let item = {
            text: text, 
            callback_data: `addSeatingInZone${this.index}`
        };
        return item;
    }

}

const mainModel = new MainModel();

module.exports = mainModel;

