// Variables de estado
let currentApplication = null;
let selectedClientId = null;
let lastCheckedTimestamp = Date.now();

// Función para seguir una solicitud
async function trackApplication(event) {
  event.preventDefault();
  
  const trackingCode = document.getElementById('tracking-code-input').value;
  
  // Verificar si es el código del administrador
  if (trackingCode === 'ADMIN-PSF') {
    try {
      await loadAdminApplications();
      showSection('admin-dashboard');
    } catch (error) {
      console.error('Error al cargar el panel de administrador:', error);
    }
    return;
  }
  
  try {
    // Obtener datos de la aplicación
    const response = await fetchApi(`applications/${trackingCode}`, 'GET');
    
    if (response && response.application) {
      // Guardar la aplicación actual
      currentApplication = response.application;
      
      // Cargar datos en el dashboard
      document.getElementById('detail-name').textContent = currentApplication.name;
document.getElementById('detail-city').textContent = currentApplication.city;
document.getElementById('detail-address').textContent = currentApplication.address;
      document.getElementById('detail-loan-type').textContent = currentApplication.type;
      document.getElementById('detail-amount').textContent = currentApplication.amount.toLocaleString() + ' €';
      document.getElementById('detail-term').textContent = currentApplication.term + ' meses';
      document.getElementById('detail-payment').textContent = currentApplication.payment + ' €';
      document.getElementById('detail-date').textContent = currentApplication.date;
      document.getElementById('detail-tracking').textContent = currentApplication.id;
      
      // Mostrar estado
      const statusElement = document.getElementById('application-status');
      if (currentApplication.status === 'approved') {
        statusElement.textContent = 'Solicitud aprobada';
        statusElement.className = 'status-badge status-approved';
      } else if (currentApplication.status === 'rejected') {
        statusElement.textContent = 'Solicitud rechazada';
        statusElement.className = 'status-badge status-rejected';
      } else {
        statusElement.textContent = 'Solicitud en estudio';
        statusElement.className = 'status-badge status-pending';
      }
      
      // Cargar mensajes
      await loadUserMessages();
      
      // Iniciar verificación periódica de mensajes
      startMessageCheck();
      
      showSection('user-dashboard');
    } else {
      showNotification('No se encontró ninguna solicitud con ese código.', true);
    }
  } catch (error) {
    console.error('Error al buscar aplicación:', error);
  }
}

