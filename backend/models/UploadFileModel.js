const fs = require('fs');
const path = require('path');

class UploadFile {
    constructor(fileNames, namesForRename) {
        this.fileNames = fileNames;
        this.namesForRename = namesForRename;
        this.filePath = path.resolve(__dirname, '../../stuff/uploads/');
    }

    upload() {
        if (Array.isArray(this.fileNames) && this.fileNames.length > 0) {
            for (let i = 0; i < this.fileNames.length; i++) {
                const originalName = this.fileNames[i];
                const txtFileName = this._getTxtFileName(originalName);
                const newFileName = this._getNewName(originalName, this.namesForRename, i);
                this._readAndConvert(txtFileName, newFileName);
            }
        } else {
            console.warn('No files provided for upload.');
        }
    }

    _getTxtFileName(fileName) {
        const base = path.basename(fileName, path.extname(fileName));
        return `${base}.txt`;
    }

    _getNewName(fileName, renameList, index) {
        const ext = path.extname(fileName).toLowerCase();

        if (!renameList || typeof renameList !== 'string') {
            return fileName;
        }

        const names = renameList.split(',');
        let newName = names[index];

        if (!newName || newName.trim() === '') {
            return fileName;
        }

        newName = newName.trim().replace(/\s+/g, '_');
        return `${newName}${ext}`;
    }

    _readAndConvert(txtFileName, outputFileName) {
        const txtPath = path.join(this.filePath, txtFileName);

        if (!fs.existsSync(txtPath)) {
            console.warn(`File not found: ${txtPath}`);
            return;
        }

        const readStream = fs.createReadStream(txtPath);
        let data = '';

        readStream.on('data', chunk => {
            data += chunk;
        });

        readStream.on('error', err => {
            console.error('Error reading file:', err);
        });

        readStream.on('end', () => {
            this._writeDecodedFile(data, outputFileName, txtPath);
        });
    }

    _writeDecodedFile(encodedData, outputFileName, txtPath) {
        try {
            const outputPath = path.join(this.filePath, outputFileName);
            fs.writeFileSync(outputPath, encodedData, 'base64');
            console.log(`${outputFileName} has been written.`);

            if (fs.existsSync(txtPath)) {
                fs.unlinkSync(txtPath);
                console.log(`${txtPath} has been deleted.`);
            } else {
                console.warn(`Could not delete. File not found: ${txtPath}`);
            }
        } catch (err) {
            console.error('Error writing or deleting file:', err);
        }
    }

    getRenamedFiles() {
        if (!Array.isArray(this.fileNames)) return [];
        return this.fileNames.map((file, i) => this._getNewName(file, this.namesForRename, i));
    }
}

module.exports = UploadFile;
