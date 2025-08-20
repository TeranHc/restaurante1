'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function LoginCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const userId = urlParams.get('user_id');
        const errorParam = urlParams.get('error');

        if (errorParam) {
          throw new Error(`Error de autenticación: ${errorParam}`);
        }

        let session = null;
        let user = null;

        // Si tenemos tokens de URL params (desde backend)
        if (accessToken && userId) {
          console.log('Procesando callback desde backend...');
          
          // Verificar el usuario con el token
          const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
          
          if (userError || !userData.user) {
            throw new Error('Token de acceso inválido');
          }

          user = userData.user;
          session = { access_token: accessToken, refresh_token: refreshToken };
        } else {
          // Método estándar de Supabase (desde frontend directo)
          console.log('Procesando callback estándar de Supabase...');
          
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            throw error;
          }

          if (data.session) {
            user = data.session.user;
            session = data.session;
          }
        }

        if (!user || !session) {
          throw new Error('No se pudo obtener la sesión del usuario');
        }

        console.log('Usuario autenticado:', {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        });

        // Sincronizar con el backend si es necesario
        try {
          const syncResponse = await fetch('http://localhost:3001/api/auth/sync-oauth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              user: {
                id: user.id,
                email: user.email,
                firstName: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || '',
                lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
                avatar: user.user_metadata?.picture || user.user_metadata?.avatar_url || null
              }
            })
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            console.log('Usuario sincronizado con backend:', syncData);
            
            // Usar los datos del backend
            localStorage.setItem('token', session.access_token);
            localStorage.setItem('refresh_token', session.refresh_token || '');
            localStorage.setItem('userRole', syncData.user?.role || 'CLIENT');
            localStorage.setItem('userName', syncData.user?.firstName || '');
            localStorage.setItem('userLastName', syncData.user?.lastName || '');
            localStorage.setItem('userEmail', syncData.user?.email || '');
            localStorage.setItem('userId', syncData.user?.id || '');
            localStorage.setItem('userPhone', syncData.user?.phone || '');
          } else {
            console.log('Error sincronizando con backend, usando datos de Supabase');
          }
        } catch (syncError) {
          console.log('Error sincronizando con backend:', syncError);
        }

        // Guardar datos básicos si la sincronización falló
        if (!localStorage.getItem('token')) {
          localStorage.setItem('token', session.access_token);
          localStorage.setItem('refresh_token', session.refresh_token || '');
          localStorage.setItem('userRole', 'CLIENT');
          localStorage.setItem('userName', user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || '');
          localStorage.setItem('userLastName', user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.name?.split(' ').slice(1).join(' ') || '');
          localStorage.setItem('userEmail', user.email || '');
          localStorage.setItem('userId', user.id || '');
        }

        // Redirigir según el rol
        const userRole = localStorage.getItem('userRole') || 'CLIENT';
        if (userRole === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }

      } catch (err) {
        console.error('Error en callback de Google:', err);
        setError('Error al procesar el inicio de sesión');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-4 rounded-2xl shadow-2xl">
                <span className="text-white text-4xl">🍷</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent mb-4">
              Bella Vista
            </h1>
            <div className="flex items-center justify-center mb-4">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-white text-lg">Completando inicio de sesión...</span>
            </div>
            <p className="text-gray-300 text-sm">Por favor espera un momento</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-red-400 to-red-600 p-4 rounded-2xl shadow-2xl">
                <span className="text-white text-4xl">❌</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Error de autenticación</h1>
            <p className="text-red-300 mb-6">{error}</p>
            <p className="text-gray-300 text-sm">Redirigiendo al inicio de sesión...</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}