// Función para cargar mensajes del usuario
async function loadUserMessages() {
  if (!currentApplication) return;
  
  try {
    const response = await fetchApi(`messages/${currentApplication.id}`, 'GET');
    
    if (response && response.messages) {
      const messagesContainer = document.getElementById('user-messages');
      messagesContainer.innerHTML = '';
      
      response.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.from === 'admin' ? 'received' : 'sent'}`;
        
        let messageContent = `<div class="message-content">${message.content}</div>`;
        
        // Agregar enlace de descarga si hay un archivo adjunto
        if (message.attachmentUrl) {
          messageContent += `
            <div class="message-attachment">
              <div class="file-icon">📎</div>
              <a href="/uploads/${message.attachmentUrl}" class="file-download" target="_blank" download>
                Descargar: ${message.attachmentUrl}
              </a>
            </div>
          `;
        }
        
        messageContent += `<div class="message-time">${message.time}</div>`;
        
        messageElement.innerHTML = messageContent;
        messagesContainer.appendChild(messageElement);
      });
      
      // Ocultar el badge de notificación de mensajes
      document.getElementById('user-message-badge').style.display = 'none';
      
      // Desplazar al final de los mensajes
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // Actualizar timestamp del último chequeo
      lastCheckedTimestamp = Date.now();
    }
  } catch (error) {
    console.error('Error al cargar mensajes:', error);
  }
}

// Función para verificar nuevos mensajes
async function checkNewMessages() {
  if (!currentApplication) return;
  
  try {
    const response = await fetchApi(`messages/${currentApplication.id}/new?lastCheck=${lastCheckedTimestamp}`, 'GET');
    
    if (response && response.hasNewMessages) {
      // Mostrar el badge de notificación
      document.getElementById('user-message-badge').style.display = 'flex';
      
      // Mostrar notificación y recargar mensajes
      showNotification('¡Tiene nuevos mensajes!');
      await loadUserMessages();
    }
  } catch (error) {
    console.error('Error al verificar nuevos mensajes:', error);
  }
}

// Verificar nuevos mensajes periódicamente
let messageCheckInterval;

// Función para iniciar la verificación periódica
function startMessageCheck() {
  // Detener intervalo existente si hay uno
  if (messageCheckInterval) {
    clearInterval(messageCheckInterval);
  }
  
  // Iniciar nuevo intervalo
  messageCheckInterval = setInterval(checkNewMessages, 30000); // 30 segundos
}

// Función para enviar un mensaje como usuario
async function sendUserMessage() {
  if (!currentApplication) return;
  
  const messageText = document.getElementById('user-message-input').value.trim();
  if (!messageText) return;
  
  try {
    // Utilizar FormData para soportar archivos
    const formData = new FormData();
    formData.append('applicationId', currentApplication.id);
    formData.append('content', messageText);
    formData.append('from', 'user');
    
    // Añadir el archivo si existe
    const fileInput = document.getElementById('user-file-upload');
    if (fileInput.files.length > 0) {
      formData.append('attachment', fileInput.files[0]);
    }
    
    await fetchApi('messages', 'POST', formData, true);
    
    // Notificar al administrador (simulado)
    try {
      const adminNotificationData = {
        applicationId: currentApplication.id,
        hasNewMessage: true
      };
      await fetchApi('admin/notifications', 'POST', adminNotificationData);
    } catch (notifError) {
      console.warn('No se pudo enviar notificación al administrador', notifError);
    }
    
    // Actualizar la interfaz
    await loadUserMessages();
    
    // Limpiar campos
    document.getElementById('user-message-input').value = '';
    fileInput.value = '';
    
    showNotification('Mensaje enviado correctamente');
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
  }
}

// Función para cargar las solicitudes del administrador
async function loadAdminApplications() {
  try {
    const response = await fetchApi('admin/applications', 'GET');
    
    if (response && response.applications) {
      const tbody = document.getElementById('admin-applications');
      tbody.innerHTML = '';
      
      response.applications.forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${app.id}</td>
          <td>${app.name}</td>
          <td>${app.email}</td>
          <td>${app.dni}</td>
          <td>${app.amount.toLocaleString()} €</td>
          <td>${app.term} meses</td>
          <td>${app.payment} €</td>
          <td class="action-buttons">
            <button class="btn btn-sm btn-approve" onclick="approveApplication('${app.id}')">Aprobar</button>
            <button class="btn btn-sm btn-reject" onclick="rejectApplication('${app.id}')">Rechazar</button>
            <button class="btn btn-sm btn-secondary" onclick="viewMessages('${app.id}', '${app.name}')">Mensajes</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error al cargar aplicaciones admin:', error);
  }
}

// Función para aprobar una solicitud
async function approveApplication(id) {
  try {
    await fetchApi(`admin/applications/${id}/approve`, 'PUT');
    await loadAdminApplications();
    showNotification(`Solicitud ${id} aprobada con éxito.`);
  } catch (error) {
    console.error('Error al aprobar aplicación:', error);
  }
}

// Función para rechazar una solicitud
async function rejectApplication(id) {
  try {
    await fetchApi(`admin/applications/${id}/reject`, 'PUT');
    await loadAdminApplications();
    showNotification(`Solicitud ${id} rechazada.`);
  } catch (error) {
    console.error('Error al rechazar aplicación:', error);
  }
}

// Función para ver mensajes de un cliente
async function viewMessages(id, name) {
  try {
    document.getElementById('selected-client-name').textContent = name;
    document.getElementById('admin-message-section').style.display = 'block';
    
    // Guardar el ID del cliente seleccionado
    selectedClientId = id;
    
    // Cargar mensajes
    const response = await fetchApi(`admin/messages/${id}`, 'GET');
    
    if (response && response.messages) {
      const messagesContainer = document.getElementById('admin-messages');
      messagesContainer.innerHTML = '';
      
      response.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.from === 'user' ? 'received' : 'sent'}`;
        
        let messageContent = `<div class="message-content">${message.content}</div>`;
        
        // Agregar enlace de descarga si hay un archivo adjunto
        if (message.attachmentUrl) {
          messageContent += `
            <div class="message-attachment">
              <div class="file-icon">📎</div>
              <a href="/uploads/${message.attachmentUrl}" class="file-download" target="_blank" download>
                Descargar: ${message.attachmentUrl}
              </a>
            </div>
          `;
        }
        
        messageContent += `<div class="message-time">${message.time}</div>`;
        
        messageElement.innerHTML = messageContent;
        messagesContainer.appendChild(messageElement);
      });
      
      // Ocultar el badge de notificación
      document.getElementById('admin-message-badge').style.display = 'none';
      
      // Desplazar al final de los mensajes
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  } catch (error) {
    console.error('Error al cargar mensajes de admin:', error);
  }
}

// Función para enviar un mensaje como administrador
async function sendAdminMessage() {
  if (!selectedClientId) return;
  
  const messageText = document.getElementById('admin-message-text').value.trim();
  if (!messageText) return;
  
  try {
    // Utilizar FormData para soportar archivos
    const formData = new FormData();
    formData.append('applicationId', selectedClientId);
    formData.append('content', messageText);
    formData.append('from', 'admin');
    
    // Añadir el archivo si existe
    const fileInput = document.getElementById('admin-file-upload');
    if (fileInput.files.length > 0) {
      formData.append('attachment', fileInput.files[0]);
    }
    
    await fetchApi('admin/messages', 'POST', formData, true);
    
    // Actualizar la interfaz
    await viewMessages(selectedClientId, document.getElementById('selected-client-name').textContent);
    
    // Limpiar campos
    document.getElementById('admin-message-text').value = '';
    fileInput.value = '';
    
    showNotification('Mensaje enviado correctamente');
  } catch (error) {
    console.error('Error al enviar mensaje de admin:', error);
  }
}

// Función para detener la verificación de mensajes cuando el usuario sale de la página
function stopMessageCheck() {
  if (messageCheckInterval) {
    clearInterval(messageCheckInterval);
    messageCheckInterval = null;
  }
}

// Agregar evento para detener la verificación cuando se cambia de sección
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden') {
    stopMessageCheck();
  } else if (document.visibilityState === 'visible' && currentApplication) {
    startMessageCheck();
  }
});

// Función de cierre de sesión
function logout() {
  // Arrêter la vérification des messages
  stopMessageCheck();
  
  // Réinitialiser les variables d'état
  currentApplication = null;
  selectedClientId = null;
  
  // Vider le champ de code de suivi
  document.getElementById('tracking-code-input').value = '';
  
  // Rediriger vers la page de suivi
  showSection('tracking-section');
  
  // Afficher un message
  showNotification('Sesión cerrada correctamente');
}

// Inicialización específica para esta página
window.initPage = function() {
  document.querySelectorAll('.section').forEach(section => {
    if (section.id !== 'tracking-section') {
      section.style.display = 'none';
    } else {
      section.style.display = 'block';
    }
  });
  
  // Detener verificación de mensajes al cambiar de sección
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', stopMessageCheck);
  });
};
