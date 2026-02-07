// ============================================
// GLOBAL VARIABLES AND INITIALIZATION
// ============================================

// Get DOM elements
const studentForm = document.getElementById('studentForm');
const editForm = document.getElementById('editForm');
const studentTableBody = document.getElementById('studentTableBody');
const tableContainer = document.getElementById('tableContainer');
const emptyState = document.getElementById('emptyState');
const editModal = document.getElementById('editModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEdit');
const resetBtn = document.getElementById('resetBtn');

// Store current student being edited
let editingStudentId = null;

// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================

/**
 * Get all students from local storage
 * @returns {Array} Array of student objects
 */
function getStudentsFromStorage() {
    const students = localStorage.getItem('students');
    return students ? JSON.parse(students) : [];
}

/**
 * Save students array to local storage
 * @param {Array} students - Array of student objects to save
 */
function saveStudentsToStorage(students) {
    localStorage.setItem('students', JSON.stringify(students));
}

/**
 * Generate unique ID for new student
 * @returns {string} Unique timestamp-based ID
 */
function generateUniqueId() {
    return Date.now().toString();
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate student name (only alphabetic characters and spaces)
 * @param {string} name - Student name to validate
 * @returns {Object} Validation result with isValid and message
 */
function validateName(name) {
    const nameRegex = /^[a-zA-Z\s]+$/;
    
    if (!name.trim()) {
        return { isValid: false, message: 'Name is required' };
    }
    
    if (!nameRegex.test(name)) {
        return { isValid: false, message: 'Name should contain only letters' };
    }
    
    if (name.trim().length < 2) {
        return { isValid: false, message: 'Name must be at least 2 characters' };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validate student ID (only numbers)
 * @param {string} id - Student ID to validate
 * @returns {Object} Validation result with isValid and message
 */
function validateStudentId(id) {
    const idRegex = /^[0-9]+$/;
    
    if (!id.trim()) {
        return { isValid: false, message: 'Student ID is required' };
    }
    
    if (!idRegex.test(id)) {
        return { isValid: false, message: 'Student ID should contain only numbers' };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with isValid and message
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
        return { isValid: false, message: 'Email is required' };
    }
    
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Validate contact number (only numbers, at least 10 digits)
 * @param {string} contact - Contact number to validate
 * @returns {Object} Validation result with isValid and message
 */
function validateContact(contact) {
    const contactRegex = /^[0-9]+$/;
    
    if (!contact.trim()) {
        return { isValid: false, message: 'Contact number is required' };
    }
    
    if (!contactRegex.test(contact)) {
        return { isValid: false, message: 'Contact number should contain only numbers' };
    }
    
    if (contact.length < 10) {
        return { isValid: false, message: 'Contact number must be at least 10 digits' };
    }
    
    return { isValid: true, message: '' };
}

/**
 * Display error message for a field
 * @param {string} fieldId - ID of the input field
 * @param {string} errorId - ID of the error message element
 * @param {string} message - Error message to display
 */
function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(errorId);
    
    field.classList.add('error');
    errorElement.textContent = message;
}

/**
 * Clear error message for a field
 * @param {string} fieldId - ID of the input field
 * @param {string} errorId - ID of the error message element
 */
function clearError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(errorId);
    
    field.classList.remove('error');
    errorElement.textContent = '';
}

/**
 * Validate entire form
 * @param {Object} formData - Form data to validate
 * @param {string} prefix - Prefix for field IDs (empty for main form, 'edit' for edit form)
 * @returns {boolean} True if all validations pass
 */
function validateForm(formData, prefix = '') {
    let isValid = true;
    
    // Validate name
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
        showError(`${prefix}studentName`, `${prefix}nameError`, nameValidation.message);
        isValid = false;
    } else {
        clearError(`${prefix}studentName`, `${prefix}nameError`);
    }
    
    // Validate student ID
    const idValidation = validateStudentId(formData.id);
    if (!idValidation.isValid) {
        showError(`${prefix}studentId`, `${prefix}idError`, idValidation.message);
        isValid = false;
    } else {
        clearError(`${prefix}studentId`, `${prefix}idError`);
    }
    
    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
        showError(`${prefix}email`, `${prefix}emailError`, emailValidation.message);
        isValid = false;
    } else {
        clearError(`${prefix}email`, `${prefix}emailError`);
    }
    
    // Validate contact
    const contactValidation = validateContact(formData.contact);
    if (!contactValidation.isValid) {
        showError(`${prefix}contactNumber`, `${prefix}contactError`, contactValidation.message);
        isValid = false;
    } else {
        clearError(`${prefix}contactNumber`, `${prefix}contactError`);
    }
    
    return isValid;
}

