// Fonction pour charger les témoignages
async function loadTestimonials() {
  showLoading();
  
  try {
    const response = await fetchApi('testimonials', 'GET');
    
    if (response && response.testimonials) {
      const container = document.getElementById('testimonials-container');
      container.innerHTML = '';
      
      if (response.testimonials.length === 0) {
        container.innerHTML = '<div class="testimonial"><p>No hay testimonios disponibles en este momento.</p></div>';
      } else {
        response.testimonials.forEach(testimonial => {
          const testimonialElement = document.createElement('div');
          testimonialElement.className = 'testimonial';
          testimonialElement.innerHTML = `
            <div class="testimonial-content">"${testimonial.content}"</div>
            <div class="testimonial-author">${testimonial.name}</div>
            <div class="testimonial-date">${testimonial.date}</div>
          `;
          container.appendChild(testimonialElement);
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

// Fonction pour envoyer un nouveau témoignage
async function submitTestimonial(event) {
  event.preventDefault();
  showLoading();
  
  // Obtenir données du formulaire
  const name = document.getElementById('testimonial-name').value;
  const content = document.getElementById('testimonial-content').value;
  
  try {
    const testimonialData = {
      name,
      content
    };
    
    await fetchApi('testimonials', 'POST', testimonialData);
    
    // Resetear el formulario
    document.getElementById('testimonial-form').reset();
    
    // Mostrar notificación y redireccionar
    showNotification('¡Gracias por compartir su experiencia! Su testimonio ha sido publicado.');
    
    // Recargar testimonios y mostrar la sección
    await loadTestimonials();
    showSection('testimonials-section');
  } catch (error) {
    console.error('Error al enviar testimonio:', error);
    showNotification('Error al enviar su testimonio', true);
  } finally {
    hideLoading();
  }
}

// Hacer disponible la función loadTestimonials a nivel global
window.loadTestimonials = loadTestimonials;

// Inicialización específica para esta página
window.initPage = function() {
  document.querySelectorAll('.section').forEach(section => {
    if (section.id !== 'testimonials-section') {
      section.style.display = 'none';
    } else {
      section.style.display = 'block';
    }
  });
  
  // Cargar testimonios al iniciar
  loadTestimonials();
};
