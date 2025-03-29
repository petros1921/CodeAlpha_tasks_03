// UI Service for handling DOM manipulation and rendering

class UIService {
    constructor() {
        this.app = document.getElementById('app');
        this.loading = document.getElementById('loading');
        
        // Templates
        this.templates = {
            login: document.getElementById('login-template'),
            dashboard: document.getElementById('dashboard-template'),
            dashboardHome: document.getElementById('dashboard-home-template'),
            projects: document.getElementById('projects-template'),
            projectDetail: document.getElementById('project-detail-template'),
            taskDetail: document.getElementById('task-detail-template'),
            createProject: document.getElementById('create-project-template'),
            createTask: document.getElementById('create-task-template')
        };
        
        // Current view state
        this.currentView = null;
        this.currentProject = null;
        this.currentTask = null;
    }
    
    // Show/hide loading spinner
    showLoading() {
        this.loading.classList.remove('hidden');
    }
    
    hideLoading() {
        this.loading.classList.add('hidden');
    }
    
    // Clear the app container
    clearApp() {
        this.app.innerHTML = '';
    }
    
    // Render a template
    renderTemplate(template, container = this.app) {
        const clone = document.importNode(template.content, true);
        container.appendChild(clone);
    }
    
    // Show error message
    showError(message, container) {
        if (container) {
            container.textContent = message;
            container.classList.remove('hidden');
        } else {
            alert(message);
        }
    }
    
