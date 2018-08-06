const metaMinin = {
  created () {
    const meta = this.$meta

    if (meta && this.$isServer) {
      this.$ssrContext.title = meta
      // console.log(meta().inject())
    }
  }
}

export default metaMinin