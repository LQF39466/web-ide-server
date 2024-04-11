const Koa = require("koa")
const Router = require("koa-router")
const {koaBody} = require("koa-body")
const KoaStatic = require("koa-static")
const {historyApiFallback} = require("koa2-connect-history-api-fallback")
const path = require("path")
const controller = require('./controller')


const app = new Koa()
const router = new Router()

app.use(historyApiFallback({whiteList: ['/api']}));   //Support browser router
const staticPath = path.resolve(__dirname, "../dist")
app.use(KoaStatic(staticPath))

app.keys = ["i love hust"]

app.use(koaBody({multipart: true}))   //Must put body parser in front of router registration

app.use(controller(router)) // Automatically add middlewares in /controllers folder
app.use(router.routes()).use(router.allowedMethods())
app.listen(3001)