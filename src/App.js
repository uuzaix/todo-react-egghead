import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { TodoForm, TodoList, Footer } from './components/todo/';
import { addTodo, generateId, findById, toggleTodo, updateTodo, removeTodo, filterTodo } from './lib/todoHelpers';
import { pipe, partial } from './lib/utils';
import { loadTodos, createTodo, saveTodo, deleteTodo } from './lib/todoService';

class App extends Component {
  state = {
    todos: [],
    currentTodo: ''
  }

  static contextTypes = {
    route: React.PropTypes.string
  }

  componentDidMount() {
    loadTodos()
      .then(todos => this.setState({ todos }))
  }

  handleRemove = (id, evt) => {
    evt.preventDefault();
    const updatedTodos = removeTodo(this.state.todos, id);
    this.setState({ todos: updatedTodos })
    deleteTodo(id)
      .then(() => this.showTempmessage('Todo deleted'))
  }

  handleToggle = (id) => {
    const getToggledTodo = pipe(findById, toggleTodo);
    const updated = getToggledTodo(id, this.state.todos);
    const getUpdatedTodos = partial(updateTodo, this.state.todos);
    const updatedTodos = getUpdatedTodos(updated);
    this.setState({ todos: updatedTodos });
    saveTodo(updated)
      .then(() => this.showTempmessage('Todo updated'))
  }

  handleInputChange = (evt) => {
    this.setState({
      currentTodo: evt.target.value
    })
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
    const newId = generateId();
    const newTodo = { id: newId, name: this.state.currentTodo, isComplete: false };
    const updatedTodos = addTodo(this.state.todos, newTodo);
    this.setState({
      todos: updatedTodos,
      currentTodo: '',
      errorMessage: ''
    });
    createTodo(newTodo)
      .then(() => this.showTempmessage('todo added'))
  }

  showTempmessage(msg) {
    this.setState({ message: msg })
    setTimeout(() => this.setState({ message: '' }), 2500)
  }

  handleEmpytSubmit = (evt) => {
    evt.preventDefault();
    this.setState({
      errorMessage: 'Please supply a todo name'
    })
  }

  render() {
    const submitHandler = this.state.currentTodo ? this.handleSubmit : this.handleEmpytSubmit;
    const displayTodos = filterTodo(this.state.todos, this.context.route);
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>ToDo</h2>
        </div>
        <div className='Todo-App'>
          {this.state.errorMessage && <span className='error'>{this.state.errorMessage}</span>}
          {this.state.message && <span className='success'>{this.state.message}</span>}
          <TodoForm
            handleInputChange={this.handleInputChange}
            handleSubmit={submitHandler}
            currentTodo={this.state.currentTodo} />
          <TodoList handleToggle={this.handleToggle}
            handleRemove={this.handleRemove}
            todos={displayTodos} />
          <Footer />
        </div>
      </div>
    );
  }
}

export default App;
