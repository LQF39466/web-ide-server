const fs = require('node:fs/promises')
const path = require('path')
const {FileIndex, ProjectIndex} = require('./types')
require('dotenv').config({
    path: path.resolve(__dirname, '../.env'),
    encoding: 'utf8',
    debug: false,
})
const env = process.env
const {v4: uuidv4} = require('uuid');


// Create an empty JSON file on the disk
const createEmptyJson = async (filePath) => {
    try {
        await fs.appendFile(filePath, JSON.stringify([]))
    } catch (err) {
        console.log(err)
    }
}

//Read project file from disk and returns a JSON object, if file not exist, create one and return an empty array
const projectInit = async () => {
    let projectListHandel, projectList
    const defaultProjectListPath = path.resolve(__dirname, env.DATA_FOLDER, env.PROJECT_LIST_NAME)
    try {
        projectListHandel = await fs.open(defaultProjectListPath)
    } catch (err) {
        if (err.code === 'ENOENT') { //If file does not exist, use empty array as project list
            await createEmptyJson(defaultProjectListPath)
            return []
        }
    }
    projectList = JSON.parse(await projectListHandel.readFile('utf-8'))
    if (projectList.length !== 0 && !projectList[0] instanceof ProjectIndex) {   //When parsed JSON does not meet type requirement
        console.log('Locale storage is corrupted, creating new project list...')
        await fs.rm(defaultProjectListPath)
        await createEmptyJson(defaultProjectListPath)
        return []
    }
    return projectList
}

const addFile = async (fileIndex, projectList) => {
    const projectIndex = projectList.find(({uid}) => uid === fileIndex.projectUid)

    //Perform project related checks
    if (projectIndex === undefined) {
        console.log('Project not found while adding file')
        return
    }
    if (projectIndex.entrance.linkedToFile === true && fileIndex.fileType === '.c') {    //Ensure only one .c file can be created for any project
        console.log('Cannot add multiple entrances to a project')
        return
    }

    //Perform fileIndex related checks
    if (!fileIndex.integrityCheck()) return

    try {
        await fs.appendFile(fileIndex.filePath, '')
    } catch (err) {
        console.log(err)
        return
    }

    const currentTime = Date.now()
    if (!fileIndex.linkToFile(currentTime, currentTime)) return   //Set timestamp and check integrity
    if (fileIndex.fileType === '.c') projectIndex.entrance = fileIndex
    else projectIndex.headers.push(fileIndex)  //If not .c, file would be determined as a header file
    projectIndex.integrityCheck()
}

const addProject = async (projectIndex, projectList) => {
    if (projectList.find(({uid}) => uid === projectIndex.uid) !== undefined) {
        console.log('Project already exist')
        return
    }
    try {
        await fs.mkdir(projectIndex.dirPath)
    } catch (err) {
        console.log(err)
        return
    }
    const currentTime = Date.now()
    const mainFile = new FileIndex(uuidv4(), projectIndex.uid, 'main', '.c')
    if (!projectIndex.linkToFolder(currentTime, currentTime, mainFile)) return
    projectList.push(projectIndex)
    await addFile(mainFile, projectList)
}

// const test = async () => {
//     const pl = await projectInit()
//     const uid = uuidv4()
//     const p = new ProjectIndex(uid, 'test1', '1234', 'C')
//     await addProject(p, pl)
//     const h1 = new FileIndex(uuidv4(), uid, 'test1', '.h')
//     const h2 = new FileIndex(uuidv4(), uid, 'test2', '.h')
//     await addFile(h1, pl)
//     await addFile(h2, pl)
// }
//
// test()