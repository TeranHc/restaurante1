import { Suspense } from 'react'
import OpcionesProductoClient from './OpcionesProductoClient'

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <OpcionesProductoClient />
    </Suspense>
  )
}
