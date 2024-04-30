const {execSync, execFileSync} = require('node:child_process')
const {readProjectList} = require('./fs')

const runCompile = async (projectUid) => {
    const projectList = await readProjectList()
    const projectIndex = projectList.find(({uid}) => uid === projectUid)
    const fileTitle = projectIndex.entrance.title
    try {
        execSync('clang ' + fileTitle + '.c' + ' -o ' + fileTitle + '.exe', {cwd: projectIndex.dirPath})
    } catch (e) {
        return {
            result: false,
            stdout: e
        }
    }
    const stdout = runExecutable(projectIndex)
    return {
        result: true,
        stdout: stdout
    }
}

const runExecutable = (projectIndex) => {
    const fileTitle = projectIndex.entrance.title + '.exe'
    try {
        return execFileSync(fileTitle, {cwd: projectIndex.dirPath}).toString()
    } catch (e) {
        return e
    }
}

module.exports = {runCompile}