// ============================================
// TABLE DISPLAY FUNCTIONS
// ============================================

/**
 * Render all students in the table
 */
function renderStudents() {
    const students = getStudentsFromStorage();
    studentTableBody.innerHTML = '';
    
    if (students.length === 0) {
        emptyState.classList.remove('hidden');
        updateScrollbar();
        return;
    }
    
    emptyState.classList.add('hidden');
    
    students.forEach((student, index) => {
        const row = createStudentRow(student, index);
        studentTableBody.appendChild(row);
    });
    
    // Update scrollbar after rendering
    updateScrollbar();
}

/**
 * Create a table row for a student
 * @param {Object} student - Student data
 * @param {number} index - Student index
 * @returns {HTMLElement} Table row element
 */
function createStudentRow(student, index) {
    const row = document.createElement('tr');
    row.className = 'slide-in';
    row.innerHTML = `
        <td>${escapeHtml(student.name)}</td>
        <td>${escapeHtml(student.id)}</td>
        <td>${escapeHtml(student.email)}</td>
        <td>${escapeHtml(student.contact)}</td>
        <td>
            <button class="action-btn edit-btn" onclick="editStudent('${student.uniqueId}')">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteStudent('${student.uniqueId}')">Delete</button>
        </td>
    `;
    return row;
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Update scrollbar visibility dynamically using JavaScript
 */
function updateScrollbar() {
    const table = document.getElementById('studentTable');
    const students = getStudentsFromStorage();
    
    // Set max height based on number of students
    // Show scrollbar if more than 5 students
    if (students.length > 5) {
        tableContainer.style.maxHeight = '400px';
        tableContainer.style.overflowY = 'auto';
    } else {
        tableContainer.style.maxHeight = 'none';
        tableContainer.style.overflowY = 'visible';
    }
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Add new student
 * @param {Object} studentData - Student data to add
 */
function addStudent(studentData) {
    const students = getStudentsFromStorage();
    
    const newStudent = {
        uniqueId: generateUniqueId(),
        name: studentData.name.trim(),
        id: studentData.id.trim(),
        email: studentData.email.trim(),
        contact: studentData.contact.trim()
    };
    
    students.push(newStudent);
    saveStudentsToStorage(students);
    renderStudents();
    
    // Show success animation
    showNotification('Student added successfully!', 'success');
}

/**
 * Edit student (populate edit form)
 * @param {string} uniqueId - Unique ID of student to edit
 */
function editStudent(uniqueId) {
    const students = getStudentsFromStorage();
    const student = students.find(s => s.uniqueId === uniqueId);
    
    if (!student) return;
    
    // Populate edit form
    document.getElementById('editStudentName').value = student.name;
    document.getElementById('editStudentId').value = student.id;
    document.getElementById('editEmail').value = student.email;
    document.getElementById('editContactNumber').value = student.contact;
    
    // Store the ID of student being edited
    editingStudentId = uniqueId;
    
    // Show modal
    editModal.classList.add('active');
}

/**
 * Update student with new data
 * @param {Object} updatedData - Updated student data
 */
function updateStudent(updatedData) {
    const students = getStudentsFromStorage();
    const index = students.findIndex(s => s.uniqueId === editingStudentId);
    
    if (index === -1) return;
    
    students[index] = {
        ...students[index],
        name: updatedData.name.trim(),
        id: updatedData.id.trim(),
        email: updatedData.email.trim(),
        contact: updatedData.contact.trim()
    };
    
    saveStudentsToStorage(students);
    renderStudents();
    closeEditModal();
    
    showNotification('Student updated successfully!', 'success');
}

/**
 * Delete student
 * @param {string} uniqueId - Unique ID of student to delete
 */
function deleteStudent(uniqueId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }
    
    const students = getStudentsFromStorage();
    const filteredStudents = students.filter(s => s.uniqueId !== uniqueId);
    
    saveStudentsToStorage(filteredStudents);
    renderStudents();
    
    showNotification('Student deleted successfully!', 'danger');
}

// ============================================
// MODAL FUNCTIONS
// ============================================

/**
 * Close edit modal
 */
function closeEditModal() {
    editModal.classList.remove('active');
    editForm.reset();
    editingStudentId = null;
    
    // Clear all edit form errors
    clearError('editStudentName', 'editNameError');
    clearError('editStudentId', 'editIdError');
    clearError('editEmail', 'editEmailError');
    clearError('editContactNumber', 'editContactError');
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, danger, warning)
 */
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Handle main form submission
 */
studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('studentName').value,
        id: document.getElementById('studentId').value,
        email: document.getElementById('email').value,
        contact: document.getElementById('contactNumber').value
    };
    
    // Validate form
    if (validateForm(formData)) {
        addStudent(formData);
        studentForm.reset();
    }
});

