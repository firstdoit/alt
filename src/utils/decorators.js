import assign from 'object-assign'

// XXX DRY
/* istanbul ignore next */
function NoopClass() { }

const builtIns = Object.getOwnPropertyNames(NoopClass)
const builtInProto = Object.getOwnPropertyNames(NoopClass.prototype)

function getInternalMethods(Obj, isProto) {
  const excluded = isProto ? builtInProto : builtIns
  const obj = isProto ? Obj.prototype : Obj
  return Object.getOwnPropertyNames(obj).reduce((value, m) => {
    if (excluded.indexOf(m) !== -1) {
      return value
    }

    value[m] = obj[m]
    return value
  }, {})
}

function addMeta(description, decoration) {
  description.value.alt = description.value.alt || {}
  assign(description.value.alt, decoration)
  return description
}

export function createActions(alt, ...args) {
  return function (Actions) {
    return alt.createActions(Actions, {}, ...args)
  }
}

export function createStore(alt, ...args) {
  return function (Store) {
    const internalMethods = getInternalMethods(Store, true)
    const publicMethods = {}
    const bindListeners = {}
    Object.keys(internalMethods).forEach((key) => {
      const meta = internalMethods[key].alt
      if (!meta) {
        return
      }
      if (meta.action) {
        bindListeners[key] = meta.action
      } else if (meta.publicMethod) {
        publicMethods[key] = internalMethods[key]
      }
    })

    Store.config = assign({
      bindListeners,
      publicMethods
    }, Store.config)

    return alt.createStore(Store, undefined, ...args)
  }
}

export function bind(...actionIds) {
  return (obj, name, description) => {
    return addMeta(description, { action: actionIds })
  }
}

export function expose(obj, name, description) {
  return addMeta(description, { publicMethod: true })
}
