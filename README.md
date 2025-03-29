### Project Management Social Platform

A full-stack web application for project and task management with social features. This platform allows users to create projects, manage tasks, collaborate with team members, and track progress in a user-friendly interface.





## Features

### User Management

- User registration and authentication
- JWT-based authentication
- Profile management
- Avatar customization


### Project Management

- Create and manage projects
- Add team members to projects
- Project overview with statistics
- Filter and sort projects


### Task Management

- Create tasks within projects
- Assign tasks to team members
- Kanban-style task board (To Do, In Progress, Completed)
- Task details with description, due dates, and status
- Comment system for task discussions


### Dashboard

- Overview of projects and tasks
- Statistics and activity tracking
- Quick access to recent projects


## Technologies Used

### Frontend

- HTML5, CSS3, JavaScript (ES6+)
- Responsive design with custom CSS
- Font Awesome for icons


### Backend

- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt.js for password hashing


## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation


### Setup

1. Clone the repository


```shellscript
git clone https://github.com/yourusername/project-management-social-platform.git
cd project-management-social-platform
```

2. Install dependencies


```shellscript
npm install
```

3. Create a `.env` file in the root directory with the following variables:


```plaintext
PORT=3000
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
```

4. Start the server


```shellscript
node server.js
```

5. Access the application at `http://localhost:3000`


## Usage Guide

### Registration and Login

1. Open the application in your browser
2. Click on the "Register" tab
3. Fill in your username, email, and password
4. Click "Register" to create your account
5. Use your email and password to log in


### Creating a Project

1. Navigate to the "Projects" page from the sidebar
2. Click "Create Project" button
3. Fill in the project title and description
4. Click "Create Project" to save


### Managing Tasks

1. Open a project by clicking on its card
2. Click "Add Task" to create a new task
3. Fill in task details and assign to a team member if needed
4. Drag tasks between columns to update their status
5. Click on a task to view details, add comments, or update its status


### Profile Management

1. Click on your username in the top-right corner
2. Select "Profile" from the sidebar
3. Update your profile information, change password, or update avatar


## Project Structure

```plaintext
project-management-social-platform/
├── server.js                 # Main server file
├── .env                      # Environment variables
├── public/                   # Frontend files
│   ├── index.html            # Main HTML file
│   ├── css/
│   │   └── styles.css        # CSS styles
│   ├── js/
│   │   ├── api.js            # API service
│   │   ├── auth.js           # Authentication service
│   │   ├── ui.js             # UI rendering service
│   │   └── app.js            # Main application entry point
│   └── images/
│       └── default-avatar.png # Default user avatar
```

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get JWT token


### Projects

- `GET /api/projects` - Get all projects for the authenticated user
- `GET /api/projects/:id` - Get a specific project by ID
- `POST /api/projects` - Create a new project
- `PATCH /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/projects/:projectId/members` - Add a member to a project
- `DELETE /api/projects/:projectId/members/:userId` - Remove a member from a project


### Tasks

- `GET /api/projects/:projectId/tasks` - Get all tasks for a project
- `GET /api/tasks/:id` - Get a specific task by ID
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task


### Comments

- `GET /api/tasks/:taskId/comments` - Get all comments for a task
- `POST /api/comments` - Create a new comment


## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Input validation
- CORS protection


## Future Enhancements

- Real-time updates with WebSockets
- File attachments for tasks
- Advanced reporting and analytics
- Email notifications
- Calendar integration
- Mobile application


## Development

### Running in Development Mode

```shellscript
npm install nodemon -g
nodemon server.js
```

### Database Schema

#### User

- username (String, required, unique)
- email (String, required, unique)
- password (String, required, hashed)
- profilePic (String, default path)
- createdAt (Date, default: now)


#### Project

- title (String, required)
- description (String)
- owner (ObjectId, ref: User)
- members (Array of ObjectId, ref: User)
- createdAt (Date, default: now)


#### Task

- title (String, required)
- description (String)
- project (ObjectId, ref: Project)
- assignedTo (ObjectId, ref: User)
- status (String, enum: ['todo', 'inprogress', 'completed'])
- dueDate (Date)
- createdAt (Date, default: now)


#### Comment

- content (String, required)
- task (ObjectId, ref: Task)
- user (ObjectId, ref: User)
- createdAt (Date, default: now)


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Font Awesome](https://fontawesome.com/) for icons
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [Express.js](https://expressjs.com/) for the backend framework


---

© 2023 Project Management Social Platform. All rights reserved.