// Variables de estado
let currentApplication = null;
let selectedClientId = null;

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
        messageElement.innerHTML = `
          <div class="message-content">${message.content}</div>
          <div class="message-time">${message.time}</div>
        `;
        messagesContainer.appendChild(messageElement);
      });
      
      // Desplazar al final de los mensajes
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  } catch (error) {
    console.error('Error al cargar mensajes:', error);
  }
}

// Función para enviar un mensaje como usuario
async function sendUserMessage() {
  if (!currentApplication) return;
  
  const messageText = document.getElementById('user-message-input').value.trim();
  if (!messageText) return;
  
  try {
    const messageData = {
      applicationId: currentApplication.id,
      content: messageText,
      from: 'user'
    };
    
    await fetchApi('messages', 'POST', messageData);
    
    // Actualizar la interfaz
    await loadUserMessages();
    
    // Limpiar el campo de entrada
    document.getElementById('user-message-input').value = '';
    
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
        messageElement.innerHTML = `
          <div class="message-content">${message.content}</div>
          <div class="message-time">${message.time}</div>
        `;
        messagesContainer.appendChild(messageElement);
      });
      
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
    const messageData = {
      applicationId: selectedClientId,
      content: messageText,
      from: 'admin'
    };
    
    await fetchApi('admin/messages', 'POST', messageData);
    
    // Actualizar la interfaz
    await viewMessages(selectedClientId, document.getElementById('selected-client-name').textContent);
    
    // Limpiar el campo de entrada
    document.getElementById('admin-message-text').value = '';
    
    showNotification('Mensaje enviado correctamente');
  } catch (error) {
    console.error('Error al enviar mensaje de admin:', error);
  }
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
};
