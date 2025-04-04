// API URL de base
const API_URL = '/api';

// Función para mostrar el spinner de carga
function showLoading() {
  document.querySelector('.loading-spinner').style.display = 'flex';
}

// Función para ocultar el spinner de carga
function hideLoading() {
  document.querySelector('.loading-spinner').style.display = 'none';
}

// Función para mostrar una notificación
function showNotification(message, isError = false) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.backgroundColor = isError ? '#D32F2F' : '#2E7D32';
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Función para mostrar secciones
function showSection(sectionId) {
  showLoading();
  
  // Ocultar todas las secciones
  document.querySelectorAll('.section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Mostrar la sección solicitada
  document.getElementById(sectionId).style.display = 'block';
  
  // Si es la sección de testimonios, cargar datos
  if (sectionId === 'testimonials-section' && window.loadTestimonials) {
    window.loadTestimonials();
  }
  
  hideLoading();
}

// Función para previsualizar archivos
function previewFile(input, previewId) {
  const preview = document.getElementById(previewId);
  const fileName = input.files[0]?.name || '';
  
  if (fileName) {
    preview.style.display = 'flex';
    preview.querySelector('.file-preview-name').textContent = fileName;
  } else {
    preview.style.display = 'none';
  }
}

// Función para eliminar un archivo
function removeFile(inputId, previewId) {
  document.getElementById(inputId).value = '';
  document.getElementById(previewId).style.display = 'none';
}

// Función para realizar solicitudes HTTP
async function fetchApi(endpoint, method = 'GET', data = null, formData = false) {
  showLoading();
  
  try {
    const options = {
      method,
      headers: !formData ? { 'Content-Type': 'application/json' } : {},
      credentials: 'include',
      body: data ? (formData ? data : JSON.stringify(data)) : null
    };
    
    const response = await fetch(`${API_URL}/${endpoint}`, options);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Error en la solicitud');
    }
    
    hideLoading();
    return responseData;
  } catch (error) {
    hideLoading();
    console.error('Error en la solicitud:', error);
    showNotification(error.message || 'Error en la solicitud', true);
    throw error;
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  // Verificar si hay una función init específica para cada página
  if (typeof window.initPage === 'function') {
    window.initPage();
  }
});
