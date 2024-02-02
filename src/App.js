import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import TaskDetails from "./TaskDetail";
const API_BASE_URL = "http://127.0.0.1:8081/api/tasks";

function App() {
  const [getalltasks, setAllTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selected, setSelected] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQueryType, setSelectedQueryType] = useState("all");

  const [selectedTask, setSelectedTask] = useState(null);

  const [deleteMessage, setDeleteMessage] = useState("");

  const [editDescription, setEditDescription] = useState("");
  const [editedDueDate, setEditedDueDate] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editPanel, setEditPanel] = useState(false);

  const [createMessage, setCreateMessage] = useState("");

  const [showPagination, setShowPagination] = useState(true);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const fetchTasksByPage = async (page = currentPage) => {
    try {
      const response = await axios.get(`${API_BASE_URL}?page=${page}&size=10`);
      setAllTasks(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.pageable.pageNumber);
      if(response.data.totalPages<2){
        setShowPagination(false);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
  };

  const handleSearchClick = async () => {
    if (selectedQueryType === "all") {
      setShowPagination(true);
      fetchTasksByPage();
    } else if (selectedQueryType === "title") {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/findByTitle/${searchTerm}`
        );
        setAllTasks(response.data);
        setShowPagination(false);
      } catch (error) {}
    } else if (selectedQueryType === "assignedto") {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/findByAssignedTo/${searchTerm}`
        );
        setAllTasks(response.data);
        setShowPagination(false);
      } catch (error) {}
    } else if (selectedQueryType === "assignedby") {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/findByAssignedBy/${searchTerm}`
        );
        setAllTasks(response.data);
        setShowPagination(false);
      } catch (error) {}
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchTasksByPage(newPage);
    }
  };
  const handleTaskClick = (task) => {
    //console.log('Task clicked:', task);
    setSelectedTask(task);
    setDeleteMessage("");
    setEditMessage("");
    setEditPanel(false);
    setSelected(true);
  };
  const handleEditPanel = async () => {
    if (editPanel) {
      handleEditTask();
      setEditPanel(false);
    } else {
      setEditPanel(true);
      setSelected(false);
      setEditDescription(selectedTask.description); // Prefill description in textarea
      setEditedDueDate(selectedTask.dueDate || "");
    }
  };
  const handleDeleteTask = async () => {
    if (!selectedTask) {
      return;
    }

    try {
      // Clear selected task
      setSelectedTask(null);
      setEditMessage("");
      setEditPanel(false);
      // Make API call to delete task
      await axios.delete(`${API_BASE_URL}/${selectedTask.id}`);

      // Optionally: Refresh task list or perform other actions after deletion

      fetchTasksByPage();

      setDeleteMessage(selectedTask.title + " deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      setDeleteMessage("Error deleting task.");
    }
  };

  const handleEditTask = async () => {
    if (!selectedTask || !(editDescription || editedDueDate)) {
      return;
    }

    try {
      // Fetch the updated task
      const updatedTaskResponse = await axios.get(
        `${API_BASE_URL}/${selectedTask.id}`
      );
      const updatedTask = updatedTaskResponse.data;

      // Make API call to edit task
      await axios.put(`${API_BASE_URL}/${selectedTask.id}`, {
        description: editDescription,
        title: updatedTask.title,
        dueDate: editedDueDate,
      });
      // Update the task list with the updated task
      const updatedTasks = getalltasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );
      setAllTasks(updatedTasks);

      // Display edit success message and preload the text box
      setEditMessage("Task edited successfully!");
      //setEditDescription(updatedTask.description);
      fetchTasksByPage();
    } catch (error) {
      console.error("Error editing task:", error);
      setEditMessage("Error editing task.");
    }
  };

  const handleMarkCompleted = async () => {
    if (!selectedTask || selectedTask.completed) {
      return;
    }

    try {
      // Fetch the updated task
      const updatedTaskResponse = await axios.get(
        `${API_BASE_URL}/${selectedTask.id}`
      );
      const updatedTask = updatedTaskResponse.data;

      // Make API call to mark task as completed
      await axios.put(`${API_BASE_URL}/${selectedTask.id}`, {
        completed: true,
        description: updatedTask.description,
        title: updatedTask.title,
        dueDate: updatedTask.dueDate,
      });

      // Update the task list with the updated task
      const updatedTasks = getalltasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );
      setAllTasks(updatedTasks);
      setSelected(false);
      // Update selectedTask with the completed status
      setSelectedTask(updatedTask);
      fetchTasksByPage();
      // Optionally: Perform other actions after marking as completed

      setEditMessage("Task marked as completed successfully!");
    } catch (error) {
      console.error("Error marking task as completed:", error);
      setEditMessage("Error marking task as completed.");
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    completed: false,
    assignedBy: "",
    assignedTo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(showCreatePage){

    try {
      const response = await axios.post(`${API_BASE_URL}`, formData);
      console.log("Task created successfully:", response.data);
      setShowCreatePage(false);
      setShowPagination(true);
      fetchTasksByPage();
      setCreateMessage("Task created successfully.");
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        completed: false,
        assignedBy: '',
        assignedTo: '',
      });
      // You can redirect or perform other actions after successful creation
    } catch (error) {
      console.error("Error creating task:", error);
    }}
    else{
      setShowCreatePage(true);
      setCreateMessage("");
    }
  };

  const calculateDateDifference = (dueDateString) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();

    // Calculate the difference in milliseconds
    const differenceInMs = dueDate - today;

    // Calculate the difference in days
    const differenceInDays = Math.floor(differenceInMs / (24 * 60 * 60 * 1000));

    return differenceInDays;
  };
  const getTaskStyle = (dueDateString, completed) => {
    const differenceInDays = calculateDateDifference(dueDateString);

    // Define threshold values for different styles
    const criticalThreshold = 0; // Example: Highlight if the task is due today or overdue
    const warningThreshold = 7; // Example: Highlight if the task is due within the next 7 days

    if (completed) {
      return { backgroundColor: 'lightgreen' };
    }
    else{
    if (differenceInDays <= criticalThreshold) {
      return { backgroundColor: 'red' }; // Apply a style for critical due dates
    } else if (differenceInDays <= warningThreshold) {
      return { backgroundColor: 'yellow' }; // Apply a style for approaching due dates
    }
  }

    return {}; // Default style if no special conditions are met
  };


  useEffect(() => {
    fetchTasksByPage(currentPage);
  }, [currentPage]); // Trigger a fetch when the currentPage changes

  return (
    <div className="App">
      <div className="Title">
        <p>Tasks Tracker</p>
      </div>
      <div className="TaskTracker">
        <div className="Sidediv">
          <div class="search-container">
            <input
              type="text"
              class="search-box"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div class="search-symbol" onClick={handleSearchClick}>
              &#128269;
            </div>
            <select
              class="query-type"
              value={selectedQueryType}
              onChange={(e) => setSelectedQueryType(e.target.value)}
            >
              <option value="assignedby">assigned By</option>
              <option value="assignedto">assigned To</option>
              <option value="title">Title</option>
              <option value="all">No Filter</option>
            </select>
          </div>
          {showCreatePage && (
            <div className="create">
              <form onSubmit={handleSubmit} class ="form">
                <p className="class-label" >
                  Title:</p>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="class-input"
                  />
                
                <br />
                <p>
                  Description:</p>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                
                <br />
                <p>
                  Due Date:</p>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                
                <br />
                <p>
                  Assigned By:</p>
                  <input
                    type="text"
                    name="assignedBy"
                    value={formData.assignedBy}
                    onChange={handleChange}
                  />
                
                <br />
                <p>
                  Assigned To:</p>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                  />
                
                <br />
                <button type="submit">Create Task</button>
              </form>
            </div>
          )}
          {(createMessage)&&<p>{createMessage}</p>}
          {(!showCreatePage)&&<button onClick={handleSubmit}>Create Task</button>}
          
          
        </div>
        <div className="TaskContainer">
          {getalltasks.map((task, index) => (
            <div
              key={index}
              className="TaskBox"
              // className={`TaskBox ${task.completed ? 'CompletedTask' : ''}`}
              style={getTaskStyle(task.dueDate, task.completed)}
              onClick={() => handleTaskClick(task)}
            >
              
              <h3>{task.title}</h3>
              <p className="TruncatedDescription">{task.description}</p>
            </div>
          ))}
        </div>

        <div className="Sidediv">
          {selected && selectedTask && (
            <div className="SelectedTaskDetails">
              <h2>Task Details</h2>
              <TaskDetails task={selectedTask} />

              <button onClick={handleDeleteTask}>Delete Task</button>
              {!editPanel && (
                <button onClick={handleEditPanel}>Edit Task</button>
              )}
            </div>
          )}

          {selected && selectedTask && (
            <div className="SelectedTaskDetails">
              <button
                onClick={handleMarkCompleted}
                disabled={selectedTask.completed}
              >
                Mark Completed
              </button>
              {/* ... (other JSX) */}
            </div>
          )}
          {deleteMessage && (
            <div className="DeleteMessage">
              <p>{deleteMessage}</p>
            </div>
          )}
          {editMessage && <p>{editMessage}</p>}
          {editPanel && !selected && (
            <div className="SelectedTaskDetails">
              <h2>Task Details</h2>

              <h3>{selectedTask.title}</h3>
              <p>Description: </p>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Edit description..."
                style={{ height: "150px", width: "250px" }}
              />
              <p>Assigned By: {selectedTask.assignedBy}</p>
              <p>Assigned To: {selectedTask.assignedTo}</p>
              <p>Edit Due Date : </p>

              <input
                type="text"
                value={editedDueDate}
                onChange={(e) => setEditedDueDate(e.target.value)}
                placeholder="Edit due date..."
              />
              <p>
                Status: {selectedTask.completed ? "Completed" : "Incomplete"}
              </p>

              <p></p>
              <button onClick={handleEditPanel}>Edit Task</button>

              <p>
                You can't edit title, assigned by or assigned to change it you
                have to delete and recreate it.
              </p>
            </div>
          )}
        </div>
      </div>
      {showPagination && (
        <div className="Pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <span>{`Page ${currentPage + 1} of ${totalPages}`}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
