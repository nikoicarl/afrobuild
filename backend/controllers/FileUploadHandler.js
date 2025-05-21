const fs = require('fs');
const path = require('path');
const md5 = require('md5');

const FileDataHolder = {};

const UPLOAD_DIR = path.join(__dirname, '../../../stuff/uploads');

module.exports = (socket) => {
    socket.on('ovasyte_general_file_upload', async (fileData, cb) => {
        const newBeginning = fileData.start + fileData.unit;

        // Extract file name without extension
        const ext = path.extname(fileData.name); // e.g., ".jpg"
        const TextFileName = path.basename(fileData.name, ext); // removes extension

        // Ensure upload directory exists
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        // File write logic
        const filePath = path.join(UPLOAD_DIR, `${TextFileName}.txt`);
        const data = fileData.data.split("base64,")[1];

        const appendStream = fs.createWriteStream(filePath, { flags: 'a' });
        appendStream.write(data);
        appendStream.end();

        // Chunk control logic
        if (newBeginning < fileData.size) {
            cb({
                status: 'more',
                divname: fileData.divname,
                index: fileData.index,
                start: newBeginning,
                unit: fileData.unit,
                name: fileData.name,
                size: fileData.size
            });
        } else if (newBeginning > fileData.size) {
            const remainingByte = fileData.size - fileData.start;
            cb({
                status: 'more',
                divname: fileData.divname,
                index: fileData.index,
                start: fileData.start,
                unit: remainingByte,
                name: fileData.name,
                size: fileData.size
            });
        } else {
            delete FileDataHolder[fileData.name];
            console.log('Finished:', fileData.name, '=> start:', fileData.start, 'unit:', fileData.unit, 'size:', fileData.size);

            cb({
                status: 'finish',
                divname: fileData.divname,
                index: fileData.index,
                start: fileData.start,
                unit: fileData.unit,
                name: fileData.name,
                size: fileData.size
            });
        }
    });
};
