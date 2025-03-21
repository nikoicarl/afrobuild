
module.exports = function getMelodyIds(melody1) {
    if (melody1 && melody1 !== "") {
        let useridTxt = (melody1.split('-')[0]) ? melody1.split('-')[0] : 'none1230';
        let sessionidTxt = (melody1.split('-')[1]) ? melody1.split('-')[1] : 'none10234';
        let userid = (useridTxt.match(/\d/g).join("")) ? useridTxt.match(/\d/g).join("") : 0;
        let sessionid = (sessionidTxt.match(/\d/g).join("")) ? sessionidTxt.match(/\d/g).join("") : 0;

        return {userid: parseInt(userid), sessionid: parseInt(sessionid)};
    } else {
        return {userid: 0, sessionid: 0};
    }
}