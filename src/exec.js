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
    return runExecutable(projectIndex)
}

const runExecutable = (projectIndex) => {
    const fileTitle = projectIndex.entrance.title + '.exe'
    let result
    try {
         result = execFileSync(fileTitle, {cwd: projectIndex.dirPath}).toString()
    } catch (e) {
        return {
            result: false,
            stdout: e
        }
    }
    return {
        result: true,
        stdout: result
    }
}

module.exports = {runCompile}