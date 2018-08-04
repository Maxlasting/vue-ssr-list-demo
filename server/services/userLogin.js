const mongoose = require('mongoose')
const User = mongoose.model('user')

const userLogin = async (username, password) => {
  const user = await User.findOne({ username, password })

  if (user) return user
  
  return null
}

module.exports = userLogin