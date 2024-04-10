const {readProjectList, addProject, deleteProject, deleteFile, addFile} = require('../fs')
const {ProjectIndex, FileIndex} = require('../types')
const {v4: uuidv4} = require('uuid');

//Only include necessary data fields while stringify object for transmission
const projectIndexSerialize = ['uid', 'title', 'details', 'languageType', 'createTime', 'lastEdit', 'entrance', 'headers']
const fileIndexSerialize = ['uid', 'projectUid', 'title', 'fileType', 'createTime', 'lastEdit']

const projectListController = async (ctx) => {
    const projectList = await readProjectList()
    ctx.body = {
        code: 0,
        projectList: JSON.stringify(projectList, projectIndexSerialize)
    }
}

const addProjectController = async (ctx) => {
    const projectInfo = ctx.request.body
    if (projectInfo !== undefined) {
        const projectList = await readProjectList()
        const projectIndex = new ProjectIndex(uuidv4(), projectInfo.title, projectInfo.details, 'C')
        if (await addProject(projectIndex, projectList))
            ctx.body = {code: 0, message: 'Project added successfully'}
        else ctx.body = {code: -1, message: 'An error has occurred while adding project'}
    } else ctx.body = {code: -2, message: 'Empty request'}
}

const deleteProjectController = async (ctx) => {
    const projectInfo = ctx.request.body
    if (projectInfo !== undefined) {
        const projectList = await readProjectList()
        if (await deleteProject(projectInfo.uid, projectList))
            ctx.body = {code: 0, message: 'Project deleted successfully'}
        else ctx.body = {code: -1, message: 'An error has occurred while deleting project'}
    } else ctx.body = {code: -2, message: 'Empty request'}
}

const addFileController = async (ctx) => {
    const fileInfo = ctx.request.body
    if (fileInfo !== undefined) {
        const projectList = await readProjectList()
        const fileIndex = new FileIndex(uuidv4(), fileInfo.projectUid, fileInfo.title, '.h')
        if (await addFile(fileIndex, projectList))
            ctx.body = {code: 0, message: 'File added successfully'}
        else ctx.body = {code: -1, message: 'An error has occurred while adding file'}
    } else ctx.body = {code: -2, message: 'Empty request'}
}

const deleteFileController = async (ctx) => {
    const fileInfo = ctx.request.body
    if (fileInfo !== undefined) {
        const projectList = await readProjectList()
        if(await deleteFile(fileInfo.projectUid, fileInfo.uid, projectList))
            ctx.body = {code: 0, message: 'File deleted successfully'}
        else ctx.body = {code: -1, message: 'An error has occurred while deleting file'}
    } else ctx.body = {code: -2, message: 'Empty request'}
}

module.exports = {
    'GET /api/getProjectList': projectListController,
    'POST /api/addProject': addProjectController,
    'POST /api/deleteProject': deleteProjectController,
    'POST /api/addFile': addFileController,
    'POST /api/deleteFile': deleteFileController
}