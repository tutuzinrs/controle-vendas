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

const Subtotal = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #c41e3a;
  margin-top: 20px;
`;

export default function Historico() {
  const [diasFinalizados, setDiasFinalizados] = useState([]);
  const [pedidosSelecionados, setPedidosSelecionados] = useState(null);
  const [totalGeral, setTotalGeral] = useState(0);

  const buscarDias = async () => {
    const snapshot = await getDocs(collection(db, "diasFinalizados"));
    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDiasFinalizados(lista);

    let total = 0;
    lista.forEach((dia) => {
      dia.pedidos.forEach((pedido) => {
        total += Number(pedido.total || 0);
      });
    });
    setTotalGeral(total);
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
                  {pedido.produto} × {pedido.quantidade}{" "}
                  <span style={{ color: "#888", fontSize: "0.9rem" }}>
                    ({pedido.formaPagamento || "?"})
                  </span>
                </span>
                <span>R$ {pedido.total.toFixed(2)}</span>
              </PedidoItem>
            ))}
          </PedidoList>
          <Subtotal>
            Total do dia: R${" "}
            {pedidosSelecionados
              .reduce((acc, p) => acc + Number(p.total || 0), 0)
              .toFixed(2)}
          </Subtotal>
        </>
      )}

      <p
        style={{
          textAlign: "center",
          fontWeight: "bold",
          color: "#1d060a",
          marginBottom: 15,
        }}
      >
        Total geral: R$ {totalGeral.toFixed(2)}
      </p>
    </Container>
  );
}
