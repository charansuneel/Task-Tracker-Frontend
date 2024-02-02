// TaskDetails.js
import React from 'react';

const TaskDetails = ({ task }) => {
    
  return (
    <div>
      <h3>{task.title}</h3>
      <p>Description: {task.description}</p>
      <p>Assigned By: {task.assignedBy}</p>
      <p>Assigned To: {task.assignedTo}</p>
      <p>Due Date : {task.dueDate.split("T")[0]}</p>
      <p>Status: {task.completed ? "Completed" : "Incomplete"}</p>

      
      {/* Add more details as needed */}
    </div>
  );
};

export default TaskDetails;
