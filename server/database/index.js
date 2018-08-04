const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise

const UserSchema = new Schema({
  username: {
    unique: true,
    type: String,
    required: true
  },
  password: {
    required: true,
    type: String
  }
})

const GoodsSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  price: {
    required: true,
    type: Number
  },
  user: {
    type: String,
    required: true
  }
})

mongoose.model('user', UserSchema)
mongoose.model('goods', GoodsSchema)

const db = 'mongodb://localhost/ssr-list-demo'

mongoose.connect(db)

mongoose.connection.once('open', async () => {
  const User = mongoose.model('user')

  const initUsers = ['admin', 'test']

  for (let i=0; i<initUsers.length; i++) {
    let user = await User.findOne({ username: initUsers[i] })

    if (!user) {
      user = new User({
        username: initUsers[i],
        password: '123'
      })
      
      await user.save()
    }
  }
  
  console.log(`Connected to mongodb -> ${db}`)
})

let t = 0

mongoose.connection.on('disconnected', () => {
  if (++t > 5) {
    throw new Error('数据库错误!')
    return
  }
  setTimeout(() => {
    mongoose.connect(db)
  }, 5000)
})

mongoose.connection.on('error', (err) => {
  console.error(err)
})