const {readProjectList, addProject, deleteProject, deleteFile, addFile, locateFile} = require('../fs')
const {ProjectIndex, FileIndex} = require('../types')
const {v4: uuidv4} = require('uuid');
const send = require('koa-send')

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
        const projectIndex = new ProjectIndex(uuidv4(), projectInfo.title, projectInfo.details, 'C')
        if (await addProject(projectIndex))
            ctx.body = {code: 0, message: 'Project added successfully'}
        else ctx.body = {code: -1, message: 'An error has occurred while adding project'}
    } else ctx.body = {code: -2, message: 'Empty request'}
}

const deleteProjectController = async (ctx) => {
    const projectInfo = ctx.request.body
    if (projectInfo !== undefined) {
        if (await deleteProject(projectInfo.uid))
            ctx.body = {code: 0, message: 'Project deleted successfully'}
        else ctx.body = {code: -1, message: 'An error has occurred while deleting project'}
    } else ctx.body = {code: -2, message: 'Empty request'}
}

const addFileController = async (ctx) => {
    const fileInfo = ctx.request.body
    if (fileInfo !== undefined) {
        const fileIndex = new FileIndex(fileInfo.uid, fileInfo.projectUid, fileInfo.title, fileInfo.fileType)
        if (await addFile(fileIndex))
            ctx.body = {code: 0, message: 'File added successfully'}
        else ctx.body = {code: -1, message: 'An error has occurred while adding file'}
    } else ctx.body = {code: -2, message: 'Empty request'}
}

const deleteFileController = async (ctx) => {
    const fileInfo = ctx.request.body
    if (fileInfo !== undefined) {
        if (await deleteFile(fileInfo.projectUid, fileInfo.uid))
            ctx.body = {code: 0, message: 'File deleted successfully'}
        else ctx.body = {code: -1, message: 'An error has occurred while deleting file'}
    } else ctx.body = {code: -2, message: 'Empty request'}
}

const sendFileController = async (ctx) => {
    const fileInfo = ctx.request.body
    if (fileInfo !== undefined) {
        const filePath = await locateFile(fileInfo.projectUid, fileInfo.uid)
        ctx.attachment(filePath)
        await send(ctx, filePath, {root: '/'})
    }
}

module.exports = {
    'GET /api/getProjectList': projectListController,
    'POST /api/addProject': addProjectController,
    'POST /api/deleteProject': deleteProjectController,
    'POST /api/addFile': addFileController,
    'POST /api/deleteFile': deleteFileController,
    'POST /api/getFile': sendFileController
}