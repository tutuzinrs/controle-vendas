import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import styled from "styled-components";

const Container = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 25px;
  color: #2c3e50;
`;

const DayList = styled.ul`
  list-style: none;
  padding: 0;
  max-width: 600px;
  margin: 0 auto;
`;

const DayItem = styled.li`
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 15px;
  box-shadow: 0 1px 6px rgb(0 0 0 / 0.05);
  cursor: pointer;
  font-weight: 700;
  color: #2c3e50;
`;

const PedidoList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 20px;
`;

const PedidoItem = styled.li`
  background: #f8f8f8;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  color: #444;
  display: flex;
  justify-content: space-between;
`;

export default function Historico() {
  const [diasFinalizados, setDiasFinalizados] = useState([]);
  const [pedidosSelecionados, setPedidosSelecionados] = useState(null);

  const buscarDias = async () => {
    const snapshot = await getDocs(collection(db, "diasFinalizados"));
    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDiasFinalizados(lista);
  };

  useEffect(() => {
    buscarDias();
  }, []);

  const verPedidosDoDia = (pedidos) => {
    setPedidosSelecionados(pedidos);
  };

  return (
    <Container>
      <Title>Histórico de Dias Finalizados</Title>
      <DayList>
        {diasFinalizados.length === 0 && (
          <p style={{ textAlign: "center", color: "#999" }}>
            Nenhum dia finalizado encontrado.
          </p>
        )}
        {diasFinalizados.map((dia) => (
          <DayItem key={dia.id} onClick={() => verPedidosDoDia(dia.pedidos)}>
            {dia.data}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Deseja apagar esse histórico?")) {
                  deleteDoc(doc(db, "diasFinalizados", dia.id));
                  buscarDias();
                }
              }}
              style={{
                float: "right",
                background: "transparent",
                color: "#d9534f",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              🗑
            </button>
          </DayItem>
        ))}
      </DayList>

      {pedidosSelecionados && (
        <>
          <h2 style={{ textAlign: "center", marginTop: 30 }}>Pedidos do dia</h2>
          <PedidoList>
            {pedidosSelecionados.map((pedido, index) => (
              <PedidoItem key={index}>
                <span>
                  {pedido.produto} × {pedido.quantidade}
                </span>
                <span>R$ {pedido.total.toFixed(2)}</span>
              </PedidoItem>
            ))}
          </PedidoList>
        </>
      )}
    </Container>
  );
}
