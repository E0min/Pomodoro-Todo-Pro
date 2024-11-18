import React, { useState, useEffect } from "react";
import { getTasks, addTask, deleteTask } from "../services/db";

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      const data = await getTasks();
      setTasks(data);
    };
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    await addTask({ title: newTask, isCompleted: false });
    setNewTask("");
    const data = await getTasks();
    setTasks(data);
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(id);
    const data = await getTasks();
    setTasks(data);
  };

  return (
    <div>
      <h1>Todo List</h1>
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <button onClick={handleAddTask}>Add Task</button>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title}
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
