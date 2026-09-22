import jsonServer from 'json-server'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'db.json')

const server = jsonServer.create()
const router = jsonServer.router(dbPath)
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

// Maps our REST-ish kebab-case API paths onto json-server's camelCase
// collection names, plus the `/pages/:slug` lookup (mirrors the collections
// listed in spec §4 / plan §"Task 13").
server.use(
  jsonServer.rewriter({
    '/homepage-content': '/homepageContent',
    '/focus-sectors': '/focusSectors',
    '/focus-sectors/:id': '/focusSectors/:id',
    '/gi-products': '/giProducts',
    '/gi-products/:id': '/giProducts/:id',
    '/pages/:slug': '/pages?slug=:slug',
  })
)

// Not a CRUD resource — a fixed login response for local development.
server.post('/auth/login', (req, res) => {
  const db = router.db
  const user = db.get('authLogin').value()
  res.status(200).json(user)
})

server.post('/newsletter/subscribe', (req, res) => {
  const db = router.db
  const email = req.body?.email
  if (!email) {
    res.status(400).json({ message: 'Email is required' })
    return
  }
  db.get('newsletterSubscribers')
    .push({ id: Date.now().toString(), email, subscribedAt: new Date().toISOString() })
    .write()
  res.status(201).json({ message: 'Subscribed' })
})

server.use(router)

const PORT = 4000
server.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`)
})
