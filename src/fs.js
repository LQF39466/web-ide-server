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


const saveProjectList = async (projectList) => {
    const defaultProjectListPath = path.resolve(__dirname, env.DATA_FOLDER, env.PROJECT_LIST_NAME)
    try {
        await fs.writeFile(defaultProjectListPath, JSON.stringify(projectList))
    } catch (err) {
        console.log(err)
        return false
    }
    return true
}

//Read project file from disk and returns a JSON object, if file not exist, create one and return an empty array
const readProjectList = async () => {
    let projectListHandel, projectList
    const defaultProjectListPath = path.resolve(__dirname, env.DATA_FOLDER, env.PROJECT_LIST_NAME)
    try {
        projectListHandel = await fs.open(defaultProjectListPath)
    } catch (err) {
        if (err.code === 'ENOENT') { //If file does not exist, use empty array as project list
            await saveProjectList([])
            return []
        }
    }
    projectList = JSON.parse(await projectListHandel.readFile('utf-8'))
    await projectListHandel.close()
    if (projectList.length !== 0 && !projectList[0] instanceof ProjectIndex) {   //When parsed JSON does not meet type requirement
        console.log('Locale storage is corrupted, creating new project list...')
        await fs.rm(defaultProjectListPath)
        await saveProjectList([])
        return []
    }
    return projectList
}

const addFile = async (fileIndex, projectList) => {
    const projectIndex = projectList.find(({uid}) => uid === fileIndex.projectUid)

    //Perform project related checks
    if (projectIndex === undefined) {
        console.log('Project not found while adding file')
        return false
    }
    if (projectIndex.entrance.linkedToFile === true && fileIndex.fileType === '.c') {    //Ensure only one .c file can be created for any project
        console.log('Cannot add multiple entrances to a project')
        return false
    }
    if (projectIndex.headers.find(({filePath}) => filePath === fileIndex.filePath) !== undefined) {
        console.log('File name already exists')
        return false
    }

    //Perform fileIndex related checks
    if (!fileIndex.integrityCheck()) return false

    try {
        await fs.appendFile(fileIndex.filePath, '')
    } catch (err) {
        console.log(err)
        return false
    }

    const currentTime = Date.now()
    if (!fileIndex.linkToFile(currentTime, currentTime)) return   //Set timestamp and check integrity
    if (fileIndex.fileType === '.c') projectIndex.entrance = fileIndex
    else projectIndex.headers.push(fileIndex)  //If not .c, file would be determined as a header file
    projectIndex.lastEdit = currentTime //Set project's edit timestamp
    console.log(projectIndex)
    await saveProjectList(projectList)
    return true
}

//Add a new project, also creates a .c file as entrance
const addProject = async (projectIndex, projectList) => {
    if (projectList.find(({uid}) => uid === projectIndex.uid) !== undefined) {
        console.log('Project already exist')
        return false
    }
    try {
        await fs.mkdir(projectIndex.dirPath)
    } catch (err) {
        console.log(err)
        return false
    }
    const currentTime = Date.now()
    const mainFile = new FileIndex(uuidv4(), projectIndex.uid, 'main', '.c')
    if (!projectIndex.linkToFolder(currentTime, currentTime, mainFile)) return false
    projectList.push(projectIndex)
    if (!await addFile(mainFile, projectList)) return false
    return await saveProjectList(projectList)
}

const deleteProject = async (uuid, projectList) => {
    const projectIndexPos = projectList.findIndex(({uid}) => uid === uuid)
    if (projectIndexPos === -1) {
        console.log('Project not exist')
        return false
    }
    const projectIndex = projectList[projectIndexPos]
    projectList.splice(projectIndexPos, 1)  //Delete from memory
    try {
        await fs.rm(projectIndex.dirPath, {recursive: true, force: true})   //Delete project files
    } catch (err) {
        console.log(err)
        return false
    }
    return await saveProjectList(projectList)
}

const deleteFile = async (projectUid, fileUid, projectList) => {
    const projectIndex = projectList.find(({uid}) => uid === projectUid)
    if (projectIndex === undefined) {
        console.log('Project not found')
        return false
    }
    const fileIndexPos = projectIndex.headers.findIndex(({uid}) => uid === fileUid)
    if (fileIndexPos === -1) {
        console.log('File not found')
        return false
    }
    const fileIndex = projectIndex.headers[fileIndexPos]
    projectIndex.headers.splice(fileIndexPos, 1)    //Delete from memory
    try {
        await fs.rm(fileIndex.filePath)
    } catch (err) {
        console.log(err)
        return false
    }
    return await saveProjectList(projectList)
}

module.exports = {readProjectList, addFile, addProject, deleteProject, deleteFile}