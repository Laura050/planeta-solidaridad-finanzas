// Función para cargar todos los testimonios
async function loadAllTestimonials() {
  showLoading();
  
  try {
    const response = await fetchApi('testimonials/admin', 'GET');
    
    if (response && response.testimonials) {
      const pendingContainer = document.getElementById('pending-testimonials');
      const approvedContainer = document.getElementById('approved-testimonials');
      
      pendingContainer.innerHTML = '';
      approvedContainer.innerHTML = '';
      
      // Filtrer les témoignages
      const pendingTestimonials = response.testimonials.filter(t => !t.approved);
      const approvedTestimonials = response.testimonials.filter(t => t.approved);
      
      // Afficher les témoignages en attente
      if (pendingTestimonials.length === 0) {
        pendingContainer.innerHTML = '<p>No hay testimonios pendientes de aprobación.</p>';
      } else {
        pendingTestimonials.forEach(testimonial => {
          const testimonialElement = document.createElement('div');
          testimonialElement.className = 'testimonial';
          testimonialElement.innerHTML = `
            <div class="testimonial-content">"${testimonial.content}"</div>
            <div class="testimonial-author">${testimonial.name}</div>
            <div class="testimonial-date">${testimonial.date}</div>
            <div class="testimonial-actions" style="margin-top: 10px;">
              <button class="btn btn-sm btn-approve" onclick="approveTestimonial('${testimonial._id}')">Aprobar</button>
              <button class="btn btn-sm btn-reject" onclick="rejectTestimonial('${testimonial._id}')">Rechazar</button>
            </div>
          `;
          pendingContainer.appendChild(testimonialElement);
        });
      }
      
      // Afficher les témoignages approuvés
      if (approvedTestimonials.length === 0) {
        approvedContainer.innerHTML = '<p>No hay testimonios aprobados.</p>';
      } else {
        approvedTestimonials.forEach(testimonial => {
          const testimonialElement = document.createElement('div');
          testimonialElement.className = 'testimonial';
          testimonialElement.innerHTML = `
            <div class="testimonial-content">"${testimonial.content}"</div>
            <div class="testimonial-author">${testimonial.name}</div>
            <div class="testimonial-date">${testimonial.date}</div>
          `;
          approvedContainer.appendChild(testimonialElement);
        });
      }
    } else {
      showNotification('Error al cargar los testimonios', true);
    }
  } catch (error) {
    console.error('Error al cargar testimonios:', error);
    showNotification('Error al cargar los testimonios', true);
  } finally {
    hideLoading();
  }
}

// Función para aprobar un testimonio
async function approveTestimonial(id) {
  showLoading();
  
  try {
    await fetchApi(`testimonials/admin/${id}/approve`, 'PUT');
    showNotification('Testimonio aprobado con éxito');
    await loadAllTestimonials();
  } catch (error) {
    console.error('Error al aprobar testimonio:', error);
    showNotification('Error al aprobar el testimonio', true);
  } finally {
    hideLoading();
  }
}

// Función para rechazar un testimonio
async function rejectTestimonial(id) {
  if (!confirm('¿Está seguro de que desea rechazar este testimonio? Esta acción no se puede deshacer.')) {
    return;
  }
  
  showLoading();
  
  try {
    await fetchApi(`testimonials/admin/${id}`, 'DELETE');
    showNotification('Testimonio rechazado con éxito');
    await loadAllTestimonials();
  } catch (error) {
    console.error('Error al rechazar testimonio:', error);
    showNotification('Error al rechazar el testimonio', true);
  } finally {
    hideLoading();
  }
}

// Inicialización de la página
document.addEventListener('DOMContentLoaded', function() {
  loadAllTestimonials();
});