    // Render login/register view
    renderAuth() {
        this.clearApp();
        this.renderTemplate(this.templates.login);
        
        // Setup tab switching
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding content
                tabContents.forEach(content => {
                    content.classList.add('hidden');
                    if (content.id === `${tabId}-form`) {
                        content.classList.remove('hidden');
                    }
                });
            });
        });
        
        // Setup login form
        const loginForm = document.getElementById('login-form');
        const loginBtn = document.getElementById('login-btn');
        const loginError = document.getElementById('login-error');
        
        loginBtn.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                this.showError('Please enter both email and password', loginError);
                return;
            }
            
            try {
                this.showLoading();
                await Auth.login(email, password);
                this.renderDashboard();
            } catch (error) {
                this.showError(error.message, loginError);
            } finally {
                this.hideLoading();
            }
        });
        
        // Setup register form
        const registerForm = document.getElementById('register-form');
        const registerBtn = document.getElementById('register-btn');
        const registerError = document.getElementById('register-error');
        
        registerBtn.addEventListener('click', async () => {
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (!username || !email || !password) {
                this.showError('Please fill in all fields', registerError);
                return;
            }
            
            if (password !== confirmPassword) {
                this.showError('Passwords do not match', registerError);
                return;
            }
            
            try {
                this.showLoading();
                await Auth.register(username, email, password);
                this.renderDashboard();
            } catch (error) {
                this.showError(error.message, registerError);
            } finally {
                this.hideLoading();
            }
        });
    }
    
    // Render dashboard layout
    renderDashboard() {
        this.clearApp();
        this.renderTemplate(this.templates.dashboard);
        
        // Set user info
        const user = Auth.getUser();
        document.getElementById('username').textContent = user.username;
        document.getElementById('user-avatar').src = user.profilePic;
        
        // Setup logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            Auth.logout();
            this.renderAuth();
        });
        
        // Setup navigation
        const navLinks = document.querySelectorAll('.sidebar nav ul li a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active link
                navLinks.forEach(l => l.parentElement.classList.remove('active'));
                link.parentElement.classList.add('active');
                
                // Render corresponding page
                const page = link.getAttribute('data-page');
                this.renderPage(page);
            });
        });
        
        // Render dashboard home by default
        this.renderPage('dashboard');
    }
    
    // Render specific page in the dashboard
    renderPage(page) {
        const pageContent = document.getElementById('page-content');
        pageContent.innerHTML = '';
        
        switch (page) {
            case 'dashboard':
                this.renderDashboardHome(pageContent);
                break;
            case 'projects':
                this.renderProjects(pageContent);
                break;
            case 'tasks':
                this.renderMyTasks(pageContent);
                break;
            case 'profile':
                this.renderProfile(pageContent);
                break;
            default:
                this.renderDashboardHome(pageContent);
        }
    }
    
    // Render dashboard home page
    async renderDashboardHome(container) {
        this.renderTemplate(this.templates.dashboardHome, container);
        
        try {
            this.showLoading();
            
            // Set welcome message
            const user = Auth.getUser();
            document.getElementById('welcome-username').textContent = user.username;
            
            // Fetch projects
            const projects = await ProjectsAPI.getProjects(Auth.getToken());
            
            // Update stats
            document.getElementById('projects-count').textContent = projects.length;
            
            // Fetch tasks for stats
            let totalTasks = 0;
            let completedTasks = 0;
            let pendingTasks = 0;
            
            for (const project of projects.slice(0, 5)) { // Limit to first 5 projects for performance
                const tasks = await TasksAPI.getProjectTasks(project._id, Auth.getToken());
                totalTasks += tasks.length;
                completedTasks += tasks.filter(task => task.status === 'completed').length;
                pendingTasks += tasks.filter(task => task.status !== 'completed').length;
            }
            
            document.getElementById('tasks-count').textContent = totalTasks;
            document.getElementById('completed-count').textContent = completedTasks;
            document.getElementById('pending-count').textContent = pendingTasks;
            
            // Render quick access projects
            const quickProjectsContainer = document.getElementById('quick-projects');
            
            if (projects.length > 0) {
                quickProjectsContainer.innerHTML = '';
                
                projects.slice(0, 6).forEach(project => {
                    const projectCard = this.createProjectCard(project);
                    quickProjectsContainer.appendChild(projectCard);
                });
            }
            
            // Setup new project button
            document.getElementById('new-project-btn').addEventListener('click', () => {
                this.showCreateProjectModal();
            });
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    // Create a project card element
    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="project-card-header">
                <h3 class="project-card-title">${project.title}</h3>
                <div class="project-card-owner">
                    <img src="${project.owner.profilePic}" alt="${project.owner.username}">
                    <span>${project.owner.username}</span>
                </div>
            </div>
            <div class="project-card-body">
                <p class="project-card-description">${project.description || 'No description'}</p>
                <div class="project-card-stats">
                    <div class="project-card-stat">
                        <i class="fas fa-users"></i>
                        <span>${project.members.length + 1} members</span>
                    </div>
                    <div class="project-card-stat">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.renderProjectDetail(project._id);
        });
        
        return card;
    }
    
    // Render projects page
    async renderProjects(container) {
        this.renderTemplate(this.templates.projects, container);
        
        try {
            this.showLoading();
            
            // Fetch projects
            const projects = await ProjectsAPI.getProjects(Auth.getToken());
            
            // Render projects
            const projectsGrid = document.getElementById('projects-grid');
            
            if (projects.length > 0) {
                projectsGrid.innerHTML = '';
                
                projects.forEach(project => {
                    const projectCard = this.createProjectCard(project);
                    projectsGrid.appendChild(projectCard);
                });
            }
            
            // Setup create project button
            document.getElementById('create-project-btn').addEventListener('click', () => {
                this.showCreateProjectModal();
            });
            
            // Setup filters
            const filterSelect = document.getElementById('project-filter');
            const sortSelect = document.getElementById('project-sort');
            
            const filterProjects = () => {
                const filterValue = filterSelect.value;
                const sortValue = sortSelect.value;
                
                let filteredProjects = [...projects];
                
                // Apply filter
                if (filterValue === 'owned') {
                    filteredProjects = filteredProjects.filter(project => 
                        project.owner._id === Auth.getUser().id
                    );
                } else if (filterValue === 'member') {
                    filteredProjects = filteredProjects.filter(project => 
                        project.owner._id !== Auth.getUser().id
                    );
                }
                
                // Apply sort
                if (sortValue === 'newest') {
                    filteredProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                } else if (sortValue === 'oldest') {
                    filteredProjects.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                } else if (sortValue === 'name') {
                    filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
                }
                
                // Render filtered projects
                projectsGrid.innerHTML = '';
                
                if (filteredProjects.length > 0) {
                    filteredProjects.forEach(project => {
                        const projectCard = this.createProjectCard(project);
                        projectsGrid.appendChild(projectCard);
                    });
                } else {
                    projectsGrid.innerHTML = '<div class="empty-state">No projects found</div>';
                }
            };
            
            filterSelect.addEventListener('change', filterProjects);
            sortSelect.addEventListener('change', filterProjects);
            
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    // Render project detail page
    async renderProjectDetail(projectId) {
        const pageContent = document.getElementById('page-content');
        pageContent.innerHTML = '';
        
        this.renderTemplate(this.templates.projectDetail, pageContent);
        
        try {
            this.showLoading();
            
            // Fetch project details
            const project = await ProjectsAPI.getProject(projectId, Auth.getToken());
            this.currentProject = project;
            
            // Set project info
            document.getElementById('project-title').textContent = project.title;
            document.getElementById('project-owner').textContent = `Owner: ${project.owner.username}`;
            document.getElementById('project-description').textContent = project.description || 'No description';
            
            // Render members
            const membersList = document.getElementById('members-list');
            membersList.innerHTML = '';
            
            // Add owner
            const ownerItem = document.createElement('div');
            ownerItem.className = 'member-item';
            ownerItem.innerHTML = `
                <img src="${project.owner.profilePic}" alt="${project.owner.username}">
                <span>${project.owner.username} (Owner)</span>
            `;
            membersList.appendChild(ownerItem);
            
            // Add members
            project.members.forEach(member => {
                const memberItem = document.createElement('div');
                memberItem.className = 'member-item';
                memberItem.innerHTML = `
                    <img src="${member.profilePic}" alt="${member.username}">
                    <span>${member.username}</span>
                `;
                membersList.appendChild(memberItem);
            });
            
            // Fetch tasks
            const tasks = await TasksAPI.getProjectTasks(projectId, Auth.getToken());
            
            // Render tasks by status
            const todoTasks = document.getElementById('todo-tasks');
            const inprogressTasks = document.getElementById('inprogress-tasks');
            const completedTasks = document.getElementById('completed-tasks');
            
            todoTasks.innerHTML = '';
            inprogressTasks.innerHTML = '';
            completedTasks.innerHTML = '';
            
            tasks.forEach(task => {
                const taskItem = this.createTaskItem(task);
                
                if (task.status === 'todo') {
                    todoTasks.appendChild(taskItem);
                } else if (task.status === 'inprogress') {
                    inprogressTasks.appendChild(taskItem);
                } else if (task.status === 'completed') {
                    completedTasks.appendChild(taskItem);
                }
            });
            
            // Setup back button
            document.getElementById('back-to-projects').addEventListener('click', (e) => {
                e.preventDefault();
                this.renderPage('projects');
            });
            
            // Setup add task button
            document.getElementById('add-task-btn').addEventListener('click', () => {
                this.showCreateTaskModal(projectId);
            });
            
            // Setup edit project button
            document.getElementById('edit-project-btn').addEventListener('click', () => {
                // TODO: Implement edit project functionality
                alert('Edit project functionality will be implemented soon');
            });
            
            // Setup invite member button
            document.getElementById('invite-member-btn').addEventListener('click', () => {
                // TODO: Implement invite member functionality
                alert('Invite member functionality will be implemented soon');
            });
            
        } catch (error) {
            console.error('Error loading project details:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    // Create a task item element
    createTaskItem(task) {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <h4 class="task-item-title">${task.title}</h4>
            <div class="task-item-meta">
                <div class="task-item-assignee">
                    ${task.assignedTo ? `
                        <img src="${task.assignedTo.profilePic}" alt="${task.assignedTo.username}">
                        <span>${task.assignedTo.username}</span>
                    ` : '<span>Unassigned</span>'}
                </div>
                ${task.dueDate ? `
                    <div class="task-item-due">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        taskItem.addEventListener('click', () => {
            this.showTaskDetailModal(task);
        });
        
        return taskItem;
    }
    
    // Show task detail modal
    async showTaskDetailModal(task) {
        this.currentTask = task;
        
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'task-detail-modal';
        document.body.appendChild(modalContainer);
        
        // Render modal content
        this.renderTemplate(this.templates.taskDetail, modalContainer);
        
        // Set task info
        document.getElementById('task-title').textContent = task.title;
        document.getElementById('task-description').textContent = task.description || 'No description';
        
        const statusSelect = document.getElementById('task-status');
        statusSelect.value = task.status;
        
        const dueDateInput = document.getElementById('task-due-date');
        if (task.dueDate) {
            dueDateInput.value = new Date(task.dueDate).toISOString().split('T')[0];
        }
        
        // Populate assigned to dropdown
        const assignedSelect = document.getElementById('task-assigned');
        assignedSelect.innerHTML = '<option value="">Unassigned</option>';
        
        // Add project members to dropdown
        const project = this.currentProject;
        
        // Add owner
        const ownerOption = document.createElement('option');
        ownerOption.value = project.owner._id;
        ownerOption.textContent = `${project.owner.username} (Owner)`;
        if (task.assignedTo && task.assignedTo._id === project.owner._id) {
            ownerOption.selected = true;
        }
        assignedSelect.appendChild(ownerOption);
        
        // Add members
        project.members.forEach(member => {
            const memberOption = document.createElement('option');
            memberOption.value = member._id;
            memberOption.textContent = member.username;
            if (task.assignedTo && task.assignedTo._id === member._id) {
                memberOption.selected = true;
            }
            assignedSelect.appendChild(memberOption);
        });
        
        // Fetch and render comments
        try {
            const comments = await CommentsAPI.getTaskComments(task._id, Auth.getToken());
            
            const commentsList = document.getElementById('comments-list');
            commentsList.innerHTML = '';
            
            if (comments.length > 0) {
                comments.forEach(comment => {
                    const commentItem = document.createElement('div');
                    commentItem.className = 'comment-item';
                    commentItem.innerHTML = `
                        <img class="comment-avatar" src="${comment.user.profilePic}" alt="${comment.user.username}">
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="comment-user">${comment.user.username}</span>
                                <span class="comment-time">${new Date(comment.createdAt).toLocaleString()}</span>
                            </div>
                            <p class="comment-text">${comment.content}</p>
                        </div>
                    `;
                    commentsList.appendChild(commentItem);
                });
            } else {
                commentsList.innerHTML = '<div class="empty-state">No comments yet</div>';
            }
            
        } catch (error) {
            console.error('Error loading comments:', error);
        }
        
        // Setup add comment
        const addCommentBtn = document.getElementById('add-comment-btn');
        const commentInput = document.getElementById('comment-input');
        
        addCommentBtn.addEventListener('click', async () => {
            const content = commentInput.value.trim();
            
            if (!content) return;
            
            try {
                this.showLoading();
                
                const comment = await CommentsAPI.createComment({
                    content,
                    taskId: task._id
                }, Auth.getToken());
                
                // Add new comment to list
                const commentsList = document.getElementById('comments-list');
                
                // Remove empty state if it exists
                const emptyState = commentsList.querySelector('.empty-state');
                if (emptyState) {
                    commentsList.removeChild(emptyState);
                }
                
                const commentItem = document.createElement('div');
                commentItem.className = 'comment-item';
                commentItem.innerHTML = `
                    <img class="comment-avatar" src="${comment.user.profilePic}" alt="${comment.user.username}">
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-user">${comment.user.username}</span>
                            <span class="comment-time">${new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p class="comment-text">${comment.content}</p>
                    </div>
                `;
                commentsList.appendChild(commentItem);
                
                // Clear input
                commentInput.value = '';
                
            } catch (error) {
                console.error('Error adding comment:', error);
                alert('Failed to add comment');
            } finally {
                this.hideLoading();
            }
        });
        
        // Setup task update
        statusSelect.addEventListener('change', async () => {
            try {
                this.showLoading();
                
                await TasksAPI.updateTask(task._id, {
                    status: statusSelect.value
                }, Auth.getToken());
                
                // Update current task
                this.currentTask.status = statusSelect.value;
                
                // Refresh project detail to update task lists
                this.renderProjectDetail(this.currentProject._id);
                
            } catch (error) {
                console.error('Error updating task status:', error);
                alert('Failed to update task status');
            } finally {
                this.hideLoading();
            }
        });
        
        assignedSelect.addEventListener('change', async () => {
            try {
                this.showLoading();
                
                await TasksAPI.updateTask(task._id, {
                    assignedTo: assignedSelect.value || null
                }, Auth.getToken());
                
            } catch (error) {
                console.error('Error updating task assignee:', error);
                alert('Failed to update task assignee');
            } finally {
                this.hideLoading();
            }
        });
        
        dueDateInput.addEventListener('change', async () => {
            try {
                this.showLoading();
                
                await TasksAPI.updateTask(task._id, {
                    dueDate: dueDateInput.value || null
                }, Auth.getToken());
                
            } catch (error) {
                console.error('Error updating task due date:', error);
                alert('Failed to update task due date');
            } finally {
                this.hideLoading();
            }
        });
        
        // Setup close modal
        const closeButtons = modalContainer.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });
        });
    }
    
    // Show create project modal
    showCreateProjectModal() {
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal';
        document.body.appendChild(modalContainer);
        
        // Render modal content
        this.renderTemplate(this.templates.createProject, modalContainer);
        
        // Setup close modal
        const closeButtons = modalContainer.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });
        });
        
        // Setup save project
        const saveButton = modalContainer.querySelector('#save-project-btn');
        saveButton.addEventListener('click', async () => {
            const title = document.getElementById('project-title').value.trim();
            const description = document.getElementById('project-description').value.trim();
            
            if (!title) {
                alert('Please enter a project title');
                return;
            }
            
            try {
                this.showLoading();
                
                const project = await ProjectsAPI.createProject({
                    title,
                    description,
                    members: [] // TODO: Implement member selection
                }, Auth.getToken());
                
                // Close modal
                document.body.removeChild(modalContainer);
                
                // Refresh projects page
                this.renderPage('projects');
                
            } catch (error) {
                console.error('Error creating project:', error);
                alert('Failed to create project');
            } finally {
                this.hideLoading();
            }
        });
    }
    
    // Show create task modal
    showCreateTaskModal(projectId) {
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal';
        document.body.appendChild(modalContainer);
        
        // Render modal content
        this.renderTemplate(this.templates.createTask, modalContainer);
        
        // Populate assigned to dropdown
        const assignedSelect = document.getElementById('task-assigned');
        assignedSelect.innerHTML = '<option value="">Unassigned</option>';
        
        // Add project members to dropdown
        const project = this.currentProject;
        
        // Add owner
        const ownerOption = document.createElement('option');
        ownerOption.value = project.owner._id;
        ownerOption.textContent = `${project.owner.username} (Owner)`;
        assignedSelect.appendChild(ownerOption);
        
        // Add members
        project.members.forEach(member => {
            const memberOption = document.createElement('option');
            memberOption.value = member._id;
            memberOption.textContent = member.username;
            assignedSelect.appendChild(memberOption);
        });
        
        // Setup close modal
        const closeButtons = modalContainer.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.body.removeChild(modalContainer);
            });
        });
        
        // Setup save task
        const saveButton = modalContainer.querySelector('#save-task-btn');
        saveButton.addEventListener('click', async () => {
            const title = document.getElementById('task-title').value.trim();
            const description = document.getElementById('task-description').value.trim();
            const assignedTo = document.getElementById('task-assigned').value;
            const status = document.getElementById('task-status').value;
            const dueDate = document.getElementById('task-due-date').value;
            
            if (!title) {
                alert('Please enter a task title');
                return;
            }
            
            try {
                this.showLoading();
                
                const task = await TasksAPI.createTask({
                    title,
                    description,
                    projectId,
                    assignedTo: assignedTo || null,
                    status,
                    dueDate: dueDate || null
                }, Auth.getToken());
                
                // Close modal
                document.body.removeChild(modalContainer);
                
                // Refresh project detail
                this.renderProjectDetail(projectId);
                
            } catch (error) {
                console.error('Error creating task:', error);
                alert('Failed to create task');
            } finally {
                this.hideLoading();
            }
        });
    }
    
    // Replace the renderMyTasks method in UIService class in public/js/ui.js

    // Render my tasks page
    async renderMyTasks(container) {
        container.innerHTML = `
            <div class="page-header">
                <h2>My Tasks</h2>
            </div>
            
            <div class="tasks-filter">
                <div class="filter-group">
                    <label>Filter:</label>
                    <select id="task-status-filter">
                        <option value="all">All Tasks</option>
                        <option value="todo">To Do</option>
                        <option value="inprogress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Sort:</label>
                    <select id="task-sort">
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="due-date">Due Date</option>
                    </select>
                </div>
            </div>
            
            <div class="my-tasks-container">
                <div id="my-tasks-list" class="my-tasks-list">
                    <div class="loading-tasks">Loading your tasks...</div>
                </div>
            </div>
        `;
        
        try {
            this.showLoading();
            
            // Fetch all projects
            const projects = await ProjectsAPI.getProjects(Auth.getToken());
            
            // Collect all tasks assigned to the current user
            const currentUserId = Auth.getUser().id;
            let myTasks = [];
            
            for (const project of projects) {
                const tasks = await TasksAPI.getProjectTasks(project._id, Auth.getToken());
                const userTasks = tasks.filter(task => 
                    task.assignedTo && task.assignedTo._id === currentUserId
                );
                
                // Add project info to each task
                userTasks.forEach(task => {
                    task.projectInfo = {
                        id: project._id,
                        title: project.title
                    };
                });
                
                myTasks = [...myTasks, ...userTasks];
            }
            
            // Render tasks
            const tasksContainer = document.getElementById('my-tasks-list');
            
            if (myTasks.length > 0) {
                renderTasksList(myTasks, tasksContainer);
            } else {
                tasksContainer.innerHTML = '<div class="empty-state">You have no assigned tasks</div>';
            }
            
            // Setup filters
            const statusFilter = document.getElementById('task-status-filter');
            const sortSelect = document.getElementById('task-sort');
            
            const filterTasks = () => {
                const filterValue = statusFilter.value;
                const sortValue = sortSelect.value;
                
                let filteredTasks = [...myTasks];
                
                // Apply filter
                if (filterValue !== 'all') {
                    filteredTasks = filteredTasks.filter(task => task.status === filterValue);
                }
                
                // Apply sort
                if (sortValue === 'newest') {
                    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                } else if (sortValue === 'oldest') {
                    filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                } else if (sortValue === 'due-date') {
                    filteredTasks.sort((a, b) => {
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        return new Date(a.dueDate) - new Date(b.dueDate);
                    });
                }
                
                // Render filtered tasks
                renderTasksList(filteredTasks, tasksContainer);
            };
            
            statusFilter.addEventListener('change', filterTasks);
            sortSelect.addEventListener('change', filterTasks);
            
        } catch (error) {
            console.error('Error loading tasks:', error);
            document.getElementById('my-tasks-list').innerHTML = 
                '<div class="error-state">Failed to load tasks. Please try again.</div>';
        } finally {
            this.hideLoading();
        }
        
        // Helper function to render tasks list
        const renderTasksList = (tasks, container) => {
            container.innerHTML = '';
            
            tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item my-task-item';
                
                // Determine status class
                let statusClass = '';
                let statusText = '';
                
                if (task.status === 'todo') {
                    statusClass = 'status-todo';
                    statusText = 'To Do';
                } else if (task.status === 'inprogress') {
                    statusClass = 'status-inprogress';
                    statusText = 'In Progress';
                } else if (task.status === 'completed') {
                    statusClass = 'status-completed';
                    statusText = 'Completed';
                }
                
                taskItem.innerHTML = `
                    <div class="task-item-header">
                        <h4 class="task-item-title">${task.title}</h4>
                        <span class="task-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="task-item-project">
                        <i class="fas fa-project-diagram"></i>
                        <span>${task.projectInfo.title}</span>
                    </div>
                    <p class="task-item-description">${task.description || 'No description'}</p>
                    <div class="task-item-meta">
                        ${task.dueDate ? `
                            <div class="task-item-due ${isOverdue(task.dueDate) ? 'overdue' : ''}">
                                <i class="fas fa-calendar-alt"></i>
                                <span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                taskItem.addEventListener('click', () => {
                    // Store current project before showing task detail
                    this.currentProject = { _id: task.projectInfo.id };
                    this.showTaskDetailModal(task);
                });
                
                container.appendChild(taskItem);
            });
        };
        
        // Helper function to check if a task is overdue
        const isOverdue = (dueDate) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const taskDueDate = new Date(dueDate);
            taskDueDate.setHours(0, 0, 0, 0);
            return taskDueDate < today;
        };
    }
    
    // Replace the renderProfile method in UIService class in public/js/ui.js

    // Render profile page
    async renderProfile(container) {
        const user = Auth.getUser();
        
        container.innerHTML = `
            <div class="page-header">
                <h2>My Profile</h2>
            </div>
            
            <div class="profile-container">
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar-container">
                            <img id="profile-avatar" src="${user.profilePic}" alt="${user.username}">
                            <button id="change-avatar-btn" class="btn btn-sm">Change Avatar</button>
                        </div>
                        <div class="profile-info">
                            <h3>${user.username}</h3>
                            <p>${user.email}</p>
                            <p>Member since: ${new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div class="profile-form">
                        <h4>Update Profile</h4>
                        <div class="form-group">
                            <label for="profile-username">Username</label>
                            <input type="text" id="profile-username" value="${user.username}">
                        </div>
                        <div class="form-group">
                            <label for="profile-email">Email</label>
                            <input type="email" id="profile-email" value="${user.email}">
                        </div>
                        <button id="update-profile-btn" class="btn btn-primary">Update Profile</button>
                        <div id="profile-update-message" class="update-message"></div>
                    </div>
                    
                    <div class="profile-form">
                        <h4>Change Password</h4>
                        <div class="form-group">
                            <label for="current-password">Current Password</label>
                            <input type="password" id="current-password" placeholder="Enter current password">
                        </div>
                        <div class="form-group">
                            <label for="new-password">New Password</label>
                            <input type="password" id="new-password" placeholder="Enter new password">
                        </div>
                        <div class="form-group">
                            <label for="confirm-password">Confirm New Password</label>
                            <input type="password" id="confirm-password" placeholder="Confirm new password">
                        </div>
                        <button id="change-password-btn" class="btn btn-primary">Change Password</button>
                        <div id="password-update-message" class="update-message"></div>
                    </div>
                    
                    <div class="profile-danger-zone">
                        <h4>Danger Zone</h4>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                        <button id="delete-account-btn" class="btn btn-danger">Delete Account</button>
                    </div>
                </div>
                
                <div class="profile-stats">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-project-diagram"></i></div>
                        <div class="stat-info">
                            <h3>My Projects</h3>
                            <p id="my-projects-count">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-tasks"></i></div>
                        <div class="stat-info">
                            <h3>My Tasks</h3>
                            <p id="my-tasks-count">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-info">
                            <h3>Completed</h3>
                            <p id="my-completed-count">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        try {
            this.showLoading();
            
            // Fetch user stats
            const projects = await ProjectsAPI.getProjects(Auth.getToken());
            const currentUserId = user.id;
            
            // Count owned projects
            const myProjects = projects.filter(project => project.owner._id === currentUserId);
            document.getElementById('my-projects-count').textContent = myProjects.length;
            
            // Count assigned tasks
            let myTasks = [];
            let completedTasks = 0;
            
            for (const project of projects) {
                const tasks = await TasksAPI.getProjectTasks(project._id, Auth.getToken());
                const userTasks = tasks.filter(task => 
                    task.assignedTo && task.assignedTo._id === currentUserId
                );
                
                myTasks = [...myTasks, ...userTasks];
                completedTasks += userTasks.filter(task => task.status === 'completed').length;
            }
            
            document.getElementById('my-tasks-count').textContent = myTasks.length;
            document.getElementById('my-completed-count').textContent = completedTasks;
            
            // Setup event listeners
            document.getElementById('update-profile-btn').addEventListener('click', async () => {
                const username = document.getElementById('profile-username').value.trim();
                const email = document.getElementById('profile-email').value.trim();
                const messageElement = document.getElementById('profile-update-message');
                
                if (!username || !email) {
                    messageElement.textContent = 'Username and email are required';
                    messageElement.className = 'update-message error';
                    return;
                }
                
                try {
                    this.showLoading();
                    
                    // This would be implemented in a real application
                    // await UsersAPI.updateProfile({ username, email }, Auth.getToken());
                    
                    // For now, just show a success message
                    messageElement.textContent = 'Profile updated successfully';
                    messageElement.className = 'update-message success';
                    
                    // Update local user data
                    const updatedUser = { ...user, username, email };
                    Auth.setSession(Auth.getToken(), updatedUser);
                    
                    // Update header username
                    document.getElementById('username').textContent = username;
                    
                } catch (error) {
                    console.error('Error updating profile:', error);
                    messageElement.textContent = 'Failed to update profile';
                    messageElement.className = 'update-message error';
                } finally {
                    this.hideLoading();
                }
            });
            
            document.getElementById('change-password-btn').addEventListener('click', async () => {
                const currentPassword = document.getElementById('current-password').value;
                const newPassword = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                const messageElement = document.getElementById('password-update-message');
                
                if (!currentPassword || !newPassword || !confirmPassword) {
                    messageElement.textContent = 'All password fields are required';
                    messageElement.className = 'update-message error';
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    messageElement.textContent = 'New passwords do not match';
                    messageElement.className = 'update-message error';
                    return;
                }
                
                try {
                    this.showLoading();
                    
                    // This would be implemented in a real application
                    // await UsersAPI.changePassword({ currentPassword, newPassword }, Auth.getToken());
                    
                    // For now, just show a success message
                    messageElement.textContent = 'Password changed successfully';
                    messageElement.className = 'update-message success';
                    
                    // Clear password fields
                    document.getElementById('current-password').value = '';
                    document.getElementById('new-password').value = '';
                    document.getElementById('confirm-password').value = '';
                    
                } catch (error) {
                    console.error('Error changing password:', error);
                    messageElement.textContent = 'Failed to change password';
                    messageElement.className = 'update-message error';
                } finally {
                    this.hideLoading();
                }
            });
            
            document.getElementById('change-avatar-btn').addEventListener('click', () => {
                // This would open a file picker in a real application
                alert('Avatar change functionality would be implemented in a real application');
            });
            
            document.getElementById('delete-account-btn').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // This would be implemented in a real application
                    // await UsersAPI.deleteAccount(Auth.getToken());
                    
                    alert('Account deletion would be implemented in a real application');
                    
                    // For now, just logout
                    Auth.logout();
                    this.renderAuth();
                }
            });
            
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            this.hideLoading();
        }
    }
}

// Create a singleton instance
const UI = new UIService();