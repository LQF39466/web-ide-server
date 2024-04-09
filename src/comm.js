const Koa = require("koa")
const Router = require("koa-router")
const {koaBody} = require("koa-body")
const KoaStatic = require("koa-static")
const Session = require("koa-session")
const path = require("path")
const controller = require('./controller')


const app = new Koa()
const router = new Router()

const staticPath = path.resolve(__dirname, "../dist")
app.use(KoaStatic(staticPath))

app.keys = ["i love hust"]

//Config a session
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

app.use(koaBody({multipart: true}))   //Must put body parser in front of router registration

app.use(controller(router)) // Automatically add middlewares in /controllers folder
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3001)