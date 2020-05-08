import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import Promise2 from '../src/index'
chai.use(sinonChai)

const assert = chai.assert

describe('chai 的使用', () => {
  it('Promise 是一个类', () => {
    assert.isFunction(Promise2)
    assert.isObject(Promise2.prototype)
  })
  it('new Promise() 参数为函数', () => {
    assert.throw(() => {
      // @ts-ignore
      new Promise2()
      new Promise2(1)
    })
  })
  it('new Promise() 参数是立即执行函数', () => {
    const fn = sinon.fake()
    const promise = new Promise2(fn)
    assert(fn.called)
  })
  it('new Promise() 回调参数函数需要接受两个参数，并且这两个参数都为函数', (done) => {
    const promise = new Promise2((resolve, reject) => {
      assert.isFunction(resolve)
      assert.isFunction(reject)
      done()
    })
  })
  it('Promise生成的实例有then方法', () => {
    const promise = new Promise2(() => {})
    assert.isFunction(promise.then)
  })
  it('当执行到resolve函数时执行then的第一个函数', (done) => {
    const success = sinon.fake()
    const promise = new Promise2((resolve, reject) => {
      assert(!success.called)
      resolve()
      setTimeout(() => {
        assert(success.called)
        done()
      })
    })
    promise.then(success, () => {})
  })
  it('当执行到reject函数时执行then的第二个函数', (done) => {
    const fail = sinon.fake()
    const promise = new Promise2((resolve, reject) => {
      assert(!fail.called)
      reject()
      setTimeout(() => {
        assert(fail.called)
        done()
      })
    })
    promise.then(() => {}, fail)
  })
  it('2.2.1 这两个onFulfilled和onRejected可选的参数', () => {
    const promise = new Promise2((resolve) => {
      resolve()
    })
    promise.then(false)
    assert(true)
  })
  it('2.2.2', (done) => {
    const fn = sinon.fake()
    const promise = new Promise2((resolve) => {
      assert.isFalse(fn.called)
      resolve(1)
      resolve(122)
      setTimeout(() => {
        assert(promise.state === 'fulfilled')
        assert(fn.calledOnce)
        assert(fn.calledWith(1))
        done()
      }, 0)
    })
    promise.then(fn)
  })
  it('2.2.3', (done) => {
    const fn = sinon.fake()
    const promise = new Promise2((resolve, reject) => {
      assert.isFalse(fn.called)
      reject(1)
      reject(122)
      setTimeout(() => {
        assert(promise.state === 'rejected')
        assert(fn.calledOnce)
        assert(fn.calledWith(1))
        done()
      }, 0)
    })
    promise.then(null, fn)
  })
  it('2.2.4 成功调用', (done) => {
    const fn = sinon.fake()
    const promise = new Promise2((resolve) => {
      resolve()
    })
    promise.then(fn)
    assert.isFalse(fn.called)
    setTimeout(() => {
      assert(fn.called)
      done()
    }, 0)
  })
  it('2.2.4 失败调用', (done) => {
    const fn = sinon.fake()
    const promise = new Promise2((resolve, reject) => {
      reject()
    })
    promise.then(null, fn)
    assert.isFalse(fn.called)
    setTimeout(() => {
      assert(fn.called)
      done()
    }, 0)
  })
  it('2.2.5', (done) => {
    const promise = new Promise2((resolve) => {
      resolve()
    })
    promise.then(function () {
      'use strict'
      assert(this === undefined)
      done()
    })
  })
  it('2.2.6', (done) => {
    const callbacks = [sinon.fake(), sinon.fake(), sinon.fake()]
    const promise = new Promise2((resolve) => {
      resolve()
    })
    promise.then(callbacks[0])
    promise.then(callbacks[1])
    promise.then(callbacks[2])
    setTimeout(() => {
      assert(callbacks[0].called)
      assert(callbacks[1].called)
      assert(callbacks[2].called)
      assert(callbacks[1].calledAfter(callbacks[0]))
      assert(callbacks[2].calledAfter(callbacks[1]))
      done()
    }, 0)
  })
  it('2.2.7', () => {
    const promise = new Promise2((resolve) => {
      resolve()
    }).then()
    assert(promise instanceof Promise2)
  })
  it('2.2.7.1 是一个基本类型值', (done) => {
    const promise = new Promise2((resolve) => {
      resolve()
    })
    promise
      .then(() => '成功')
      .then((res) => {
        assert.equal(res, '成功')
        done()
      })
  })
  it('2.2.7.1.2 then的success 是一个Promise', (done) => {
    const promise = new Promise2((resolve) => {
      resolve()
    })
    const fn = sinon.fake()
    promise.then(() => new Promise2((resolve) => resolve())).then(fn)
    setTimeout(() => {
      assert(fn.called)
      done()
    })
  })
  it('2.2.7.1.3 then的success 是一个Promise, 且失败', (done) => {
    const promise = new Promise2((resolve) => {
      resolve()
    })
    const fn = sinon.fake()
    promise
      .then(() => new Promise2((resolve, reject) => reject()))
      .then(null, fn)
    setTimeout(() => {
      assert(fn.called)
      done()
    })
  })
  it('2.2.7.1.4 then的fail 是一个Promise', (done) => {
    const promise = new Promise2((resolve, reject) => {
      reject()
    })
    const fn = sinon.fake()
    promise.then(null, () => new Promise2((resolve) => resolve())).then(fn)
    setTimeout(() => {
      assert(fn.called)
      done()
    })
  })
  it('2.2.7.1.5 then的fail 是一个Promise, 且失败', (done) => {
    const promise = new Promise2((resolve, reject) => {
      reject()
    })
    const fn = sinon.fake()
    promise
      .then(null, () => new Promise2((resolve, reject) => reject()))
      .then(null, fn)
    setTimeout(() => {
      assert(fn.called)
      done()
    })
  })
  it('2.2.7.2 success抛出异常时reject', (done) => {
    const promise = new Promise2((resolve) => {
      resolve()
    })
    const error = new Error()
    const fn = sinon.fake()
    promise
      .then(() => {
        throw error
      })
      .then(null, fn)
    setTimeout(() => {
      assert(fn.called)
      assert(fn.calledWith(error))
      done()
    })
  })
  it('2.2.7.2.2 fail抛出异常时reject', (done) => {
    const promise = new Promise2((resolve, reject) => {
      reject()
    })
    const error = new Error()
    const fn = sinon.fake()
    promise
      .then(null, () => {
        throw error
      })
      .then(null, fn)
    setTimeout(() => {
      assert(fn.called)
      assert(fn.calledWith(error))
      done()
    })
  })
})
