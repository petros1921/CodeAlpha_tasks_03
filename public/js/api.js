// API Service for making requests to the backend

const API_URL = '/api';

// Helper function for making API requests
async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        method,
        headers
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.message || 'Something went wrong');
        }
        
        return responseData;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
const AuthAPI = {
    register: (userData) => apiRequest('/users/register', 'POST', userData),
    login: (credentials) => apiRequest('/users/login', 'POST', credentials),
    getCurrentUser: (token) => apiRequest('/users/me', 'GET', null, token)
};

// Projects API
const ProjectsAPI = {
    getProjects: (token) => apiRequest('/projects', 'GET', null, token),
    getProject: (id, token) => apiRequest(`/projects/${id}`, 'GET', null, token),
    createProject: (projectData, token) => apiRequest('/projects', 'POST', projectData, token),
    updateProject: (id, projectData, token) => apiRequest(`/projects/${id}`, 'PATCH', projectData, token),
    deleteProject: (id, token) => apiRequest(`/projects/${id}`, 'DELETE', null, token),
    addMember: (projectId, userId, token) => apiRequest(`/projects/${projectId}/members`, 'POST', { userId }, token),
    removeMember: (projectId, userId, token) => apiRequest(`/projects/${projectId}/members/${userId}`, 'DELETE', null, token)
};

// Tasks API
const TasksAPI = {
    getProjectTasks: (projectId, token) => apiRequest(`/projects/${projectId}/tasks`, 'GET', null, token),
    getTask: (id, token) => apiRequest(`/tasks/${id}`, 'GET', null, token),
    createTask: (taskData, token) => apiRequest('/tasks', 'POST', taskData, token),
    updateTask: (id, taskData, token) => apiRequest(`/tasks/${id}`, 'PATCH', taskData, token),
    deleteTask: (id, token) => apiRequest(`/tasks/${id}`, 'DELETE', null, token)
};

// Comments API
const CommentsAPI = {
    getTaskComments: (taskId, token) => apiRequest(`/tasks/${taskId}/comments`, 'GET', null, token),
    createComment: (commentData, token) => apiRequest('/comments', 'POST', commentData, token)
};

// Users API
const UsersAPI = {
    searchUsers: (query, token) => apiRequest(`/users/search?q=${query}`, 'GET', null, token)
};