import Vue from 'vue'
import Vuex from 'vuex'
import model from '../model'

Vue.use(Vuex)

export const createStore = () => new Vuex.Store({
  state: {
    user: null,
    loading: false,
    goodsList: [],
    errMsg: '',
    errRedirect: ''
  },
  mutations: {
    loadingStart (state) {
      state.loading = true
    },
    loadingEnd (state) {
      state.loading = false
    },
    setUserInfo (state, payload) {
      state.user = payload
    },
    getGoodsList (state, payload) {
      state.goodsList = payload
    },
    addGoodsItem (state, payload) {
      state.goodsList.unshift(payload)
    },
    setErrorMsg (state, payload) {
      state.errMsg = payload.msg
      
      if (payload.redirect) {
        state.errRedirect = payload.redirect
      }
    },
    initErrMsg (state) {
      state.errMsg = ''
      state.errRedirect = ''
    },
    setOneGoodsData (state, payload) {
      const { goodsId, name, price } = payload
      
      for (let i=0; i<state.goodsList.length; i++) {
        const target = state.goodsList[i]
        if (target.goodsId === goodsId) {
          target.name = name
          target.price = price
          break;
        }
      }
    },
    removeOneGoodsData (state, goodsId) {
      state.goodsList = state.goodsList.filter((item) => item.goodsId !== goodsId)
    }
  },
  actions: {
    handleUserLogin ({ commit }, { username, password }) {
      commit('loadingStart')
      return new Promise(async (resolve, reject) => {
        try {
          const res = await model.userLogin(username, password)
          if (res.success) {
            commit('setUserInfo', res.data)
            resolve(true)
          } else {
            reject(res.msg)
          }
          commit('setErrorMsg', res)
        } catch (error) {
          console.log(error)
          reject(error)
        }
        commit('loadingEnd')
      })
    },
    handleUserLogout ({ commit }) {
      commit('loadingStart')
      return new Promise(async (resolve, reject) => {
        try {
          const res = await model.userLogout()
          if (res.success) {
            commit('setUserInfo', null)
            resolve(true)
          } else {
            reject(res.msg)
          }
          commit('setErrorMsg', res)
        } catch (error) {
          console.log(error)
          reject(error)
        }
        commit('loadingEnd')
      })
    },
    handleGetGoodsList ({ commit, state }) {
      commit('loadingStart')
      return new Promise(async (resolve, reject) => {
        try {
          const res = await model.getGoodsList(state.user.username)
          if (res.success) {
            commit('getGoodsList', res.data)
            resolve(true)
          } else {
            reject(res.msg)
          }
          commit('setErrorMsg', res)
        } catch (error) {
          console.log(error)
          reject(error)
        }
        commit('loadingEnd')
      })
    },
    handleAddOneGoods ({ commit, state }, { name, price }) {
      commit('loadingStart')
      return new Promise(async (resolve, reject) => {
        try {
          const res = await model.addOneGoods(state.user.username, name, price)
          if (res.success) {
            commit('addGoodsItem', res.data)
            resolve(true)
          } else {
            reject(res.msg)
          }
          commit('setErrorMsg', res)
        } catch (error) {
          console.log(error)
          reject(error)
        }
        commit('loadingEnd')
      })
    },
    handleUpdateOneGoods ({ commit }, { goodsId, name, price }) {
      commit('loadingStart')
      return new Promise(async (resolve, reject) => {
        try {
          const res = await model.updateOneGoods(goodsId, name, price)
          if (res.success) {
            commit('setOneGoodsData', { goodsId, name, price })
            resolve(true)
          } else {
            reject(res.msg)
          }
          commit('setErrorMsg', res)
        } catch (error) {
          console.log(error)
          reject(error)
        }
        commit('loadingEnd')
      })
    },
    handleRemoveOneGoods ({ commit }, goodsId) {
      commit('loadingStart')
      return new Promise(async (resolve, reject) => {
        try {
          const res = await model.removeOneGoods(goodsId)
          if (res.success) {
            commit('removeOneGoodsData', goodsId)
            resolve(true)
          } else {
            reject(res.msg)
          }
          commit('setErrorMsg', res)
        } catch (error) {
          console.log(error)
          reject(error)
        }
        commit('loadingEnd')
      })
    }
  }
})