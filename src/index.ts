const nextTick = (fn) => {
  if (process !== undefined && typeof process.nextTick === 'function') {
    return process.nextTick(fn)
  } else {
    var counter = 1
    var observer = new MutationObserver(fn)
    var textNode = document.createTextNode(String(counter))

    observer.observe(textNode, {
      characterData: true,
    })

    counter = counter + 1
    textNode.data = String(counter)
  }
}

class Promise2 {
  state = 'pending' // promise状态
  private callbacks = [] // 保存所有then函数的传参
  constructor(fn) {
    if (typeof fn !== 'function') {
      throw new Error('fn 必须是一个函数')
    }
    fn(this.resolve, this.reject) // promise 的入参是一个立即执行函数
  }

  /**
   * promise重要执行函数
   */
  then = (successFn?, failFn?) => {
    const handle = [successFn, failFn]
    handle[2] = new Promise2(() => {})
    this.callbacks.push(handle)
    return handle[2]
  }

  // 失败或成功具体执行函数
  private call = (val, param) => {
    nextTick(() => {
      for (const item of this.callbacks) {
        if (typeof item[val] === 'function') {
          let x
          try {
            x = item[val].call(undefined, param) // then的回调函数的返回值必须能传给下一个then的回调入参
          } catch (e) {
            item[2].reject(e)
          }
          item[2].resolveWith(x)
        }
      }
    })
  }

  /**
   * 成功执行函数
   * @param result 成功入参
   */
  resolve = (result?) => {
    if (this.state !== 'pending') return
    this.state = 'fulfilled'
    this.call(0, result)
  }

  /**
   * 失败执行函数
   * @param reason 失败入参
   */
  reject = (reason?) => {
    if (this.state !== 'pending') return
    this.state = 'rejected'
    this.call(1, reason)
  }

  private resolveWithSelf = () => {
    this.reject(new TypeError('promise和x不能引用同一个对象'))
  }

  private resolveWithThenable = (x) => {
    try {
      x.then(
        (y) => {
          this.resolveWith(y)
        },
        (r) => {
          this.reject(r)
        }
      )
    } catch (e) {
      this.reject(e)
    }
  }

  private resolveWithPromise = (x) => {
    x.then(
      (res) => {
        this.resolve(res)
      },
      (rea) => {
        this.reject(rea)
      }
    )
  }

  private getThen = (x) => {
    let then
    try {
      then = x.then
    } catch (e) {
      this.reject(e)
    }
    return then
  }

  private resolveWithObject = (x) => {
    const then = this.getThen(x)
    if (then instanceof Function) {
      this.resolveWithThenable(x)
    } else {
      this.resolve(x)
    }
  }

  resolveWith(x) {
    if (this === x) {
      this.resolveWithSelf()
    } else if (x instanceof Promise2) {
      this.resolveWithPromise(x)
    } else if (x instanceof Object) {
      this.resolveWithObject(x)
    } else {
      this.resolve(x)
    }
  }
}

export default Promise2