/**
 * Handle edit form submission
 */
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('editStudentName').value,
        id: document.getElementById('editStudentId').value,
        email: document.getElementById('editEmail').value,
        contact: document.getElementById('editContactNumber').value
    };
    
    // Validate form with 'edit' prefix
    if (validateForm(formData, 'edit')) {
        updateStudent(formData);
    }
});

/**
 * Handle reset button click
 */
resetBtn.addEventListener('click', () => {
    studentForm.reset();
    
    // Clear all errors
    clearError('studentName', 'nameError');
    clearError('studentId', 'idError');
    clearError('email', 'emailError');
    clearError('contactNumber', 'contactError');
});

/**
 * Handle close modal button
 */
closeModalBtn.addEventListener('click', closeEditModal);

/**
 * Handle cancel edit button
 */
cancelEditBtn.addEventListener('click', closeEditModal);

/**
 * Close modal when clicking outside
 */
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeEditModal();
    }
});

/**
 * Real-time validation for main form inputs
 */
document.getElementById('studentName').addEventListener('input', (e) => {
    const validation = validateName(e.target.value);
    if (e.target.value.trim()) {
        if (!validation.isValid) {
            showError('studentName', 'nameError', validation.message);
        } else {
            clearError('studentName', 'nameError');
        }
    } else {
        clearError('studentName', 'nameError');
    }
});

document.getElementById('studentId').addEventListener('input', (e) => {
    const validation = validateStudentId(e.target.value);
    if (e.target.value.trim()) {
        if (!validation.isValid) {
            showError('studentId', 'idError', validation.message);
        } else {
            clearError('studentId', 'idError');
        }
    } else {
        clearError('studentId', 'idError');
    }
});

document.getElementById('email').addEventListener('input', (e) => {
    const validation = validateEmail(e.target.value);
    if (e.target.value.trim()) {
        if (!validation.isValid) {
            showError('email', 'emailError', validation.message);
        } else {
            clearError('email', 'emailError');
        }
    } else {
        clearError('email', 'emailError');
    }
});

document.getElementById('contactNumber').addEventListener('input', (e) => {
    const validation = validateContact(e.target.value);
    if (e.target.value.trim()) {
        if (!validation.isValid) {
            showError('contactNumber', 'contactError', validation.message);
        } else {
            clearError('contactNumber', 'contactError');
        }
    } else {
        clearError('contactNumber', 'contactError');
    }
});

/**
 * Real-time validation for edit form inputs
 */
document.getElementById('editStudentName').addEventListener('input', (e) => {
    const validation = validateName(e.target.value);
    if (e.target.value.trim()) {
        if (!validation.isValid) {
            showError('editStudentName', 'editNameError', validation.message);
        } else {
            clearError('editStudentName', 'editNameError');
        }
    } else {
        clearError('editStudentName', 'editNameError');
    }
});

document.getElementById('editStudentId').addEventListener('input', (e) => {
    const validation = validateStudentId(e.target.value);
    if (e.target.value.trim()) {
        if (!validation.isValid) {
            showError('editStudentId', 'editIdError', validation.message);
        } else {
            clearError('editStudentId', 'editIdError');
        }
    } else {
        clearError('editStudentId', 'editIdError');
    }
});

document.getElementById('editEmail').addEventListener('input', (e) => {
    const validation = validateEmail(e.target.value);
    if (e.target.value.trim()) {
        if (!validation.isValid) {
            showError('editEmail', 'editEmailError', validation.message);
        } else {
            clearError('editEmail', 'editEmailError');
        }
    } else {
        clearError('editEmail', 'editEmailError');
    }
});

document.getElementById('editContactNumber').addEventListener('input', (e) => {
    const validation = validateContact(e.target.value);
    if (e.target.value.trim()) {
        if (!validation.isValid) {
            showError('editContactNumber', 'editContactError', validation.message);
        } else {
            clearError('editContactNumber', 'editContactError');
        }
    } else {
        clearError('editContactNumber', 'editContactError');
    }
});

// ============================================
// ANIMATION STYLES (Injected via JavaScript)
// ============================================

// Add notification animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// INITIALIZE APPLICATION
// ============================================

/**
 * Initialize the application on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    renderStudents();
    console.log('Student Registration System initialized successfully!');
});