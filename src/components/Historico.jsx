import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import styled from "styled-components";
import { updateDoc } from "firebase/firestore";


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

const PastaContainer = styled.div`
  margin-top: 30px;
  background: #eaeaea;
  border-radius: 10px;
  padding: 15px 20px;
`;

const PastaTitulo = styled.h2`
  margin: 0 0 10px;
  color: #222;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PedidoContainer = styled.div`
  margin-left: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 8px rgb(0 0 0 / 0.05);
`;

const PedidoTitulo = styled.h3`
  margin: 0 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PedidoList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 0;
`;

const PedidoItem = styled.li`
  background: #f8f8f8;
  padding: 8px 10px;
  margin-bottom: 6px;
  border-radius: 6px;
  color: #444;
  display: flex;
  justify-content: space-between;
`;

const Subtotal = styled.div`
  text-align: center;
  font-weight: bold;
  margin-top: 10px;
  color: #c41e3a;
`;

const ExportButton = styled.button`
  padding: 7px 15px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

const ToggleIcon = styled.span`
  font-weight: bold;
  font-size: 1.3rem;
  user-select: none;
`;

export default function Historico() {
  const [diasFinalizados, setDiasFinalizados] = useState([]);
  const [totalGeral, setTotalGeral] = useState(0);
  const [abertos, setAbertos] = useState({}); // objeto { data: true/false }

  useEffect(() => {
    buscarDias();
  }, []);

  async function buscarDias() {
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
  }

  // Agrupa os dados por data, juntando todos os pedidos dos docs com a mesma data
  function agruparPorData(dias) {
    const agrupado = {};

    dias.forEach((dia) => {
      if (!agrupado[dia.data]) {
        agrupado[dia.data] = [];
      }
      agrupado[dia.data] = agrupado[dia.data].concat(dia.pedidos || []);
    });

    // transforma em array [{ data: "11/07", pedidos: [...] }, ...]
    return Object.entries(agrupado).map(([data, pedidos]) => ({
      data,
      pedidos,
    }));
  }

  function calcularTotaisPorPagamento(pedidos) {
    const totais = {
      Dinheiro: 0,
      Pix: 0,
      Cartão: 0,
      Outros: 0,
    };

    pedidos.forEach((pedido) => {
      const forma = (pedido.formaPagamento || "Outros").toLowerCase();

      if (forma.includes("dinheiro")) totais.Dinheiro += Number(pedido.total || 0);
      else if (forma.includes("pix")) totais.Pix += Number(pedido.total || 0);
      else if (forma.includes("cart")) totais.Cartão += Number(pedido.total || 0);
      else totais.Outros += Number(pedido.total || 0);
    });

    return totais;
  }

 function exportarCSV(pedidos, data) {
  const headers = ["Produto", "Quantidade", "Total", "Forma de Pagamento"];
  const rows = pedidos.map((p) => [
    p.produto,
    p.quantidade,
    p.total,
    p.formaPagamento,
  ]);

    const csvContent = [headers, ...rows]
    .map((row) => row.join(";"))
    .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Pedidos do dia ${data.replace(/\//g, "-")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

  async function deletarPorData(data) {
    const docsParaDeletar = diasFinalizados.filter((d) => d.data === data);
    if (
      docsParaDeletar.length > 0 &&
      window.confirm(`Deseja apagar todos os históricos do dia ${data}?`)
    ) {
      for (const d of docsParaDeletar) {
        await deleteDoc(doc(db, "diasFinalizados", d.id));
      }
      buscarDias();
    }
  }

  async function excluirPedidoIndividual(data, indexParaRemover) {
  const docsDoDia = diasFinalizados.filter((d) => d.data === data);

  for (const d of docsDoDia) {
    const novosPedidos = [...d.pedidos];
    if (indexParaRemover >= 0 && indexParaRemover < novosPedidos.length) {
      novosPedidos.splice(indexParaRemover, 1);

      await doc(db, "diasFinalizados", d.id).update({
        pedidos: novosPedidos,
      });
      break; // só remove de um documento
    }
  }

  buscarDias(); // atualiza a tela
}


  // Toggle abre/fecha pasta
  function togglePasta(data) {
    setAbertos((prev) => ({ ...prev, [data]: !prev[data] }));
  }

  const diasAgrupados = agruparPorData(diasFinalizados);
  const todosPedidos = diasAgrupados.flatMap((dia) => dia.pedidos);
  const totaisGeralPorPagamento = calcularTotaisPorPagamento(todosPedidos);

  return (
    <Container>
      <Title>Histórico de Dias Finalizados</Title>

      {diasAgrupados.length === 0 && (
        <p style={{ textAlign: "center", color: "#999" }}>
          Nenhum dia finalizado encontrado.
        </p>
      )}

      {diasAgrupados.map((dia, idx) => {
        const pedidos = dia.pedidos || [];
        const totalDia = pedidos.reduce(
          (acc, p) => acc + Number(p.total || 0),
          0
        );

        const aberto = abertos[dia.data] ?? false;

        return (
          <PastaContainer key={dia.data}>
            <PastaTitulo onClick={() => togglePasta(dia.data)}>
              <span>Pedidos dia {idx + 1}</span>
              <ToggleIcon>{aberto ? "−" : "+"}</ToggleIcon>
            </PastaTitulo>

            {aberto && (
              <PedidoContainer>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <PedidoTitulo>📦 Pedidos do dia {dia.data}</PedidoTitulo>
                  <button
                    onClick={() => deletarPorData(dia.data)}
                    style={{
                      background: "transparent",
                      color: "#d9534f",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "1.3rem",
                    }}
                  >
                    🗑
                  </button>
                </div>

                <PedidoList>
                  {pedidos.map((pedido, index) => (
                    <PedidoItem key={index}>
                      <span>
                        {pedido.produto} × {pedido.quantidade}{" "}
                        <span style={{ color: "#888", fontSize: "0.9rem" }}>
                          ({pedido.formaPagamento || "?"})
                        </span>
                      </span>
                      <span>
                        R$ {Number(pedido.total || 0).toFixed(2)}{" "}
                        <button
                          onClick={() =>
                            excluirPedidoIndividual(dia.data, index)
                          }
                          style={{
                            background: "transparent",
                            color: "#d9534f",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            marginLeft: 10,
                          }}
                          title="Excluir pedido"
                        >
                          🗑️
                        </button>
                      </span>
                    </PedidoItem>
                  ))}
                </PedidoList>

                <Subtotal>Total do dia: R$ {totalDia.toFixed(2)}</Subtotal>

                <div style={{ textAlign: "center" }}>
                  <ExportButton onClick={() => exportarCSV(pedidos, dia.data)}>
                    Exportar CSV
                  </ExportButton>
                </div>
              </PedidoContainer>
            )}
          </PastaContainer>
        );
      })}

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <h2 style={{ marginBottom: 10 }}>
          💰 Total geral: R$ {totalGeral.toFixed(2)}
        </h2>

        <p>💳 Cartão: R$ {totaisGeralPorPagamento.Cartão.toFixed(2)}</p>
        <p>💸 Pix: R$ {totaisGeralPorPagamento.Pix.toFixed(2)}</p>
        <p>🪙 Dinheiro: R$ {totaisGeralPorPagamento.Dinheiro.toFixed(2)}</p>
        <p>❓ Não informados Pagamento: R$ {totaisGeralPorPagamento.Outros.toFixed(2)}</p>
      </div>
    </Container>
  );
}
