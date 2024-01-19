const Koa = require("koa")
const Router = require("koa-router")
const { koaBody } = require("koa-body")
const KoaStatic = require("koa-static")
const Session = require("koa-session")
const path = require("path")

const app = new Koa()
const router = new Router()

const staticPath = path.resolve(__dirname, "../dist/static")
app.use(KoaStatic(staticPath))

app.keys = ["i love hust"]

//配置session
const SessionStore = {}
const CONFIG = {
    key: "koa.sess",
    maxAge: 86400000,
    autoCommit: true,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false,
    secure: false,
    sameSite: undefined,
    store: {
        get: (key) => {
            return SessionStore[key]
        },
        set: (key, value, maxAge) => {
            console.log("set", key, value, maxAge)
            SessionStore[key] = value
        },
        destroy: (key) => {
            SessionStore[key] = null
            console.log("destroy")
        },
    },
}
app.use(Session(CONFIG, app))

app.use(koaBody({ multipart: true }))
app.use(router.routes()).use(router.allowedMethods())
app.listen(3001)