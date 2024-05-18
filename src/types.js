const path = require('path')
require('dotenv').config({
    path: path.resolve(__dirname, '../.env'),
    encoding: 'utf8',
    debug: false,
})
const env = process.env

class ProjectIndex {
    constructor(uid, title, details, languageType) {
        // Must-have attributes under any conditions
        this.uid = uid
        this.title = title
        this.details = details
        this.dirPath = path.resolve(__dirname, env.USR_FOLDER, this.uid)
        this.languageType = languageType

        this.linkedToFolder = false   // A flag indicates object status

        // Must-have attributes only when linkedToFolder flag is set to true
        this.createTime = undefined
        this.lastEdit = undefined
        this.entrance = undefined    //File index of code entrance, filetype must be .c
        this.headers = undefined      //Array of header files, filetype must be .h
        this.textFiles = undefined    //Array of text files, filetype must be .txt
    }

    // Check all data fields
    integrityCheck() {
        if (typeof this.uid !== 'string' ||
            typeof this.details !== 'string' ||
            typeof this.title !== 'string' ||
            typeof this.languageType !== 'string'
        ) {
            console.log('Project ' + this.uid + ' has invalid attribute types')
            return false
        }
        if (this.languageType !== 'C') {
            console.log('Project ' + this.uid + '\'s language is not supported')
            return false
        }

        if (this.linkedToFolder) {
            if (typeof this.createTime !== 'number' ||
                typeof this.lastEdit !== 'number' ||
                !this.entrance instanceof FileIndex ||
                !Array.isArray(this.headers)
            ) {
                console.log('Project ' + this.uid + ' has invalid attribute types')
                return false
            }
            if (this.headers.length !== 0 && !this.headers[0] instanceof FileIndex) {
                console.log('Project ' + this.uid + '\'s header list has insufficient data')
                return false
            }
        }
        return true
    }

    // Perform status change
    linkToFolder(createTime, lastEdit, entrance) {
        this.linkedToFolder = true
        this.createTime = createTime
        this.lastEdit = lastEdit
        this.entrance = entrance
        this.headers = []
        this.textFiles = []
        return this.integrityCheck()
    }
}

class FileIndex {
    constructor(uid, projectUid, title, fileType) {
        this.uid = uid
        this.projectUid = projectUid
        this.title = title
        this.fileType = fileType
        this.filePath = path.resolve(__dirname, env.USR_FOLDER, this.projectUid, this.title + this.fileType)

        this.linkedToFile = false   // A flag indicates object status

        // Must-have attributes only when linkedToFile flag is set to true
        this.createTime = undefined
        this.lastEdit = undefined
    }

    //Check must-have data fields
    integrityCheck() {
        if (typeof this.uid !== 'string' ||
            typeof this.projectUid !== 'string' ||
            typeof this.title !== 'string' ||
            typeof this.fileType !== 'string'
        ) {
            console.log('File ' + this.uid + ' has invalid attribute types')
            return false
        }

        if (this.linkedToFile) {
            if (typeof this.createTime !== 'number' ||
                typeof this.lastEdit !== 'number'
            ) {
                console.log('File ' + this.uid + ' has invalid attribute types')
                return false
            }
        }
        return true
    }

    // Perform status change
    linkToFile(createTime, lastEdit) {
        this.linkedToFile = true
        this.createTime = createTime
        this.lastEdit = lastEdit
        return this.integrityCheck()
    }
}

module.exports = {ProjectIndex, FileIndex}