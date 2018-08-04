const Koa = require('koa')
const KoaRouter = require('koa-router')
const fs = require('fs')
const { join } = require('path')
const { createBundleRenderer } = require('vue-server-renderer')
const LRU = require('lru-cache')
const favicon = require('koa-favicon')
const koaBody = require('koa-body')
const koaSession = require('koa-session')

const app = new Koa()
const router = new KoaRouter()

require('./server/database')

const isDev = process.env.NODE_ENV === 'development'
const port = process.env.PORT || 8080

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    if (e.url) {
      isDev && console.log('重定向 ==========>', e.url)
      ctx.redirect(e.url)
      return
    }
    if (e.code == 404) {
      ctx.status = 404
      ctx.body = '404 | Not Found.'
      return
    }
    ctx.status = 500
    ctx.body = isDev ? e.message : '500 Server Error.'
    isDev && console.log(e.message)
  }
})

app.keys = ['max-lasting-session']
  
const CONFIG = {
  key: 'ssr-demo',
  maxAge: 5 * 60 * 10000,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false
}

app.use(koaSession(CONFIG, app))

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 100 * 1024 * 1024
  }
}))

app.use(favicon(join(__dirname, './favicon.png')))

// 这里来写自定义接口等服务
// ---- start ----
const apiRouter = new KoaRouter({ prefix: '/api' })

const userLogin = require('./server/services/userLogin.js')

apiRouter.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body

  let user = await userLogin(username, password)
  
  if (user) {
    const { username, _id: userId } = ctx.session.user = user
    user = {
      username,
      userId,
      timestamp: Date.now()
    }
  }

  const success = !!user

  ctx.body = {
    success: success,
    msg: success ? '' : 'Wrong user name or password!',
    data: success ? user : {}
  }
})

apiRouter.get('/logout', async (ctx) => {
  ctx.session.user = null
  ctx.body = {
    success: true,
    msg: '',
    redirect: '/login'
  }
})

const auth = async (ctx, next) => {
  if (ctx.session.user) {
    await next()
  } else {
    ctx.status = 401

    ctx.body = {
      success: false,
      msg: 'Action not allowed!',
      redirect: '/login'
    }
  }
}

const addGoodsItem = require('./server/services/addGoodsItem.js')

apiRouter.post('/add/:user', auth, async (ctx) => {
  const { name, price } = ctx.request.body
  const { user } = ctx.params

  let goods = await addGoodsItem(user, name, price)

  const success = !!goods

  if (success) {
    goods = {
      name: goods.name,
      price: goods.price,
      goodsId: goods._id
    }
  }

  ctx.body = {
    success,
    msg: success ? '' : 'The goods has already added!',
    data: success ? goods : {}
  }
})

const removeGoodsItem = require('./server/services/removeGoodsItem.js')

apiRouter.del('/remove/:goodsId', auth, async (ctx) => {
  const { goodsId } = ctx.params

  const ret = await removeGoodsItem(goodsId)

  ctx.body = {
    success: ret,
    msg: ret ? '' : 'The goods is not found!'
  }
})

const updateGoodsItem = require('./server/services/updataGoodsItem.js')

apiRouter.put('/update/:goodsId', auth, async (ctx) => {
  const { goodsId } = ctx.params
  const { name, price } = ctx.request.body

  const goods = await updateGoodsItem(goodsId, name, price)

  const success = !!goods

  let data = null

  if (success) 
    data = {
      name: goods.name,
      price: goods.price,
      goodsId: goods._id
    }

  ctx.body = {
    success,
    msg: success ? '' : 'update goods failed!',
    data
  }
})


const getAllGoods = require('./server/services/getAllGoods.js')

apiRouter.get('/list/:user', auth, async (ctx) => {
  const { user } = ctx.params
  const ret = await getAllGoods(user)
  
  ctx.body = {
    success: true,
    msg: '',
    data: ret
  }
})

app.use(apiRouter.routes()).use(apiRouter.allowedMethods())

// ---- end ----

const createRenderer = (bundle, options) => createBundleRenderer(
  bundle,
  Object.assign(options, {
    cache: LRU({
      max: 1000, 
      maxAge: 1000 * 60 * 15
    }),
    runInNewContext: false
  })
)

let renderer = null
let readyPromise = null
let templatePath = join(__dirname, './index.template.html')

if (isDev) {
  const setupDevServer = require('./build/setup-dev-server.js')

  readyPromise = setupDevServer(app, templatePath, (bundle, options) => {
    renderer = createRenderer(bundle, options)
  })
} else {
  const template = fs.readFileSync(templatePath, 'utf-8')
  const bundle = require('./dist/vue-ssr-server-bundle.json')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')

  renderer = createRenderer(bundle, {
    template,
    clientManifest
  })
}

const render = async (ctx, next) => {
  const s = Date.now()

  ctx.set('Content-Type', 'text/html')

  const context = {
    url: ctx.url,
    user: null
  }

  const user = ctx.session.user || null

  if (!!user) {
    context.user = {
      username: user.username,
      userId: user._id,
      timestamp: Date.now()
    }
  }

  const html = await renderer.renderToString(context)
  
  ctx.body = html

  isDev && console.log(`渲染用时：${Date.now() - s}ms`)
}


if (!isDev) {
  const koaSend = require('koa-send')

  router.get('/dist/*', async (ctx) => {
    await koaSend(ctx, ctx.path)
  })
}

const loged = async (ctx, next) => {
  const user = ctx.session.user

  if (ctx.path === '/login' && user) {
    ctx.redirect('/')
    return
  }

  if (ctx.path === '/' && !user) {
    ctx.redirect('/login')
    return
  }

  await next()
}

router.get('*', loged, isDev ? (ctx) => readyPromise.then(() => render(ctx)) : render)

app.use(router.routes()).use(router.allowedMethods())

app.listen(port, () => {
  console.log(`Server is running at ${port}`)
})
