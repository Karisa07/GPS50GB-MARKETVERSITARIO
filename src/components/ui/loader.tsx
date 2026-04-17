import React from 'react'

export function LoaderOne() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white backdrop-blur-md">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner SVG puro en Tailwind (No falla nunca en Next.js) */}
        <div className="relative flex items-center justify-center h-20 w-20">
          <svg className="animate-spin h-14 w-14 text-[#534AB7]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {/* Anillo de pulso extra para estética premium */}
          <div className="absolute inset-0 rounded-full border-4 border-[#534AB7]/30 animate-pulse"></div>
        </div>
        
        <span className="text-sm font-medium tracking-widest text-[#534AB7] animate-pulse">
          CARGANDO
        </span>
      </div>
    </div>
  )
}
