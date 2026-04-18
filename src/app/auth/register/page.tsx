"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, Mail, Lock, CreditCard } from "lucide-react";
import { Particles } from "@/components/ui/particles";

export default function AuthSwitch() {
  // Comienza en true porque esta es la ruta de registro (/auth/register)
  const [isSignUp, setIsSignUp] = useState(true);
  const [docType, setDocType] = useState("CC");

  useEffect(() => {
    const container = document.querySelector(".auth-container");
    if (!container) return;
    if (isSignUp) container.classList.add("sign-up-mode");
    else container.classList.remove("sign-up-mode");
  }, [isSignUp]);

  return (
    <>
      {/* ── FONDO INTERACTIVO DE PARTÍCULAS ── */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-slate-50">
        <Particles
          className="absolute inset-0"
          quantity={150}
          ease={80}
          color="#534AB7"
          refresh
        />
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .auth-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 950px;
          min-height: 660px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 5rem;
          transition: all 0.2s 0.7s;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        form.sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        form.sign-in-form {
          z-index: 2;
        }

        .title {
          font-size: 2.2rem;
          color: #333;
          margin-bottom: 20px;
          font-weight: 800;
        }

        .input-field {
          max-width: 380px;
          width: 100%;
          background-color: #f3f4f6;
          margin: 6px 0;
          height: 48px;
          border-radius: 12px;
          display: grid;
          grid-template-columns: 15% 85%;
          padding: 0 0.4rem;
          position: relative;
          transition: 0.3s;
          border: 1px solid transparent;
        }

        .input-field:focus-within {
          background-color: #ffffff;
          border-color: #534AB7;
          box-shadow: 0 0 0 4px rgba(83, 74, 183, 0.1);
        }

        .input-field i {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          transition: 0.5s;
        }

        .input-field:focus-within i {
          color: #534AB7;
        }

        .input-field input, .input-field select {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 1rem;
          color: #374151;
          width: 100%;
        }

        .input-field select {
          cursor: pointer;
          color: #374151;
        }

        .input-field select.placeholder-select {
          color: #9ca3af;
          font-weight: 400;
        }

        .input-field input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .btn {
          width: 160px;
          background: linear-gradient(to right, #6055D0, #534AB7);
          border: none;
          outline: none;
          height: 50px;
          border-radius: 12px;
          color: #fff;
          text-transform: uppercase;
          font-weight: 700;
          margin: 15px 0;
          cursor: pointer;
          transition: 0.5s;
          font-size: 0.9rem;
          letter-spacing: 1px;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(83, 74, 183, 0.3);
        }

        .btn.transparent {
          margin: 10px 0 0 0;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          border: 2px solid #fff;
          width: 140px;
          height: 45px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .btn.transparent:hover {
          background: #fff;
          color: #534AB7;
          transform: translateY(-2px);
        }

        .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .panel .content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .panel h3 {
          font-weight: 700;
          line-height: 1;
          font-size: 1.8rem;
          margin-bottom: 15px;
        }

        .panel p {
          font-size: 1rem;
          padding: 0.7rem 0;
          opacity: 0.9;
        }

        .right-panel .content {
          transform: translateX(800px);
        }

        /* ----- CIRCULO GIGANTE DE FONDO ----- */
        .auth-container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .auth-container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .auth-container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .auth-container.sign-up-mode form.sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .auth-container.sign-up-mode form.sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .auth-container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .auth-container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .auth-container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #378ADD 0%, #534AB7 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        .social-text {
          padding: 1rem 0;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .social-media {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .social-icon {
          height: 50px;
          width: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          color: #4b5563;
          transition: 0.3s;
          cursor: pointer;
          filter: grayscale(100%) opacity(0.8);
        }

        .social-icon:hover {
          border-color: #534AB7;
          background: #f8f9fa;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          filter: grayscale(0%) opacity(1);
        }

        .social-text {
          padding: 1rem 0;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .social-media {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .social-icon {
          height: 46px;
          width: 46px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 50%;
          color: #4b5563;
          transition: 0.3s;
          cursor: pointer;
        }

        .social-icon:hover {
          border-color: #534AB7;
          background: #f8f9fa;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        @media (max-width: 870px) {
          .auth-container {
            min-height: 800px;
            height: 100vh;
            border-radius: 0;
          }
          .signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .signin-signup,
          .auth-container.sign-up-mode .signin-signup {
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .right-panel {
            grid-row: 3 / 4;
          }
          .left-panel {
            grid-row: 1 / 2;
          }
          .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .panel h3 {
            font-size: 1.4rem;
          }
          .panel p {
            font-size: 0.9rem;
            padding: 0.5rem 0;
          }
          .auth-container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .auth-container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
            top: initial;
          }
          .auth-container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .auth-container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .right-panel .content {
            transform: translateY(300px);
          }
        }

        @media (max-width: 570px) {
          form {
            padding: 0 1.5rem;
          }
          .panel .content {
            padding: 0.5rem 1rem;
          }
        }
      `}</style>

      <div className="auth-container sign-up-mode">
        <div className="forms-container">
          <div className="signin-signup">
            
            {/* ── FORMULARIO DE LOG IN ── */}
            <form className="sign-in-form">
              <h2 className="title" style={{ marginBottom: '25px', marginTop: '40px' }}>
                Bienvenido a <span style={{ color: '#534AB7' }}>MarketVersitario</span>
              </h2>
              <div className="input-field">
                <i><Mail size={20} /></i>
                <input type="email" placeholder="Correo electrónico" />
              </div>
              <div className="input-field">
                <i><Lock size={20} /></i>
                <input type="password" placeholder="Contraseña" />
              </div>
              <button type="button" className="btn solid">Entrar</button>
              
              <p className="social-text">O continúa usando</p>
              <div className="social-media">
                <SocialIcons />
              </div>
            </form>

            {/* ── FORMULARIO DE REGISTRO ── */}
            <form className="sign-up-form">
              <h2 className="title" style={{ marginBottom: '25px', marginTop: '40px' }}>Crear cuenta</h2>
              
              <div className="input-field">
                <i><User size={20} /></i>
                <input type="text" placeholder="Nombre completo" />
              </div>

              <div className="input-field">
                <i><CreditCard size={20} /></i>
                <select 
                  value={docType} 
                  onChange={(e) => setDocType(e.target.value)}
                  className={docType === "" ? "placeholder-select" : ""}
                >
                  <option value="" disabled>Tipo de documento</option>
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                </select>
              </div>

              <div className="input-field">
                <i><CreditCard size={20} /></i>
                <input type="text" placeholder="Número de documento" />
              </div>

              <div className="input-field">
                <i><Mail size={20} /></i>
                <input type="email" placeholder="Correo electrónico" />
              </div>
              
              <div className="input-field">
                <i><Lock size={20} /></i>
                <input type="password" placeholder="Contraseña" />
              </div>

              <button type="button" className="btn" style={{ margin: '10px 0' }}>Registrarse</button>
              
              <p className="social-text">O regístrate con</p>
              <div className="social-media">
                <SocialIcons />
              </div>
            </form>

          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>¿Nuevo por aquí?</h3>
              <p>Únete a la mejor plataforma de Marketplace para tu comunidad universitaria en segundos.</p>
              <button className="btn transparent" onClick={() => setIsSignUp(true)}>
                Crear Cuenta
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>¿Ya eres uno de nuestros estudiantes?</h3>
              <p>Inicia sesión y sigue descubriendo productos increíbles de otros estudiantes.</p>
              <button className="btn transparent" onClick={() => setIsSignUp(false)}>
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Iconos abstractos genéricos de Google (con hover iluminado)
function SocialIcons() {
  return (
    <>
      <a href="#" className="social-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      </a>
    </>
  );
}
