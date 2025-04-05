// Fonction pour charger les témoignages
async function loadTestimonials() {
  showLoading();
  
  // Données de secours (fallback) en cas d'échec de l'API
  const fallbackTestimonials = [
    {name: 'Carlos Ruiz', content: 'Gracias a PSF pude financiar mis estudios de máster. El proceso fue rápido y transparente.', date: '15/12/2023'},
    {name: 'Laura Fernández', content: 'Solicité un préstamo para reformar mi casa y me lo concedieron en menos de 48 horas.', date: '23/01/2024'},
    {name: 'Miguel Ángel Pérez', content: 'Mi experiencia con PSF ha sido inmejorable. Un trato personalizado y condiciones competitivas.', date: '18/03/2024'},
    {name: 'Elena Torres', content: 'Recomiendo PSF a todos mis amigos. Gracias a su préstamo pude comprar mi primer coche.', date: '05/05/2024'},
    {name: 'Javier Moreno', content: 'Elegí PSF por su transparencia y su atención al cliente. No me he arrepentido en absoluto.', date: '12/07/2024'}
  ];
  
  try {
    let testimonials = [];
    
    try {
      const response = await fetchApi('testimonials', 'GET');
      if (response && response.testimonials && response.testimonials.length > 0) {
        testimonials = response.testimonials;
      } else {
        throw new Error('No testimonials from API');
      }
    } catch (apiError) {
      console.warn('Error fetching testimonials from API, using fallback data', apiError);
      testimonials = fallbackTestimonials;
    }
    
    const container = document.getElementById('testimonials-container');
    container.innerHTML = '';
    
    testimonials.forEach(testimonial => {
      const testimonialElement = document.createElement('div');
      testimonialElement.className = 'testimonial';
      testimonialElement.innerHTML = `
        <div class="testimonial-content">"${testimonial.content}"</div>
        <div class="testimonial-author">${testimonial.name}</div>
        <div class="testimonial-date">${testimonial.date}</div>
      `;
      container.appendChild(testimonialElement);
    });
  } catch (error) {
    console.error('Error al cargar testimonios:', error);
    showNotification('Error al cargar los testimonios', true);
  } finally {
    hideLoading();
  }
}
