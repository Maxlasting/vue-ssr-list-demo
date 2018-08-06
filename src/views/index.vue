<template>
  <div class="index-root">
    <v-app dark>
      <v-container>
        <h1 class="mb-5">
          SSR List Demo
          <v-btn class="cyan" @click="handleLogout">
            Logout
          </v-btn>
        </h1>
        <v-card>
          <v-btn fab absolute top right class="green" @click="handleShowAddDialog">
            <v-icon>add</v-icon>
          </v-btn>
          
          <v-data-table :headers="tableHeaders" :items="tableDatas">
            <template slot="items" slot-scope="props">
              <td class="text-xs-center">{{ props.index + 1 }}</td>
              <td class="text-xs-center">{{ props.item.name }}</td>
              <td class="text-xs-center">{{ props.item.price }}</td>
              <td class="text-xs-center">
                <v-btn fab small color="primary" @click="handleShowEditDialog(props.item)">
                  <v-icon>edit</v-icon>
                </v-btn>
                <v-btn fab small color="warning" @click="handleShowRemoveDialog(props.item)">
                  <v-icon>delete</v-icon>
                </v-btn>
              </td>
            </template>
          </v-data-table>
        </v-card>
        <v-dialog v-model="goodsDialog" max-width="500">
          <v-card>
            <v-card-title>
              <h3>{{ dialogTitle }}</h3>
            </v-card-title>
            <v-card-text>
              <v-form v-model="valid" ref="form" lazy-validation>
                <v-text-field
                  v-model="name"
                  :rules="nameRules"
                  :counter="10"
                  label="Name"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="price"
                  :rules="priceRules"
                  label="Price"
                  required
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="success" :disabled="!valid" @click="handleSure" :loading="loading">Sure</v-btn>
              <v-btn color="warning" @click="handleCancel">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="removeDialog" max-width="500">
          <v-card>
            <v-card-title>
              <h3>Are you sure remove this item?</h3>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" :disabled="!valid" @click="handleSure" :loading="loading">Sure</v-btn>
              <v-btn color="success" @click="handleCancel">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-app>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex'

  export default {
    asyncData ({ store, router }) {
      if (store.state.user) {
        return store.dispatch('handleGetGoodsList')
      }
      router.replace('/login')
      return Promise.resolve()
    },
    metaInfo: {
      title: 'User List',
      meta: [
        {
          name: 'description',
          context: 'User List'
        }
      ]
    },
    data () {
      return {
        tableHeaders: [
          {
            text: 'Index',
            align: 'center',
            sortable: false,
            value: 'Index'
          },
          {
            text: 'Name',
            align: 'center',
            sortable: false,
            value: 'Name'
          },
          {
            text: 'Price($)',
            align: 'center',
            sortable: false,
            value: 'price'
          },
          {
            text: 'Action',
            align: 'center',
            sortable: false,
            value: 'Action'
          }
        ],
        dialogTitle: '',
        goodsDialog: false,
        goodsAction: '',
        valid: true,
        name: '',
        price: '',
        nameRules: [
          v => !!v || 'Name is required',
          v => v && v.length <= 10 || 'Name must be less than 10 characters'
        ],
        priceRules: [
          v => !!v || 'Price is required',
          v => /^\d+$/.test(v) || 'Price must be valid'
        ],
        currentGoodsData: null,
        prevPrice: '',
        prevName: '',
        currentGoodsId: '',
        removeDialog: false
      }
    },
    computed: {
      ...mapState(['user', 'goodsList', 'loading', 'errRedirect']),
      tableDatas () {
        return this.goodsList
      },
      canSubmit () {
        return this.$refs.form.validate()
      }
    },
    watch: {
      goodsDialog (val) {
        !val && this.$refs.form.reset()
      },
      errRedirect (val) {
        if (val) this.$router.replace(val)
      }
    },
    methods: {
      ...mapActions(['handleAddOneGoods', 'handleUpdateOneGoods', 'handleRemoveOneGoods', 'handleUserLogout']),
      handleShowAddDialog () {
        this.dialogTitle = 'Add one goods'
        this.goodsDialog = true
        this.goodsAction = 'add'
      },
      handleShowEditDialog (item) {
        this.dialogTitle = 'Edit one goods'
        this.goodsDialog = true
        this.goodsAction = 'edit'
        this.prevPrice = this.price = item.price
        this.prevName = this.name = item.name
        this.currentGoodsId = item.goodsId
      },
      handleShowRemoveDialog (item) {
        this.removeDialog = true
        this.currentGoodsId = item.goodsId
        this.goodsAction = 'remove'
      },
      handleSure () {
        if (this.canSubmit) {
          if (this.goodsAction === 'add') {
            this.handleAddOneGoods({
              name: this.name,
              price: this.price
            })
            .then((res) => {
              this.handleCancel()
            })
            .catch((err) => {
              this.handleCancel()
              alert(err)
            })
            return
          }
          if (this.goodsAction === 'edit') {
            if (this.price === this.prevPrice && this.prevName === this.name) {
              this.handleCancel()
            } else {
              this.handleUpdateOneGoods({
                goodsId: this.currentGoodsId,
                name: this.name,
                price: this.price
              }).then((res) => {
                this.handleCancel()
              })
              .catch((err) => {
                this.handleCancel()
                alert(err)
              })
            }
            return
          }
          return
        }
        if (this.goodsAction === 'remove') {
          this.handleRemoveOneGoods(
            this.currentGoodsId
          ).then((res) => {
            this.handleCancel(true)
          }).catch((err) => {
            alert(err)
          })
        }
      },
      handleCancel () {
        if (this.goodsAction === 'remove') {
          this.removeDialog = false
        } else {
          this.goodsDialog = false
        }
        this.$refs.form.reset()
      },
      async handleLogout () {
        await this.handleUserLogout()
      }
    }
  }
</script>