import Alt from './'
import { createStore, bind, expose } from './utils/decorators'

const alt = new Alt()

const TodoActions = alt.generateActions('addTodo')

@createStore(alt)
class TodoStore {
  static displayName = 'TodoStore'

  constructor() {
    this.todos = {}
    this.id = 0
  }

  uid() {
    return this.id++
  }

  @bind(TodoActions.addTodo)
  addTodo(todo) {
    this.todos[this.uid()] = todo
  }

  @expose
  getTodo(id) {
    return this.getState().todos[id]
  }
}

TodoActions.addTodo('hello')

//console.log('@', TodoStore)

console.log(TodoStore.getState())
console.log(TodoStore.getTodo(0))
