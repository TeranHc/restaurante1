'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  const heroSlides = [
    {
      title: "Experiencia Culinaria Única",
      subtitle: "Descubre sabores auténticos en un ambiente elegante",
      image: "🍽️",
      bgGradient: "from-amber-900/80 to-slate-900/80"
    },
    {
      title: "Cocina Gourmet Ecuatoriana",
      subtitle: "Tradición y modernidad en cada platillo",
      image: "🥘",
      bgGradient: "from-red-900/80 to-amber-900/80"
    },
    {
      title: "Ambiente Excepcional",
      subtitle: "El lugar perfecto para momentos especiales",
      image: "🕯️",
      bgGradient: "from-slate-900/80 to-amber-900/80"
    }
  ];

  const specialties = [
    {
      name: "Seco de Cabrito Gourmet",
      description: "Tradicional seco de cabrito con frejoles y arroz con cilantro",
      price: "$18.50",
      image: "🍖",
      category: "Plato Principal"
    },
    {
      name: "Ceviche de Camarones",
      description: "Fresco ceviche con camarones del Pacífico y leche de tigre",
      price: "$16.00",
      image: "🦐",
      category: "Entrada"
    },
    {
      name: "Locro Quiteño Premium",
      description: "Cremoso locro con queso fresco y aguacate",
      price: "$12.50",
      image: "🥔",
      category: "Sopas"
    },
    {
      name: "Tres Leches Artesanal",
      description: "Postre tradicional con un toque de café y canela",
      price: "$8.00",
      image: "🍰",
      category: "Postres"
    }
  ];

  const testimonials = [
    {
      name: "María González",
      rating: 5,
      comment: "La mejor experiencia culinaria de Quito. El ambiente es perfecto y la comida excepcional.",
      location: "Quito, Ecuador"
    },
    {
      name: "Carlos Mendoza",
      rating: 5,
      comment: "Celebramos nuestro aniversario aquí. El servicio fue impecable y cada plato una obra de arte.",
      location: "Guayaquil, Ecuador"
    },
    {
      name: "Ana Rodríguez",
      rating: 5,
      comment: "Bella Vista superó todas mis expectativas. Definitivamente volveré con mi familia.",
      location: "Cuenca, Ecuador"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[id^="animate-"]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden border">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900"></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-40 h-40 bg-amber-500/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-amber-600/10 to-red-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-full px-4 sm:px-6 lg:px-8">
          <div className="transform transition-all duration-1000 ease-out">
            <div className="text-8xl mb-6 animate-bounce">
              {heroSlides[currentSlide].image}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 bg-clip-text text-transparent leading-tight">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-amber-100 max-w-4xl mx-auto leading-relaxed">
              {heroSlides[currentSlide].subtitle}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link
              href="/menu"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold text-base sm:text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-1 text-center"
            >
              Ver Nuestra Carta
            </Link>
            <Link
              href="/reservas"
              className="w-full sm:w-auto border-2 border-amber-400 text-amber-400 px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-amber-400 hover:text-slate-900 transition-all duration-300 font-semibold text-base sm:text-lg backdrop-blur-sm bg-white/10 text-center"
            >
              Reservar Mesa
            </Link>
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center mt-12 space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-amber-400 w-8' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="animate-about" className={`py-20 bg-white transition-all duration-1000 ${isVisible['animate-about'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Más de 
                <span className="text-amber-600"> 15 años</span>
                <br />creando experiencias
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mb-6 leading-relaxed">
                En Bella Vista, combinamos la rica tradición culinaria ecuatoriana con técnicas modernas para crear experiencias gastronómicas únicas. Cada plato cuenta una historia, cada sabor despierta emociones.
              </p>
              <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
                Nuestro compromiso es ofrecerte no solo una comida, sino un momento memorable en un ambiente elegante y acogedor, donde cada detalle está pensado para tu satisfacción.
              </p>
              <Link
                href="/nosotros"
                className="inline-flex items-center bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-3 rounded-lg hover:from-slate-800 hover:to-slate-700 transition-all duration-300 font-medium group"
              >
                Conoce Nuestra Historia
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold mb-2">Reconocimiento</h3>
                  <p className="text-amber-100">Mejor Restaurante Gourmet de Quito 2024</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">⭐</div>
                  <p className="font-bold">5.0</p>
                  <p className="text-sm text-red-100">Calificación</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="animate-specialties" className={`py-20 bg-gradient-to-br from-slate-50 to-amber-50 transition-all duration-1000 ${isVisible['animate-specialties'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Nuestras <span className="text-amber-600">Especialidades</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              Platillos cuidadosamente preparados con ingredientes frescos y técnicas tradicionales
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {specialties.map((dish, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="p-6">
                  <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                    {dish.image}
                  </div>
                  <div className="text-xs text-amber-600 font-semibold mb-2 uppercase tracking-wide">
                    {dish.category}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {dish.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {dish.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-amber-600">
                      {dish.price}
                    </span>
                    <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-medium text-sm">
                      Ordenar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/menu"
              className="inline-flex items-center bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-4 rounded-xl hover:from-slate-800 hover:to-slate-700 transition-all duration-300 font-semibold text-lg group"
            >
              Ver Carta Completa
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="animate-testimonials" className={`py-20 bg-white transition-all duration-1000 ${isVisible['animate-testimonials'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Lo que dicen nuestros <span className="text-amber-600">clientes</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              Experiencias reales de personas que han disfrutado de Bella Vista
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic leading-relaxed">
                  {testimonial.comment}
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-600/20 to-transparent"></div>
          <div className="absolute top-10 right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-amber-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-6xl mb-8 animate-bounce">🍽️</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            ¿Listo para una experiencia <span className="text-amber-400">inolvidable</span>?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-amber-100 mb-8 max-w-3xl mx-auto">
            Reserva tu mesa ahora y descubre por qué Bella Vista es el destino gastronómico favorito de Quito
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservas"
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              Reservar Mesa
            </Link>
            <Link
              href="/pedido"
              className="border-2 border-amber-400 text-amber-400 px-8 py-4 rounded-xl hover:bg-amber-400 hover:text-slate-900 transition-all duration-300 font-semibold text-lg backdrop-blur-sm bg-white/10"
            >
              Ordenar a Domicilio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}