import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaHome, FaHistory, FaDollarSign } from "react-icons/fa";

// Styled Components
const Nav = styled.nav`
  width: 220px;
  height: 100%;
  background: linear-gradient(180deg, #1f1f1f 0%, #121212 100%);
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  box-sizing: border-box;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  transform: translateX(${({ isOpen }) => (isOpen ? "0" : "-100%")});
  transition: transform 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  max-height: 100%;
`;

const Button = styled.button`
  background: none;
  border: none;
  color: ${({ active }) => (active ? "#C41E3A " : "#ccc")};
  font-size: 1.2rem;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: ${({ active }) => (active ? "700" : "400")};
  transition: color 0.3s ease;

  &:hover {
    color: #C41E3A ;
  }

  svg {
    margin-right: 12px;
  }
`;

const Footer = styled.footer`
  margin-top: auto;
  border-top: 1px solid #444;
  font-size: 0.9rem;
  color: #888;
  text-align: center;
  padding-top: 15px;
  padding-bottom: 15px;
  flex-shrink: 0;
`;

const FooterLink = styled.a`
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: #d4883a;
    text-decoration: underline;
  }
`;

const ToggleButton = styled.button`
  position: fixed;
  top: 15px;
  left: 15px;
  font-size: 2rem;
  background: none;
  border: none;
  color: #C41E3A ;
  cursor: pointer;
  z-index: 1100;
  user-select: none;
`;

const Overlay = styled.div`
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 900;
`;

export default function Sidebar({ page, setPage }) {
  const [isOpen, setIsOpen] = useState(false);

  // Fecha a sidebar ao trocar de página
  useEffect(() => {
    setIsOpen(false);
  }, [page]);

  return (
    <>
      {/* Botão ☰ aparece sempre que sidebar estiver fechada */}
      {!isOpen && (
        <ToggleButton onClick={() => setIsOpen(true)} aria-label="Abrir menu">
          ☰
        </ToggleButton>
      )}

      {/* Overlay escuro quando menu aberto */}
      <Overlay isOpen={isOpen} onClick={() => setIsOpen(false)} />

      <Nav isOpen={isOpen}>
        {/* Botão × para fechar */}
        <ToggleButton
          onClick={() => setIsOpen(false)}
          aria-label="Fechar menu"
          style={{ color: "#fff", left: 180, top: 20 }}
        >
          ×
        </ToggleButton>

        <Button active={page === "home"} onClick={() => setPage("home")}>
          <FaHome /> Home
        </Button>
        <Button active={page === "historico"} onClick={() => setPage("historico")}>
          <FaHistory /> Histórico
        </Button>
        <Button active={page === "valores"} onClick={() => setPage("valores")}>
          <FaDollarSign /> Valores
        </Button>

        <Footer>
          Desenvolvido por{" "}
          <FooterLink
            href="https://www.linkedin.com/in/arthurnasciment/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Arthur
          </FooterLink>
        </Footer>
      </Nav>
    </>
  );
}
