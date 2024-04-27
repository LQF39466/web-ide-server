const {runCompile} = require('../exec')

const execController = async (ctx) => {
    const projectInfo = ctx.request.body
    if (projectInfo !== undefined) {
        const result = await runCompile(projectInfo.uid)
        if (result.result)
            ctx.body = {code: 0, message: 'Project execution completed', stdout: result.stdout};
        else ctx.body = {code: -1, message: 'An error has occurred while executing project'}
    } else ctx.body = {code: -2, message: 'Empty request'}
}

module.exports = {
    'POST /api/runProject': execController,
}