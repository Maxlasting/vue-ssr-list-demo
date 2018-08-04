<template lang="html">
  <v-app>
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs8 sm7 md6>
            <v-card class="elevation-12">
              <v-toolbar dark>
                <v-toolbar-title>User Login</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form v-model="valid" ref="form">
                  <v-text-field 
                    prepend-icon="person" 
                    name="login" 
                    label="UserName" 
                    type="text"
                    v-model="username" 
                    required
                    :counter="10"
                    :rules="userNameRules"
                  />
                  <v-text-field 
                    prepend-icon="lock" 
                    name="password" 
                    label="Password" 
                    type="password" 
                    v-model="password" 
                    required
                    :rules="passwordRules"
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn dark @click="handleSubmit" :loading="loading">LOGIN</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import { mapActions, mapState, mapMutations } from 'vuex'

  export default {
    data () {
      return {
        username: '',
        password: '',
        userNameRules: [
          v => !!v || 'User name is required',
          v => v.length <= 10 || 'Name must be less than 10 characters'
        ],
        passwordRules: [
          v => !!v || 'User name is required'
        ],
        valid: false
      }
    },
    computed: {
      ...mapState(['loading', 'user'])
    },
    mounted () {
      this.initErrMsg()
    },
    methods: {
      ...mapMutations(['initErrMsg']),
      ...mapActions(['handleUserLogin']),
      handleSubmit () {
        if (this.$refs.form.validate()) {
          const { username, password } = this

          this.handleUserLogin({ username, password })
            .then((res) => {
              this.$router.replace('/')
            })
            .catch((err) => {
              console.log(err)
              alert(err)
            })
        }
      }
    }
  }
</script>
