import EventEmitter from 'eventemitter3'
import assign from 'object-assign'
import Symbol from 'es-symbol'
import * as Sym from './symbols/symbols'

const {
  ALL_LISTENERS,
  HANDLING_ERRORS,
  LIFECYCLE,
  LISTENERS,
  PUBLIC_METHODS,
  STATE_CONTAINER
} = Sym

// event emitter instance
const EE = Symbol()

export default class AltStore {
  constructor(alt, model, state, StoreModel) {
    this[EE] = new EventEmitter()
    this[LIFECYCLE] = model[LIFECYCLE]
    this[STATE_CONTAINER] = state || model

    this._storeName = model._storeName
    this.boundListeners = model[ALL_LISTENERS]
    this.StoreModel = StoreModel
    if (typeof this.StoreModel === 'object') {
      this.StoreModel.state = assign({}, StoreModel.state)
    }

    assign(this, model[PUBLIC_METHODS])

    // Register dispatcher
    this.dispatchToken = alt.dispatcher.register((payload) => {
      this[LIFECYCLE].emit('beforeEach', payload, this[STATE_CONTAINER])

      if (model[LISTENERS][payload.action]) {
        let result = false

        try {
          result = model[LISTENERS][payload.action](payload.data)
        } catch (e) {
          if (model[HANDLING_ERRORS]) {
            this[LIFECYCLE].emit('error', e, payload, this[STATE_CONTAINER])
          } else {
            throw e
          }
        }

        if (result !== false) {
          this.emitChange()
        }
      }

      this[LIFECYCLE].emit('afterEach', payload, this[STATE_CONTAINER])
    })

    this[LIFECYCLE].emit('init')
  }

  getEventEmitter() {
    return this[EE]
  }

  emitChange() {
    this[EE].emit('change', this[STATE_CONTAINER])
  }

  listen(cb) {
    this[EE].on('change', cb)
    return () => this.unlisten(cb)
  }

  unlisten(cb) {
    this[LIFECYCLE].emit('unlisten')
    this[EE].removeListener('change', cb)
  }

  getState() {
    return this.StoreModel.config.getState.call(this, this[STATE_CONTAINER])
  }
}
